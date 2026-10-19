/**
 * Measures every component, block and template example in a real browser and writes the results to registry/quality.json, which the
 * scorecard on each item page and the /quality page read. Nothing is claimed that was not observed here.
 *
 *   pnpm quality                       measure what is missing or out of date (an item's version changed)
 *   pnpm quality --force               measure everything again
 *   pnpm quality --filter button,hero  only items whose name starts with one of these
 *   pnpm quality --base-url http://localhost:3301   use a server that is already running (default: start `next start` on 3302)
 *   pnpm quality --workers 6           parallel browsers (default 4)
 *   pnpm quality --check               list items with no scorecard or a stale one and exit 1 if there are any (CI)
 *
 * Needs the production site built (`pnpm build:registry && pnpm --filter @ballmac-ui/www build`), with Pro mounted to measure Pro items,
 * and Playwright's Chromium. Per example, in light and dark:
 *   accessibility  axe-core, WCAG 2.0 A/AA, 2.1 A/AA, 2.2 AA and best-practice rules, serious and critical violations, at 1280 and 390 px
 *   small screens  horizontal overflow at 1280, 390 and 360 px
 *   reduced motion endless animations still running when the visitor asks for less motion (CSS and Web Animations)
 *   right to left  the layout against its mirror image (the same method as scripts/rtl-sweep.ts)
 *   console        errors logged while loading, including React hydration errors
 *   keyboard       every tab stop shows some visible change when it takes focus
 * Facts that are not measured in a browser (states, documented keys, tests, source size) are read from the item's metadata and files.
 */
import { spawn, type ChildProcess } from "node:child_process"
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs"
import { createRequire } from "node:module"
import { join, relative } from "node:path"
import { gzipSync } from "node:zlib"

import { record, summarize, type QualityRun } from "./quality-history"

import AxeBuilder from "@axe-core/playwright"
import { chromium, type Browser, type BrowserContext, type Page } from "playwright"

const ROOT = join(import.meta.dirname, "..")
const OUT = join(ROOT, "registry/quality.json")
const HISTORY = join(ROOT, "registry/quality-history.json")
const arg = (n: string, d?: string) => {
  const i = process.argv.indexOf(`--${n}`)
  return i > -1 ? process.argv[i + 1] : d
}
const flag = (n: string) => process.argv.includes(`--${n}`)

type Item = {
  name: string
  title: string
  category: string
  tier: "free" | "pro"
  version: string
  states: { id: string }[]
  statesNone?: string
  dependencies: string[]
  ai?: { a11y?: { keys: string; action: string }[] }
  examples: { name: string; file: string }[]
  files: { path: string; source: string }[]
}

/** Raw measurements for one example. Short keys: this file has one of these per example. */
export type Measured = {
  /** serious or critical axe violation ids, per theme and width */
  ax: Record<"light" | "dark", Record<"1280" | "390", string[]>>
  /** widths (px) at which the page scrolled sideways */
  ov: number[]
  /** console errors while loading (light, dark and reduced motion, de-duplicated) */
  ce: string[]
  /** endless animations running with reduced motion on: descriptions */
  rm: string[]
  /** animations of any kind running forever with normal motion (0 means the question does not arise) */
  inf: number
  /** right to left: share of elements that are not where the mirror image says, at 1100 px; null when it could not be measured */
  rtl: number | null
  /** keyboard: tab stops, and how many showed no change on focus */
  kb: { stops: number; none: number; where?: string[] }
  /** an error that stopped the measurement */
  err?: string
}
export type CheckStatus = "pass" | "fail" | "na" | "info"
export type Check = { id: string; label: string; status: CheckStatus; detail: string }
export type ItemQuality = {
  /** the item version these were measured on */
  v: string
  checks: Check[]
  ex: Record<string, Measured>
  size: { files: number; gzip: number }
}
export type QualityFile = {
  schema: 1
  generated: string
  tools: { axe: string; browser: string; playwright: string }
  items: Record<string, ItemQuality>
}

const SERIOUS = new Set(["serious", "critical"])
const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]
const TABBABLE = 'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex]:not([tabindex="-1"]),[contenteditable="true"]'

async function overflowed(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)
}

async function load(page: Page, base: string, name: string, query = "") {
  await page.goto(`${base}/preview/${encodeURIComponent(name)}${query}`, { waitUntil: "networkidle", timeout: 45_000 })
  await page.evaluate(() => document.fonts.ready)
}

