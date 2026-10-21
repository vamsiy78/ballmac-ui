vi.mock("@/lib/affiliate-email", () => import("../lib/affiliate-email"))
import { createRequire } from "node:module"
import { readFileSync } from "node:fs"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { hashToken } from "../lib/affiliates"
import { payoutCents } from "../lib/affiliate-admin"
vi.mock("@/lib/affiliates", () => import("../lib/affiliates"))
vi.mock("@/lib/affiliate-admin", () => import("../lib/affiliate-admin"))
vi.mock("@/lib/pro-session-core", () => import("../lib/pro-session-core"))
vi.mock("@/lib/payments", () => import("../lib/payments"))
vi.mock("@/lib/rate-limit", () => ({ createRateLimiter: () => () => false, clientId: () => "test" }))
vi.mock("@/lib/resend", () => ({ resend: vi.fn().mockResolvedValue({ id: "email-test" }) }))
import { resend } from "@/lib/resend"
import { POST as signIn, DELETE as signOut } from "../worker/routes/affiliate-admin-session"
import { GET, POST } from "../worker/routes/affiliate-admin"
import { webhook } from "../worker/routes/affiliates"
// Node 22 (also used by CI) provides real SQLite. The small adapter exercises the actual D1 SQL, not a query mock.
type Row = Record<string, unknown>
type SQLite = {
  exec: (sql: string) => void
  close: () => void
  prepare: (sql: string) => {
    get: (...args: unknown[]) => Row | undefined
    all: (...args: unknown[]) => Row[]
    run: (...args: unknown[]) => unknown
  }
}
const { DatabaseSync } = createRequire(import.meta.url)("node:sqlite") as {
  DatabaseSync: new (file: string) => SQLite
}
let sql: SQLite
function setup() {
  sql = new DatabaseSync(":memory:")
  for (const file of [
    "0001_affiliates.sql",
    "0002_affiliate_sessions.sql",
    "0003_affiliate_admin.sql",
    "0004_affiliate_notifications.sql",
  ])
    sql.exec(readFileSync(new URL(`../worker/migrations/${file}`, import.meta.url), "utf8"))
  sql
    .prepare(
      "INSERT INTO affiliates (id,email,name,channel,code,status,terms_version) VALUES ('partner','partner@example.com','Partner','https://example.com','partner-test','active','2026-10-21')",
    )
    .run()
  const adapter = {
    prepare(query: string) {
      const statement = sql.prepare(query)
      return {
        args: [] as unknown[],
        bind(...args: unknown[]) {
          this.args = args
          return this
        },
        async first() {
          return statement.get(...this.args) ?? null
        },
        async all() {
          return { results: statement.all(...this.args) }
        },
        async run() {
          return statement.run(...this.args)
        },
      }
    },
    async batch(statements: { all: () => Promise<{ results: Row[] }> }[]) {
      sql.exec("BEGIN")
      try {
        const results = []
        for (const statement of statements) results.push(await statement.all())
        sql.exec("COMMIT")
        return results
      } catch (error) {
        sql.exec("ROLLBACK")
        throw error
      }
    },
  }
  return { env: { AFFILIATES: adapter } } as unknown as Parameters<typeof POST>[1]
}

const request = (body: unknown, cookie = "") =>
  new Request("https://ui.ballmac.com/api/affiliates/admin", {
    method: "POST",
    headers: { host: "ui.ballmac.com", origin: "https://ui.ballmac.com", cookie },
    body: JSON.stringify(body),
  })
const read = (cookie = "", query = "") =>
  new Request(`https://ui.ballmac.com/api/affiliates/admin?${query}`, { headers: { cookie } })
