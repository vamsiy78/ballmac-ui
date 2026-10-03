/**
 * Captures every Ballmac component, block and template as images and self-contained HTML, for building the Figma kit.
 *
 *   pnpm figma:capture --base-url http://localhost:3400                (needs the site running: pnpm build, then next start)
 *     --out figma-kit            output folder (default figma-kit; captures go in captures/, plus manifest.json)
 *     --filter hero-pro,button   only items whose name starts with one of these
 *     --tier free|pro|all        default all
 *     --kind block,template      default every kind that has previews
 *     --examples demo|all        only each item's first example (default) or every variant
 *     --concurrency 4            browser pages at once
 *     --force                    recapture files that already exist
 *
 * For each preview it writes, at 1440 and 390 px wide in light and dark:
 *   <category>/<item>/<example>.<width>.<mode>.png    a screenshot (full height for blocks and templates, cropped to the component otherwise)
 *   <category>/<item>/<example>.<width>.<mode>.html   the rendered page, scripts removed, linking one shared stylesheet in captures/assets/
 * manifest.json lists every item, its variants and each file with pixel sizes, so a script or a person can build frames from it.
 * Needs Playwright with Chromium (PLAYWRIGHT_CHROMIUM_EXECUTABLE overrides the browser path).
 */
import { createHash } from "node:crypto"
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs"
import { dirname, isAbsolute, join } from "node:path"

import { chromium, type Browser, type BrowserContext } from "playwright"

const arg = (n: string, d?: string) => {
  const i = process.argv.indexOf(`--${n}`)
  return i > -1 ? process.argv[i + 1] : d
}
const flag = (n: string) => process.argv.includes(`--${n}`)

export const VIEWPORTS = [
  { id: "1440", width: 1440, height: 900 },
  { id: "390", width: 390, height: 844 },
] as const
export const MODES = ["light", "dark"] as const

type IndexItem = { name: string; title: string; kind: string; category: string; tier: string; blockCategory?: string; examples: string[]; url: string }
type Shot = { png: string; html: string; width: number; height: number }
type Entry = { name: string; title: string; kind: string; category: string; blockCategory?: string; tier: string; url: string; variants: { example: string; files: Record<string, Shot> }[] }

/** Which items to capture, from the site's public index. */
export function selectItems(items: IndexItem[], opts: { filter?: string[]; tier?: string; kinds?: string[] }) {
  return items.filter((i) => {
    if (!i.examples.length) return false
    if (opts.tier && opts.tier !== "all" && i.tier !== opts.tier) return false
    if (opts.kinds?.length && !opts.kinds.includes(i.kind)) return false
    if (opts.filter?.length && !opts.filter.some((f) => i.name === f || i.name.startsWith(f))) return false
    return true
  })
}

export const fileBase = (item: Pick<IndexItem, "category" | "name">, example: string, viewport: string, mode: string) => `${item.category}/${item.name}/${example}.${viewport}.${mode}`

function pngSize(file: string) {
  const b = readFileSync(file)
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) }
}