async function axeIds(page: Page) {
  // Let entrance animations finish: axe would otherwise measure the contrast of text that is still fading in.
  await page.evaluate(() => Promise.all(document.getAnimations().filter((a) => a.effect?.getTiming().iterations !== Infinity).map((a) => a.finished.catch(() => undefined))))
  const r = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze()
  return [...new Set(r.violations.filter((v) => SERIOUS.has(v.impact ?? "") && v.id !== "aria-hidden-focus").map((v) => v.id))].sort()
}

/** Layout boxes of every visible element, for the mirror comparison. */
async function boxes(page: Page) {
  return page.evaluate(() => {
    const width = document.documentElement.clientWidth
    const skip = new Set(["SCRIPT", "STYLE", "NEXT-ROUTE-ANNOUNCER", "svg", "path", "circle", "rect", "line", "g", "defs", "use", "polyline", "polygon", "ellipse", "text"])
    const out: { l: number; r: number; t: number; ltr: boolean }[] = []
    for (const el of document.body.querySelectorAll("*")) {
      if (skip.has(el.tagName)) continue
      const b = el.getBoundingClientRect()
      if (b.width < 4 || b.height < 4) continue
      const s = getComputedStyle(el)
      if (s.visibility === "hidden" || s.display === "none") continue
      // Inside an explicit dir="ltr" island (source code, a phone number) things read left to right on purpose; the island itself is still compared.
      const island = el.parentElement?.closest("[dir]")
      out.push({ l: b.left, r: b.right, t: b.top, ltr: island !== null && island !== undefined && island !== document.documentElement && island.getAttribute("dir") === "ltr" })
    }
    return { boxes: out, width }
  })
}

async function mirrorScore(page: Page, base: string, name: string) {
  const freeze = "*,*::before,*::after{animation:none!important;transition:none!important}"
  await page.setViewportSize({ width: 1100, height: 800 })
  await load(page, base, name)
  await page.addStyleTag({ content: freeze })
  await page.waitForTimeout(300)
  const a = await boxes(page)
  await load(page, base, name, "?dir=rtl")
  await page.addStyleTag({ content: freeze })
  await page.waitForTimeout(300)
  const dir = await page.evaluate(() => document.documentElement.dir)
  const b = await boxes(page)
  if (dir !== "rtl") return null
  if (a.boxes.length !== b.boxes.length) return 1
  // Islands are read from the right-to-left pass, where a dir="ltr" is a choice and not just the page's own direction.
  let off = 0
  let compared = 0
  for (let i = 0; i < a.boxes.length; i++) {
    if (b.boxes[i]!.ltr) continue
    compared++
    if (Math.abs(b.boxes[i]!.l - (a.width - a.boxes[i]!.r)) > 3) off++
  }
  return off / Math.max(compared, 1)
}

/** Endless animations that are running right now. */
async function endless(page: Page) {
  return page.evaluate(() =>
    document
      .getAnimations()
      .filter((a) => a.playState === "running" && a.effect?.getTiming().iterations === Infinity)
      .map((a) => {
        const target = (a.effect as KeyframeEffect | null)?.target as Element | null
        const name = (a as CSSAnimation).animationName || (a as CSSTransition).transitionProperty || "animation"
        return `${name} on <${target?.tagName.toLowerCase() ?? "?"}${target?.getAttribute?.("class") ? ` class="${target.getAttribute("class")!.split(/\s+/).slice(0, 3).join(" ")}"` : ""}>`
      })
  )
}

/** Presses Tab through the page and records whether each tab stop looks different when it has focus. */
/** Does the area around the focused element look different from the same area with focus taken away? */
async function looksFocused(page: Page): Promise<boolean> {
  const box = await page.evaluate(() => {
    const r = (document.activeElement as HTMLElement).getBoundingClientRect()
    return { x: r.left, y: r.top, w: r.width, h: r.height, vw: window.innerWidth, vh: window.innerHeight }
  })
  const pad = 48
  const x = Math.max(0, box.x - pad)
  const y = Math.max(0, box.y - pad)
  const clip = { x, y, width: Math.max(1, Math.min(box.vw - x, box.w + pad * 2)), height: Math.max(1, Math.min(box.vh - y, box.h + pad * 2)) }
  try {
    const focused = await page.screenshot({ clip, animations: "disabled", caret: "hide" })
    const handle = await page.evaluateHandle(() => document.activeElement)
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur?.())
    const plain = await page.screenshot({ clip, animations: "disabled", caret: "hide" })
    // Put focus back where it was, so the next Tab continues from here.
    await handle.evaluate((el) => (el as HTMLElement).focus({ preventScroll: true }))
    return !focused.equals(plain)
  } catch {
    return true
  }
}

