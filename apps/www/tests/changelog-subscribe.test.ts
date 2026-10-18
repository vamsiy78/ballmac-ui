import { afterEach, describe, expect, it, vi } from "vitest"

const resendMock = vi.hoisted(() => vi.fn(async () => ({})))
vi.mock("../lib/resend", () => ({ resend: resendMock }))

import { POST } from "../worker/routes/changelog-subscribe"

const call = (body: unknown, { ip = "1.1.1.1", origin = "https://ui.test" } = {}) =>
  POST(new Request("https://ui.test/api/changelog-subscribe", { method: "POST", headers: { host: "ui.test", origin, "cf-connecting-ip": ip }, body: JSON.stringify(body) }))

const configure = () => {
  vi.stubEnv("RESEND_API_KEY", "k")
  vi.stubEnv("RESEND_CHANGELOG_AUDIENCE_ID", "aud_1")
  vi.stubEnv("RESEND_FROM", "Ballmac UI <ui@example.com>")
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
  resendMock.mockClear()
  resendMock.mockImplementation(async () => ({}))
})

describe("POST /api/changelog-subscribe", () => {
  it("says it is not set up until the audience exists", async () => {
    const res = await call({ email: "a@b.co" })
    expect(res.status).toBe(503)
    expect(resendMock).not.toHaveBeenCalled()
  })

  it("saves the address in the release notes audience and confirms", async () => {
    configure()
    const res = await call({ email: "  reader@example.com " }, { ip: "2.2.2.2" })
    expect(res.status).toBe(200)
    const [contacts, confirmation] = resendMock.mock.calls as unknown as [string, { body: Record<string, unknown> }][]
    expect(contacts![0]).toBe("/contacts")
    expect(contacts![1].body).toEqual({ email: "reader@example.com", unsubscribed: false, segments: [{ id: "aud_1" }] })
    expect(confirmation![0]).toBe("/emails")
    expect(confirmation![1].body.to).toEqual(["reader@example.com"])
  })

  it("rejects another site, a bad address and a bot", async () => {
    configure()
    expect((await call({ email: "a@b.co" }, { origin: "https://evil.test", ip: "3.3.3.3" })).status).toBe(403)
    expect((await call({ email: "nope" }, { ip: "3.3.3.3" })).status).toBe(422)
    expect((await call({ email: "a@b.co", website: "http://spam" }, { ip: "3.3.3.3" })).status).toBe(200)
    expect(resendMock).not.toHaveBeenCalled()
  })

  it("keeps the address even when the confirmation cannot be sent, and fails when it cannot be saved", async () => {
    configure()
    vi.spyOn(console, "error").mockImplementation(() => {})
    resendMock.mockImplementationOnce(async () => ({})).mockImplementationOnce(async () => {
      throw new Error("mail down")
    })
    expect((await call({ email: "a@b.co" }, { ip: "4.4.4.4" })).status).toBe(200)
    resendMock.mockImplementationOnce(async () => {
      throw new Error("api down")
    })
    expect((await call({ email: "c@d.co" }, { ip: "4.4.4.4" })).status).toBe(502)
  })

  it("limits one address to five tries in ten minutes", async () => {
    configure()
    let last = 0
    for (let i = 0; i < 7; i++) last = (await call({ email: `u${i}@example.com` }, { ip: "9.9.9.9" })).status
    expect(last).toBe(429)
  })
})
