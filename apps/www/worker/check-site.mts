/**
 * Checks a deployed (or local) Cloudflare build of ui.ballmac.com end to end: static pages, headers, redirects, the 404 page, the public APIs, and every
 * Worker route, including the Pro licence gate. Read-only, apart from starting a login session. Exits 1 on any failure.
 *
 *   pnpm cf:check --base-url http://127.0.0.1:8788 --key local-test-key     (local: pnpm cf:preview)
 *   pnpm cf:check --base-url https://ballmac-ui-preview.<account>.workers.dev --key <a real or test licence key>
 *
 * Without --key the licensed requests are skipped and only the refusals are checked.
 */
const arg = (name: string) => {
  const i = process.argv.indexOf(`--${name}`)
  return i > -1 ? process.argv[i + 1] : undefined
}
const base = (arg("base-url") ?? "http://127.0.0.1:8788").replace(/\/$/, "")
const key = arg("key")
const origin = new URL(base).origin

let failed = 0
let passed = 0
async function check(name: string, run: () => Promise<string | void>) {
  try {
    const note = await run()
    passed++
    console.log(`  ✓ ${name}${note ? `  (${note})` : ""}`)
  } catch (e) {
    failed++
    console.log(`  ✗ ${name}: ${(e as Error).message}`)
  }
}
const expect = (ok: unknown, message: string) => {
  if (!ok) throw new Error(message)
}
const get = (path: string, init: RequestInit = {}) => fetch(`${base}${path}`, { redirect: "manual", ...init })
const status = (res: Response, want: number | number[]) => expect([want].flat().includes(res.status), `status ${res.status}, expected ${want}`)

console.log(`Checking ${base}`)

console.log("\nStatic pages")
await check("home page", async () => {
  const res = await get("/")
  status(res, 200)
  expect(res.headers.get("content-type")?.includes("text/html"), `content-type ${res.headers.get("content-type")}`)
  expect(res.headers.get("x-content-type-options") === "nosniff", "no x-content-type-options")
  expect(res.headers.get("content-security-policy")?.includes("frame-ancestors 'self'"), "no content-security-policy")
  expect((await res.text()).includes("Ballmac"), "body does not mention Ballmac")
})
for (const path of ["/components", "/components/button", "/blocks/hero-1", "/pricing", "/pro", "/quality", "/docs/guides/check-your-app", "/preview/button-demo"]) {
  await check(path, async () => status(await get(path), 200))
}
await check("unknown page is a 404 with the site's page", async () => {
  const res = await get("/this-page-does-not-exist")
  status(res, 404)
  expect((await res.text()).includes("<html"), "not an HTML page")
})
await check("redirect /docs/licensing → /license", async () => {
  const res = await get("/docs/licensing")
  status(res, [301, 308])
  expect(res.headers.get("location")?.endsWith("/license"), `location ${res.headers.get("location")}`)
})
for (const [path, type] of [
  ["/llms.txt", "text/plain"],
  ["/robots.txt", "text/plain"],
  ["/sitemap.xml", "xml"],
  ["/search-index.json", "json"],
  ["/offer-state.json", "json"],
  ["/license/pro/text", "text/plain"],
  ["/opengraph-image", "image/png"],
  ["/components/button/opengraph-image-1tt7vc", "image/png"],
] as const) {
  await check(path, async () => {
    const res = await get(path)
    status(res, 200)
    expect(res.headers.get("content-type")?.includes(type), `content-type ${res.headers.get("content-type")}`)
  })
}

console.log("\nPublic registry and API")
await check("/r/button.json (shadcn)", async () => {
  const res = await get("/r/button.json")
  status(res, 200)
  expect(res.headers.get("access-control-allow-origin") === "*", "no CORS header")
  const body = (await res.json()) as { name?: string }
  expect(body.name === "button", "wrong item")
})
await check("/api/v1/index.json", async () => {
  const res = await get("/api/v1/index.json")
  status(res, 200)
  expect(res.headers.get("access-control-allow-origin") === "*", "no CORS header")
  await res.json()
})
await check("/api/v1/items/button.json", async () => {
  const res = await get("/api/v1/items/button.json")
  status(res, 200)
  expect(res.headers.get("content-type")?.includes("application/json"), `content-type ${res.headers.get("content-type")}`)
  await res.json()
})