async function keyboard(page: Page) {
  await page.setViewportSize({ width: 1280, height: 900 })
  const stops = await page.evaluate((sel) => {
    const visible = (el: Element) => {
      const r = el.getBoundingClientRect()
      const s = getComputedStyle(el)
      return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none"
    }
    const sig = (el: Element) => {
      const parts: string[] = []
      let e: Element | null = el
      for (let i = 0; i < 3 && e; i++, e = e.parentElement) {
        const s = getComputedStyle(e)
        parts.push([s.outlineStyle, s.outlineWidth, s.outlineColor, s.boxShadow, s.borderTopColor, s.backgroundColor, s.color, s.textDecorationLine, s.transform, s.opacity].join("|"))
      }
      return parts.join("¦")
    }
    const list = [...document.querySelectorAll(sel)].filter(visible)
    list.forEach((el, i) => {
      el.setAttribute("data-q-idx", String(i))
      ;(window as unknown as { __q: Record<string, string> }).__q ??= {}
      ;(window as unknown as { __q: Record<string, string> }).__q[i] = sig(el)
    })
    ;(window as unknown as { __sig: typeof sig }).__sig = sig
    return list.length
  }, TABBABLE)
  if (stops === 0) return { stops: 0, none: 0 }
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur?.())
  const seen = new Set<number>()
  const missing: string[] = []
  const presses = Math.min(stops + 3, 45)
  for (let i = 0; i < presses; i++) {
    await page.keyboard.press("Tab")
    const r = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null
      const idx = el?.getAttribute?.("data-q-idx")
      if (!el || el === document.body || idx == null) return null
      const w = window as unknown as { __q: Record<string, string>; __sig: (e: Element) => string }
      return { idx: Number(idx), changed: w.__sig(el) !== w.__q[idx], label: `<${el.tagName.toLowerCase()}${el.getAttribute("aria-label") ? ` aria-label="${el.getAttribute("aria-label")}"` : el.textContent?.trim() ? `>${el.textContent.trim().slice(0, 24)}` : ""}` }
    })
    if (!r || seen.has(r.idx)) continue
    seen.add(r.idx)
    // Some controls show focus on something next to them (the active slot of a one-time-code field, a ring on a wrapper), so if no style on the control changed,
    // look at the pixels around it: focused against not focused. A pure style comparison cannot see those.
    if (!r.changed && !(await looksFocused(page))) missing.push(r.label)
  }
  return { stops: seen.size || stops, none: missing.length, ...(missing.length ? { where: missing.slice(0, 4) } : {}) }
}

