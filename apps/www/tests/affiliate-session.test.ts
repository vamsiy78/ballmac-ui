vi.mock("@/lib/affiliate-email", () => import("../lib/affiliate-email"))
import { createRequire } from "node:module"
import { readFileSync } from "node:fs"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { hashToken } from "../lib/affiliates"

vi.mock("@/lib/affiliates", () => import("../lib/affiliates"))
vi.mock("@/lib/pro-session-core", () => import("../lib/pro-session-core"))
vi.mock("@/lib/rate-limit", () => ({ createRateLimiter: () => () => false, clientId: () => "test" }))
vi.mock("@/lib/payments", () => import("../lib/payments"))
vi.mock("@/lib/resend", () => ({ resend: vi.fn().mockResolvedValue({ id: "email-test" }) }))
import { resend } from "@/lib/resend"
import { POST, DELETE } from "../worker/routes/affiliate-session"
import { GET } from "../worker/routes/affiliates"

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
  for (const file of ["0001_affiliates.sql", "0002_affiliate_sessions.sql"])
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
    async batch(statements: { run: () => Promise<unknown> }[]) {
      sql.exec("BEGIN")
      try {
        for (const statement of statements) await statement.run()
        sql.exec("COMMIT")
      } catch (error) {
        sql.exec("ROLLBACK")
        throw error
      }
    },
  }
  return { env: { AFFILIATES: adapter } } as unknown as Parameters<typeof POST>[1]
}
const req = (body: unknown) =>
  new Request("https://ui.ballmac.com/api/affiliates/session", {
    method: "POST",
    headers: { host: "ui.ballmac.com", origin: "https://ui.ballmac.com" },
    body: JSON.stringify(body),
  })
const emailedCode = () =>
  (vi.mocked(resend).mock.calls[0][1]?.body as { text: string }).text.match(/code is (\d{6})/)![1]
beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv("RESEND_API_KEY", "test-only")
  vi.stubEnv("RESEND_FROM", "Ballmac <test@example.com>")
})
afterEach(() => {
  sql?.close()
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe("partner email sign-in with real SQLite", () => {
  it("emails a one-time code, stores only its hash, creates a secure session and consumes the code", async () => {
    const ctx = setup()
    expect((await POST(req({ action: "request", email: "PARTNER@example.com" }), ctx)).status).toBe(200)
    const code = emailedCode()
    expect(sql.prepare("SELECT code_hash FROM affiliate_challenges").get()?.code_hash).toBe(
      await hashToken(`partner@example.com:${code}`),
    )
    const response = await POST(req({ action: "verify", email: "partner@example.com", code }), ctx)
    expect(response.status).toBe(200)
    expect(response.headers.get("set-cookie")).toMatch(
      /bm_partner=[a-f0-9]{64}; Path=\/; HttpOnly; SameSite=Lax; Max-Age=2592000; Secure/,
    )
    expect(sql.prepare("SELECT COUNT(*) AS count FROM affiliate_challenges").get()?.count).toBe(0)
    const session = response.headers.get("set-cookie")!.split(";")[0]
    const dashboard = await GET(
      new Request("https://ui.ballmac.com/api/affiliates", { headers: { cookie: session } }),
      ctx,
    )
    expect(dashboard.status).toBe(200)
    expect((await dashboard.json()).affiliate.name).toBe("Partner")
    expect((await POST(req({ action: "verify", email: "partner@example.com", code }), ctx)).status).toBe(401)
  })
  it("does not reveal whether an email is approved and throttles repeat emails durably", async () => {
    const ctx = setup()
    const unknown = await POST(req({ action: "request", email: "unknown@example.com" }), ctx)
    const approved = await POST(req({ action: "request", email: "partner@example.com" }), ctx)
    expect(await unknown.json()).toEqual(await approved.json())
    await POST(req({ action: "request", email: "partner@example.com" }), ctx)
    expect(resend).toHaveBeenCalledTimes(1)
  })
  it("locks a challenge after five failed attempts, even if the next code is correct", async () => {
    const ctx = setup()
    await POST(req({ action: "request", email: "partner@example.com" }), ctx)
    const code = emailedCode(),
      wrong = code === "000000" ? "111111" : "000000"
    for (let i = 0; i < 5; i++)
      expect(
        (await POST(req({ action: "verify", email: "partner@example.com", code: wrong }), ctx)).status,
      ).toBe(401)
    expect((await POST(req({ action: "verify", email: "partner@example.com", code }), ctx)).status).toBe(401)
    expect(sql.prepare("SELECT COUNT(*) AS count FROM affiliate_sessions").get()?.count).toBe(0)
  })
  it("rejects expired codes and cross-site mutations", async () => {
    const ctx = setup()
    await POST(req({ action: "request", email: "partner@example.com" }), ctx)
    sql.exec("UPDATE affiliate_challenges SET expires_at=0")
    expect(
      (await POST(req({ action: "verify", email: "partner@example.com", code: emailedCode() }), ctx)).status,
    ).toBe(401)
    const crossSite = req({ action: "request", email: "partner@example.com" })
    crossSite.headers.set("origin", "https://other.example")
    expect((await POST(crossSite, ctx)).status).toBe(403)
  })
  it("supports the existing access key, revokes sessions on sign-out, and rejects expired sessions", async () => {
    const ctx = setup(),
      key = "a".repeat(64)
    sql.prepare("UPDATE affiliates SET token_hash=?").run(await hashToken(key))
    const response = await POST(req({ action: "key", key }), ctx)
    const session = response.headers.get("set-cookie")!.split(";")[0]
    sql.exec("UPDATE affiliate_sessions SET expires_at=0")
    expect(
      (await GET(new Request("https://ui.ballmac.com/api/affiliates", { headers: { cookie: session } }), ctx))
        .status,
    ).toBe(401)
    const second = await POST(req({ action: "key", key }), ctx),
      secondCookie = second.headers.get("set-cookie")!.split(";")[0]
    const logout = await DELETE(
      new Request("https://ui.ballmac.com/api/affiliates/session", {
        method: "DELETE",
        headers: { host: "ui.ballmac.com", origin: "https://ui.ballmac.com", cookie: secondCookie },
      }),
      ctx,
    )
    expect(logout.headers.get("set-cookie")).toContain("Max-Age=0")
    expect(
      (
        await GET(
          new Request("https://ui.ballmac.com/api/affiliates", { headers: { cookie: secondCookie } }),
          ctx,
        )
      ).status,
    ).toBe(401)
  })
  it("does not create a session when email delivery fails", async () => {
    const ctx = setup()
    vi.mocked(resend).mockRejectedValueOnce(new Error("Provider unavailable"))
    expect((await POST(req({ action: "request", email: "partner@example.com" }), ctx)).status).toBe(502)
    expect(sql.prepare("SELECT COUNT(*) AS count FROM affiliate_sessions").get()?.count).toBe(0)
  })
})

describe("payout eligibility", () => {
  it("separates current-month earnings, earlier eligible earnings, paid transfers and reversals", async () => {
    const ctx = setup(),
      key = "b".repeat(64)
    sql.prepare("UPDATE affiliates SET token_hash=?").run(await hashToken(key))
    sql.exec(`INSERT INTO affiliate_sales VALUES
      ('prior','partner',16667,5000,'earned',datetime('now','start of month','-1 day'),datetime('now')),
      ('pending','partner',8910,2673,'earned',datetime('now'),datetime('now')),
      ('reversed','partner',10000,3000,'reversed',datetime('now','start of month','-1 day'),datetime('now'));
      INSERT INTO affiliate_payouts (id,affiliate_id,amount_cents,reference) VALUES ('payout','partner',1000,'transfer-1');`)
    const response = await GET(
      new Request("https://ui.ballmac.com/api/affiliates", { headers: { authorization: `Bearer ${key}` } }),
      ctx,
    )
    expect((await response.json()).totals).toEqual({
      conversions: 2,
      earned: 7673,
      paid: 1000,
      balance: 6673,
      eligible: 4000,
      pending: 2673,
    })
  })
  it("offsets earlier overpayments against pending earnings without inventing available funds", async () => {
    const ctx = setup(),
      key = "c".repeat(64)
    sql.prepare("UPDATE affiliates SET token_hash=?").run(await hashToken(key))
    sql.exec(`INSERT INTO affiliate_sales VALUES ('pending','partner',8910,2673,'earned',datetime('now'),datetime('now'));
      INSERT INTO affiliate_payouts (id,affiliate_id,amount_cents,reference) VALUES ('payout','partner',5000,'transfer-2');`)
    const body = await (
      await GET(
        new Request("https://ui.ballmac.com/api/affiliates", { headers: { authorization: `Bearer ${key}` } }),
        ctx,
      )
    ).json()
    expect(body.totals).toMatchObject({ eligible: 0, pending: 0, balance: -2327 })
  })
})
