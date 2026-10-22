vi.mock("@/lib/resend", () => ({ resend: vi.fn() }))
vi.mock("@/lib/affiliate-email", () => import("../lib/affiliate-email"))
import { afterEach, describe, expect, it, vi } from "vitest"
import {
  AFFILIATE,
  commissionCents,
  paymentNetUsdCents,
  hashToken,
  referralCode,
  verifyAffiliateWebhook,
} from "../lib/affiliates"

vi.mock("@/lib/affiliates", () => import("../lib/affiliates"))
vi.mock("@/lib/pro-session-core", () => import("../lib/pro-session-core"))
vi.mock("@/lib/rate-limit", () => ({ createRateLimiter: () => () => false, clientId: () => "test" }))
vi.mock("@/lib/payments", () => import("../lib/payments"))
import { POST, GET, checkout, referral, referralStatus, webhook } from "../worker/routes/affiliates"

const context = (database?: unknown) => ({ env: { AFFILIATES: database } }) as Parameters<typeof POST>[1]
const request = (body: unknown) =>
  new Request("https://ui.ballmac.com/api/affiliates", {
    method: "POST",
    headers: { origin: "https://ui.ballmac.com", host: "ui.ballmac.com" },
    body: JSON.stringify(body),
  })
function database(first: unknown = null) {
  const statement = {
    bind: vi.fn().mockReturnThis(),
    first: vi.fn().mockResolvedValue(first),
    run: vi.fn().mockResolvedValue({ success: true }),
    all: vi.fn().mockResolvedValue({ results: [] }),
  }
  return { prepare: vi.fn().mockReturnValue(statement), batch: vi.fn().mockResolvedValue([]), statement }
}
const secret = `whsec_${btoa("test-signing-secret-32-characters")}`
async function signed(body: string, time = Math.floor(Date.now() / 1000)) {
  const id = "msg_test",
    timestamp = String(time)
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode("test-signing-secret-32-characters"),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const bytes = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${id}.${timestamp}.${body}`)),
  )
  return new Headers({
    "webhook-id": id,
    "webhook-timestamp": timestamp,
    "webhook-signature": `v1,${btoa(String.fromCharCode(...bytes))}`,
  })
}
afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})
describe("affiliate rules", () => {
  it("applies a flat 30% after the buyer's 10% discount, in integer cents", () => {
    expect(AFFILIATE.discount).toBe(10)
    expect(commissionCents(8910)).toBe(2673)
    expect(commissionCents(1)).toBe(0)
    for (const n of [-1, NaN, 1.1, Infinity]) expect(() => commissionCents(n)).toThrow()
  })
  it("accepts only safe referral slugs", () => {
    expect(referralCode("partner-12345678")).toBe("partner-12345678")
    for (const s of ["../x", "a;Secure", "a", "UPPER", undefined, "x".repeat(33)])
      expect(referralCode(s)).toBeNull()
  })
  it("stores a deterministic hash instead of the dashboard key", async () => {
    const hash = await hashToken("private-key")
    expect(hash).toMatch(/^[a-f0-9]{64}$/)
    expect(hash).toBe(await hashToken("private-key"))
    expect(hash).not.toBe(await hashToken("other-key"))
  })
  it("verifies signed raw bodies and rejects tampering and stale deliveries", async () => {
    const body = '{"type":"payment.succeeded"}'
    expect(await verifyAffiliateWebhook(body, await signed(body), secret)).toBe(true)
    expect(await verifyAffiliateWebhook(body + " ", await signed(body), secret)).toBe(false)
    expect(
      await verifyAffiliateWebhook(body, await signed(body, Math.floor(Date.now() / 1000) - 301), secret),
    ).toBe(false)
    expect(await verifyAffiliateWebhook(body, new Headers(), secret)).toBe(false)
  })
})
describe("applications and private dashboards", () => {
  it("fails gracefully until D1 is bound", async () => {
    expect((await POST(request({}), context())).status).toBe(503)
  })
  it("rejects cross-site submissions", async () => {
    const req = request({})
    req.headers.set("origin", "https://other.example")
    expect((await POST(req, context(database()))).status).toBe(403)
  })
  it("requires complete details, https and explicit terms acceptance", async () => {
    expect(
      (
        await POST(
          request({ name: "Partner", email: "p@example.com", channel: "javascript:alert(1)", terms: true }),
          context(database()),
        )
      ).status,
    ).toBe(422)
    expect(
      (
        await POST(
          request({ name: "Partner", email: "p@example.com", channel: "https://example.com", terms: false }),
          context(database()),
        )
      ).status,
    ).toBe(422)
  })
  it("records accepted terms and uses conflict-safe insert for duplicate applications", async () => {
    vi.stubEnv("AFFILIATE_ADMIN_EMAILS", "owner@example.com")
    const db = database()
    expect(
      (
        await POST(
          request({
            name: "Partner",
            email: "P@example.com",
            channel: "https://example.com",
            promotionPlan: "I will publish React tutorials for my newsletter audience.",
            terms: true,
          }),
          context(db),
        )
      ).status,
    ).toBe(200)
    expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining("ON CONFLICT(email) DO NOTHING"))
    expect(db.statement.bind).toHaveBeenCalledWith(
      expect.any(String),
      "p@example.com",
      "Partner",
      "https://example.com",
      expect.stringMatching(/^partner-/),
      AFFILIATE.termsVersion,
      "I will publish React tutorials for my newsletter audience.",
      expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
    )
  })
  it("requires a private dashboard credential", async () => {
    expect(
      (await GET(new Request("https://ui.ballmac.com/api/affiliates"), context(database()))).status,
    ).toBe(401)
  })
})
describe("referral and checkout", () => {
  it("sets an HttpOnly 30-day first-party cookie only for active partners", async () => {
    const db = database({ id: "partner" })
    const res = await referral(
      new Request("https://ui.ballmac.com/api/affiliates/ref?ref=partner-12345678"),
      context(db),
    )
    expect(res.status).toBe(303)
    expect(res.headers.get("location")).toBe("https://ui.ballmac.com/pro")
    expect(res.headers.get("set-cookie")).toContain("HttpOnly; SameSite=Lax; Max-Age=2592000; Secure")
    const invalid = await referral(
      new Request("https://ui.ballmac.com/api/affiliates/ref?ref=evil%3Bcode"),
      context(db),
    )
    expect(invalid.headers.get("set-cookie")).toBeNull()
  })
  it("does not advertise a discount when payment settings are missing", async () => {
    vi.stubEnv("DODO_API_KEY", "")
    const res = await referralStatus(
      new Request("https://ui.ballmac.com/api/affiliates/status", {
        headers: { cookie: "bm_ref=partner-12345678" },
      }),
      context(database({ id: "partner" })),
    )
    expect(await res.json()).toEqual({ active: false })
  })
  it("creates a server-side session with one locked discount and trusted affiliate metadata", async () => {
    vi.stubEnv("DODO_API_KEY", "test-key")
    vi.stubEnv("DODO_AFFILIATE_PRODUCT_ID", "pro-standard")
    vi.stubEnv("NEXT_PUBLIC_PRO_FOUNDING_ENDS", "2026-01-01T00:00:00Z")
    const fetcher = vi
      .fn()
      .mockResolvedValue(Response.json({ checkout_url: "https://checkout.dodopayments.com/session" }))
    vi.stubGlobal("fetch", fetcher)
    const response = await checkout(
      new Request("https://ui.ballmac.com/api/affiliates/checkout", {
        headers: { cookie: "bm_ref=partner-12345678" },
      }),
      context(database({ id: "partner-id", discount_code: "PARTNER10" })),
    )
    expect(response.status).toBe(303)
    const payload = JSON.parse(fetcher.mock.calls[0][1].body)
    expect(payload.discount_code).toBe("PARTNER10")
    expect(payload.feature_flags.allow_discount_code).toBe(false)
    expect(payload.product_cart).toEqual([{ product_id: "pro-standard", quantity: 1 }])
    expect(payload.metadata).toEqual({ affiliate_id: "partner-id" })
  })
})
describe("checkout failure states", () => {
  it("sends expired referrals back to a readable Pro page state", async () => {
    vi.stubEnv("DODO_API_KEY", "test")
    vi.stubEnv("DODO_AFFILIATE_PRODUCT_ID", "pro-standard")
    const response = await checkout(
      new Request("https://ui.ballmac.com/api/affiliates/checkout"),
      context(database()),
    )
    expect(response.headers.get("location")).toBe("https://ui.ballmac.com/pro?referral_error=expired")
  })
  it("refuses the founding product even when it is accidentally configured", async () => {
    vi.stubEnv("DODO_API_KEY", "test")
    vi.stubEnv("DODO_AFFILIATE_PRODUCT_ID", "founding")
    vi.stubEnv("DODO_FOUNDING_PRODUCT_ID", "founding")
    const response = await checkout(
      new Request("https://ui.ballmac.com/api/affiliates/checkout"),
      context(database()),
    )
    expect(response.headers.get("location")).toBe("https://ui.ballmac.com/pro?referral_error=unavailable")
  })
  it("refuses test-mode checkout on production", async () => {
    vi.stubEnv("DODO_API_KEY", "test")
    vi.stubEnv("DODO_AFFILIATE_PRODUCT_ID", "pro-standard")
    vi.stubEnv("DEPLOY_ENV", "production")
    vi.stubEnv("DODO_MODE", "test")
    const response = await checkout(
      new Request("https://ui.ballmac.com/api/affiliates/checkout"),
      context(database()),
    )
    expect(response.headers.get("location")).toBe("https://ui.ballmac.com/pro?referral_error=unavailable")
  })
})
describe("payment reconciliation", () => {
  it("rejects unsigned deliveries without touching D1", async () => {
    vi.stubEnv("DODO_API_KEY", "test")
    vi.stubEnv("DODO_AFFILIATE_WEBHOOK_SECRET", secret)
    const db = database()
    const response = await webhook(
      new Request("https://ui.ballmac.com/api/affiliates/webhook", { method: "POST", body: "{}" }),
      context(db),
    )
    expect(response.status).toBe(401)
    expect(db.prepare).not.toHaveBeenCalled()
  })
  it("rejects malformed signed events without writing to the ledger", async () => {
    vi.stubEnv("DODO_API_KEY", "test")
    vi.stubEnv("DODO_AFFILIATE_WEBHOOK_SECRET", secret)
    const db = database()
    for (const body of ["{", "null", JSON.stringify({ type: "payment.succeeded", data: null })]) {
      const response = await webhook(
        new Request("https://ui.ballmac.com/api/affiliates/webhook", {
          method: "POST",
          body,
          headers: await signed(body),
        }),
        context(db),
      )
      expect(response.status).toBe(400)
    }
    expect(db.batch).not.toHaveBeenCalled()
  })
  it.each(["USD", "INR"])(
    "records tax-exclusive %s commission and event id in one batch",
    async (currency) => {
      vi.stubEnv("DODO_API_KEY", "test")
      vi.stubEnv("DODO_AFFILIATE_WEBHOOK_SECRET", secret)
      vi.stubEnv("DODO_AFFILIATE_PRODUCT_ID", "pro-standard")
      const db = database()
      db.statement.first
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: "partner", email: "partner@example.com" })
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(
          Response.json({
            payment_id: "pay_1",
            status: "succeeded",
            currency,
            total_amount: currency === "USD" ? 9910 : 1032944,
            tax: currency === "USD" ? 1000 : 151507,
            settlement_currency: "USD",
            settlement_amount: 10514,
            settlement_tax: 1604,
            metadata: { affiliate_id: "partner" },
            customer: { email: "buyer@example.com" },
            product_cart: [{ product_id: "pro-standard", quantity: 1 }],
            created_at: "2026-10-21T00:00:00Z",
            refunds: [],
            disputes: [],
          }),
        ),
      )
      const body = JSON.stringify({ type: "payment.succeeded", data: { payment_id: "pay_1" } })
      const response = await webhook(
        new Request("https://ui.ballmac.com/api/affiliates/webhook", {
          method: "POST",
          body,
          headers: await signed(body),
        }),
        context(db),
      )
      expect(response.status).toBe(200)
      expect(db.statement.bind).toHaveBeenCalledWith(
        "pay_1",
        "partner",
        8910,
        2673,
        "earned",
        "2026-10-21T00:00:00Z",
        expect.any(String),
      )
      expect(db.batch).toHaveBeenCalledOnce()
    },
  )
})

describe("USD commission base for adaptive-currency payments", () => {
  it("uses USD settlement amounts and USD settlement tax for INR payments", () => {
    const net = paymentNetUsdCents({
      currency: "INR",
      total_amount: 1032944,
      tax: 151507,
      settlement_currency: "USD",
      settlement_amount: 10514,
      settlement_tax: 1604,
    })
    expect(net).toBe(8910)
    expect(commissionCents(net!)).toBe(2673)
  })
  it("accepts untaxed local-currency payments without inventing converted tax", () => {
    expect(
      paymentNetUsdCents({
        currency: "INR",
        tax: null,
        settlement_currency: "USD",
        settlement_amount: 8910,
        settlement_tax: null,
      }),
    ).toBe(8910)
  })
  it("keeps native USD payments in their charged amounts", () => {
    expect(
      paymentNetUsdCents({
        currency: "USD",
        total_amount: 10514,
        tax: 1604,
        settlement_currency: "EUR",
        settlement_amount: 9000,
      }),
    ).toBe(8910)
  })
  it("refuses guessed conversion, missing converted tax and invalid amounts", () => {
    for (const payment of [
      { currency: "INR", total_amount: 1032944, tax: 151507 },
      { currency: "INR", tax: 151507, settlement_currency: "USD", settlement_amount: 10514 },
      { currency: "USD", total_amount: 100, tax: 101 },
      { currency: "USD", total_amount: 100, tax: -1 },
      { currency: "USD", total_amount: "10514", tax: 1604 },
    ])
      expect(paymentNetUsdCents(payment)).toBeNull()
  })
})
