import { afterEach, describe, expect, it, vi } from "vitest"

const resendMock = vi.hoisted(() => vi.fn(async () => {
  throw new Error("down")
}))
vi.mock("../lib/resend", () => ({ resend: resendMock }))

import { feedbackEmail, parseFeedback } from "../lib/docs-feedback"
import { POST } from "../worker/routes/docs-feedback"

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

const post = (body: unknown, ip = "1.1.1.1") => POST(new Request("https://ui.test/api/docs-feedback", { method: "POST", headers: { "cf-connecting-ip": ip }, body: typeof body === "string" ? body : JSON.stringify(body) }))

describe("parseFeedback", () => {
  it("accepts a docs page and an answer", () => {
    expect(parseFeedback({ page: "/docs/guides/pro", helpful: true })).toEqual({ page: "/docs/guides/pro", helpful: true })
    expect(parseFeedback({ page: "/docs", helpful: false, comment: "  missing a step  " })).toEqual({ page: "/docs", helpful: false, comment: "missing a step" })
  })
  it("keeps a comment only with a no, and caps it", () => {
    expect(parseFeedback({ page: "/docs", helpful: true, comment: "great" })).toEqual({ page: "/docs", helpful: true })
    expect(parseFeedback({ page: "/docs", helpful: false, comment: "x".repeat(5000) })!.comment).toHaveLength(1000)
  })
  it("refuses anything that is not a docs page or a yes or no", () => {
    for (const bad of [null, "x", {}, { page: "/pricing", helpful: true }, { page: "/docs/../etc", helpful: true }, { page: "/docs/a b", helpful: true }, { page: "/docs", helpful: "yes" }]) expect(parseFeedback(bad)).toBeNull()
  })
  it("writes an email that names the page", () => {
    const mail = feedbackEmail({ page: "/docs/guides/pro", helpful: false, comment: "unclear" }, "https://ui.ballmac.com")
    expect(mail.subject).toBe("Docs feedback: /docs/guides/pro")
    expect(mail.text).toContain("https://ui.ballmac.com/docs/guides/pro")
  })
})

describe("POST /api/docs-feedback", () => {
  it("logs a vote as one JSON line and says ok", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    const res = await post({ page: "/docs/guides/pro", helpful: true }, "2.2.2.2")
    expect(res.status).toBe(200)
    expect(JSON.parse(log.mock.calls[0]![0] as string)).toEqual({ event: "docs-feedback", page: "/docs/guides/pro", helpful: true })
  })
  it("emails a no with a comment when email is set up, and still says ok if sending fails", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {})
    vi.spyOn(console, "error").mockImplementation(() => {})
    vi.stubEnv("RESEND_API_KEY", "k")
    vi.stubEnv("CONTACT_TO_EMAIL", "team@example.com")
    vi.stubEnv("RESEND_FROM", "docs@example.com")
    resendMock.mockClear()
    const res = await post({ page: "/docs", helpful: false, comment: "step 3 fails" }, "3.3.3.3")
    expect(res.status).toBe(200)
    expect(resendMock).toHaveBeenCalledTimes(1)
    expect((resendMock.mock.calls[0] as unknown as [string, { body: { subject: string } }])[1].body.subject).toBe("Docs feedback: /docs")
  })
  it("rejects bad input and limits one address", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {})
    expect((await post("not json", "4.4.4.4")).status).toBe(400)
    expect((await post({ page: "/elsewhere", helpful: true }, "4.4.4.4")).status).toBe(400)
    let last = 200
    for (let i = 0; i < 25; i++) last = (await post({ page: "/docs", helpful: true }, "5.5.5.5")).status
    expect(last).toBe(429)
  })
})
