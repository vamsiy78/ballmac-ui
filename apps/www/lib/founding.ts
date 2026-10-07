/**
 * The founding offer: the first N buyers get Pro at the launch price, until a deadline. It is driven entirely by environment variables, so
 * ending the offer needs no code change:
 *
 *   NEXT_PUBLIC_PRO_FOUNDING_LIMIT     how many licences the offer covers (the offer is off without it)
 *   NEXT_PUBLIC_PRO_PRICE              the founding price, in dollars
 *   NEXT_PUBLIC_PRO_CHECKOUT_URL       checkout link for the founding product
 *   NEXT_PUBLIC_PRO_FOUNDING_ENDS      the deadline as an ISO date with a zone, for example 2026-10-21T18:29:00Z (11:59 pm IST)
 *   NEXT_PUBLIC_PRO_LIST_PRICE         the regular price, shown struck through now and charged after the offer
 *   NEXT_PUBLIC_PRO_STANDARD_CHECKOUT_URL  checkout link for the regular-price product
 *
 * Without the deadline, list price and standard link it behaves as before: a founding price with no end. No framework imports.
 */
import { paymentsLive, testModeInProduction } from "./payments"


type Env = Record<string, string | undefined>

export type Founding = { limit: number; price: string; /** The regular price, when known and higher than the founding price. */ listPrice: string | null; /** When the offer ends, ISO. */ endsAt: string | null }

const money = (v: string | undefined) => {
  const s = v?.trim()
  return s && /^\d+(\.\d{1,2})?$/.test(s) && Number(s) > 0 ? s : null
}

/** The deadline as an ISO string, or null when none is set (or it is not a real date). */
export function foundingEnds(env: Env = process.env): string | null {
  const raw = env.NEXT_PUBLIC_PRO_FOUNDING_ENDS?.trim()
  if (!raw) return null
  const t = Date.parse(raw)
  return Number.isFinite(t) ? new Date(t).toISOString() : null
}

/** True when a founding limit is configured at all, whether or not the offer is still running. */
export function foundingConfigured(env: Env = process.env): boolean {
  const limit = Number(env.NEXT_PUBLIC_PRO_FOUNDING_LIMIT)
  return Number.isInteger(limit) && limit >= 1 && limit <= 10_000
}

/** The running offer, or null when it is off, sold out of time, or Pro is not on sale. */
export function founding(env: Env = process.env, now: Date = new Date()): Founding | null {
  if (testModeInProduction(env)) return null
  if (!foundingConfigured(env)) return null
  const price = money(env.NEXT_PUBLIC_PRO_PRICE)
  if (!price || !env.NEXT_PUBLIC_PRO_CHECKOUT_URL?.trim()) return null
  const endsAt = foundingEnds(env)
  if (endsAt && now.getTime() >= Date.parse(endsAt)) return null
  const list = money(env.NEXT_PUBLIC_PRO_LIST_PRICE)
  return { limit: Number(env.NEXT_PUBLIC_PRO_FOUNDING_LIMIT), price, listPrice: list && Number(list) > Number(price) ? list : null, endsAt }
}

export type ProOffer = {
  /** True when a visitor can buy Pro right now. */
  onSale: boolean
  /** The price being charged, in dollars, and where to pay it. */
  price: string | null
  checkout: string | null
  /** The running founding offer, when there is one. */
  founding: Founding | null
}

/**
 * What the pricing page sells at this moment. While the founding offer runs it is the founding price; once it has ended it is the regular
 * price with the regular checkout link. If the offer has ended and there is no regular link yet, nothing is for sale rather than showing a
 * price the checkout would not charge.
 *
 * `fullAlready` is for the licence cap: when the founding product has reached its limit the offer is over even before the deadline.
 */
export function proOffer(env: Env = process.env, now: Date = new Date(), fullAlready = false): ProOffer {
  if (!paymentsLive(env)) return { onSale: false, price: null, checkout: null, founding: null }
  const running = fullAlready ? null : founding(env, now)
  if (running) return { onSale: true, price: running.price, checkout: env.NEXT_PUBLIC_PRO_CHECKOUT_URL!.trim(), founding: running }
  const list = money(env.NEXT_PUBLIC_PRO_LIST_PRICE)
  const standard = env.NEXT_PUBLIC_PRO_STANDARD_CHECKOUT_URL?.trim()
  if (list && standard) return { onSale: true, price: list, checkout: standard, founding: null }
  // No offer was ever configured: a single price and link, as before.
  if (!foundingConfigured(env)) {
    const price = money(env.NEXT_PUBLIC_PRO_PRICE)
    const checkout = env.NEXT_PUBLIC_PRO_CHECKOUT_URL?.trim()
    if (price && checkout) return { onSale: true, price, checkout, founding: null }
  }
  return { onSale: false, price: null, checkout: null, founding: null }
}

const IST = "Asia/Kolkata"

/** The deadline as a readable moment in India time, the same on the server and in the browser: "Wed 21 Oct 2026, 11:59 pm IST". */
export function endsLabel(endsAt: string): string {
  const d = new Date(endsAt)
  const date = new Intl.DateTimeFormat("en-GB", { timeZone: IST, weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(d).replace(",", "")
  const time = new Intl.DateTimeFormat("en-US", { timeZone: IST, hour: "numeric", minute: "2-digit", hour12: true }).format(d).toLowerCase().replace(" ", " ")
  return `${date}, ${time} IST`
}

export type TimeLeft = { ended: boolean; days: number; hours: number; minutes: number; seconds: number; totalMs: number }

export function timeLeft(endsAt: string, now: Date = new Date()): TimeLeft {
  const ms = Math.max(0, Date.parse(endsAt) - now.getTime())
  const s = Math.floor(ms / 1000)
  return { ended: ms <= 0, days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60, totalMs: ms }
}

/** A short honest phrase for banners and prompts: "ends in 5 days", "ends in 31 hours", "ends in 40 minutes". Days and hours are rounded down. */
export function leftPhrase(endsAt: string, now: Date = new Date()): string {
  const t = timeLeft(endsAt, now)
  if (t.ended) return "has ended"
  const hoursTotal = Math.floor(t.totalMs / 3_600_000)
  if (hoursTotal >= 48) return `ends in ${t.days} days`
  if (hoursTotal >= 2) return `ends in ${hoursTotal} hours`
  if (hoursTotal === 1) return "ends in about an hour"
  return `ends in ${Math.max(1, t.minutes)} minutes`
}

/** The line shown where a visitor is looking at Pro and might leave: on Pro block pages and where the source is locked. Null when there is no offer to mention. */
export function nudgeText(offer: Founding | null, now: Date = new Date()): string | null {
  if (!offer) return null
  const then = offer.listPrice ? `: $${offer.price}, then $${offer.listPrice}.` : `: $${offer.price}.`
  if (offer.endsAt) return `Founding price ${leftPhrase(offer.endsAt, now)}${then}`
  return `Founding price for the first ${offer.limit} buyers${then}`
}

/** A short date for a banner, in India time: "21 Oct". */
export function endsShort(endsAt: string): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone: IST, day: "numeric", month: "short" }).format(new Date(endsAt))
}