async function measure(contexts: { light: BrowserContext; dark: BrowserContext; reduced: BrowserContext }, base: string, name: string): Promise<Measured> {
  const m: Measured = { ax: { light: { "1280": [], "390": [] }, dark: { "1280": [], "390": [] } }, ov: [], ce: [], rm: [], inf: 0, rtl: null, kb: { stops: 0, none: 0 } }
  const errors = new Set<string>()
  try {
    for (const theme of ["light", "dark"] as const) {
      const page = await contexts[theme].newPage()
      page.on("console", (msg) => {
        const t = msg.text()
        if (msg.type() === "error" && !/favicon|Failed to load resource/i.test(t)) errors.add(t.split("\n")[0]!.slice(0, 160))
      })
      page.on("pageerror", (e) => errors.add(String(e.message).split("\n")[0]!.slice(0, 160)))
      try {
        await page.setViewportSize({ width: 1280, height: 900 })
        await load(page, base, name)
        m.ax[theme]["1280"] = await axeIds(page)
        if (theme === "light" && (await overflowed(page))) m.ov.push(1280)
        await page.setViewportSize({ width: 390, height: 844 })
        await page.waitForTimeout(200)
        m.ax[theme]["390"] = await axeIds(page)
        if (theme === "light") {
          if (await overflowed(page)) m.ov.push(390)
          await page.setViewportSize({ width: 360, height: 800 })
          await page.waitForTimeout(150)
          if (await overflowed(page)) m.ov.push(360)
          // The keyboard pass comes last, on a fresh page, because focusing things can open popovers that would colour the other checks.
          await load(page, base, name)
          m.kb = await keyboard(page)
        }
      } finally {
        await page.close()
      }
    }
    // Reduced motion: what is still running forever, and how much runs forever with normal motion.
    const normal = await contexts.light.newPage()
    try {
      await load(normal, base, name)
      await normal.waitForTimeout(500)
      m.inf = (await endless(normal)).length
    } finally {
      await normal.close()
    }
    const reduced = await contexts.reduced.newPage()
    reduced.on("console", (msg) => {
      const t = msg.text()
      if (msg.type() === "error" && !/favicon|Failed to load resource/i.test(t)) errors.add(t.split("\n")[0]!.slice(0, 160))
    })
    try {
      await load(reduced, base, name)
      await reduced.waitForTimeout(600)
      m.rm = [...new Set(await endless(reduced))].slice(0, 4)
      m.rtl = await mirrorScore(reduced, base, name)
    } finally {
      await reduced.close()
    }
  } catch (e) {
    const message = String((e as Error).message).split("\n")[0]!.slice(0, 160)
    // A browser that was closed under us (the run was interrupted) says nothing about the example: stop instead of recording it.
    if (/has been closed|Target closed|Browser closed/i.test(message)) throw e
    m.err = message
  }
  m.ce = [...errors].slice(0, 3)
  m.ov = [...new Set(m.ov)].sort((a, b) => b - a)
  return m
}

// ---------- turning measurements into the checks a person reads ----------

type Facts = {
  item: Item
  testedBy: string[]
  functional: string | null
  rtlKnown: string | null
}

const list = (xs: string[], n = 3) => (xs.length > n ? `${xs.slice(0, n).join(", ")} and ${xs.length - n} more` : xs.join(", "))

