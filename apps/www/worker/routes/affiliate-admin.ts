import { notificationStatement, deliverAffiliateNotifications } from "../affiliate-notifications"
import { approvalEmail, affiliateOrigin, partnerEmail } from "@/lib/affiliate-email"
import { commissionCents, hashToken, paymentNetUsdCents } from "@/lib/affiliates"
import { payoutCents, type AdminPartner, type AdminView } from "@/lib/affiliate-admin"
import { sameOrigin } from "@/lib/pro-session-core"
import { createRateLimiter, clientId } from "@/lib/rate-limit"
import { paymentsLive } from "@/lib/payments"
import { resend } from "@/lib/resend"
import { adminIdentity, ownerJson as json, type AdminContext } from "./affiliate-admin-session"

const limited = createRateLimiter({ max: 30, windowMs: 600_000 })
const product = () => {
  const id = process.env.DODO_AFFILIATE_PRODUCT_ID?.trim()
  return id && id !== process.env.DODO_FOUNDING_PRODUCT_ID?.trim() ? id : null
}
class ActionError extends Error {
  constructor(
    message: string,
    readonly status = 422,
  ) {
    super(message)
  }
}
const balances = `WITH balances AS (
  SELECT a.id,a.name,a.email,a.channel,a.code,a.discount_code,a.review_note,a.created_at,a.revision,
    CASE WHEN a.review_state='rejected' THEN 'rejected' ELSE a.status END AS status,
    COALESCE(s.conversions,0) AS conversions,COALESCE(s.earned,0) AS earned,COALESCE(s.prior,0) AS prior,COALESCE(p.paid,0) AS paid
  FROM affiliates a LEFT JOIN (
    SELECT affiliate_id,COUNT(CASE WHEN state='earned' THEN 1 END) AS conversions,
      SUM(CASE WHEN state='earned' THEN commission_cents ELSE 0 END) AS earned,
      SUM(CASE WHEN state='earned' AND datetime(created_at)<datetime('now','start of month') THEN commission_cents ELSE 0 END) AS prior
    FROM affiliate_sales GROUP BY affiliate_id
  ) s ON s.affiliate_id=a.id LEFT JOIN (SELECT affiliate_id,SUM(amount_cents) AS paid FROM affiliate_payouts GROUP BY affiliate_id) p ON p.affiliate_id=a.id
), partners AS (SELECT *,earned-paid AS balance,MAX(0,prior-paid) AS eligible,MAX(0,earned-paid-MAX(0,prior-paid)) AS pending FROM balances)`
async function provider(path: string, body?: unknown): Promise<Record<string, unknown>> {
  if (!paymentsLive() || !product() || !process.env.DODO_API_KEY)
    throw new ActionError("Configure live-safe Dodo settings and the regular Pro product first.", 503)
  const res = await fetch(
    `https://${process.env.DODO_MODE === "test" ? "test" : "live"}.dodopayments.com${path}`,
    {
      method: body ? "POST" : "GET",
      headers: { authorization: `Bearer ${process.env.DODO_API_KEY}`, "content-type": "application/json" },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(15_000),
    },
  )
  if (!res.ok) {
    // Never return arbitrary provider messages: they may contain account or request details.
    const detail = (await res.json().catch(() => null)) as { code?: string } | null
    if (res.status === 403 && detail?.code === "INSUFFICIENT_PERMISSION") {
      const permission =
        path === "/discounts" && body
          ? "discounts:write"
          : path.startsWith("/discounts")
            ? "discounts:read"
            : "payments:read"
      throw new ActionError(
        `The Dodo API key needs ${permission} permission. Update this environment's DODO_API_KEY and try again.`,
        502,
      )
    }
    if (res.status === 401)
      throw new ActionError(
        "Dodo rejected the API key. Update DODO_API_KEY with a valid key for the configured payment mode.",
        502,
      )
    throw new ActionError(
      res.status === 404
        ? "The requested Dodo record was not found."
        : "Dodo could not complete the request. Please try again.",
      res.status === 404
        ? 404
        : res.status === 409 || detail?.code === "DISCOUNT_CODE_ALREADY_EXISTS"
          ? 409
          : 502,
    )
  }
  return res.json()
}
async function discountFor(partner: AdminPartner, supplied: string) {
  // Dodo codes are limited to 16 characters. Keep a stable, partner-specific code for retry safety.
  const code = supplied || `BM${(await hashToken(`discount:${partner.id}`)).slice(0, 12).toUpperCase()}10`
  let discount: Record<string, unknown>
  try {
    discount = await provider(`/discounts/code/${encodeURIComponent(code)}`)
  } catch (error) {
    if (supplied || !(error instanceof ActionError) || error.status !== 404) throw error
    try {
      discount = await provider("/discounts", {
        code,
        name: `Ballmac partner ${partner.code}`,
        type: "percentage",
        amount: 1000,
        restricted_to: [product()],
        per_customer_usage_limit: 1,
        metadata: { affiliate_id: partner.id },
      })
    } catch (error) {
      // Only a duplicate-code conflict can be recovered by looking up a concurrent creation.
      if (!(error instanceof ActionError) || error.status !== 409) throw error
      discount = await provider(`/discounts/code/${encodeURIComponent(code)}`)
    }
  }
  const restricted = discount.restricted_to as string[] | undefined
  if (
    discount.type !== "percentage" ||
    discount.amount !== 1000 ||
    restricted?.length !== 1 ||
    restricted[0] !== product() ||
    discount.per_customer_usage_limit !== 1 ||
    typeof discount.code !== "string" ||
    (discount.expires_at && Date.parse(String(discount.expires_at)) <= Date.now()) ||
    (discount.starts_at && Date.parse(String(discount.starts_at)) > Date.now())
  )
    throw new ActionError("Use an active 10% discount restricted to regular Pro, with one use per customer.")
  return discount.code as string
}
export async function GET(req: Request, ctx: AdminContext) {
  if (!ctx.env.AFFILIATES) return json({ error: "The partner database is not configured." }, 503)
  const owner = await adminIdentity(req, ctx)
  if (!owner) return json({ error: "Owner sign-in is required." }, 401)
  const db = ctx.env.AFFILIATES,
    url = new URL(req.url)
  const allowed: AdminView[] = [
    "overview",
    "applications",
    "partners",
    "sales",
    "payouts",
    "audit",
    "settings",
  ]
  const view = allowed.includes(url.searchParams.get("view") as AdminView)
    ? (url.searchParams.get("view") as AdminView)
    : "overview"
  let page = Math.min(100000, Math.max(0, Math.floor(Number(url.searchParams.get("page")) || 0)))
  const q = (url.searchParams.get("q") ?? "").trim().slice(0, 150),
    status = url.searchParams.get("status") ?? "all"
  const summary = await db
    .prepare(
      `${balances} SELECT COUNT(CASE WHEN status='pending' THEN 1 END) AS pending,COUNT(CASE WHEN status='active' THEN 1 END) AS active,COUNT(CASE WHEN status='paused' THEN 1 END) AS paused,COUNT(CASE WHEN status='rejected' THEN 1 END) AS rejected,COALESCE(SUM(earned),0) AS earned,COALESCE(SUM(paid),0) AS paid,COALESCE(SUM(eligible),0) AS eligible,COALESCE(SUM(pending),0) AS pendingEarnings,COALESCE(SUM(conversions),0) AS sales FROM partners`,
    )
    .first()
  let partners: unknown[] = [],
    sales: unknown[] = [],
    payouts: unknown[] = [],
    audit: unknown[] = [],
    total = 0
  const offsetFor = (count: number) => {
    page = Math.min(page, Math.max(0, Math.ceil(count / 25) - 1))
    return page * 25
  }
  if (["overview", "applications", "partners"].includes(view)) {
    const conditions =
      view === "applications"
        ? ["status IN ('pending','rejected')"]
        : view === "partners"
          ? ["status IN ('active','paused')"]
          : ["eligible>=5000 OR status='pending'"]
    const args: unknown[] = []
    if (q) {
      conditions.push("instr(lower(name||' '||email||' '||code),lower(?))>0")
      args.push(q)
    }
    if (status === "ready" && view === "partners") conditions.push("eligible>=5000")
    else if (["pending", "rejected", "active", "paused"].includes(status)) {
      conditions.push("status=?")
      args.push(status)
    }
    const where = conditions.join(" AND ")
    total = Number(
      (
        await db
          .prepare(`${balances} SELECT COUNT(*) AS total FROM partners WHERE ${where}`)
          .bind(...args)
          .first<{ total: number }>()
      )?.total ?? 0,
    )
    partners = (
      await db
        .prepare(
          `${balances} SELECT * FROM partners WHERE ${where} ORDER BY ${view === "applications" ? "created_at ASC" : "eligible DESC,created_at DESC"} LIMIT 25 OFFSET ?`,
        )
        .bind(...args, offsetFor(total))
        .all()
    ).results
  } else if (view === "sales") {
    const where = ["1=1"],
      args: unknown[] = []
    if (q) {
      where.push("instr(lower(a.email||' '||a.name||' '||s.payment_id),lower(?))>0")
      args.push(q)
    }
    if (["earned", "reversed"].includes(status)) {
      where.push("s.state=?")
      args.push(status)
    }
    const clause = where.join(" AND ")
    total = Number(
      (
        await db
          .prepare(
            `SELECT COUNT(*) AS total FROM affiliate_sales s JOIN affiliates a ON a.id=s.affiliate_id WHERE ${clause}`,
          )
          .bind(...args)
          .first<{ total: number }>()
      )?.total ?? 0,
    )
    sales = (
      await db
        .prepare(
          `SELECT s.*,a.name,a.email FROM affiliate_sales s JOIN affiliates a ON a.id=s.affiliate_id WHERE ${clause} ORDER BY s.created_at DESC LIMIT 25 OFFSET ?`,
        )
        .bind(...args, offsetFor(total))
        .all()
    ).results
  } else if (view === "payouts") {
    const clause = "instr(lower(a.email||' '||a.name||' '||p.reference),lower(?))>0"
    total = Number(
      (
        await db
          .prepare(
            `SELECT COUNT(*) AS total FROM affiliate_payouts p JOIN affiliates a ON a.id=p.affiliate_id WHERE ${clause}`,
          )
          .bind(q)
          .first<{ total: number }>()
      )?.total ?? 0,
    )
    payouts = (
      await db
        .prepare(
          `SELECT p.*,a.name,a.email FROM affiliate_payouts p JOIN affiliates a ON a.id=p.affiliate_id WHERE ${clause} ORDER BY p.paid_at DESC LIMIT 25 OFFSET ?`,
        )
        .bind(q, offsetFor(total))
        .all()
    ).results
  } else if (view === "audit") {
    const clause = "instr(lower(actor||' '||action||' '||target||' '||note),lower(?))>0"
    total = Number(
      (
        await db
          .prepare(`SELECT COUNT(*) AS total FROM affiliate_audit WHERE ${clause}`)
          .bind(q)
          .first<{ total: number }>()
      )?.total ?? 0,
    )
    audit = (
      await db
        .prepare(
          `SELECT * FROM affiliate_audit WHERE ${clause} ORDER BY created_at DESC,rowid DESC LIMIT 25 OFFSET ?`,
        )
        .bind(q, offsetFor(total))
        .all()
    ).results
  }
  if (view === "settings") page = 0
  const mail =
    view === "settings"
      ? await db
          .prepare(
            "SELECT COUNT(CASE WHEN state='pending' THEN 1 END) AS pending, COUNT(CASE WHEN state='pending' AND (attempts>=10 OR created_at<=strftime('%Y-%m-%dT%H:%M:%fZ','now','-23 hours')) THEN 1 END) AS attention FROM affiliate_notifications",
          )
          .first<{ pending: number; attention: number }>()
      : null
  return json({
    owner,
    view,
    page,
    pages: Math.max(1, Math.ceil(total / 25)),
    total,
    summary,
    partners,
    sales,
    payouts,
    audit,
    settings: [
      {
        label: "Partner database",
        ready: true,
        help: "Applications, commissions, sessions and audit history.",
      },
      {
        label: "Owner authentication",
        ready: true,
        help: "Server-side email allowlist and eight-hour owner sessions.",
      },
      {
        label: "Email delivery",
        ready: Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM),
        help: "RESEND_API_KEY and RESEND_FROM.",
      },
      ...(mail
        ? [
            {
              label: "Application & payout emails",
              ready: mail.attention === 0,
              help: `${mail.pending} queued; ${mail.attention} need attention. Pending deliveries retry every 15 minutes. Check sender configuration and provider logs for failures.`,
            },
          ]
        : []),
      {
        label: "Regular-price Pro product",
        ready: Boolean(product()),
        help: "DODO_AFFILIATE_PRODUCT_ID must differ from the founding product.",
      },
      {
        label: "Payment provider",
        ready: Boolean(process.env.DODO_API_KEY && paymentsLive()),
        help: "DODO_API_KEY and DODO_MODE; test mode is refused on production.",
      },
      {
        label: "Payment webhooks",
        ready: Boolean(process.env.DODO_AFFILIATE_WEBHOOK_SECRET),
        help: "DODO_AFFILIATE_WEBHOOK_SECRET and the Dodo webhook endpoint.",
      },
    ],
  })
}
export async function POST(req: Request, ctx: AdminContext) {
  if (!sameOrigin(req.headers, true)) return json({ error: "Please make changes from this site." }, 403)
  const owner = await adminIdentity(req, ctx)
  if (!owner) return json({ error: "Owner sign-in is required." }, 401)
  const db = ctx.env.AFFILIATES!
  if (limited(clientId(req.headers)))
    return json({ error: "Too many actions. Please wait a few minutes." }, 429)
  const raw = await req.text()
  if (raw.length > 5000) return json({ error: "Request is too long." }, 413)
  let body: Record<string, unknown>
  try {
    body = JSON.parse(raw)
  } catch {
    return json({ error: "Invalid request." }, 400)
  }
  if (!body || typeof body !== "object") return json({ error: "Invalid request." }, 400)
  const action = typeof body.action === "string" ? body.action : "",
    id = typeof body.id === "string" ? body.id : ""
  const note = typeof body.note === "string" ? body.note.trim().slice(0, 1000) : ""
  const auditId = crypto.randomUUID()
  try {
    if (action === "reconcile") {
      const sale = await db
        .prepare(
          "SELECT s.*,a.email FROM affiliate_sales s JOIN affiliates a ON a.id=s.affiliate_id WHERE s.payment_id=?",
        )
        .bind(id)
        .first<{ affiliate_id: string; email: string; updated_at: string }>()
      if (!sale) throw new ActionError("Commission record not found.", 404)
      const payment = await provider(`/payments/${encodeURIComponent(id)}`)
      const cart = payment.product_cart as { product_id: string; quantity: number }[] | undefined,
        metadata = payment.metadata as { affiliate_id?: string } | undefined,
        customer = payment.customer as { email?: string } | undefined
      if (
        metadata?.affiliate_id !== sale.affiliate_id ||
        cart?.length !== 1 ||
        cart[0].product_id !== product() ||
        cart[0].quantity !== 1 ||
        !customer?.email ||
        customer.email.toLowerCase() === sale.email.toLowerCase()
      )
        throw new ActionError("The payment is not an eligible referred Pro purchase.")
      const net = paymentNetUsdCents(payment)
      if (net === null) throw new ActionError("The payment has no valid tax-exclusive USD amount from Dodo.")
      const refunds = payment.refunds as { status: string }[] | undefined,
        disputes = payment.disputes as { dispute_status: string }[] | undefined
      const state =
        payment.status === "succeeded" &&
        !refunds?.some((r) => r.status === "succeeded") &&
        !disputes?.some((d) => !["dispute_won", "dispute_cancelled"].includes(d.dispute_status))
          ? "earned"
          : "reversed"
      const result = await db.batch([
        db
          .prepare(
            "UPDATE affiliate_sales SET net_cents=?,commission_cents=?,state=?,updated_at=? WHERE payment_id=? AND updated_at=? RETURNING payment_id",
          )
          .bind(net, commissionCents(net), state, new Date().toISOString(), id, sale.updated_at),
        db
          .prepare(
            "INSERT INTO affiliate_audit (id,actor,action,target,note,detail) SELECT ?,?,?,?,?,? WHERE changes()=1",
          )
          .bind(
            auditId,
            owner,
            action,
            id,
            note || "Reconciled against the payment provider",
            JSON.stringify({ state, net_cents: net, commission_cents: commissionCents(net) }),
          ),
      ])
      if (!result[0].results.length)
        throw new ActionError("The payment changed during review. Refresh and try again.", 409)
      return json({ ok: true, message: `Payment reconciled. Commission is ${state}.` })
    }
    const partner = await db
      .prepare(`${balances} SELECT * FROM partners WHERE id=?`)
      .bind(id)
      .first<AdminPartner>()
    if (!partner) throw new ActionError("Partner record not found.", 404)
    if (action === "payout") {
      const amount = payoutCents(body.amount),
        reference = typeof body.reference === "string" ? body.reference.trim() : "",
        method = body.method
      if (
        body.confirmed !== true ||
        amount === null ||
        amount < 5000 ||
        !reference ||
        reference.length > 200 ||
        !["paypal", "wise", "other"].includes(String(method))
      )
        throw new ActionError(
          "Confirm the completed transfer, enter at least $50.00 USD, choose a method and supply its unique reference.",
        )
      const payoutId = crypto.randomUUID()
      const result = await db.batch([
        db
          .prepare(
            `INSERT INTO affiliate_payouts (id,affiliate_id,amount_cents,reference,method) SELECT ?,?,?,?,? WHERE ? <= (SELECT COALESCE(SUM(CASE WHEN state='earned' AND datetime(created_at)<datetime('now','start of month') THEN commission_cents ELSE 0 END),0) FROM affiliate_sales WHERE affiliate_id=?) - (SELECT COALESCE(SUM(amount_cents),0) FROM affiliate_payouts WHERE affiliate_id=?) RETURNING id`,
          )
          .bind(payoutId, id, amount, reference, method, amount, id, id),
        db
          .prepare(
            "INSERT INTO affiliate_audit (id,actor,action,target,note,detail) SELECT ?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM affiliate_payouts WHERE id=?)",
          )
          .bind(
            auditId,
            owner,
            action,
            id,
            note,
            JSON.stringify({ amount_cents: amount, reference, method }),
            payoutId,
          ),
        notificationStatement(
          db,
          `payout:${payoutId}`,
          id,
          partner.email,
          partnerEmail({
            eyebrow: "Payout confirmation",
            title: "Your partner payout is recorded",
            intro: `Hi ${partner.name}, a completed transfer has been recorded for your partnership.`,
            details: [
              ["Amount", `$${(amount / 100).toFixed(2)} USD`],
              ["Method", String(method)],
              ["Transfer reference", reference],
            ],
            paragraphs: [
              "This confirms the transfer recorded by Ballmac. Your payment provider determines when the funds arrive. Contact support if the details do not match what you received.",
            ],
            action: {
              label: "View payment history",
              url: `${affiliateOrigin()}/affiliates/dashboard#partner-payouts`,
            },
          }),
          false,
          { table: "affiliate_payouts", id: payoutId },
        ),
      ])
      if (!result[0].results.length)
        throw new ActionError("The eligible balance is too low. Refresh before recording the payout.", 409)
      try {
        await deliverAffiliateNotifications(db)
      } catch {
        console.error("affiliate_payout_notification_dispatch_failed")
      }
      return json({
        ok: true,
        message:
          "Completed transfer recorded. A confirmation email is queued. This action did not send money.",
      })
    }
    if (action === "notify") {
      if (partner.status !== "active")
        throw new ActionError("Only active partners can receive an approval email.")
      await notify(partner)
      await db
        .prepare("INSERT INTO affiliate_audit (id,actor,action,target,note) VALUES (?,?,?,?,?)")
        .bind(auditId, owner, action, id, "Approval email sent")
        .run()
      return json({ ok: true, message: "Approval email sent." })
    }
    if (!["approve", "pause", "reject", "reopen", "revoke"].includes(action))
      throw new ActionError("Unknown action.", 400)
    if (!Number.isInteger(body.revision) || body.revision !== partner.revision)
      throw new ActionError("This record has changed. Refresh before making another change.", 409)
    if (["pause", "reject"].includes(action) && !note)
      throw new ActionError("Add an internal reason for this decision.")
    if (
      (action === "pause" && partner.status !== "active") ||
      (action === "reject" && partner.status !== "pending") ||
      (action === "reopen" && partner.status !== "rejected") ||
      (action === "revoke" && !["active", "paused"].includes(partner.status))
    )
      throw new ActionError("This action is not available for the current status.", 409)
    if (action === "approve" && partner.status === "active")
      throw new ActionError("This partner is already active.", 409)
    const discount =
      action === "approve"
        ? await discountFor(
            partner,
            typeof body.discount === "string"
              ? body.discount.trim().toUpperCase().slice(0, 100)
              : (partner.discount_code ?? ""),
          )
        : partner.discount_code
    const status =
      action === "approve"
        ? "active"
        : action === "pause"
          ? "paused"
          : action === "reopen" || action === "reject"
            ? "pending"
            : partner.status
    const statements = [
      db
        .prepare(
          "UPDATE affiliates SET status=?,review_state=?,review_note=?,reviewed_at=?,discount_code=?,revision=revision+1 WHERE id=? AND revision=? RETURNING id",
        )
        .bind(
          status,
          action === "reject" ? "rejected" : null,
          note || partner.review_note,
          new Date().toISOString(),
          discount,
          id,
          body.revision,
        ),
      db
        .prepare(
          "INSERT INTO affiliate_audit (id,actor,action,target,note,detail) SELECT ?,?,?,?,?,? WHERE changes()=1",
        )
        .bind(
          auditId,
          owner,
          action,
          id,
          note,
          JSON.stringify({ status: action === "reject" ? "rejected" : status }),
        ),
    ]
    if (["approve", "revoke", "reject"].includes(action)) {
      statements.push(
        db
          .prepare(
            "DELETE FROM affiliate_sessions WHERE affiliate_id=? AND EXISTS(SELECT 1 FROM affiliate_audit WHERE id=?)",
          )
          .bind(id, auditId),
        db
          .prepare(
            "DELETE FROM affiliate_challenges WHERE affiliate_id=? AND EXISTS(SELECT 1 FROM affiliate_audit WHERE id=?)",
          )
          .bind(id, auditId),
        db
          .prepare(
            "UPDATE affiliates SET token_hash=NULL WHERE id=? AND EXISTS(SELECT 1 FROM affiliate_audit WHERE id=?)",
          )
          .bind(id, auditId),
      )
    }
    const result = await db.batch(statements)
    if (!result[0].results.length)
      throw new ActionError("This record changed during review. Refresh and try again.", 409)
    let warning: string | undefined
    if (action === "approve" && body.notify === true) {
      try {
        await notify(partner)
      } catch {
        warning = "Partner approved, but the email could not be sent. Use ‘Send approval email’ to retry."
      }
    }
    return json({
      ok: true,
      message:
        action === "approve"
          ? "Partner approved. Email sign-in and their referral link are active."
          : action === "revoke"
            ? "Partner sessions and access keys revoked. They can request a new email sign-in code."
            : "Partner record updated.",
      warning,
    })
  } catch (error) {
    if (error instanceof ActionError) return json({ error: error.message }, error.status)
    if (
      error instanceof Error &&
      /UNIQUE constraint failed|unique constraint|SQLITE_CONSTRAINT/i.test(error.message)
    )
      return json(
        { error: "That transfer reference is already recorded. No additional payout was added." },
        409,
      )
    return json(
      { error: "The action could not be completed. Refresh to check its status before trying again." },
      502,
    )
  }
}
async function notify(partner: AdminPartner) {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM)
    throw new ActionError("Email delivery is not configured.", 503)
  await resend("/emails", {
    method: "POST",
    body: {
      from: process.env.RESEND_FROM,
      to: [partner.email],
      ...approvalEmail(partner.name),
    },
  })
}
