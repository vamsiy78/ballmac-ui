import type { D1Database } from "@cloudflare/workers-types"
import { createRequire } from "node:module"
import { readFileSync } from "node:fs"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
vi.mock("@/lib/affiliate-email", () => import("../lib/affiliate-email"))
vi.mock("@/lib/affiliates", () => import("../lib/affiliates"))
vi.mock("@/lib/pro-session-core", () => import("../lib/pro-session-core"))
vi.mock("@/lib/payments", () => import("../lib/payments"))
vi.mock("@/lib/rate-limit", () => ({ createRateLimiter: () => () => false, clientId: () => "test" }))
vi.mock("@/lib/resend", () => ({
  resend: vi.fn().mockResolvedValue({ id: "sent" }),
  ResendError: class extends Error {},
}))
import { resend } from "@/lib/resend"
import { POST } from "../worker/routes/affiliates"
import { deliverAffiliateNotifications } from "../worker/affiliate-notifications"
import { affiliateOwners, partnerEmail, signInEmail } from "../lib/affiliate-email"
const { DatabaseSync } = createRequire(import.meta.url)("node:sqlite")
let sql: ReturnType<typeof makeDb>
function makeDb() {
  return new DatabaseSync(":memory:")
}
let db: D1Database
beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(resend).mockResolvedValue({ id: "sent" })
  vi.stubEnv("AFFILIATE_ADMIN_EMAILS", "owner@example.com")
  vi.stubEnv("RESEND_API_KEY", "test")
  vi.stubEnv("RESEND_FROM", "Ballmac <test@example.com>")
  vi.stubEnv("DEPLOY_ENV", "preview")
  sql = makeDb()
  for (const migration of [
    "0001_affiliates.sql",
    "0002_affiliate_sessions.sql",
    "0003_affiliate_admin.sql",
    "0004_affiliate_notifications.sql",
    "0005_affiliate_applications.sql",
  ])
    sql.exec(readFileSync(new URL(`../worker/migrations/${migration}`, import.meta.url), "utf8"))
  db = {
    prepare(query: string) {
      const s = sql.prepare(query)
      return {
        args: [] as unknown[],
        bind(...args: unknown[]) {
          this.args = args
          return this
        },
        async first() {
          return s.get(...this.args) ?? null
        },
        async all() {
          return { results: s.all(...this.args) }
        },
        async run() {
          return s.run(...this.args)
        },
      }
    },
    async batch(statements: { all: () => Promise<unknown> }[]) {
      sql.exec("BEGIN")
      try {
        const result = []
        for (const s of statements) result.push(await s.all())
        sql.exec("COMMIT")
        return result
      } catch (e) {
        sql.exec("ROLLBACK")
        throw e
      }
    },
  } as unknown as D1Database
})
afterEach(() => {
  sql.close()
  vi.unstubAllEnvs()
})
const apply = (overrides: Record<string, unknown> = {}) =>
  POST(
    new Request("https://preprod.ui.ballmac.com/api/affiliates", {
      method: "POST",
      headers: { origin: "https://preprod.ui.ballmac.com", host: "preprod.ui.ballmac.com" },
      body: JSON.stringify({
        name: "<script>Applicant</script>",
        email: "partner@example.com",
        channel: "https://example.com",
        terms: true,
        promotionPlan: "I share React tutorials with my developer newsletter audience.",
        ...overrides,
      }),
    }),
    { env: { AFFILIATES: db } },
  )
