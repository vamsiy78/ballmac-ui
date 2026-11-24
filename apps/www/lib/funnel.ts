/**
 * The buying funnel: which pages lead to a Buy click and which lead to a sale. Clicks come from /api/checkout-click; sales from the Dodo payment webhook, which
 * reads the page the buyer started from out of the checkout's metadata (`from_page`, set by /api/checkout/pro). Rows live in D1 (funnel_events, migration
 * 0007) and are read with `pnpm funnel`. No framework imports.
 */
type D1 = import("@cloudflare/workers-types").D1Database

/** A path on this site, or null. The same rule as the click beacon. */
export function sitePath(v: unknown): string | null {
  return typeof v === "string" && v.length <= 200 && /^\/[A-Za-z0-9/_.-]*$/.test(v) && !v.includes("..") && !v.startsWith("//") ? v : null
}

export type FunnelRow = {
  id: string
  at: number
  kind: "click" | "paid"
  plan?: string | null
  page?: string | null
  utm?: string | null
  fromHost?: string | null
  country?: string | null
  productId?: string | null
  amount?: number | null
  currency?: string | null
}

/** Writes one row; never throws, so a missing table or a D1 hiccup cannot break a click or a webhook. A repeated id is ignored. */
export async function recordFunnel(db: D1 | undefined, r: FunnelRow) {
  if (!db) return
  try {
    await db
      .prepare("INSERT OR IGNORE INTO funnel_events (id, at, kind, plan, page, utm, from_host, country, product_id, amount, currency) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(r.id, r.at, r.kind, r.plan ?? null, r.page ?? null, r.utm ?? null, r.fromHost ?? null, r.country ?? null, r.productId ?? null, r.amount ?? null, r.currency ?? null)
      .run()
  } catch (err) {
    console.error("funnel: write failed", err instanceof Error ? err.message : err)
  }
}
