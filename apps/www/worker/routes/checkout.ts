import { OFFER, newNonce, offerStatus, productFromLink, validNonce, type OfferRow } from "../../lib/checkout-offer"
import { paymentsLive } from "../../lib/payments"
import { withRedirect } from "../../lib/pro-checkout"
import { clientId, createRateLimiter } from "../../lib/rate-limit"

/**
 * Pro checkout started from this site, and the one-time "still thinking?" offer ($5 off for ten minutes) for a buyer who clicks back on Dodo's page.
 *
 *   GET /api/checkout/pro     creates a Dodo checkout session whose cancel address is /api/checkout/back, and sends the buyer to it. Anything that goes wrong
 *                             sends them to the plain checkout link instead: a buyer is never lost to the offer. `?o=0` (this browser already used its offer) skips it.
 *   GET /api/checkout/back    where Dodo's payment page sends its back button. Starts the ten minutes if they have not started.
 *   GET /api/checkout/offer   for the checkout in the cookie (or ?n=): starts the ten minutes the first time the buyer is back on any page, and returns { open, remainingMs }.
 *   GET /api/checkout/done    where a payment returns: clears the cookie.
 *   GET /api/checkout/claim   inside the ten minutes: makes a one-use Dodo code (10.21%, which is exactly $5 on $49) and a session with it applied, and sends the buyer there.
 *
 * State is one D1 row per checkout (migration 0006). Nothing personal is stored. CHECKOUT_OFFER=off turns the offer off and leaves a plain checkout.
 */
type Context = { env: { AFFILIATES?: import("@cloudflare/workers-types").D1Database } }

const limited = createRateLimiter({ max: 30, windowMs: 10 * 60_000 })
const noStore = { "cache-control": "no-store", "referrer-policy": "no-referrer" }
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: noStore })
const go = (location: string, extra: Record<string, string> = {}) => new Response(null, { status: 303, headers: { location, ...noStore, ...extra } })

/**
 * Dodo only calls the cancel address from its payment page; the browser's own back button on the first (address) page just goes to the previous page of this site.
 * So the checkout start also leaves this cookie with the checkout's id, and any page of the site can ask whether an offer is open for it.
 * It is cleared when a payment succeeds (/api/checkout/done), so a buyer who paid never sees the offer.
 */
const COOKIE = "bm_co"
const cookieNonce = (req: Request) => req.headers.get("cookie")?.match(/(?:^|;\s*)bm_co=([A-Za-z0-9_-]{22})/)?.[1] ?? null
const setCookie = (origin: string, value: string, maxAge: number) => `${COOKIE}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${origin.startsWith("https:") ? "; Secure" : ""}`
const nonceOf = (req: Request) => new URL(req.url).searchParams.get("n") ?? cookieNonce(req)

const COLUMNS = "nonce, created_at, started_at, expires_at, code, claimed_at"

