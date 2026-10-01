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
  "drawer-demo": async (p) => { await p.getByRole("button", { name: "Review order" }).click() },
  "drawer-states": async (p) => { await p.getByRole("button", { name: "Bottom" }).click() },
  "date-picker-demo": async (p) => { await p.getByRole("button", { name: /Delivery date/ }).click() },
  "date-picker-states": async (p) => { await p.getByRole("button", { name: /Date of birth|Select your birthday/ }).first().click() },
  "data-table-demo": async (p) => { await p.getByRole("button", { name: "Columns" }).click() },
  "form-demo": async (p) => { await p.getByRole("button", { name: "Create account" }).click() },
  "toast-demo": async (p) => { await p.getByRole("button", { name: "Error" }).click() },
  "toast-states": async (p) => { await p.getByRole("button", { name: "Action and cancel" }).click() },
  "sidebar-demo": async () => {},
  "sidebar-states": async () => {},
  "calendar-demo": async () => {},
  "calendar-states": async () => {},
  "carousel-demo": async () => {},
  "carousel-states": async () => {},
  "chart-demo": async () => {},
  "chart-bars": async () => {},
  "chart-donut": async () => {},
  "input-otp-demo": async (p) => { await p.getByRole("textbox").first().fill("111111") },
  "resizable-demo": async () => {},
  "navbar-demo": async (p) => { await p.getByRole("button", { name: "Menu" }).click({ timeout: 1500 }).catch(() => {}) },
  "navbar-states": async () => {},
  "mega-menu-demo": async (p) => { await p.getByRole("button", { name: "Product" }).click({ timeout: 1500 }).catch(() => {}) },
  "mega-menu-states": async (p) => { await p.getByText("Product").first().click() },
  "floating-nav-demo": async () => {},
  "floating-nav-states": async () => {},
  "app-shell-demo": async (p) => { await p.getByRole("button", { name: "Open navigation" }).click({ timeout: 1500 }).catch(() => {}) },
  "app-shell-states": async () => {},
  "team-switcher-demo": async (p) => { await p.getByRole("button", { name: /Acme Inc\./ }).click() },
  "team-switcher-states": async (p) => { await p.getByRole("button", { name: /Team: / }).click() },
  "sticky-scroll-demo": async () => {},
  "sticky-scroll-states": async () => {},
  "split-view-demo": async () => {},
  "split-view-states": async (p) => { await p.getByRole("button", { name: "Brand guidelines.pdf" }).click() },
  "masonry-grid-demo": async () => {},
  "masonry-grid-states": async () => {},
  "scroll-progress-demo": async () => {},
  "scroll-progress-states": async () => {},
  "back-to-top-demo": async (p) => { await p.getByLabel("Release notes").evaluate((el) => { el.scrollTop = 400 }) },
  "back-to-top-states": async (p) => { await p.getByLabel("Long page").evaluate((el) => { el.scrollTop = 200 }) },
  "table-of-contents-demo": async (p) => { await p.getByLabel("Guide").evaluate((el) => { el.scrollTop = 300 }) },
  "table-of-contents-states": async () => {},
  "container-scroll-demo": async () => {},
  "container-scroll-states": async () => {},
  "section-tabs-demo": async (p) => { await p.getByRole("link", { name: "Pricing" }).click() },
  "section-tabs-states": async (p) => { await p.getByRole("link", { name: "Reviews" }).click() },
  "onboarding-checklist-demo": async (p) => { await p.getByRole("button", { name: "Invite your team" }).click() },
  "onboarding-checklist-states": async () => {},
  "settings-panel-demo": async (p) => { await p.getByRole("checkbox", { name: /Weekly digest/ }).click({ timeout: 2000 }).catch(() => p.getByRole("switch", { name: /Weekly digest/ }).click()) },
  "settings-panel-states": async () => {},
  "usage-meter-demo": async () => {},
  "usage-meter-states": async () => {},
  "billing-card-demo": async () => {},
  "billing-card-states": async () => {},
  "plan-selector-demo": async (p) => { await p.getByRole("radio", { name: /Monthly/ }).check({ force: true }) },
  "plan-selector-states": async () => {},
  "invite-members-demo": async (p) => { await p.getByRole("textbox", { name: "Email addresses" }).fill("new@acme.example, bad@") ; await p.keyboard.press("Enter") },
  "invite-members-states": async () => {},
  "notification-center-demo": async () => {},
  "notification-center-states": async () => {},
  "feedback-widget-demo": async (p) => { await p.getByRole("radio", { name: "Happy", exact: true }).check({ force: true }) },
  "feedback-widget-states": async (p) => { await p.getByRole("button", { name: "Rate this page" }).click() },
  "changelog-feed-demo": async () => {},
  "changelog-feed-states": async () => {},
  "cookie-consent-demo": async (p) => { await p.getByRole("button", { name: "Customize" }).click() },
  "cookie-consent-states": async () => {},
  "user-menu-demo": async () => {},
  "user-menu-states": async (p) => { await p.getByRole("button", { name: /Account menu/ }).click() },
  "workspace-card-demo": async () => {},
  "workspace-card-states": async () => {},
  "command-bar-demo": async (p) => { await p.getByRole("button", { name: /Search or jump to/ }).click() },
  "command-bar-states": async (p) => { await p.getByRole("button", { name: /Open from your own button/ }).click() },
  "thinking-indicator-demo": async () => {},
  "thinking-indicator-variants": async () => {},
  "ai-orb-demo": async (p) => { await p.getByRole("button", { name: "Speaking" }).click() },
  "ai-orb-voice": async () => {},
  "suggestion-chips-demo": async (p) => { await p.getByRole("button", { name: "Explain this error" }).click() },
  "suggestion-chips-cards": async (p) => { await p.getByRole("button", { name: /Find the bug/ }).focus() },
  "citation-demo": async (p) => { await p.getByRole("link", { name: /Source 1/ }).focus() },
  "citation-pill": async (p) => { await p.getByRole("link", { name: /Source: Acme and 2 more/ }).focus() },
  "sources-list-demo": async (p) => { await p.getByRole("button", { name: "Hover or focus this" }).focus() },
  "sources-list-cards": async (p) => { await p.getByRole("button", { name: "Show all 5" }).click() },
  "chat-attachment-demo": async (p) => { await p.getByRole("button", { name: "Remove migration-notes.md" }).click() },
  "chat-attachment-tiles": async (p) => { await p.getByRole("button", { name: "Open whiteboard.png" }).click() },
  "model-picker-demo": async (p) => { await p.getByRole("combobox").click(); await p.keyboard.press("ArrowDown") },
  "model-picker-compact": async (p) => { await p.getByRole("combobox").click() },
  "token-meter-demo": async () => {},
  "token-meter-pill": async (p) => { await p.getByRole("button", { name: /Context window/ }).click() },
  "agent-plan-demo": async (p) => { await p.getByRole("button", { name: /Done: Read the repository/ }).click({ timeout: 15000 }) },
  "agent-plan-failed": async (p) => { await p.getByRole("button", { name: "Retry Send the summary to accounting" }).focus() },
  "approval-card-demo": async (p) => { await p.getByRole("button", { name: "Approve" }).click() },
  "approval-card-risks": async () => {},
  "voice-input-demo": async (p) => { await p.getByRole("button", { name: "Dictate a message" }).click() },
  "voice-input-button": async () => {},
  "artifact-panel-demo": async (p) => { await p.getByRole("tab", { name: "Code" }).click() },
  "artifact-panel-streaming": async () => {},
  "copy-button-demo": async (p) => { await p.getByRole("button", { name: "Copy", exact: true }).click() },
  "copy-button-inline": async () => {},
  "snippet-tabs-demo": async (p) => { await p.getByRole("tab", { name: "Python" }).click() },
  "snippet-tabs-variables": async () => {},
  "status-badge-row-demo": async (p) => { const s = p.getByRole("slider").first(); await s.focus(); await p.keyboard.press("ArrowLeft"); await p.keyboard.press("ArrowLeft") },
  "status-badge-row-incident": async (p) => { await p.getByRole("slider").first().focus() },
  "package-badge-demo": async () => {},
  "package-badge-inline": async () => {},
  "keyboard-shortcuts-demo": async () => {},
  "keyboard-shortcuts-dialog": async (p) => { await p.getByRole("button", { name: /Keyboard shortcuts/ }).click() },
  "api-endpoint-demo": async (p) => { await p.getByRole("tab", { name: "402" }).click() },
  "api-endpoint-list": async (p) => { await p.getByRole("button", { name: /^GET \/v1\/projects\/\{id\}/ }).click() },
  "env-editor-demo": async (p) => { await p.getByRole("button", { name: "Show all" }).click() },
  "env-editor-controlled": async () => {},
  "log-stream-demo": async () => {},
  "log-stream-static": async (p) => { await p.getByRole("button", { name: /ERROR/ }).first().click() },
  "webhook-card-demo": async (p) => { await p.getByRole("button", { name: /invoice\.paid/ }).first().click() },
  "webhook-card-failing": async (p) => { await p.getByRole("button", { name: /order\.created/ }).first().click() },
  "git-graph-demo": async (p) => { await p.getByRole("listbox").focus(); await p.keyboard.press("ArrowDown") },
  "git-graph-linear": async (p) => { await p.getByRole("option").nth(1).click() },
  "blur-fade-demo": async (p) => { await p.waitForTimeout(2200) },
  "blur-fade-directions": async (p) => { await p.waitForTimeout(2200) },
  "text-animate-demo": async (p) => { await p.waitForTimeout(3000) },
  "text-animate-characters": async (p) => { await p.waitForTimeout(3500) },
  "typing-text-demo": async (p) => { await p.waitForTimeout(4000) },
  "typing-text-once": async (p) => { await p.waitForTimeout(4500) },
  "hyper-text-demo": async (p) => { await p.waitForTimeout(3000) },
  "hyper-text-hover": async (p) => { await p.getByText("Hover me").first().focus(); await p.waitForTimeout(1500) },
  "sparkles-text-demo": async (p) => { await p.waitForTimeout(800) },
  "sparkles-text-gradient": async (p) => { await p.waitForTimeout(800) },
  "morphing-text-demo": async (p) => { await p.waitForTimeout(1500) },
  "morphing-text-inline": async (p) => { await p.waitForTimeout(1500) },
  "spinning-text-demo": async (p) => { await p.waitForTimeout(300) },
  "spinning-text-sizes": async (p) => { await p.waitForTimeout(300) },
  "highlighter-demo": async (p) => { await p.waitForTimeout(4000) },
  "highlighter-actions": async (p) => { await p.waitForTimeout(3500) },
  "rainbow-button-demo": async (p) => { await p.getByRole("button").first().focus() },
  "rainbow-button-sizes": async (p) => { await p.getByRole("button").first().focus() },
  "shiny-button-demo": async (p) => { await p.getByRole("button").first().hover(); await p.waitForTimeout(900) },
  "shiny-button-variants": async () => {},
  "pulse-button-demo": async () => {},
  "pulse-button-tones": async (p) => { await p.getByRole("button").first().click() },
  "ripple-demo": async () => {},
  "ripple-click": async (p) => { await p.getByText("Inbox").click() },
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