describe("durable application notifications", () => {
  it("sends the owner a review link and the applicant a receipt only once", async () => {
    expect((await apply()).status).toBe(200)
    expect(vi.mocked(resend).mock.calls).toHaveLength(2)
    const payloads = vi
      .mocked(resend)
      .mock.calls.map((call) => call[1]!.body as { to: string[]; html: string; text: string })
    expect(
      payloads.some(
        (p) => p.to[0] === "owner@example.com" && p.html.includes("/affiliates/admin?view=applications"),
      ),
    ).toBe(true)
    expect(
      payloads.some((p) => p.to[0] === "partner@example.com" && p.text.includes("three business days")),
    ).toBe(true)
    expect(payloads.every((p) => !p.html.includes("<script>"))).toBe(true)
    expect(sql.prepare("SELECT COUNT(*) AS n FROM affiliate_notifications WHERE state='sent'").get().n).toBe(
      2,
    )
    expect((await apply()).status).toBe(200)
    expect(vi.mocked(resend).mock.calls).toHaveLength(2)
    expect(sql.prepare("SELECT COUNT(*) AS n FROM affiliates").get().n).toBe(1)
  })
  it.each([false, undefined, "true", 1])(
    "rejects missing or non-boolean consent (%s) without storing or emailing",
    async (terms) => {
      expect((await apply({ terms })).status).toBe(422)
      expect(sql.prepare("SELECT COUNT(*) AS n FROM affiliates").get().n).toBe(0)
      expect(sql.prepare("SELECT COUNT(*) AS n FROM affiliate_notifications").get().n).toBe(0)
      expect(resend).not.toHaveBeenCalled()
    },
  )
  it.each(["", "short", "x".repeat(1001)])(
    "rejects incomplete or oversized promotion plans",
    async (promotionPlan) => {
      expect((await apply({ promotionPlan })).status).toBe(422)
      expect(sql.prepare("SELECT COUNT(*) AS n FROM affiliates").get().n).toBe(0)
      expect(resend).not.toHaveBeenCalled()
    },
  )
  it("stores the promotion plan and server consent timestamp and includes the plan in owner mail", async () => {
    const before = Date.now()
    expect((await apply()).status).toBe(200)
    const record = sql.prepare("SELECT promotion_plan,terms_version,terms_accepted_at FROM affiliates").get()
    expect(record.promotion_plan).toContain("developer newsletter")
    expect(record.terms_version).toBe("2026-10-22.2")
    expect(Date.parse(record.terms_accepted_at)).toBeGreaterThanOrEqual(before)
    const mail = vi
      .mocked(resend)
      .mock.calls.find((call) => (call[1]!.body as { to: string[] }).to[0] === "owner@example.com")
    expect((mail![1]!.body as { text: string }).text).toContain(record.promotion_plan)
  })
  it("keeps accepted applications and retries provider failures with stable idempotency keys", async () => {
    vi.mocked(resend).mockRejectedValue(new Error("private provider detail"))
    expect((await apply()).status).toBe(200)
    expect(
      sql.prepare("SELECT COUNT(*) AS n FROM affiliate_notifications WHERE state='pending'").get().n,
    ).toBe(2)
    expect(JSON.stringify(sql.prepare("SELECT last_error FROM affiliate_notifications").all())).not.toContain(
      "private",
    )
    const keys = vi.mocked(resend).mock.calls.map((call) => call[1]!.idempotencyKey)
    sql.exec("UPDATE affiliate_notifications SET next_attempt_at=0")
    vi.mocked(resend).mockResolvedValue({ id: "sent" })
    await deliverAffiliateNotifications(db)
    expect(
      vi
        .mocked(resend)
        .mock.calls.slice(2)
        .map((call) => call[1]!.idempotencyKey),
    ).toEqual(keys)
    expect(keys.every((k) => k!.length <= 256)).toBe(true)
    await deliverAffiliateNotifications(db)
    expect(vi.mocked(resend).mock.calls).toHaveLength(4)
  })
  it("leases each pending notification to one concurrent dispatcher", async () => {
    vi.stubEnv("RESEND_API_KEY", "")
    await apply()
    vi.stubEnv("RESEND_API_KEY", "test")
    await Promise.all([deliverAffiliateNotifications(db), deliverAffiliateNotifications(db)])
    expect(vi.mocked(resend).mock.calls).toHaveLength(2)
  })
  it("does not deliver private application details to a removed owner", async () => {
    vi.stubEnv("RESEND_API_KEY", "")
    await apply()
    vi.stubEnv("RESEND_API_KEY", "test")
    vi.stubEnv("AFFILIATE_ADMIN_EMAILS", "replacement@example.com")
    await deliverAffiliateNotifications(db)
    const recipients = vi.mocked(resend).mock.calls.map((call) => (call[1]!.body as { to: string[] }).to[0])
    expect(recipients).toEqual(["partner@example.com"])
    expect(
      sql.prepare("SELECT COUNT(*) AS n FROM affiliate_notifications WHERE state='cancelled'").get().n,
    ).toBe(1)
  })
  it("does not silently accept applications without any configured owner", async () => {
    vi.stubEnv("AFFILIATE_ADMIN_EMAILS", "")
    expect((await apply()).status).toBe(503)
    expect(sql.prepare("SELECT COUNT(*) AS n FROM affiliates").get().n).toBe(0)
  })
  it("retains stale delivery failures for owner review instead of resending beyond provider idempotency retention", async () => {
    vi.stubEnv("RESEND_API_KEY", "")
    await apply()
    sql.exec("UPDATE affiliate_notifications SET created_at=strftime('%Y-%m-%dT%H:%M:%fZ','now','-24 hours')")
    vi.stubEnv("RESEND_API_KEY", "test")
    await deliverAffiliateNotifications(db)
    expect(resend).not.toHaveBeenCalled()
  })
})
describe("transactional email safety", () => {
  it("escapes content and refuses off-site action links", () => {
    const email = partnerEmail({
      eyebrow: "Partners",
      title: "<unsafe>",
      intro: '"quoted" & text',
      action: { label: "Sign in", url: "https://evil.example" },
    })
    expect(email.html).not.toContain("<unsafe>")
    expect(email.html).toContain("&lt;unsafe&gt;")
    expect(email.html).not.toContain("evil.example")
    expect(email.text).not.toContain("evil.example")
    expect(signInEmail("123456").text).toContain("code is 123456")
    expect(signInEmail("123456", true).html).toContain("Administration access")
  })
  it("normalizes, deduplicates and validates owner recipients", () => {
    vi.stubEnv("AFFILIATE_ADMIN_EMAILS", "OWNER@example.com, owner@example.com, invalid")
    expect(affiliateOwners()).toEqual(["owner@example.com"])
  })
})
