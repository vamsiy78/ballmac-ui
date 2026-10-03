/**
 * Crawls every page in the sitemap and checks each link on it.
 * Internal links must answer below 400 and any #fragment must exist on the target page.
 * External links are checked once each (HEAD, then GET); a failure is reported as a warning unless --strict-external.
 * Usage: pnpm link:crawl --base-url http://localhost:3400 [--no-external] [--strict-external]
 */
const args = process.argv.slice(2)
const flag = (n: string) => args.includes(n)
const val = (n: string, d: string) => (args.includes(n) ? args[args.indexOf(n) + 1]! : d)
const base = val("--base-url", "http://localhost:3400").replace(/\/$/, "")
const skipExternal = flag("--no-external")
const strictExternal = flag("--strict-external")
const CANONICAL = "https://ui.ballmac.com"
const decode = (s: string) => s.replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"')

const sitemap = await (await fetch(`${base}/sitemap.xml`)).text()
const pages = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]!).pathname)
console.log(`${pages.length} pages in the sitemap`)

const pageCache = new Map<string, { status: number; ids: Set<string> }>()
async function page(path: string) {
  const hit = pageCache.get(path)
  if (hit) return hit
  const res = await fetch(base + path, { redirect: "follow" })
  const html = res.headers.get("content-type")?.includes("html") ? await res.text() : ""
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]!))
  const out = { status: res.status, ids }
  pageCache.set(path, out)
  return out
}

const internal = new Map<string, Set<string>>() // target -> pages linking to it
const external = new Map<string, Set<string>>()
const htmlOf = new Map<string, string>()
let next = 0
async function crawl() {
  while (next < pages.length) {
    const p = pages[next++]!
    const res = await fetch(base + p)
    const html = await res.text()
    htmlOf.set(p, html)
    const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]!))
    pageCache.set(p, { status: res.status, ids })
    for (const m of html.matchAll(/<a\s[^>]*?href="([^"]*)"/g)) {
      const href = decode(m[1]!)
      if (!href || /^(mailto:|tel:|javascript:|data:)/.test(href)) continue
      let url: URL
      try {
        url = new URL(href, base + p)
      } catch {
        continue
      }
      const add = (bucket: Map<string, Set<string>>, key: string) => {
        if (!bucket.has(key)) bucket.set(key, new Set())
        bucket.get(key)!.add(p)
      }
      // The production address of this site is checked against the server being crawled.
      if (url.origin === base || url.origin === CANONICAL) add(internal, url.pathname + url.search + url.hash)
      else {
        add(external, url.href.replace(/#.*$/, ""))
        // "Open in v0" links carry a registry URL of this site in their query; that must resolve here too.
        const inner = url.searchParams.get("url")
        if (inner?.startsWith(CANONICAL)) add(internal, new URL(inner).pathname)
      }
    }
  }
}
await Promise.all(Array.from({ length: 8 }, crawl))

const problems: string[] = []
const warnings: string[] = []
let checked = 0
let demoPlaceholders = 0
const targets = [...internal.keys()]
let ti = 0
async function checkInternal() {
  while (ti < targets.length) {
    const t = targets[ti++]!
    const hashAt = t.indexOf("#")
    const path = hashAt === -1 ? t : t.slice(0, hashAt)
    const frag = hashAt === -1 ? "" : decodeURIComponent(t.slice(hashAt + 1))
    const target = await page(path || "/").catch(() => ({ status: 0, ids: new Set<string>() }))
    checked++
    const from = [...internal.get(t)!].slice(0, 2).join(", ")
    // The private registry answers 401 without a licence key, by design.
    if (target.status === 401 && path.startsWith("/r/pro/")) continue
    if (target.status >= 400 || target.status === 0) problems.push(`${t} → ${target.status} (linked from ${from})`)
    else if (frag && frag !== "top" && !target.ids.has(frag)) {
      // Sample navigation inside a component, block or template demo points at placeholder anchors on purpose.
      const demoOnly = [...internal.get(t)!].every((f) => /^\/(components|blocks|templates)\//.test(f))
      if (demoOnly) demoPlaceholders++
      else problems.push(`${t} → no element with id "${frag}" (linked from ${from})`)
    }
  }
}
await Promise.all(Array.from({ length: 8 }, checkInternal))
console.log(`${checked} internal link targets checked (${demoPlaceholders} placeholder anchors inside component demos ignored)`)

if (!skipExternal) {
  const urls = [...external.keys()]
  let ei = 0
  async function checkExternal() {
    while (ei < urls.length) {
      const u = urls[ei++]!
      let status = 0
      for (const method of ["HEAD", "GET"]) {
        try {
          const r = await fetch(u, { method, redirect: "follow", signal: AbortSignal.timeout(15000), headers: { "user-agent": "Mozilla/5.0 (compatible; ballmac-link-check)" } })
          status = r.status
          if (status < 400) break
        } catch {
          status = 0
        }
      }
      if (status >= 400 || status === 0) {
        const msg = `${u} → ${status || "no answer"} (linked from ${[...external.get(u)!].slice(0, 2).join(", ")})`
        // 401/403/429 usually mean the site refuses automated requests, not that the link is broken.
        ;(strictExternal || ![401, 403, 429, 999].includes(status) ? problemsExternal : warnings).push(msg)
      }
    }
  }
  var problemsExternal: string[] = []
  await Promise.all(Array.from({ length: 8 }, checkExternal))
  console.log(`${urls.length} external links checked`)
  problems.push(...problemsExternal.filter((m) => strictExternal))
  for (const m of problemsExternal.filter(() => !strictExternal)) warnings.push(m)
}

for (const w of warnings) console.log(`warn  ${w}`)
for (const p of problems) console.log(`FAIL  ${p}`)
console.log(problems.length ? `\n${problems.length} broken link(s)` : "\n✓ no broken internal links")
if (problems.length) process.exit(1)
