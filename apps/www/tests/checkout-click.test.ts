import { afterEach, describe, expect, it, vi } from "vitest"

const resendMock = vi.hoisted(() => vi.fn(async () => ({})))
vi.mock("../lib/resend", () => ({ resend: resendMock }))

import { clickEmail, isBot, parseClick } from "../lib/checkout-click"
import { POST } from "../worker/routes/checkout-click"

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
  resendMock.mockClear()
})

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15"
const click = { plan: "pro", page: "/pro", utm: "ballmac-ui/home-hero/hero", from: "www.reddit.com" }
const post = (body: unknown, init: { ip?: string; ua?: string; origin?: string; country?: string } = {}) =>
  POST(
    new Request("https://ui.test/api/checkout-click", {
      method: "POST",
      headers: { "cf-connecting-ip": init.ip ?? "9.9.9.9", "user-agent": init.ua ?? UA, ...(init.origin ? { origin: init.origin } : {}), ...(init.country ? { "cf-ipcountry": init.country } : {}) },
      body: typeof body === "string" ? body : JSON.stringify(body),
    })
  )
const withEmail = () => {
  vi.stubEnv("RESEND_API_KEY", "key")
  vi.stubEnv("CONTACT_TO_EMAIL", "owner@example.test")
  vi.stubEnv("RESEND_FROM", "Ballmac <hello@example.test>")
  vi.spyOn(console, "log").mockImplementation(() => {})
}

describe("parseClick", () => {
  it("accepts a plan with a site path, campaign tags and a referrer host", () => {
    expect(parseClick(click)).toEqual({ plan: "pro", page: "/pro", utm: "ballmac-ui / home-hero / hero", from: "www.reddit.com" })
    expect(parseClick({ plan: "team", page: "/pricing" })).toEqual({ plan: "team", page: "/pricing" })
    expect(parseClick({ plan: "monthly", page: "/pricing" })).toEqual({ plan: "monthly", page: "/pricing" })
  })
  it("refuses an unknown plan, a page that is not a path on this site, or junk", () => {
    for (const bad of [null, "x", {}, { plan: "free", page: "/pro" }, { plan: "pro", page: "https://evil.test/" }, { plan: "pro", page: "/a/../b" }, { plan: "pro", page: "/pro?x=<script>" }]) expect(parseClick(bad)).toBeNull()
  })
  it("drops campaign tags and referrers that carry anything but plain tokens", () => {
    expect(parseClick({ plan: "pro", page: "/pro", utm: "<b>x</b>/ok", from: "bad host!" })).toEqual({ plan: "pro", page: "/pro", utm: "ok" })
  })
})

describe("isBot", () => {
  it("flags crawlers and empty user agents, not browsers", () => {
    expect(isBot(null)).toBe(true)
    expect(isBot("Mozilla/5.0 (compatible; Googlebot/2.1)")).toBe(true)
    expect(isBot("HeadlessChrome/120")).toBe(true)
    expect(isBot(UA)).toBe(false)
  })
})

describe("clickEmail", () => {
  it("names the plan, the page, the country and the time in Indian time, and holds no personal data", () => {
    const mail = clickEmail(parseClick(click)!, { country: "DE", now: new Date("2026-10-24T10:00:00Z"), siteUrl: "https://ui.ballmac.com" })
    expect(mail.subject).toBe("Checkout opened: Pro from /pro")
    expect(mail.text).toContain("https://ui.ballmac.com/pro")
    expect(mail.text).toContain("DE")
    expect(mail.text).toContain("www.reddit.com")
    expect(mail.text).toMatch(/24 Oct 2026, 15:30 IST/)
  })
})

describe("POST /api/checkout-click", () => {
  it("logs the click as one JSON line and emails the owner once", async () => {
    withEmail()
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    expect((await post(click, { country: "IN" })).status).toBe(204)
    expect(JSON.parse(log.mock.calls[0][0] as string)).toMatchObject({ event: "checkout-click", plan: "pro", page: "/pro", country: "IN" })
    expect(resendMock).toHaveBeenCalledTimes(1)
    const [, options] = resendMock.mock.calls[0] as unknown as [string, { body: { to: string[]; subject: string } }]
    expect(options.body.to).toEqual(["owner@example.test"])
    expect(options.body.subject).toContain("Pro")
  })
  it("sends one email per visitor and plan in ten minutes, but a different plan still counts", async () => {
    withEmail()
    await post(click, { ip: "2.2.2.2" })
    await post(click, { ip: "2.2.2.2" })
    expect(resendMock).toHaveBeenCalledTimes(1)
    await post({ ...click, plan: "team" }, { ip: "2.2.2.2" })
    expect(resendMock).toHaveBeenCalledTimes(2)
  })
  it("ignores crawlers and other sites, answers 400 for bad input and 413 for a big body", async () => {
    withEmail()
    expect((await post(click, { ip: "3.3.3.3", ua: "Googlebot/2.1" })).status).toBe(204)
    expect((await post(click, { ip: "3.3.3.4", origin: "https://evil.test" })).status).toBe(204)
    expect(resendMock).not.toHaveBeenCalled()
    expect((await post({ plan: "nope", page: "/pro" }, { ip: "3.3.3.5" })).status).toBe(400)
    expect((await post("not json", { ip: "3.3.3.6" })).status).toBe(400)
    expect((await post("x".repeat(2000), { ip: "3.3.3.7" })).status).toBe(413)
  })
  it("does not fail the visitor when email is not set up or Resend is down", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {})
    expect((await post(click, { ip: "4.4.4.4" })).status).toBe(204)
    expect(resendMock).not.toHaveBeenCalled()
    withEmail()
    resendMock.mockRejectedValueOnce(new Error("down"))
    vi.spyOn(console, "error").mockImplementation(() => {})
    expect((await post(click, { ip: "4.4.4.5" })).status).toBe(204)
  })
})
