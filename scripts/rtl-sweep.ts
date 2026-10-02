/**
 * Loads every preview left-to-right and right-to-left and compares the layout.
 *
 * Mirror score: for each element, where it sits in RTL should be where its mirror image sat in LTR
 * (left_rtl = width - right_ltr). The score is the share of elements that are not where the mirror says.
 * Page overflow is reported separately. A low score means the layout follows the reading direction.
 *
 * Usage: start the production server (`next start -p 3301` in apps/www), then
 *   PLAYWRIGHT_CHROMIUM_EXECUTABLE=<chrome, optional> tsx scripts/rtl-sweep.ts [name-filter…]
 *   RTL_MAX=0.2 sets the score above which a preview is reported (default 0.15).
 *   RTL_AXE=1 also runs axe (serious and critical) on each right-to-left page.
 */
import AxeBuilder from "@axe-core/playwright"
import { chromium, type Page } from "playwright"
import { readFile } from "node:fs/promises"
import { resolve } from "node:path"

const base = process.env.RTL_BASE ?? "http://127.0.0.1:3301"
const max = Number(process.env.RTL_MAX ?? 0.15)
const filter = process.argv.slice(2)
const index = JSON.parse(await readFile(resolve(import.meta.dirname, "../apps/www/lib/generated/index.json"), "utf8")) as { examples?: { name: string }[] }[]
const names = index.flatMap((i) => i.examples?.map((e) => e.name) ?? []).filter((n) => !filter.length || filter.some((f) => n.includes(f)))
const exceptions = JSON.parse(await readFile(resolve(import.meta.dirname, "rtl-exceptions.json"), "utf8")) as { file: string }[]
const skipped = new Set(exceptions.map((e) => e.file.split("/").pop()!.replace(".tsx", "")))
// Previews that are not meant to be mirror images (code, charts, pixel-positioned or decorative), with reasons.
const known = JSON.parse(await readFile(resolve(import.meta.dirname, "rtl-sweep-known.json"), "utf8")) as { prefix: string; reason: string }[]
const isKnown = (name: string) => known.some((k) => name.startsWith(k.prefix)) || [...skipped].some((f) => name === f || name.startsWith(`${f}-`))

type Box = { tag: string; l: number; r: number; t: number; b: number }

async function boxes(page: Page): Promise<{ boxes: Box[]; width: number; overflow: boolean }> {
  return page.evaluate(() => {
    const width = document.documentElement.clientWidth
    const out: { tag: string; l: number; r: number; t: number; b: number }[] = []
    for (const el of document.body.querySelectorAll("*")) {
      if (["SCRIPT", "STYLE", "NEXT-ROUTE-ANNOUNCER", "svg", "path", "circle", "rect", "line", "g", "defs", "use", "polyline", "polygon", "ellipse", "text"].includes(el.tagName)) continue
      const r = el.getBoundingClientRect()
      if (r.width < 4 || r.height < 4) continue
      const s = getComputedStyle(el)
      if (s.visibility === "hidden" || s.display === "none") continue
      out.push({ tag: el.tagName.toLowerCase(), l: r.left, r: r.right, t: r.top, b: r.bottom })
    }
    return { boxes: out, width, overflow: document.documentElement.scrollWidth > width + 1 }
  })
}

async function load(page: Page, name: string, rtl: boolean) {
  await page.goto(`${base}/preview/${encodeURIComponent(name)}${rtl ? "?dir=rtl" : ""}`, { waitUntil: "networkidle" })
  await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important}" })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(350)
}

const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE })
const results: { name: string; width: number; score: number; overflow: boolean; counts?: string }[] = []
const axeFindings: string[] = []
let next = 0
async function worker() {
  const context = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1100, height: 800 } })
  const page = await context.newPage()
  while (next < names.length) {
    const name = names[next++]!
    for (const width of [1100, 390]) {
      try {
        await page.setViewportSize({ width, height: 800 })
        await load(page, name, false)
        const a = await boxes(page)
        await load(page, name, true)
        const dir = await page.evaluate(() => document.documentElement.dir)
        const b = await boxes(page)
        if (dir !== "rtl") throw new Error("dir did not switch")
        if (process.env.RTL_AXE) {
          const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze()
          for (const v of r.violations.filter((x) => (x.impact === "serious" || x.impact === "critical") && x.id !== "aria-hidden-focus")) axeFindings.push(`${name} @${width} (rtl): ${v.id} ${v.nodes.slice(0, 2).map((n) => n.target.join(" ")).join(" | ")}`)
        }
        if (a.boxes.length !== b.boxes.length) {
          results.push({ name, width, score: 1, overflow: b.overflow, counts: `${a.boxes.length} vs ${b.boxes.length} elements` })
          continue
        }
        let off = 0
        for (let i = 0; i < a.boxes.length; i++) {
          const x = a.boxes[i]!
          const y = b.boxes[i]!
          const mirrored = a.width - x.r
          if (Math.abs(y.l - mirrored) > 3 || Math.abs(y.t - x.t) > 40) off++
        }
        results.push({ name, width, score: off / Math.max(a.boxes.length, 1), overflow: b.overflow && !a.overflow })
      } catch (e) {
        results.push({ name, width, score: 1, overflow: false, counts: `error: ${(e as Error).message.slice(0, 80)}` })
      }
    }
  }
  await context.close()
}
await Promise.all(Array.from({ length: Number(process.env.RTL_WORKERS ?? 4) }, worker))
await browser.close()

const bad = results.filter((r) => (r.score > max || r.overflow) && !isKnown(r.name))
bad.sort((a, b) => b.score - a.score)
for (const r of bad) console.log(`${r.name} @${r.width}: ${Math.round(r.score * 100)}% off${r.overflow ? ", page overflows only in RTL" : ""}${r.counts ? ` (${r.counts})` : ""}`)
const worst = new Map<string, number>()
for (const r of results) worst.set(r.name, Math.max(worst.get(r.name) ?? 0, r.score))
for (const f of axeFindings) console.log(f)
console.log(`RTL sweep: ${names.length} previews, ${bad.length} scan(s) above ${Math.round(max * 100)}% or overflowing${process.env.RTL_AXE ? `, ${axeFindings.length} axe finding(s)` : ""}.`)
process.exit(bad.length || axeFindings.length ? 1 : 0)
