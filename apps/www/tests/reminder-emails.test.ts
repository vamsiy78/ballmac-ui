import { describe, expect, it } from "vitest"

import { planReminders, reminderConfirmEmail, reminderEmail, reminderSendAt } from "../lib/reminder-emails"

const ctx = { endsAt: "2026-10-21T18:29:00.000Z", price: "49", listPrice: "99", limit: 25, siteUrl: "https://ui.ballmac.com" }

describe("reminder emails", () => {
  it("send at exactly 72 and 24 hours before the deadline", () => {
    expect(reminderSendAt(ctx.endsAt, "72h").toISOString()).toBe("2026-10-18T18:29:00.000Z")
    expect(reminderSendAt(ctx.endsAt, "24h").toISOString()).toBe("2026-10-20T18:29:00.000Z")
  })
  it("never schedule a reminder whose time has passed", () => {
    expect(planReminders(ctx.endsAt, new Date("2026-10-07T00:00:00Z")).map((r) => r.kind)).toEqual(["72h", "24h"])
    expect(planReminders(ctx.endsAt, new Date("2026-10-19T00:00:00Z")).map((r) => r.kind)).toEqual(["24h"])
    expect(planReminders(ctx.endsAt, new Date("2026-10-21T00:00:00Z"))).toEqual([])
  })
  it("state only true things: price, the real deadline in IST, the cap", () => {
    for (const kind of ["72h", "24h"] as const) {
      const e = reminderEmail(kind, ctx)
      for (const body of [e.html, e.text]) {
        expect(body).toContain("$49")
        expect(body).toContain("$99")
        expect(body).toContain("Wed 21 Oct 2026, 11:59 pm IST")
        expect(body).toContain("25 founding licences")
        expect(body).not.toMatch(/refund/i)
        expect(body).toContain("https://ui.ballmac.com/pricing")
      }
    }
  })
  it("carry Resend's unsubscribe link, and say which reminder it is", () => {
    const a = reminderEmail("72h", ctx), b = reminderEmail("24h", ctx)
    expect(a.html).toContain("{{{RESEND_UNSUBSCRIBE_URL}}}")
    expect(a.text).toContain("{{{RESEND_UNSUBSCRIBE_URL}}}")
    expect(a.text).toContain("first of two")
    expect(b.text).toContain("second and last")
    expect(a.subject).toContain("3 days")
    expect(b.subject).toContain("24 hours")
  })
  it("leave out the list price when there is none, instead of printing a blank", () => {
    const e = reminderEmail("24h", { ...ctx, listPrice: null })
    expect(e.text).not.toContain("then $")
    expect(e.html).not.toContain("then $")
  })
  it("escape anything that is not ours", () => {
    const e = reminderEmail("72h", { ...ctx, price: "49<script>" })
    expect(e.html).not.toContain("<script>")
  })
  it("confirm the sign-up and promise only two emails", () => {
    const c = reminderConfirmEmail(ctx)
    expect(c.text).toContain("twice")
    expect(c.text).toContain("nothing more unless you buy")
    expect(c.html).toContain("Wed 21 Oct 2026, 11:59 pm IST")
  })
})