async function owner() {
  const ctx = setup(),
    token = "a".repeat(64)
  sql
    .prepare("INSERT INTO affiliate_owner_sessions VALUES (?,?,?)")
    .run(await hashToken(token), "owner@example.com", Date.now() + 3600000)
  return { ctx, cookie: `bm_partner_admin=${token}` }
}
const discount = {
  code: "PARTNER10",
  type: "percentage",
  amount: 1000,
  restricted_to: ["pro-standard"],
  per_customer_usage_limit: 1,
}
beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv("AFFILIATE_ADMIN_EMAILS", "owner@example.com")
  vi.stubEnv("RESEND_API_KEY", "test")
  vi.stubEnv("RESEND_FROM", "test@example.com")
  vi.stubEnv("DODO_API_KEY", "test")
  vi.stubEnv("DODO_AFFILIATE_PRODUCT_ID", "pro-standard")
  vi.stubEnv("DODO_MODE", "test")
  vi.stubEnv("DEPLOY_ENV", "preview")
})
afterEach(() => {
  try {
    sql?.close()
  } catch {
    /* A pure helper test may not open a database. */
  }
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe("owner authentication", () => {
  it("does not expose management data to partners or unauthenticated users", async () => {
    const ctx = setup()
    expect((await GET(read(), ctx)).status).toBe(401)
    expect((await GET(read(`bm_partner=${"a".repeat(64)}`), ctx)).status).toBe(401)
    expect(
      (await POST(request({ action: "pause", id: "partner", revision: 0, note: "reason" }), ctx)).status,
    ).toBe(401)
  })
  it("uses an allowlisted email, a one-time code and a separate eight-hour secure session", async () => {
    const ctx = setup()
    const outsider = await signIn(request({ action: "request", email: "partner@example.com" }), ctx)
    expect(outsider.status).toBe(200)
    expect(resend).not.toHaveBeenCalled()
    const allowed = await signIn(request({ action: "request", email: "owner@example.com" }), ctx)
    expect(await outsider.json()).toEqual(await allowed.json())
    const code = (vi.mocked(resend).mock.calls[0][1]?.body as { text: string }).text.match(
      /code is (\d{6})/,
    )![1]
    const response = await signIn(request({ action: "verify", email: "owner@example.com", code }), ctx)
    expect(response.status).toBe(200)
    expect(response.headers.get("set-cookie")).toMatch(
      /bm_partner_admin=[a-f0-9]{64}; Path=\/; HttpOnly; SameSite=Strict; Max-Age=28800; Secure/,
    )
    expect((await signIn(request({ action: "verify", email: "owner@example.com", code }), ctx)).status).toBe(
      401,
    )
    const cookie = response.headers.get("set-cookie")!.split(";")[0]
    expect((await GET(read(cookie), ctx)).status).toBe(200)
    await signOut(
      new Request("https://ui.ballmac.com/api/affiliates/admin/session", {
        method: "DELETE",
        headers: { host: "ui.ballmac.com", origin: "https://ui.ballmac.com", cookie },
      }),
      ctx,
    )
    expect((await GET(read(cookie), ctx)).status).toBe(401)
  })
  it("bounds code guesses, rejects cross-site changes and revokes removed owners", async () => {
    const { ctx, cookie } = await owner()
    const bad = request({ action: "pause", id: "partner", revision: 0, note: "reason" }, cookie)
    bad.headers.set("origin", "https://other.example")
    expect((await POST(bad, ctx)).status).toBe(403)
    await signIn(request({ action: "request", email: "owner@example.com" }), ctx)
    for (let i = 0; i < 5; i++)
      await signIn(request({ action: "verify", email: "owner@example.com", code: "invalid" }), ctx)
    // Syntactically invalid codes do not count as valid guesses; exercise five valid wrong guesses.
    sql.exec("UPDATE affiliate_owner_challenges SET code_hash='not-a-valid-code'")
    for (let i = 0; i < 5; i++)
      expect(
        (await signIn(request({ action: "verify", email: "owner@example.com", code: "111111" }), ctx)).status,
      ).toBe(401)
    expect(sql.prepare("SELECT attempts FROM affiliate_owner_challenges").get()?.attempts).toBe(5)
    vi.stubEnv("AFFILIATE_ADMIN_EMAILS", "different@example.com")
    expect((await GET(read(cookie), ctx)).status).toBe(401)
  })
})
describe("application management and audit", () => {
  it("approves an application, checks its discount, invalidates old sessions and writes one audit record", async () => {
    const { ctx, cookie } = await owner()
    sql.exec("UPDATE affiliates SET status='pending'")
    sql.prepare("INSERT INTO affiliate_sessions VALUES (?,?,?)").run("hash", "partner", Date.now() + 3600000)
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(discount)))
    const response = await POST(
      request(
        { action: "approve", id: "partner", revision: 0, discount: "PARTNER10", notify: false },
        cookie,
      ),
      ctx,
    )
    expect(response.status).toBe(200)
    expect(sql.prepare("SELECT status,revision FROM affiliates").get()).toMatchObject({
      status: "active",
      revision: 1,
    })
    expect(sql.prepare("SELECT COUNT(*) AS total FROM affiliate_sessions").get()?.total).toBe(0)
    expect(sql.prepare("SELECT COUNT(*) AS total FROM affiliate_audit").get()?.total).toBe(1)
    expect(
      (await POST(request({ action: "pause", id: "partner", revision: 0, note: "stale" }, cookie), ctx))
        .status,
    ).toBe(409)
    expect(sql.prepare("SELECT COUNT(*) AS total FROM affiliate_audit").get()?.total).toBe(1)
  })
  it("generates a restricted discount when none exists", async () => {
    const { ctx, cookie } = await owner()
    sql.exec("UPDATE affiliates SET status='pending'")
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(new Response("{}", { status: 404 }))
      .mockResolvedValueOnce(Response.json(discount))
    vi.stubGlobal("fetch", fetcher)
    expect((await POST(request({ action: "approve", id: "partner", revision: 0 }, cookie), ctx)).status).toBe(
      200,
    )
    const payload = JSON.parse(fetcher.mock.calls[1][1].body)
    expect(payload.code).toMatch(/^BM[A-F0-9]{12}10$/)
    expect(payload.code.length).toBeLessThanOrEqual(16)
    expect(payload).toMatchObject({
      type: "percentage",
      amount: 1000,
      restricted_to: ["pro-standard"],
      per_customer_usage_limit: 1,
    })
  })
  it("preserves discount creation errors rather than masking them with a missing-code lookup", async () => {
    const { ctx, cookie } = await owner()
    sql.exec("UPDATE affiliates SET status='pending'")
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(new Response("{}", { status: 404 }))
      .mockResolvedValueOnce(new Response("{}", { status: 422 }))
    vi.stubGlobal("fetch", fetcher)
    const response = await POST(request({ action: "approve", id: "partner", revision: 0 }, cookie), ctx)
    expect(response.status).toBe(502)
    expect((await response.json()).error).toContain("Dodo could not complete")
    expect(fetcher).toHaveBeenCalledTimes(2)
    expect(sql.prepare("SELECT status FROM affiliates WHERE id='partner'").get()?.status).toBe("pending")
  })
  it("explains missing Dodo discount permissions without exposing provider details", async () => {
    const { ctx, cookie } = await owner()
    sql.exec("UPDATE affiliates SET status='pending'")
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(new Response("{}", { status: 404 }))
      .mockResolvedValueOnce(
        Response.json(
          { code: "INSUFFICIENT_PERMISSION", message: "private provider details" },
          { status: 403 },
        ),
      )
    vi.stubGlobal("fetch", fetcher)
    const response = await POST(request({ action: "approve", id: "partner", revision: 0 }, cookie), ctx)
    expect(response.status).toBe(502)
    const result = await response.json()
    expect(result.error).toContain("discounts:write")
    expect(result.error).not.toContain("private provider details")
    expect(fetcher).toHaveBeenCalledTimes(2)
    expect(sql.prepare("SELECT status FROM affiliates WHERE id='partner'").get()?.status).toBe("pending")
  })
  it.each([409, 422])(
    "recovers a concurrent discount creation after a provider %s duplicate conflict",
    async (status) => {
      const { ctx, cookie } = await owner()
      sql.exec("UPDATE affiliates SET status='pending'")
      const fetcher = vi
        .fn()
        .mockResolvedValueOnce(new Response("{}", { status: 404 }))
        .mockResolvedValueOnce(Response.json({ code: "DISCOUNT_CODE_ALREADY_EXISTS" }, { status }))
        .mockResolvedValueOnce(Response.json(discount))
      vi.stubGlobal("fetch", fetcher)
      expect(
        (await POST(request({ action: "approve", id: "partner", revision: 0 }, cookie), ctx)).status,
      ).toBe(200)
      expect(fetcher).toHaveBeenCalledTimes(3)
      expect(fetcher.mock.calls[2][0]).toBe(fetcher.mock.calls[0][0])
    },
  )
  it("refuses incorrect discounts and preserves pending status", async () => {
    const { ctx, cookie } = await owner()
    sql.exec("UPDATE affiliates SET status='pending'")
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ ...discount, amount: 2000 })))
    expect(
      (await POST(request({ action: "approve", id: "partner", revision: 0, discount: "WRONG" }, cookie), ctx))
        .status,
    ).toBe(422)
    expect(sql.prepare("SELECT status FROM affiliates").get()?.status).toBe("pending")
  })
  it("declines and reopens without destroying the application or its history", async () => {
    const { ctx, cookie } = await owner()
    sql.exec("UPDATE affiliates SET status='pending'")
    expect(
      (
        await POST(
          request({ action: "reject", id: "partner", revision: 0, note: "Audience does not fit" }, cookie),
          ctx,
        )
      ).status,
    ).toBe(200)
    const listing = await (await GET(read(cookie, "view=applications&status=rejected"), ctx)).json()
    expect(listing.partners[0].status).toBe("rejected")
    expect((await POST(request({ action: "reopen", id: "partner", revision: 1 }, cookie), ctx)).status).toBe(
      200,
    )
    expect(sql.prepare("SELECT review_state,revision FROM affiliates").get()).toMatchObject({
      review_state: null,
      revision: 2,
    })
  })
  it("reports an email failure after approval without rolling back a successful decision", async () => {
    const { ctx, cookie } = await owner()
    sql.exec("UPDATE affiliates SET status='pending'")
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(discount)))
    vi.mocked(resend).mockRejectedValueOnce(new Error("offline"))
    const response = await POST(
      request({ action: "approve", id: "partner", revision: 0, discount: "PARTNER10", notify: true }, cookie),
      ctx,
    )
    expect(response.status).toBe(200)
    expect((await response.json()).warning).toContain("email could not be sent")
    expect(sql.prepare("SELECT status FROM affiliates").get()?.status).toBe("active")
  })
})
describe("payout recording", () => {
  it("parses exact USD cents and refuses malformed amounts", () => {
    expect(payoutCents("53.46")).toBe(5346)
    expect(payoutCents("50")).toBe(5000)
    for (const value of ["1e3", "50.001", "-50", 5000, "NaN", "50abc"]) expect(payoutCents(value)).toBeNull()
  })
  it("records only confirmed eligible transfers, prevents duplicate references and prevents overpayment", async () => {
    const { ctx, cookie } = await owner()
    sql.exec(
      "INSERT INTO affiliate_sales VALUES ('pay','partner',30000,9000,'earned',datetime('now','start of month','-1 day'),datetime('now'))",
    )
    const body = {
      action: "payout",
      id: "partner",
      amount: "50.00",
      reference: "transfer-1",
      method: "wise",
      confirmed: true,
    }
    expect((await POST(request({ ...body, confirmed: false }, cookie), ctx)).status).toBe(422)
    expect((await POST(request({ ...body, amount: "100.00" }, cookie), ctx)).status).toBe(409)
    expect((await POST(request(body, cookie), ctx)).status).toBe(200)
    expect(sql.prepare("SELECT amount_cents,method FROM affiliate_payouts").get()).toMatchObject({
      amount_cents: 5000,
      method: "wise",
    })
    // Replenish eligible earnings to prove uniqueness is enforced independently of the balance check.
    sql.exec("UPDATE affiliate_sales SET commission_cents=20000")
    expect((await POST(request(body, cookie), ctx)).status).toBe(409)
    expect(sql.prepare("SELECT COUNT(*) AS total FROM affiliate_payouts").get()?.total).toBe(1)
    expect(
      sql.prepare("SELECT COUNT(*) AS total FROM affiliate_audit WHERE action='payout'").get()?.total,
    ).toBe(1)
  })
  it("does not offset another partner's eligible earnings with someone else's debt", async () => {
    const { ctx, cookie } = await owner()
    sql.exec(`INSERT INTO affiliates (id,email,name,channel,code,status,terms_version) VALUES ('other','other@example.com','Other','https://example.com','other-test','active','2026-10-21');
      INSERT INTO affiliate_sales VALUES ('pay','partner',20000,6000,'earned',datetime('now','start of month','-1 day'),datetime('now'));
      INSERT INTO affiliate_payouts (id,affiliate_id,amount_cents,reference) VALUES ('old','other',5000,'old-transfer');`)
    const body = await (await GET(read(cookie), ctx)).json()
    expect(body.summary.eligible).toBe(6000)
  })
})
describe("commission reconciliation", () => {
  it.each(["USD", "INR"])(
    "restores only provider-confirmed %s payments with resolved disputes and logs the review",
    async (currency) => {
      const { ctx, cookie } = await owner()
      sql.exec(
        "INSERT INTO affiliate_sales VALUES ('pay','partner',8910,2673,'reversed',datetime('now','start of month','-1 day'),'before')",
      )
      vi.stubGlobal(
        "fetch",
        vi.fn().mockImplementation(async () =>
          Response.json({
            currency,
            total_amount: currency === "USD" ? 9910 : 1032944,
            tax: currency === "USD" ? 1000 : 151507,
            settlement_currency: "USD",
            settlement_amount: 10514,
            settlement_tax: 1604,
            status: "succeeded",
            metadata: { affiliate_id: "partner" },
            customer: { email: "buyer@example.com" },
            product_cart: [{ product_id: "pro-standard", quantity: 1 }],
            refunds: [],
            disputes: [{ dispute_status: "dispute_won" }],
          }),
        ),
      )
      expect(
        (await POST(request({ action: "reconcile", id: "pay", note: "Dispute won" }, cookie), ctx)).status,
      ).toBe(200)
      expect(sql.prepare("SELECT state,commission_cents FROM affiliate_sales").get()).toMatchObject({
        state: "earned",
        commission_cents: 2673,
      })
      expect(sql.prepare("SELECT action FROM affiliate_audit").get()?.action).toBe("reconcile")
    },
  )
})