export function derive(facts: Facts, ex: Record<string, Measured>, size: { files: number; gzip: number }, tools: { axe: string }): Check[] {
  const { item } = facts
  const all = Object.values(ex)
  const failed = all.find((m) => m.err)
  const checks: Check[] = []

  // Accessibility. The pass mark is WCAG 2.1 AA plus axe's best-practice rules, the bar `pnpm a11y` has always held. WCAG 2.2's 24 px target size is measured too but reported as a note, not a failure: window controls drawn at the size macOS draws them are under it by design.
  const ax: string[] = []
  const small = new Set<string>()
  for (const [name, m] of Object.entries(ex))
    for (const theme of ["light", "dark"] as const)
      for (const w of ["1280", "390"] as const)
        for (const id of m.ax[theme][w]) {
          if (id === "target-size") small.add(name)
          else ax.push(`${id} (${name}, ${theme}, ${w}px)`)
        }
  const smallNote = small.size ? ` Not part of the pass mark: some controls are smaller than the 24 px WCAG 2.2 target size (${list([...small], 2)}).` : ""
  checks.push(
    failed
      ? { id: "a11y", label: "Accessibility scan", status: "na", detail: `Could not be measured: ${failed.err}` }
      : ax.length === 0
        ? { id: "a11y", label: "Accessibility scan", status: "pass", detail: `No serious or critical issues in light and dark, on a phone and a desktop (axe-core ${tools.axe}, WCAG 2.1 AA and best-practice rules).${smallNote}` }
        : { id: "a11y", label: "Accessibility scan", status: "fail", detail: `${ax.length} issue${ax.length === 1 ? "" : "s"}: ${list(ax)}.${smallNote}` }
  )

  // Small screens
  const ov = [...new Set(all.flatMap((m) => m.ov))].sort((a, b) => a - b)
  checks.push(failed ? { id: "mobile", label: "Small screens", status: "na", detail: "Could not be measured." } : ov.length === 0 ? { id: "mobile", label: "Small screens", status: "pass", detail: "No sideways scrolling at 360, 390 or 1280 px wide." } : { id: "mobile", label: "Small screens", status: "fail", detail: `The page scrolls sideways at ${ov.join(", ")} px.` })

  // Reduced motion
  // A loading spinner is a status indicator: the library keeps it turning on purpose (see useLoopsPaused in lib/ballmac/motion.ts), and the busy state is also in aria-busy and the label.
  const isSpinner = (r: string) => /^spin on <svg/.test(r)
  const running = all.flatMap((m) => m.rm).filter((r) => !isSpinner(r))
  const spinners = all.some((m) => m.rm.some(isSpinner))
  const anyLoop = all.some((m) => m.inf > 0)
  checks.push(
    failed
      ? { id: "motion", label: "Reduced motion", status: "na", detail: "Could not be measured." }
      : running.length === 0
        ? { id: "motion", label: "Reduced motion", status: "pass", detail: spinners ? "Every decorative animation stops. A loading spinner keeps turning on purpose, because it is the only sign that work is in progress." : anyLoop ? "Every endless animation stops when the visitor asks for less motion." : "No endless animation to begin with." }
        : facts.functional
          ? { id: "motion", label: "Reduced motion", status: "pass", detail: `Keeps a status indicator moving on purpose: ${facts.functional}` }
          : { id: "motion", label: "Reduced motion", status: "fail", detail: `Still running with reduced motion on: ${list(running, 2)}.` }
  )

  // Right to left
  const scores = all.map((m) => m.rtl).filter((x): x is number => x !== null)
  const worst = scores.length ? Math.max(...scores) : null
  checks.push(
    facts.rtlKnown
      ? { id: "rtl", label: "Right to left", status: "na", detail: `Not mirrored by design: ${facts.rtlKnown}` }
      : worst === null
        ? { id: "rtl", label: "Right to left", status: "na", detail: "Could not be measured." }
        : worst <= 0.15
          ? { id: "rtl", label: "Right to left", status: "pass", detail: `Mirrors correctly in Arabic, Hebrew, Persian and Urdu layouts (${Math.round(worst * 100)}% of elements off the mirror, limit 15%).` }
          : { id: "rtl", label: "Right to left", status: "fail", detail: `${Math.round(worst * 100)}% of elements are not where the mirror image puts them (limit 15%).` }
  )

  // Console
  const ce = [...new Set(all.flatMap((m) => m.ce))]
  checks.push(failed ? { id: "console", label: "Clean console", status: "na", detail: "Could not be measured." } : ce.length === 0 ? { id: "console", label: "Clean console", status: "pass", detail: "No console errors or React hydration errors while loading." } : { id: "console", label: "Clean console", status: "fail", detail: `Logged: ${list(ce, 2)}.` })

  // Keyboard
  const stops = all.reduce((n, m) => n + m.kb.stops, 0)
  const none = all.reduce((n, m) => n + m.kb.none, 0)
  const keys = item.ai?.a11y?.length ?? 0
  const where = all.flatMap((m) => m.kb.where ?? [])
  checks.push(
    failed
      ? { id: "keyboard", label: "Keyboard", status: "na", detail: "Could not be measured." }
      : stops === 0
        ? { id: "keyboard", label: "Keyboard", status: "na", detail: "Static content: nothing to focus." }
        : none === 0
          ? { id: "keyboard", label: "Keyboard", status: "pass", detail: `${stops} tab stop${stops === 1 ? "" : "s"}, each showing a visible change when it takes focus.${keys ? ` ${keys} documented key${keys === 1 ? "" : "s"}.` : ""}` }
          : { id: "keyboard", label: "Keyboard", status: "fail", detail: `${none} of ${stops} tab stops show no visible change on focus: ${list(where, 2)}.` }
  )

  // States
  checks.push(
    item.states.length
      ? { id: "states", label: "Loading, empty and error", status: "pass", detail: `Ships ${list(item.states.map((s) => s.id), 5)} states, each with an example.` }
      : item.statesNone
        ? { id: "states", label: "Loading, empty and error", status: "na", detail: item.statesNone }
        : { id: "states", label: "Loading, empty and error", status: "na", detail: "Does not show data or take submissions." }
  )

  // Tests
  checks.push(
    facts.testedBy.length
      ? { id: "tests", label: "Automated tests", status: "pass", detail: `Covered by ${list(facts.testedBy, 2)}.` }
      : { id: "tests", label: "Automated tests", status: "info", detail: "No test file of its own yet." }
  )

  // Footprint
  const deps = item.dependencies.map((d) => d.replace(/@[\^~]?[\d.x*]+$/, ""))
  checks.push({ id: "footprint", label: "Footprint", status: "info", detail: `${(size.gzip / 1024).toFixed(1)} KB of source (gzip) in ${size.files} file${size.files === 1 ? "" : "s"}. ${deps.length ? `Installs ${list(deps, 4)}.` : "No extra npm packages."}` })
  return checks
}

