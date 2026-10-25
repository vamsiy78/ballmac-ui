// Scans interactive previews in the states a first-load scan never sees: everything expanded, every toggle pressed, and scripted steps (editing, confirming,
// switching a feature off, a finished request). Needs a running site: A11Y_BASE_URL=http://localhost:3300 pnpm a11y:states <preview names>. W sets the width.
import AxeBuilder from "@axe-core/playwright"
import { chromium } from "playwright"
const base = process.env.A11Y_BASE_URL ?? "http://localhost:3300"
const names = process.argv.slice(2)
// Extra scripted steps per preview, run after the generic passes. Each is [label, async (page) => void].
const custom = {
  "memory-panel-demo": [
    ["editing", async (p) => { await p.getByRole("button", { name: /^Edit:/ }).first().click() }],
    ["forgetting", async (p) => { await p.keyboard.press("Escape"); await p.getByRole("button", { name: /^Forget:/ }).first().click() }],
    ["memory off", async (p) => { await p.getByRole("button", { name: "Undo" }).first().click(); await p.getByRole("switch").click(); await p.waitForTimeout(700) }],
  ],
  "knowledge-sources-demo": [
    ["confirm remove", async (p) => { await p.getByRole("button", { name: /^Remove / }).first().click() }],
    ["syncing", async (p) => { await p.getByRole("button", { name: "Keep it" }).click(); await p.getByRole("button", { name: /^Sync now: Product/ }).click() }],
    ["switched off", async (p) => { await p.getByRole("switch").first().click(); await p.waitForTimeout(500) }],
  ],
  "review-center-demo": [["request changes", async (p) => { await p.keyboard.press("r") }]],
  "agent-13-demo": [["request changes", async (p) => { await p.getByRole("option").first().focus(); await p.keyboard.press("r") }]],
  "message-actions-demo": [["thumbs down reasons", async (p) => { await p.getByRole("button", { name: "Bad answer" }).click() }], ["copied", async (p) => { await p.getByRole("button", { name: "Copy" }).click() }]],
  "agent-queue-demo": [["cancel confirm", async (p) => { await p.getByRole("button", { name: /^Cancel/ }).first().click() }]],
  "agent-16-demo": [["thinking", async (p) => { await p.getByLabel("Your question").fill("Do you ship abroad?"); await p.keyboard.press("Enter"); await p.waitForTimeout(300) }], ["answered", async (p) => { await p.waitForTimeout(1800) }]],
  "agent-18-demo": [["test answer", async (p) => { await p.getByRole("button", { name: "Test" }).click(); await p.waitForTimeout(1300) }]],
  "agent-11-demo": [["steering", async (p) => { const b = p.getByRole("textbox").first(); await b.fill("Please use the new template"); await p.keyboard.press("Enter"); await p.waitForTimeout(200) }]],
  "uptime-tracker-demo": [["day detail", async (p) => { await p.getByRole("button", { name: /Outage/ }).first().focus() }]],
  "reliability-1-demo": [["day detail", async (p) => { await p.getByRole("button", { name: /Outage/ }).first().focus() }]],
  "rating-distribution-demo": [["filtered", async (p) => { await p.getByRole("button", { name: /^4 stars/ }).click() }]],
  "reviews-2-demo": [["no reviews for a size", async (p) => { await p.getByRole("button", { name: /^1 stars/ }).click() }]],
  "analytics-1-demo": [["7 days", async (p) => { await p.getByRole("radio", { name: "7 days" }).check({ force: true }) }], ["sources tab", async (p) => { await p.getByRole("tab", { name: "Sources" }).click() }]],
  "eval-scorecard-demo": [["got worse filter", async (p) => { await p.getByRole("button", { name: /^Got worse/ }).click() }], ["rerun busy", async (p) => { await p.getByRole("button", { name: /^Run the/ }).click() }]],
  "ecommerce-1-demo": [["filtered", async (p) => { await p.getByRole("checkbox", { name: /Audio/ }).click(); await p.getByRole("checkbox", { name: "On sale" }).click() }], ["nothing matches", async (p) => { await p.getByRole("checkbox", { name: /Bags/ }).click() }]],
  "ecommerce-2-demo": [["added", async (p) => { await p.getByRole("button", { name: /Add to bag/ }).click(); await p.waitForTimeout(1000) }], ["details open", async (p) => { await p.getByText("Shipping", { exact: true }).click() }]],
  "ecommerce-3-demo": [["promo error", async (p) => { await p.getByLabel("Promo code").fill("nope"); await p.getByRole("button", { name: "Apply" }).click(); await p.waitForTimeout(900) }], ["promo applied", async (p) => { await p.getByLabel("Promo code").fill("welcome10"); await p.getByRole("button", { name: "Apply" }).click(); await p.waitForTimeout(900) }], ["line removed", async (p) => { await p.getByRole("button", { name: /^Remove Glow/ }).click() }]],
  "ecommerce-4-demo": [["field error", async (p) => { await p.getByRole("button", { name: "Continue" }).click() }], ["delivery step", async (p) => { await p.getByLabel("Email").fill("sam@example.com"); await p.getByRole("button", { name: "Continue" }).click() }], ["delivery errors", async (p) => { await p.getByRole("button", { name: "Continue" }).click() }], ["payment step", async (p) => { await p.getByLabel("Full name").fill("Sam Rivera"); await p.getByLabel("Address").fill("1 Road"); await p.getByLabel("City").fill("Bristol"); await p.getByLabel("Postal code").fill("BS1"); await p.getByRole("button", { name: "Continue" }).click() }], ["payment errors", async (p) => { await p.getByRole("button", { name: /^Pay/ }).click() }], ["confirmed", async (p) => { await p.getByLabel("Name on card").fill("Sam"); await p.getByLabel("Card number").fill("4242 4242 4242 4242"); await p.getByLabel("Expires").fill("12 / 39"); await p.getByLabel("Security code").fill("123"); await p.getByRole("button", { name: /^Pay/ }).click(); await p.waitForTimeout(1300) }]],
  "ecommerce-5-demo": [["copied", async (p) => { await p.getByRole("button", { name: "Copy the tracking number" }).click() }]],
  "pricing-5-demo": [["add-ons and monthly", async (p) => { await p.getByRole("checkbox", { name: /Single sign-on/ }).check({ force: true }); await p.getByRole("switch", { name: "Pay yearly" }).click() }]],
  "hero-8-demo": [["bad email", async (p) => { await p.getByLabel("Work email").fill("nope"); await p.getByRole("button", { name: "Get started free" }).click() }], ["signed up", async (p) => { await p.getByLabel("Work email").fill("sam@company.com"); await p.getByRole("button", { name: "Get started free" }).click(); await p.waitForTimeout(1300) }]],
  "agent-17-demo": [["rerun busy", async (p) => { await p.getByRole("button", { name: /^Run the/ }).click() }]],
}
const browser = await chromium.launch()
let total = 0
let found = 0
async function scan(page, name, theme, label) {
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze()
  const bad = r.violations.filter((v) => (v.impact === "serious" || v.impact === "critical") && !(v.id === "aria-hidden-focus" && v.nodes.some((n) => n.target.join(" ").includes("data-aria-hidden"))))  // a modal hides the page behind it, as it should
  total++
  found += bad.length
  for (const v of bad) console.log(`${name} (${theme}) [${label}] ${v.id}\n   ` + v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join("\n   "))
}
for (const name of names) {
  for (const theme of ["light", "dark"]) {
    const ctx = await browser.newContext({ colorScheme: theme, viewport: { width: +(process.env.W ?? 1100), height: 900 } })
    const page = await ctx.newPage()
    await page.goto(`${base}/preview/${name}`, { waitUntil: "networkidle" })
    await page.waitForTimeout(500)
    // Generic pass 1: open everything collapsed.
    const closed = page.locator('[aria-expanded="false"]:visible')
    let n = await closed.count()
    for (let i = 0; i < Math.min(n, 12); i++) await closed.nth(i).click({ timeout: 2000 }).catch(() => {})
    await page.waitForTimeout(300)
    await scan(page, name, theme, "everything expanded")
    // Generic pass 2: press every toggle.
    const off = page.locator('[aria-pressed="false"]:visible')
    n = await off.count()
    for (let i = 0; i < Math.min(n, 6); i++) await off.nth(i).click({ timeout: 2000 }).catch(() => {})
    await page.waitForTimeout(300)
    await scan(page, name, theme, "toggles pressed")
    for (const [label, step] of custom[name] ?? []) {
      try { await step(page); await page.waitForTimeout(250); await scan(page, name, theme, label) } catch (e) { console.log(`${name} (${theme}) [${label}] STEP FAILED: ${String(e.message).split("\n")[0]}`) }
    }
    await ctx.close()
  }
}
await browser.close()
console.log("state scans:", total)

process.exit(total === 0 || found > 0 ? 1 : 0)