describe("owner record views", () => {
  it("serves each protected view, parameterizes searches and clamps pages after records change", async () => {
    const { ctx, cookie } = await owner()
    for (const view of ["overview", "applications", "partners", "sales", "payouts", "audit", "settings"]) {
      const response = await GET(read(cookie, `view=${view}&page=999`), ctx)
      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.view).toBe(view)
      expect(body.page).toBe(0)
    }
    const response = await GET(read(cookie, "view=partners&q=%27%20OR%201%3D1--"), ctx)
    expect((await response.json()).total).toBe(0)
  })
  it("requires a reason to pause and revokes partner sessions without granting owner access", async () => {
    const { ctx, cookie } = await owner()
    expect((await POST(request({ action: "pause", id: "partner", revision: 0 }, cookie), ctx)).status).toBe(
      422,
    )
    expect(
      (
        await POST(
          request({ action: "pause", id: "partner", revision: 0, note: "Review brand bidding" }, cookie),
          ctx,
        )
      ).status,
    ).toBe(200)
    sql
      .prepare("INSERT INTO affiliate_sessions VALUES (?,?,?)")
      .run("partner-token", "partner", Date.now() + 3600000)
    expect(
      (
        await POST(
          request({ action: "revoke", id: "partner", revision: 1, note: "Requested by partner" }, cookie),
          ctx,
        )
      ).status,
    ).toBe(200)
    expect(sql.prepare("SELECT COUNT(*) AS total FROM affiliate_sessions").get()?.total).toBe(0)
    expect(sql.prepare("SELECT status FROM affiliates").get()?.status).toBe("paused")
    expect(sql.prepare("SELECT COUNT(*) AS total FROM affiliate_audit").get()?.total).toBe(2)
  })
})

