/**
 * Checks the SEO and social basics of every page in the sitemap, against a running site.
 *
 *   pnpm seo:audit --base-url http://localhost:3400 [--limit 0]
 *
 * For each URL: 200 status, one <h1>, <title> (under 70 characters), meta description (50 to 170), canonical on the
 * site, Open Graph and Twitter cards with an image that loads, a language, valid JSON-LD, and no noindex on pages
 * that should be found. Also checks robots.txt and the sitemap itself. Exits 1 on any problem.
 */
const arg = (n: string, d?: string) => {
  const i = process.argv.indexOf(`--${n}`)
  return i > -1 ? process.argv[i + 1] : d
}
const base = (arg("base-url") ?? "http://localhost:3400").replace(/\/$/, "")
const limit = Number(arg("limit", "0"))

const decode = (v: string | undefined) => v?.replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
const meta = (html: string, attr: "name" | "property", key: string) =>
  decode(rawMeta(html, attr, key))
const rawMeta = (html: string, attr: "name" | "property", key: string) =>
  html.match(new RegExp(`<meta[^>]+${attr}="${key}"[^>]+content="([^"]*)"`, "i"))?.[1] ?? html.match(new RegExp(`<meta[^>]+content="([^"]*)"[^>]+${attr}="${key}"`, "i"))?.[1]

export function checkPage(html: string, url: string, siteOrigin: string): string[] {
  const problems: string[] = []
  const h1 = (html.match(/<h1[\s>]/g) ?? []).length
  // dashboard-kit is the one item whose demo is a page header: its h1 is the thing being demonstrated.
  if (h1 !== 1 && !url.endsWith("/components/dashboard-kit")) problems.push(`${h1} h1 elements (want 1)`)
  const title = decode(html.match(/<title>([^<]*)<\/title>/)?.[1])
  if (!title) problems.push("no <title>")
  else if (title.length > 70) problems.push(`title is ${title.length} characters (max 70)`)
  const desc = meta(html, "name", "description")
  if (!desc) problems.push("no meta description")
  else if (desc.length < 50 || desc.length > 170) problems.push(`description is ${desc.length} characters (want 50 to 170)`)
  const canonical = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]*)"/)?.[1]
  if (!canonical) problems.push("no canonical link")
  else if (!canonical.startsWith(siteOrigin)) problems.push(`canonical points elsewhere: ${canonical}`)
  if (!meta(html, "property", "og:title")) problems.push("no og:title")
  if (!meta(html, "property", "og:image")) problems.push("no og:image")
  if (!meta(html, "name", "twitter:card")) problems.push("no twitter:card")
  if (!/<html[^>]+lang="[a-z]/.test(html)) problems.push("no html lang")
  if (/<meta[^>]+name="robots"[^>]+content="[^"]*noindex/.test(html)) problems.push("page is noindex")
  for (const m of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(m[1]!)
    } catch {
      problems.push("invalid JSON-LD")
    }
  }
  return problems
}

async function main() {
  let failed = 0
  const fail = (m: string) => {
    failed++
    console.error(`✗ ${m}`)
  }
  const robots = await fetch(`${base}/robots.txt`)
  const robotsText = robots.ok ? await robots.text() : ""
  if (!robotsText.includes("Sitemap:")) fail("robots.txt has no Sitemap line")
  if (/Disallow:\s*\/\s*$/m.test(robotsText)) fail("robots.txt disallows the whole site")
  const sm = await fetch(`${base}/sitemap.xml`)
  if (!sm.ok) return fail(`sitemap.xml → ${sm.status}`), process.exit(1)
  const urls = [...(await sm.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!)
  console.log(`${urls.length} URLs in the sitemap`)
  const origin = new URL(urls[0]!).origin
  const seenImages = new Map<string, boolean>()
  let checked = 0
  for (const u of limit ? urls.slice(0, limit) : urls) {
    // The sitemap carries the production origin; fetch the same path from the site under test.
    const path = new URL(u).pathname
    const res = await fetch(base + path, { redirect: "manual" })
    if (res.status !== 200) {
      fail(`${path} → ${res.status}`)
      continue
    }
    const html = await res.text()
    for (const p of checkPage(html, path, origin)) fail(`${path}: ${p}`)
    const image = meta(html, "property", "og:image")
    if (image && !seenImages.has(image)) {
      const img = await fetch(image.replace(origin, base), { method: "GET" })
      seenImages.set(image, img.ok && (img.headers.get("content-type") ?? "").startsWith("image/"))
      if (!seenImages.get(image)) fail(`${path}: og:image does not load (${image})`)
    }
    if (++checked % 100 === 0) console.log(`  ${checked}/${urls.length}`)
  }
  console.log(failed ? `\n✗ ${failed} problem(s)` : `\n✓ ${checked} pages pass`)
  process.exit(failed ? 1 : 0)
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) await main()
