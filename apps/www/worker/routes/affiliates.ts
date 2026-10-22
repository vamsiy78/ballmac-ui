import { affiliateOwners } from "@/lib/affiliate-email"
import { applicationNotifications, deliverAffiliateNotifications } from "../affiliate-notifications"
import {
  AFFILIATE,
  commissionCents,
  paymentNetUsdCents,
  hashToken,
  referralCode,
  verifyAffiliateWebhook,
} from "@/lib/affiliates"
import { sameOrigin, readCookie } from "@/lib/pro-session-core"
import { createRateLimiter, clientId } from "@/lib/rate-limit"
import { paymentsLive } from "@/lib/payments"

const limited = createRateLimiter({ max: 5, windowMs: 600_000 })
const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "cache-control": "no-store", "referrer-policy": "no-referrer" } })
const affiliateProduct = () => {
  const id = process.env.DODO_AFFILIATE_PRODUCT_ID?.trim()
  return id && id !== process.env.DODO_FOUNDING_PRODUCT_ID?.trim() ? id : null
}
type Affiliate = {
  id: string
  name: string
  email: string
  code: string
  status: string
  discount_code: string | null
}
type Context = { env: { AFFILIATES?: import("@cloudflare/workers-types").D1Database } }
async function dodo(path: string, body?: unknown) {
  const res = await fetch(
    `${process.env.DODO_MODE === "test" ? "https://test.dodopayments.com" : "https://live.dodopayments.com"}${path}`,
    {
      method: body ? "POST" : "GET",
      headers: { authorization: `Bearer ${process.env.DODO_API_KEY}`, "content-type": "application/json" },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(15_000),
    },
  )
  if (!res.ok) throw new Error(`Affiliate payment provider: ${res.status}`)
  return res.json() as Promise<Record<string, unknown>>
}
export async function POST(req: Request, { env }: Context) {
  if (!sameOrigin(req.headers, true)) return json({ error: "Please submit from this site." }, 403)
  if (!env.AFFILIATES) return json({ error: "Applications are not open yet. Please check back soon." }, 503)
  if (limited(clientId(req.headers)))
    return json({ error: "Too many attempts. Please try again later." }, 429)
  const raw = await req.text()
  if (raw.length > 5000) return json({ error: "Please shorten your application." }, 413)
  let b: Record<string, unknown>
  try {
    b = JSON.parse(raw)
  } catch {
    return json({ error: "Invalid application." }, 400)
  }
  if (!b || typeof b !== "object") return json({ error: "Invalid application." }, 400)
  if (b.website) return json({ ok: true })
  const name = typeof b.name === "string" ? b.name.trim() : ""
  const email = typeof b.email === "string" ? b.email.trim().toLowerCase() : ""
  const channel = typeof b.channel === "string" ? b.channel.trim() : ""
  const promotionPlan = typeof b.promotionPlan === "string" ? b.promotionPlan.trim() : ""
  let validChannel = false
  try {
    const url = new URL(channel)
    validChannel = url.protocol === "https:" && !!url.hostname && !url.username && !url.password
  } catch {
    /* validation below */
  }
  if (
    !name ||
    name.length > 100 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > 254 ||
    !validChannel ||
    channel.length > 500 ||
    promotionPlan.length < 20 ||
    promotionPlan.length > 1000 ||
    b.terms !== true
  )
    return json(
      {
        error:
          "Enter your name, email, an https audience link and a promotion plan (20–1,000 characters), and accept the program terms.",
      },
      422,
    )
  if (!affiliateOwners().length)
    return json({ error: "Applications are temporarily unavailable. Please contact support." }, 503)
  const id = crypto.randomUUID()
  await env.AFFILIATES.batch([
    env.AFFILIATES.prepare(
      "INSERT INTO affiliates (id,email,name,channel,code,terms_version,promotion_plan,terms_accepted_at) VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(email) DO NOTHING",
    ).bind(
      id,
      email,
      name,
      channel,
      `partner-${crypto.randomUUID().slice(0, 8)}`,
      AFFILIATE.termsVersion,
      promotionPlan,
      new Date().toISOString(),
    ),
    ...applicationNotifications(env.AFFILIATES, id, { name, email, channel, promotionPlan }),
  ])
  // Acceptance is durable even when the email provider is unavailable. Scheduled retries use the same outbox rows.
  try {
    await deliverAffiliateNotifications(env.AFFILIATES)
  } catch {
    console.error("affiliate_notification_dispatch_failed")
  }
  // Same response for existing addresses: applications cannot enumerate membership.
  return json({ ok: true })
}
export async function GET(req: Request, { env }: Context) {
  if (!env.AFFILIATES) return json({ error: "The partner dashboard is not available yet." }, 503)
  if (!sameOrigin(req.headers, false))
    return json({ error: "Please open the partner dashboard on this site." }, 403)
  const bearer = req.headers.get("authorization")?.replace(/^Bearer /, "")
  const token = bearer ?? readCookie(req.headers.get("cookie"), "bm_partner") ?? ""
  if (!/^[a-f0-9]{64}$/.test(token)) return json({ error: "Sign in to open your partner dashboard." }, 401)
  const affiliate = bearer
    ? await env.AFFILIATES.prepare("SELECT id,name,code,status FROM affiliates WHERE token_hash = ?")
        .bind(await hashToken(token))
        .first<Affiliate>()
    : await env.AFFILIATES.prepare(
        "SELECT a.id,a.name,a.code,a.status FROM affiliates a JOIN affiliate_sessions s ON s.affiliate_id=a.id WHERE s.token_hash=? AND s.expires_at>?",
      )
        .bind(await hashToken(token), Date.now())
        .first<Affiliate>()
  if (!affiliate) return json({ error: "Your session has expired. Please sign in again." }, 401)
  const sales = await env.AFFILIATES.prepare(
    "SELECT payment_id,net_cents,commission_cents,state,created_at FROM affiliate_sales WHERE affiliate_id = ? ORDER BY created_at DESC LIMIT 100",
  )
    .bind(affiliate.id)
    .all()
  const totals = await env.AFFILIATES.prepare(
    "SELECT COUNT(CASE WHEN state='earned' THEN 1 END) AS conversions, COALESCE(SUM(CASE WHEN state='earned' THEN commission_cents ELSE 0 END),0) AS earned, COALESCE(SUM(CASE WHEN state='earned' AND datetime(created_at) < datetime('now','start of month') THEN commission_cents ELSE 0 END),0) AS prior FROM affiliate_sales WHERE affiliate_id=?",
  )
    .bind(affiliate.id)
    .first<{ conversions: number; earned: number; prior: number }>()
  const payouts = await env.AFFILIATES.prepare(
    "SELECT amount_cents,reference,paid_at FROM affiliate_payouts WHERE affiliate_id=? ORDER BY paid_at DESC",
  )
    .bind(affiliate.id)
    .all<{ amount_cents: number }>()
  const paid = payouts.results.reduce((sum, p) => sum + p.amount_cents, 0)
  const balance = (totals?.earned ?? 0) - paid
  const eligible = Math.max(0, (totals?.prior ?? 0) - paid)
  const pending = Math.max(0, balance - eligible)
  const now = new Date()
  const reviewMonth = now.getUTCMonth() + (now.getUTCDate() > 15 ? 1 : 0)
  const reviewStart = new Date(Date.UTC(now.getUTCFullYear(), reviewMonth, 1))
  const reviewEnd = new Date(Date.UTC(now.getUTCFullYear(), reviewMonth, 15))
  return json({
    review: {
      start: reviewStart.toISOString(),
      end: reviewEnd.toISOString(),
      pendingEligibleAt: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)).toISOString(),
    },
    affiliate: { name: affiliate.name, code: affiliate.code, status: affiliate.status },
    totals: {
      conversions: totals?.conversions ?? 0,
      earned: totals?.earned ?? 0,
      paid,
      balance,
      eligible,
      pending,
    },
    sales: sales.results,
    payouts: payouts.results,
  })
}
export async function referral(req: Request, { env }: Context) {
  const url = new URL(req.url),
    code = referralCode(url.searchParams.get("ref"))
  const affiliate =
    code && env.AFFILIATES
      ? await env.AFFILIATES.prepare("SELECT id FROM affiliates WHERE code=? AND status='active'")
          .bind(code)
          .first()
      : null
  const headers = new Headers({
    location: new URL("/pro", url.origin).toString(),
    "cache-control": "no-store",
  })
  if (affiliate)
    headers.set(
      "set-cookie",
      `bm_ref=${code}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${AFFILIATE.cookieDays * 86400}${url.protocol === "https:" ? "; Secure" : ""}`,
    )
  return new Response(null, { status: 303, headers })
}
const checkoutLimited = createRateLimiter({ max: 20, windowMs: 600_000 })
function checkoutError(req: Request, reason: string) {
  return new Response(null, {
    status: 303,
    headers: {
      location: `${new URL(req.url).origin}/pro?referral_error=${reason}`,
      "cache-control": "no-store",
    },
  })
}
export async function checkout(req: Request, { env }: Context) {
  if (checkoutLimited(clientId(req.headers))) return checkoutError(req, "busy")
  if (!paymentsLive() || !process.env.DODO_API_KEY || !affiliateProduct() || !env.AFFILIATES)
    return checkoutError(req, "unavailable")
  const code = referralCode(req.headers.get("cookie")?.match(/(?:^|;\s*)bm_ref=([^;]+)/)?.[1])
  const affiliate = code
    ? await env.AFFILIATES.prepare("SELECT id,discount_code FROM affiliates WHERE code=? AND status='active'")
        .bind(code)
        .first<Affiliate>()
    : null
  if (!affiliate?.discount_code) return checkoutError(req, "expired")
  const end = process.env.NEXT_PUBLIC_PRO_FOUNDING_ENDS
  if (end && Date.now() < Date.parse(end)) return checkoutError(req, "founding")
  let result: Record<string, unknown>
  try {
    result = await dodo("/checkouts", {
      product_cart: [{ product_id: affiliateProduct(), quantity: 1 }],
      discount_code: affiliate.discount_code,
      feature_flags: { allow_discount_code: false, allow_currency_selection: false },
      metadata: { affiliate_id: affiliate.id },
      return_url: `${new URL(req.url).origin}/pro`,
    })
  } catch {
    return checkoutError(req, "unavailable")
  }
  if (typeof result.checkout_url !== "string" || new URL(result.checkout_url).protocol !== "https:")
    throw new Error("Invalid checkout response")
  return new Response(null, {
    status: 303,
    headers: { location: result.checkout_url, "cache-control": "no-store" },
  })
}
export async function referralStatus(req: Request, { env }: Context) {
  const code = referralCode(req.headers.get("cookie")?.match(/(?:^|;\s*)bm_ref=([^;]+)/)?.[1])
  const active =
    code && env.AFFILIATES
      ? await env.AFFILIATES.prepare(
          "SELECT id FROM affiliates WHERE code=? AND status='active' AND discount_code IS NOT NULL",
        )
          .bind(code)
          .first()
      : null
  const ends = process.env.NEXT_PUBLIC_PRO_FOUNDING_ENDS
  return json({
    active: Boolean(
      active &&
      paymentsLive() &&
      process.env.DODO_API_KEY &&
      affiliateProduct() &&
      (!ends || Date.now() >= Date.parse(ends)),
    ),
  })
}
export async function webhook(req: Request, { env }: Context) {
  if (!env.AFFILIATES || !process.env.DODO_AFFILIATE_WEBHOOK_SECRET || !process.env.DODO_API_KEY)
    return json({ error: "Not configured" }, 503)
  const raw = await req.text()
  if (raw.length > 100_000) return json({ error: "Payload too large" }, 413)
  if (!(await verifyAffiliateWebhook(raw, req.headers, process.env.DODO_AFFILIATE_WEBHOOK_SECRET)))
    return json({ error: "Invalid signature" }, 401)
  let event: { type: string; data?: { payment_id?: string } }
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== "object" || typeof parsed.type !== "string")
      return json({ error: "Invalid webhook event" }, 400)
    event = parsed
  } catch {
    return json({ error: "Invalid webhook event" }, 400)
  }
  if (
    ![
      "payment.succeeded",
      "refund.succeeded",
      "dispute.opened",
      "dispute.lost",
      "dispute.won",
      "dispute.cancelled",
    ].includes(event.type)
  )
    return json({ ok: true })
  const id = req.headers.get("webhook-id")!
  if (await env.AFFILIATES.prepare("SELECT id FROM affiliate_events WHERE id=?").bind(id).first())
    return json({ ok: true })
  if (!event.data || typeof event.data.payment_id !== "string" || !event.data.payment_id)
    return json({ error: "Missing payment" }, 400)
  // Reconcile from the provider, rather than trusting an event's order or monetary fields.
  const payment = (await dodo(`/payments/${encodeURIComponent(event.data.payment_id)}`)) as {
    payment_id: string
    status: string
    currency: string
    total_amount: number
    tax: number | null
    settlement_currency?: string
    settlement_amount?: number
    settlement_tax?: number | null
    created_at: string
    metadata: { affiliate_id?: string }
    customer: { email: string }
    product_cart: { product_id: string; quantity: number }[]
    refunds?: { status: string }[]
    disputes?: { dispute_status: string }[]
  }
  const affiliate = payment.metadata?.affiliate_id
    ? await env.AFFILIATES.prepare("SELECT id,email FROM affiliates WHERE id=?")
        .bind(payment.metadata.affiliate_id)
        .first<Affiliate>()
    : null
  if (
    !affiliate ||
    !payment.customer?.email ||
    payment.customer.email.toLowerCase() === affiliate.email.toLowerCase() ||
    payment.product_cart?.length !== 1 ||
    payment.product_cart[0].product_id !== affiliateProduct() ||
    payment.product_cart[0].quantity !== 1
  )
    return json({ ok: true })
  const net = paymentNetUsdCents(payment)
  if (net === null) return json({ error: "The payment has no valid tax-exclusive USD amount." }, 422)
  const disputesResolved =
    Boolean(payment.disputes?.length) &&
    payment.disputes!.every((d) => ["dispute_won", "dispute_cancelled"].includes(d.dispute_status))
  const unresolvedDispute = payment.disputes?.some(
    (d) => !["dispute_won", "dispute_cancelled"].includes(d.dispute_status),
  )
  const reversed =
    payment.status !== "succeeded" ||
    event.type === "refund.succeeded" ||
    Boolean(payment.refunds?.some((r) => r.status === "succeeded")) ||
    Boolean(unresolvedDispute) ||
    (event.type.startsWith("dispute.") && !disputesResolved)
  // Reversals are sticky: a late payment.succeeded cannot restore a reversed commission. Restoration is reviewed manually.
  await env.AFFILIATES.batch([
    env.AFFILIATES.prepare(
      "INSERT INTO affiliate_sales (payment_id,affiliate_id,net_cents,commission_cents,state,created_at,updated_at) VALUES (?,?,?,?,?,?,?) ON CONFLICT(payment_id) DO UPDATE SET state=CASE WHEN affiliate_sales.state='reversed' THEN 'reversed' ELSE excluded.state END, updated_at=excluded.updated_at",
    ).bind(
      payment.payment_id,
      affiliate.id,
      net,
      commissionCents(net),
      reversed ? "reversed" : "earned",
      payment.created_at,
      new Date().toISOString(),
    ),
    env.AFFILIATES.prepare("INSERT OR IGNORE INTO affiliate_events (id) VALUES (?)").bind(id),
  ])
  return json({ ok: true })
}
