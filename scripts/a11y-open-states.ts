/**
 * Axe on the open (and closed) states of overlay examples: menus, sheet, command dialog, combobox, navigation menu.
 * `pnpm a11y` scans each preview as rendered; this script also opens the overlays first, at desktop and 390 px
 * widths in light and dark, and screenshots each state to $SHOTS (default: the OS temp folder).
 *
 * Usage: start the production server (`next start -p 3301` in apps/www), then
 *   PLAYWRIGHT_CHROMIUM_EXECUTABLE=<chrome path, optional> tsx scripts/a11y-open-states.ts [name-filter…]
 *
 * Known upstream pattern, reported but not counted: Radix modal menus set aria-hidden on the page behind them
 * while focus is trapped in the menu, and NavigationMenu renders its own aria-hidden focus proxy. Axe flags both
 * as aria-hidden-focus.
 */
import AxeBuilder from "@axe-core/playwright"
import { chromium } from "playwright"
import { tmpdir } from "node:os"

const base = "http://127.0.0.1:3301"
type Step = (page: import("playwright").Page) => Promise<void>
const cases: Record<string, Step> = {
  "dropdown-menu-demo": async () => {},
  "dropdown-menu-states": async (p) => { await p.getByRole("button", { name: "Sort and view" }).click() },
  "context-menu-demo": async (p) => { await p.getByText("Q3 roadmap.pdf").click({ button: "right" }) },
  "context-menu-states": async (p) => { await p.getByText(/Grid (on|off)/).click({ button: "right" }) },
  "menubar-demo": async () => {},
  "menubar-states": async (p) => { await p.getByRole("menuitem", { name: "Appearance" }).click() },
  "sheet-demo": async (p) => { await p.getByRole("button", { name: "Edit project" }).click() },
  "sheet-states": async (p) => { await p.getByRole("button", { name: "Bottom" }).click() },
  "navigation-menu-demo": async () => {},
  "navigation-menu-states": async (p) => { await p.getByRole("button", { name: "Guides" }).click() },
  "command-dialog": async (p) => { await p.getByRole("button", { name: /Search commands/ }).click() },
  "combobox-demo": async (p) => { await p.getByRole("combobox").click() },
  "combobox-states": async (p) => { await p.getByRole("combobox").first().click() },
  "slider-demo": async (p) => { await p.getByRole("slider").first().focus() },
  "table-states": async () => {},
  "field-demo": async () => {},
  "input-group-demo": async () => {},
}
const filter = process.argv.slice(2)
const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE })
let bad = 0
for (const [name, step] of Object.entries(cases)) {
  if (filter.length && !filter.some((f) => name.includes(f))) continue
  for (const theme of ["light", "dark"]) {
    for (const [w, h, tag] of [[1100, 800, "d"], [390, 800, "m"]] as const) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: theme as "light" | "dark" })
      const page = await ctx.newPage()
      const errors: string[] = []
      page.on("pageerror", (e) => errors.push(e.message))
      page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()) })
      await page.addInitScript((t) => { try { localStorage.setItem("bm-theme", t) } catch {} }, theme)
      await page.goto(`${base}/preview/${name}?theme=${theme}`, { waitUntil: "networkidle" })
      await page.evaluate((t) => { document.documentElement.classList.toggle("dark", t === "dark"); document.documentElement.dataset.theme = t }, theme)
      await step(page)
      await page.waitForTimeout(500)
      const res = await new AxeBuilder({ page }).analyze()
      // Radix modal menus set aria-hidden on the page behind them while focus is trapped in the menu, and
      // navigation-menu renders its own aria-hidden focus proxies; axe flags both as aria-hidden-focus. Reported separately.
      const all = res.violations.filter((x) => x.impact === "serious" || x.impact === "critical")
      const known = all.filter((x) => x.id === "aria-hidden-focus")
      if (known.length) console.log(`${name} ${theme} ${tag}: (known Radix aria-hidden-focus, ${known[0].nodes.length} node)`)
      const v = all.filter((x) => x.id !== "aria-hidden-focus")
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)
      for (const x of v) { bad++; console.log(`${name} ${theme} ${tag}: ${x.impact} ${x.id}\n   ${x.nodes.slice(0,2).map((n) => n.html.slice(0, 160)).join("\n   ")}`) }
      if (overflow) { bad++; console.log(`${name} ${theme} ${tag}: horizontal overflow`) }
      if (errors.length) { bad++; console.log(`${name} ${theme} ${tag}: console errors ${errors.slice(0,2)}`) }
      await page.screenshot({ path: `${process.env.SHOTS ?? tmpdir()}/${name}-${theme}-${tag}.png` })
      await ctx.close()
    }
  }
}
await browser.close()
console.log(bad ? `${bad} problem(s)` : "open states: all clean")
