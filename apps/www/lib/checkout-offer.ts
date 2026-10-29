/**
 * The "still thinking?" offer: a buyer who opens the Pro checkout and clicks back gets $5 off for ten minutes, once. The checkout is Dodo's page, so the
 * way back is the session's `cancel_url`, which lands on /api/checkout/back with a random id; that id is the whole state (see worker/routes/checkout.ts).
 * The clock starts when the buyer lands back on the site, never resets, and the code Dodo holds expires with it. No framework imports.
 */

/** Dodo's percentage discounts are in basis points; 10.21% of the 4,900-cent Pro price is exactly $5.00. */
export const OFFER = { dollars: 5, bps: 1021, windowMs: 10 * 60_000, /** How long after the offer closes the code still works, so a buyer who claimed it at nine minutes can finish paying. */ graceMs: 10 * 60_000, /** A checkout older than this has no offer (they left long ago). */ startedWithinMs: 6 * 60 * 60_000 } as const

/** Set in the browser once the offer is taken, so the next checkout from the same browser starts without one. */
export const OFFER_USED_KEY = "bm-offer-used"

export type OfferRow = { nonce: string; created_at: number; started_at: number | null; expires_at: number | null; code: string | null; claimed_at: number | null }

const ID = /^[A-Za-z0-9_-]{22}$/

/** An unguessable id for one checkout: 16 random bytes, URL safe. */
export function newNonce(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  let bin = ""
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

export const validNonce = (v: unknown): v is string => typeof v === "string" && ID.test(v)

/**
 * Where an offer stands: "none" (no such checkout, or too old), "fresh" (the buyer has not come back yet), "open" (inside the ten minutes),
 * "expired" (the ten minutes ran out). Claiming is allowed only while "open", and as often as the buyer likes inside the window: the Dodo code works once, so
 * going back from the discounted checkout returns to the same offer and the same clock.
 */
export function offerStatus(row: OfferRow | null, now: number): "none" | "fresh" | "open" | "expired" {
  if (!row) return "none"
  if (now - row.created_at > OFFER.startedWithinMs) return "none"
  if (row.started_at === null || row.expires_at === null) return "fresh"
  return now < row.expires_at ? "open" : "expired"
}

/** The Dodo product id inside a checkout link such as https://checkout.dodopayments.com/buy/pdt_abc?quantity=1, or null. */
export function productFromLink(link: string | undefined): string | null {
  const m = link?.match(/\/buy\/(pdt_[A-Za-z0-9]+)/)
  return m ? m[1] : null
}

/** "9:41" for the countdown. */
export function clock(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`
}