// ---------- gathering the inputs ----------

function readJson<T>(path: string, fallback: T): T {
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T
  } catch {
    return fallback
  }
}
const walk = (dir: string): string[] => (existsSync(dir) ? readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)])) : [])

/** Which test files import which item, for free items (one file per item, mostly) and Pro items (one file per batch). */
function testIndex(items: Item[]) {
  const owner = new Map<string, string>()
  for (const i of items) for (const f of i.files) {
    const m = f.source.match(/registry\/(?:pro\/)?ballmac\/(components|hooks|lib)\/(.+)\.tsx?$/)
    if (m) owner.set(`@/${m[1]}/ballmac/${m[2]}`, i.name)
  }
  const out = new Map<string, Set<string>>()
  for (const dir of ["registry/tests", "registry/pro/tests"]) {
    for (const file of walk(join(ROOT, dir)).filter((f) => /\.test\.tsx?$/.test(f))) {
      const code = readFileSync(file, "utf8")
      const base = file.split("/").pop()!
      for (const m of code.matchAll(/from\s+["'](@\/(?:components|hooks|lib)\/ballmac\/[^"']+)["']/g)) {
        const name = owner.get(m[1]!) ?? owner.get(`${m[1]}/index`)
        if (name) (out.get(name) ?? out.set(name, new Set()).get(name)!).add(base)
      }
    }
  }
  return out
}

function sizeOf(item: Item) {
  let bytes = ""
  let files = 0
  for (const f of item.files) {
    const p = join(ROOT, f.source)
    if (existsSync(p)) {
      bytes += readFileSync(p, "utf8")
      files++
    }
  }
  return { files, gzip: gzipSync(Buffer.from(bytes)).length }
}

