/**
 * Tells Bing and the other IndexNow search engines about new and changed pages, so they do not have to wait for a crawl.
 *
 *   pnpm indexnow                  the URLs in the live sitemap that changed in the last two days
 *   pnpm indexnow --all            every URL in the sitemap (use once, or after a big change)
 *   pnpm indexnow --dry-run        show what would be sent
 *   pnpm indexnow --site https://example.com
 *
 * The key is the name of the file in apps/www/public (`<32 hex characters>.txt`, containing the same key). IndexNow checks that the
 * file is served at the site root. The key is not a secret. The workflow in .github/workflows/indexnow.yml runs this after every
 * successful production deploy.
 */
import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

const ROOT = join(import.meta.dirname, "..")
const ENDPOINT = "https://api.indexnow.org/indexnow"
const BATCH = 10_000
const DAY = 24 * 60 * 60 * 1000

export type SitemapEntry = { url: string; lastmod?: string }

/** The `<loc>` and `<lastmod>` of every `<url>` in a sitemap. */
export function parseSitemap(xml: string): SitemapEntry[] {
  return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].flatMap(([, block]) => {
    const url = block!.match(/<loc>([^<]+)<\/loc>/)?.[1]?.trim()
    return url ? [{ url, lastmod: block!.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1]?.trim() }] : []
  })
}

/** Entries changed within `days` days of `now`. An entry with no date counts as changed. */
export function changedWithin(entries: SitemapEntry[], days: number, now = Date.now()) {
  return entries.filter((e) => {
    const t = e.lastmod ? Date.parse(e.lastmod) : NaN
    return Number.isNaN(t) || now - t <= days * DAY
  })
}

export const chunk = <T>(items: T[], size: number) => Array.from({ length: Math.ceil(items.length / size) }, (_, i) => items.slice(i * size, (i + 1) * size))

/** The IndexNow key: the name of the `<32 hex>.txt` file in public/. */
export function findKey(dir = join(ROOT, "apps/www/public")) {
  const file = readdirSync(dir).find((f) => /^[a-f0-9]{32}\.txt$/.test(f))
  if (!file) throw new Error(`No IndexNow key file (<32 hex characters>.txt) in ${dir}`)
  const key = file.replace(/\.txt$/, "")
  if (readFileSync(join(dir, file), "utf8").trim() !== key) throw new Error(`${file} must contain the key ${key}`)
  return key
}

async function main() {
  const args = process.argv.slice(2)
  const site = (args.includes("--site") ? args[args.indexOf("--site") + 1]! : "https://ui.ballmac.com").replace(/\/$/, "")
  const key = findKey()
  const keyLocation = `${site}/${key}.txt`

  const sitemap = await fetch(`${site}/sitemap.xml`)
  if (!sitemap.ok) throw new Error(`${site}/sitemap.xml answered ${sitemap.status}`)
  const entries = parseSitemap(await sitemap.text())
  const urls = (args.includes("--all") ? entries : changedWithin(entries, 2)).map((e) => e.url)
  console.log(`${urls.length} of ${entries.length} URL(s) to send`)
  if (!urls.length) return
  if (args.includes("--dry-run")) return void console.log(urls.slice(0, 10).join("\n"))

  // IndexNow only accepts a key it can read from the site.
  const served = await fetch(keyLocation).then((r) => (r.ok ? r.text() : ""))
  if (served.trim() !== key) throw new Error(`The key file is not served at ${keyLocation} yet (deploy first)`)

  for (const urlList of chunk(urls, BATCH)) {
    const res = await fetch(ENDPOINT, { method: "POST", headers: { "content-type": "application/json; charset=utf-8" }, body: JSON.stringify({ host: new URL(site).host, key, keyLocation, urlList }) })
    // 200 and 202 both mean accepted. 422 is a URL outside the host, 403 a key it cannot verify.
    if (res.status !== 200 && res.status !== 202) throw new Error(`IndexNow answered ${res.status}: ${(await res.text()).slice(0, 200)}`)
    console.log(`sent ${urlList.length} URL(s): ${res.status}`)
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main()