async function dodo(path: string, body: unknown) {
  const base = process.env.DODO_API_URL ?? (process.env.DODO_MODE === "test" ? "https://test.dodopayments.com" : "https://live.dodopayments.com")
  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { authorization: `Bearer ${process.env.DODO_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  })
  if (!res.ok) throw new Error(`Payment provider: ${res.status}`)
  return (await res.json()) as Record<string, unknown>
}

const standardLink = () => process.env.NEXT_PUBLIC_PRO_STANDARD_CHECKOUT_URL?.trim()
/** The regular Pro product, or null while the founding offer (a different product) is still running, when this flow stays out of the way. */
function product() {
  const end = process.env.NEXT_PUBLIC_PRO_FOUNDING_ENDS
  if (end && Date.now() < Date.parse(end)) return null
  return productFromLink(standardLink())
}
const live = () => paymentsLive() && Boolean(process.env.DODO_API_KEY) && product() !== null
const offerOn = (env: Context["env"]) => live() && Boolean(env.AFFILIATES) && process.env.CHECKOUT_OFFER !== "off"

/** The buyer is never stranded: the plain link when there is one, the pricing page when there is not. */
function plain(origin: string) {
  const link = standardLink()
  return go(link ? withRedirect(link, origin) : `${origin}/pricing`)
}

async function session(origin: string, body: Record<string, unknown>) {
  const result = await dodo("/checkouts", {
    product_cart: [{ product_id: product(), quantity: 1 }],
    return_url: `${origin}/api/checkout/done`,
    ...body,
  })
  if (typeof result.checkout_url !== "string" || new URL(result.checkout_url).protocol !== "https:") throw new Error("Invalid checkout response")
  return result.checkout_url
}

const row = (env: Context["env"], nonce: string) =>
  env.AFFILIATES!.prepare(`SELECT ${COLUMNS} FROM checkout_offers WHERE nonce = ?`).bind(nonce).first<OfferRow>()

export async function start(req: Request, { env }: Context) {
  const url = new URL(req.url)
  const origin = url.origin
  if (!live() || limited(clientId(req.headers))) return plain(origin)
  const withOffer = offerOn(env) && url.searchParams.get("o") !== "0"
  try {
    if (!withOffer) return go(await session(origin, {}))
    const nonce = newNonce()
    const now = Date.now()
    await env.AFFILIATES!.prepare("INSERT INTO checkout_offers (nonce, created_at) VALUES (?, ?)").bind(nonce, now).run()
    // Old rows are of no use; a small share of requests sweeps them.
    if (Math.random() < 0.05) await env.AFFILIATES!.prepare("DELETE FROM checkout_offers WHERE created_at < ?").bind(now - 2 * 86_400_000).run()
    const checkout = await session(origin, { cancel_url: `${origin}/api/checkout/back?n=${nonce}` })
    console.log(JSON.stringify({ event: "checkout-start", offer: true }))
    return go(checkout, { "set-cookie": setCookie(origin, nonce, Math.round(OFFER.startedWithinMs / 1000)) })
  } catch (err) {
    console.error("checkout: start failed", err instanceof Error ? err.message : err)
    return plain(origin)
  }
}

/** The ten minutes start the first time the buyer is seen back on the site, and never again. */
async function begin(env: Context["env"], nonce: string, now: number) {
  const found = await row(env, nonce)
  if (!found || found.started_at !== null || offerStatus(found, now) !== "fresh") return found
  await env.AFFILIATES!.prepare("UPDATE checkout_offers SET started_at = ?, expires_at = ? WHERE nonce = ? AND started_at IS NULL AND created_at > ?")
    .bind(now, now + OFFER.windowMs, nonce, now - OFFER.startedWithinMs)
    .run()
  console.log(JSON.stringify({ event: "offer-shown" }))
  return row(env, nonce)
}

export async function back(req: Request, { env }: Context) {
  const url = new URL(req.url)
  const origin = url.origin
  const nonce = url.searchParams.get("n")
  if (!offerOn(env) || !validNonce(nonce)) return go(`${origin}/pro`)
  try {
    const now = Date.now()
    if (offerStatus(await begin(env, nonce, now), now) === "open") return go(`${origin}/pro?offer=${nonce}`)
  } catch (err) {
    console.error("checkout: back failed", err instanceof Error ? err.message : err)
  }
  return go(`${origin}/pro`)
}

/** Where a finished payment lands: forgets the checkout, so the offer is never shown to someone who paid. */
export async function done(req: Request) {
  const url = new URL(req.url)
  const status = url.searchParams.get("status")
  const paid = !status || status === "succeeded"
  return go(`${url.origin}/pro`, paid ? { "set-cookie": setCookie(url.origin, "", 0) } : {})
}

export async function offer(req: Request, { env }: Context) {
  const nonce = nonceOf(req)
  if (!offerOn(env) || !validNonce(nonce)) return json({ open: false })
  try {
    const now = Date.now()
    const found = await begin(env, nonce, now)
    return offerStatus(found, now) === "open" ? json({ open: true, remainingMs: found!.expires_at! - now, dollars: OFFER.dollars }) : json({ open: false })
  } catch {
    return json({ open: false })
  }
}

export async function claim(req: Request, { env }: Context) {
  const url = new URL(req.url)
  const origin = url.origin
  const nonce = nonceOf(req)
  if (!offerOn(env) || !validNonce(nonce)) return plain(origin)
  if (limited(clientId(req.headers))) return go(`${origin}/pro?offer=${nonce}&offer_error=1`)
  try {
    const now = Date.now()
    const found = await row(env, nonce)
    if (offerStatus(found, now) !== "open") return go(`${origin}/pro`)
    let code = found!.code
    if (!code) {
      const made = await dodo("/discounts", {
        type: "percentage",
        amount: OFFER.bps,
        name: "Still thinking? offer",
        usage_limit: 1,
        restricted_to: [product()],
        customer_eligibility: "first_time",
        // The code outlives the ten minutes a little, so a buyer who claims at the last minute can still pay.
        expires_at: new Date(found!.expires_at! + OFFER.graceMs).toISOString(),
        metadata: { source: "checkout-back" },
      })
      if (typeof made.code !== "string") throw new Error("Invalid discount response")
      await env.AFFILIATES!.prepare("UPDATE checkout_offers SET code = ? WHERE nonce = ? AND code IS NULL").bind(made.code, nonce).run()
      code = (await row(env, nonce))?.code ?? made.code
    }
    const checkout = await session(origin, { discount_codes: [code], feature_flags: { allow_discount_code: false, allow_currency_selection: false }, cancel_url: `${origin}/pro?offer=${nonce}` })
    await env.AFFILIATES!.prepare("UPDATE checkout_offers SET claimed_at = ? WHERE nonce = ? AND claimed_at IS NULL").bind(now, nonce).run()
    console.log(JSON.stringify({ event: "offer-claimed" }))
    return go(checkout)
  } catch (err) {
    console.error("checkout: claim failed", err instanceof Error ? err.message : err)
    return go(`${origin}/pro?offer=${nonce}&offer_error=1`)
  }
}