console.log("\nWorker routes")
await check("custom theme link", async () => {
  const res = await get("/themes/custom.json?h=262&c=0.19")
  status(res, 200)
  expect(((await res.json()) as { name?: string }).name === "theme-custom", "not a theme")
})
await check("GitHub star count", async () => {
  const res = await get("/api/stars")
  status(res, 200)
  const { stars } = (await res.json()) as { stars?: number | null }
  expect(stars === null || (typeof stars === "number" && stars >= 0), `stars is ${JSON.stringify(stars)}`)
})
await check("wrong method is refused", async () => status(await get("/api/support"), 405))
await check("support form validates", async () => {
  const res = await get("/api/support", { method: "POST", headers: { "content-type": "application/json", origin }, body: "{}" })
  status(res, [400, 422, 503])
})
await check("licence check refuses a made-up key", async () => {
  const res = await get("/api/v1/license/verify", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key: "not-a-real-key" }) })
  status(res, [200, 503])
  expect(((await res.json()) as { valid?: boolean }).valid === false, "a made-up key was accepted")
})
await check("Pro registry refuses a request without a key", async () => status(await get("/r/pro/hero-pro-1.json"), [401, 403]))
await check("Pro registry refuses a made-up key", async () => status(await get("/r/pro/hero-pro-1.json", { headers: { authorization: "Bearer not-a-real-key" } }), [401, 403, 429]))
await check("Pro code needs a login", async () => status(await get("/api/pro/items/hero-pro-1"), [401, 403]))
await check("Pro downloads need a login", async () => status(await get("/api/pro/download/starters/beacon-saas-0.1.0.zip"), [401, 403]))

if (key) {
  console.log("\nWith the licence key")
  const auth = { authorization: `Bearer ${key}` }
  await check("licence check accepts the key", async () => {
    const res = await get("/api/v1/license/verify", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key }) })
    expect(((await res.json()) as { valid?: boolean }).valid === true, "the key was refused")
  })
  await check("Pro registry item", async () => {
    const res = await get("/r/pro/hero-pro-1.json", { headers: auth })
    status(res, 200)
    expect(res.headers.get("cache-control")?.includes("no-store"), "Pro JSON may be cached")
    const body = (await res.json()) as { files?: { content?: string }[] }
    expect(body.files?.[0]?.content, "no source in the item")
  })
  await check("Pro starter archive", async () => {
    const res = await get("/r/pro/starters/beacon-saas-0.1.0.tar.gz", { headers: auth })
    status(res, 200)
    const bytes = new Uint8Array(await res.arrayBuffer())
    expect(bytes[0] === 0x1f && bytes[1] === 0x8b, "not a gzip file")
    return `${(bytes.length / 1e6).toFixed(1)} MB`
  })
  let cookie = ""
  await check("browser login", async () => {
    const res = await get("/api/pro/session", { method: "POST", headers: { "content-type": "application/json", origin }, body: JSON.stringify({ key }) })
    status(res, 200)
    cookie = res.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ")
    expect(cookie.includes("bm_pro"), "no session cookie")
  })
  await check("Pro code with the login", async () => {
    const res = await get("/api/pro/items/hero-pro-1", { headers: { cookie, origin } })
    status(res, 200)
    const body = (await res.json()) as { files?: { html?: string }[] }
    expect(body.files?.[0]?.html?.includes("<pre"), "no highlighted code")
  })
  await check("Pro download with the login", async () => {
    const res = await get("/api/pro/download/kits/ballmac-figma-tokens.tar.gz", { headers: { cookie, origin } })
    status(res, 200)
    expect(res.headers.get("content-disposition")?.includes("attachment"), "not a download")
  })
}

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed ? 1 : 0)