async function capture(context: BrowserContext, base: string, item: IndexItem, example: string, vp: (typeof VIEWPORTS)[number], mode: (typeof MODES)[number], out: string, force: boolean): Promise<Shot> {
  const stem = fileBase(item, example, vp.id, mode)
  const png = join(out, "captures", `${stem}.png`)
  const html = join(out, "captures", `${stem}.html`)
  if (!force && existsSync(png) && existsSync(html) && statSync(png).size > 0) return { png: `captures/${stem}.png`, html: `captures/${stem}.html`, ...pngSize(png) }
  mkdirSync(dirname(png), { recursive: true })
  const page = await context.newPage()
  try {
    await page.addInitScript((m) => {
      try {
        localStorage.setItem("bm-theme", m)
      } catch {}
    }, mode)
    await page.goto(`${base}/preview/${example}`, { waitUntil: "networkidle" })
    await page.evaluate((m) => document.documentElement.classList.toggle("dark", m === "dark"), mode)
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(500)
    const fullPage = item.category === "blocks" || item.category === "templates"
    if (fullPage) {
      await page.screenshot({ path: png, fullPage: true, animations: "disabled" })
    } else {
      // Components sit centred on a stage: crop to the component with some air around it.
      const box = await page.locator(".bm-stage > *").first().boundingBox()
      if (box) {
        const pad = 24
        const x = Math.max(0, box.x - pad)
        const y = Math.max(0, box.y - pad)
        await page.screenshot({ path: png, animations: "disabled", clip: { x, y, width: Math.min(vp.width - x, box.width + pad * 2), height: box.height + pad * 2 }, fullPage: true })
      } else await page.screenshot({ path: png, fullPage: true, animations: "disabled" })
    }
    // The rendered page with scripts removed. The site's CSS is the same for every preview, so it is written once to
    // captures/assets/<hash>.css and linked, which keeps each HTML file small.
    const doc = await page.evaluate(() => {
      const css = [...document.styleSheets]
        .map((s) => {
          try {
            return [...s.cssRules].map((r) => r.cssText).join("\n")
          } catch {
            return ""
          }
        })
        .join("\n")
      const clone = document.documentElement.cloneNode(true) as HTMLElement
      clone.querySelectorAll("script, noscript, link[rel=stylesheet], link[rel=preload], link[rel=modulepreload], style").forEach((n) => n.remove())
      return { html: clone.outerHTML, css, origin: location.origin }
    })
    const hash = createHash("sha256").update(doc.css).digest("hex").slice(0, 12)
    const cssFile = join(out, "captures/assets", `${hash}.css`)
    const depth = "../".repeat(stem.split("/").length - 1)
    // Root-relative addresses (images, fonts) point at the site so the file still shows them when opened elsewhere.
    const absolute = (text: string) => text.replace(/(src|href|srcset|poster)="\//g, `$1="${doc.origin}/`).replace(/url\(\s*(["']?)\//g, `url($1${doc.origin}/`)
    if (!existsSync(cssFile)) {
      mkdirSync(dirname(cssFile), { recursive: true })
      writeFileSync(cssFile, absolute(doc.css))
    }
    writeFileSync(html, `<!doctype html>\n${absolute(doc.html).replace("<head>", `<head><link rel="stylesheet" href="${depth}assets/${hash}.css">`)}`)
    return { png: `captures/${stem}.png`, html: `captures/${stem}.html`, ...pngSize(png) }
  } finally {
    await page.close()
  }
}

async function main() {
  const base = (arg("base-url") ?? "http://localhost:3400").replace(/\/$/, "")
  const outArg = arg("out", "figma-kit")!
  const out = isAbsolute(outArg) ? outArg : join(import.meta.dirname, "..", outArg)
  const concurrency = Number(arg("concurrency", "4"))
  const res = await fetch(`${base}/api/v1/index.json`)
  if (!res.ok) throw new Error(`Cannot read ${base}/api/v1/index.json (${res.status}). Is the site running?`)
  const index = (await res.json()) as { items: IndexItem[] }
  const items = selectItems(index.items, { filter: arg("filter")?.split(","), tier: arg("tier"), kinds: arg("kind")?.split(",") })
  const allVariants = arg("examples", "demo") === "all"
  const jobs = items.flatMap((item) => (allVariants ? item.examples : item.examples.slice(0, 1)).map((example) => ({ item, example })))
  console.log(`Capturing ${items.length} items, ${jobs.length} previews × ${VIEWPORTS.length} widths × ${MODES.length} modes = ${jobs.length * VIEWPORTS.length * MODES.length} captures`)

  const browser: Browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined })
  const contexts = new Map<string, BrowserContext>()
  for (const vp of VIEWPORTS) contexts.set(vp.id, await browser.newContext({ viewport: { width: vp.width, height: vp.height }, reducedMotion: "reduce", deviceScaleFactor: 1 }))

  const entries = new Map<string, Entry>()
  let done = 0
  const failures: string[] = []
  const queue = [...jobs]
  async function worker() {
    for (let job = queue.shift(); job; job = queue.shift()) {
      const { item, example } = job
      const files: Record<string, Shot> = {}
      for (const vp of VIEWPORTS) {
        for (const mode of MODES) {
          try {
            files[`${vp.id}-${mode}`] = await capture(contexts.get(vp.id)!, base, item, example, vp, mode, out, flag("force"))
          } catch (error) {
            failures.push(`${example} ${vp.id} ${mode}: ${(error as Error).message.split("\n")[0]}`)
          }
        }
      }
      const entry = entries.get(item.name) ?? { name: item.name, title: item.title, kind: item.kind, category: item.category, blockCategory: item.blockCategory, tier: item.tier, url: item.url, variants: [] }
      entry.variants.push({ example, files })
      entries.set(item.name, entry)
      if (++done % 10 === 0 || done === jobs.length) console.log(`  ${done}/${jobs.length}`)
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker))
  await browser.close()

  const manifest = {
    generatedAt: new Date().toISOString(),
    source: base,
    viewports: VIEWPORTS,
    modes: MODES,
    items: [...entries.values()].sort((a, b) => a.name.localeCompare(b.name)),
  }
  mkdirSync(out, { recursive: true })
  writeFileSync(join(out, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n")
  console.log(`✓ ${manifest.items.length} items → ${out}/manifest.json`)
  if (failures.length) {
    console.error(`✗ ${failures.length} capture(s) failed:\n  ${failures.slice(0, 20).join("\n  ")}`)
    process.exit(1)
  }
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) await main()
