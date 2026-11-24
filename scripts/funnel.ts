/**
 * Which pages lead to a Buy click and which lead to a sale, from the funnel_events table in D1 (see apps/www/lib/funnel.ts).
 *
 *   pnpm funnel                 production, last 30 days
 *   pnpm funnel --days 7
 *   pnpm funnel --env preview
 *
 * Needs wrangler logged in to the Cloudflare account. Sales started from a raw checkout link or an in-app button have no page and are listed as "(unknown)".
 */
import { execFileSync } from "node:child_process"
import { join } from "node:path"

const arg = (n: string, d: string) => {
  const i = process.argv.indexOf(`--${n}`)
  return i > -1 ? process.argv[i + 1]! : d
}
const env = arg("env", "production")
const days = Math.max(1, Number(arg("days", "30")) || 30)
const db = env === "production" ? "ballmac-affiliates-production" : "ballmac-affiliates-preview"
const since = Date.now() - days * 86_400_000

const sql = `SELECT kind, plan, COALESCE(page, '(unknown)') AS page, COUNT(*) AS n, SUM(COALESCE(amount, 0)) AS amount, currency
FROM funnel_events WHERE at >= ${since} GROUP BY kind, plan, page, currency`

const out = execFileSync("npx", ["wrangler", "d1", "execute", db, "--remote", "--json", "--env", env, "--command", sql], {
  cwd: join(import.meta.dirname, "../apps/www"),
  encoding: "utf8",
  stdio: ["ignore", "pipe", "inherit"],
})
type Row = { kind: "click" | "paid"; plan: string | null; page: string; n: number; amount: number; currency: string | null }
const rows = (JSON.parse(out) as { results: Row[] }[])[0]?.results ?? []

type Page = { clicks: number; pro: number; team: number; monthly: number; sales: number; amounts: Map<string, number> }
const pages = new Map<string, Page>()
const page = (p: string) => pages.get(p) ?? pages.set(p, { clicks: 0, pro: 0, team: 0, monthly: 0, sales: 0, amounts: new Map() }).get(p)!
for (const r of rows) {
  const p = page(r.page)
  if (r.kind === "click") {
    p.clicks += r.n
    if (r.plan === "pro" || r.plan === "team" || r.plan === "monthly") p[r.plan] += r.n
  } else {
    p.sales += r.n
    // Amounts are in the smallest unit of the buyer's currency, kept per currency.
    const cur = r.currency ?? "?"
    p.amounts.set(cur, (p.amounts.get(cur) ?? 0) + r.amount)
  }
}

const list = [...pages.entries()].sort((a, b) => b[1].sales - a[1].sales || b[1].clicks - a[1].clicks)
const money = (m: Map<string, number>) => [...m].map(([c, v]) => `${(v / 100).toFixed(2)} ${c}`).join(", ")
const pad = (s: string | number, n: number) => String(s).padEnd(n)
const padL = (s: string | number, n: number) => String(s).padStart(n)

console.log(`\nBuying funnel, ${env}, last ${days} day(s)\n`)
if (!list.length) {
  console.log("No clicks or sales recorded yet.")
  process.exit(0)
}
console.log(`${pad("Page", 44)}${padL("Clicks", 8)}${padL("Pro", 6)}${padL("Team", 6)}${padL("Mo.", 6)}${padL("Sales", 7)}${padL("Rate", 8)}  Revenue`)
for (const [p, v] of list) {
  const rate = v.clicks ? `${((v.sales / v.clicks) * 100).toFixed(0)}%` : "-"
  console.log(`${pad(p.length > 43 ? p.slice(0, 42) + "…" : p, 44)}${padL(v.clicks, 8)}${padL(v.pro, 6)}${padL(v.team, 6)}${padL(v.monthly, 6)}${padL(v.sales, 7)}${padL(rate, 8)}  ${money(v.amounts)}`)
}
const total = list.reduce((t, [, v]) => ({ clicks: t.clicks + v.clicks, sales: t.sales + v.sales }), { clicks: 0, sales: 0 })
console.log(`\n${total.clicks} Buy click(s), ${total.sales} sale(s).`)
console.log("Rate is sales per click on the same page. A buyer who clicks on one page and pays after coming back from another counts under the page that started the checkout.")