describe("late dispute delivery after owner reconciliation", () => {
  it("preserves a reviewed restoration while keeping automatic reversal holds sticky", async () => {
    const { ctx, cookie } = await owner()
    sql.exec(
      "INSERT INTO affiliate_sales VALUES ('pay-late','partner',8910,2673,'reversed',datetime('now'),'before')",
    )
    const payment = {
      payment_id: "pay-late",
      currency: "USD",
      total_amount: 8910,
      tax: 0,
      status: "succeeded",
      metadata: { affiliate_id: "partner" },
      customer: { email: "buyer@example.com" },
      product_cart: [{ product_id: "pro-standard", quantity: 1 }],
      created_at: new Date().toISOString(),
      refunds: [],
      disputes: [{ dispute_status: "dispute_won" }],
    }
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json(payment)),
    )
    const body = JSON.stringify({ type: "dispute.won", data: { payment_id: "pay-late" } })
    const secret = "owner-late-event-secret",
      timestamp = String(Math.floor(Date.now() / 1000))
    vi.stubEnv("DODO_AFFILIATE_WEBHOOK_SECRET", `whsec_${btoa(secret)}`)
    async function deliver(id: string) {
      const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
      )
      const signature = btoa(
        String.fromCharCode(
          ...new Uint8Array(
            await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${id}.${timestamp}.${body}`)),
          ),
        ),
      )
      return webhook(
        new Request("https://ui.ballmac.com/api/affiliates/webhook", {
          method: "POST",
          body,
          headers: {
            "webhook-id": id,
            "webhook-timestamp": timestamp,
            "webhook-signature": `v1,${signature}`,
          },
        }),
        ctx,
      )
    }
    expect((await deliver("before-review")).status).toBe(200)
    expect(sql.prepare("SELECT state FROM affiliate_sales WHERE payment_id='pay-late'").get()?.state).toBe(
      "reversed",
    )
    expect(
      (await POST(request({ action: "reconcile", id: "pay-late", note: "Dispute resolved" }, cookie), ctx))
        .status,
    ).toBe(200)
    expect((await deliver("late-after-review")).status).toBe(200)
    expect(sql.prepare("SELECT state FROM affiliate_sales WHERE payment_id='pay-late'").get()?.state).toBe(
      "earned",
    )
  })
})