async function main() {
  const index = readJson<Item[]>(join(ROOT, "apps/www/lib/generated/index.json"), [])
  if (!index.length) throw new Error("apps/www/lib/generated/index.json is missing. Run pnpm build:registry first.")
  const filter = (arg("filter") ?? "").split(",").filter(Boolean)
  const items = index.filter((i) => i.category !== "foundation" && i.examples.length > 0 && (!filter.length || filter.some((f) => i.name.startsWith(f))))
  const existing = readJson<QualityFile | null>(OUT, null)
  // An item is measured again when it has no scorecard, when its version changed, or when an earlier run could not finish measuring it.
  const stale = (i: Item) => flag("force") || !existing?.items[i.name] || existing.items[i.name]!.v !== i.version || existing.items[i.name]!.checks.length < 9 || Object.values(existing.items[i.name]!.ex).some((m) => m.err)

  if (flag("check")) {
    const behind = items.filter(stale)
    for (const i of behind) console.log(`${i.name}: ${existing?.items[i.name] ? `measured on ${existing.items[i.name]!.v}, now ${i.version}` : "no scorecard"}`)
    console.log(`${behind.length} of ${items.length} item(s) need measuring.`)
    process.exit(behind.length ? 1 : 0)
  }

  const todo = items.filter(stale)
  if (!todo.length) return console.log(`Every one of the ${items.length} scorecards is up to date.`)

  const functionalLists = ["scripts/motion-functional.json", "registry/pro/motion-functional.json"].map((p) => readJson<Record<string, string>>(join(ROOT, p), {}))
  const functionalAll = Object.assign({}, ...functionalLists) as Record<string, string>
  const rtlKnown = readJson<{ prefix: string; reason: string }[]>(join(ROOT, "scripts/rtl-sweep-known.json"), [])
  const rtlExceptions = readJson<{ file: string; reason: string }[]>(join(ROOT, "scripts/rtl-exceptions.json"), [])
  const tested = testIndex(index)

  const baseArg = arg("base-url")
  const base = baseArg ?? "http://127.0.0.1:3302"
  let server: ChildProcess | undefined
  let browser: Browser | undefined
  const result: QualityFile = existing ?? { schema: 1, generated: "", tools: { axe: "", browser: "", playwright: "" }, items: {} }
  try {
    if (!baseArg) server = spawn(join(ROOT, "apps/www/node_modules/.bin/next"), ["start", "-p", "3302"], { cwd: join(ROOT, "apps/www"), stdio: "ignore" })
    for (let i = 0; i < 90; i++) {
      try {
        if ((await fetch(base)).ok) break
      } catch {
        /* still starting */
      }
      if (server && server.exitCode !== null) throw new Error("The site did not start. Build it first: pnpm --filter @ballmac-ui/www build")
      await new Promise((r) => setTimeout(r, 1000))
    }
    browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE })
    // axe-core sits beside @axe-core/playwright, which pnpm keeps out of the root node_modules.
    const axeVersion = (() => {
      try {
        const via = createRequire(import.meta.url).resolve("@axe-core/playwright")
        return (createRequire(via)("axe-core/package.json") as { version: string }).version
      } catch {
        return ""
      }
    })()
    result.tools = { axe: axeVersion || "4", browser: `Chromium ${browser.version()}`, playwright: readJson<{ version: string }>(join(ROOT, "node_modules/playwright/package.json"), { version: "" }).version }

    const workers = Number(arg("workers") ?? 4)
    const started = Date.now()
    let next = 0
    let done = 0
    const queue = todo
    async function worker() {
      const mk = async (opts: Parameters<Browser["newContext"]>[0], theme: "light" | "dark") => {
        const c = await browser!.newContext({ ...opts, viewport: { width: 1280, height: 900 } })
        await c.addInitScript((m) => localStorage.setItem("bm-theme", m), theme)
        // tsx wraps named functions with __name(), which does not exist in the page the functions are sent to.
        await c.addInitScript("window.__name = window.__name || ((f) => f)")
        return c
      }
      const contexts = { light: await mk({ colorScheme: "light" }, "light"), dark: await mk({ colorScheme: "dark" }, "dark"), reduced: await mk({ reducedMotion: "reduce", colorScheme: "light" }, "light") }
      while (next < queue.length) {
        const item = queue[next++]!
        const ex: Record<string, Measured> = {}
        for (const e of item.examples) ex[e.name] = await measure(contexts, base, e.name)
        const files = item.files.map((f) => f.source)
        const functional = files.map((f) => functionalAll[f]).find(Boolean) ?? null
        const known = rtlKnown.find((k) => item.examples.some((e) => e.name.startsWith(k.prefix)))?.reason ?? rtlExceptions.find((x) => files.some((f) => f === x.file))?.reason ?? null
        const size = sizeOf(item)
        result.items[item.name] = { v: item.version, ex, size, checks: derive({ item, testedBy: [...(tested.get(item.name) ?? [])].sort(), functional, rtlKnown: known }, ex, size, { axe: result.tools.axe }) }
        done++
        if (done % 10 === 0 || done === queue.length) {
          result.generated = new Date().toISOString()
          writeFileSync(OUT, JSON.stringify(sortKeys(result)) + "\n")
          console.log(`  ${done}/${queue.length} measured  (${Math.round((Date.now() - started) / 1000)} s)`)
        }
      }
      await Promise.all(Object.values(contexts).map((c) => c.close()))
    }
    await Promise.all(Array.from({ length: Math.max(1, Math.min(workers, queue.length)) }, worker))
    // Items that no longer exist are dropped.
    const names = new Set(index.map((i) => i.name))
    for (const n of Object.keys(result.items)) if (!names.has(n)) delete result.items[n]
    result.generated = new Date().toISOString()
    writeFileSync(OUT, JSON.stringify(sortKeys(result)) + "\n")
    const history = existsSync(HISTORY) ? (JSON.parse(readFileSync(HISTORY, "utf8")) as QualityRun[]) : []
    writeFileSync(HISTORY, JSON.stringify(record(history, summarize(result.items, result.generated.slice(0, 10))), null, 2) + "\n")
    const fails = Object.entries(result.items).flatMap(([n, q]) => q.checks.filter((c) => c.status === "fail").map((c) => `${n}: ${c.label}: ${c.detail}`))
    for (const f of fails) console.log(`✗ ${f}`)
    console.log(`Measured ${queue.length} item(s); ${fails.length} failing check(s) across ${Object.keys(result.items).length} item(s) → ${relative(ROOT, OUT)}`)
  } finally {
    await browser?.close()
    server?.kill("SIGTERM")
  }
}

const sortKeys = (q: QualityFile): QualityFile => ({ ...q, items: Object.fromEntries(Object.entries(q.items).sort(([a], [b]) => a.localeCompare(b))) })

if (import.meta.url === `file://${process.argv[1]}`) await main()
