import { describe, expect, it } from "vitest"

import { createRateLimiter } from "../lib/rate-limit"
import { parseSupport, supportLimits, validateSupport } from "../lib/support"
import { esc, supportTeamEmail, supportUserEmail } from "../lib/support-emails"

const good = { topic: "bug", plan: "pro", name: "Ada Lovelace", email: "ada@example.com", item: "hero-pro-1", message: "The hero headline wraps badly on a 320px screen." }

describe("support request", () => {
  it("accepts a complete request", () => {
    const r = parseSupport(good)!
    expect(validateSupport(r)).toEqual({})
    expect(r).toMatchObject({ topic: "bug", plan: "pro", email: "ada@example.com" })
  })

  it("asks for a topic, a reachable email and a real message", () => {
    const e = validateSupport(parseSupport({ topic: "nope", email: "not-an-email", message: "short" })!)
    expect(Object.keys(e).sort()).toEqual(["email", "message", "topic"])
    expect(validateSupport(parseSupport({ ...good, message: "x".repeat(supportLimits.message + 50) })!).message).toMatch(/under/)
  })

  it("cleans untrusted input: control characters, header injection and lengths", () => {
    const r = parseSupport({ ...good, name: "Eve\r\nBcc: victim@example.com", email: "a@b.co\r\nBcc: x@y.z", item: "i".repeat(500), plan: "enterprise" })!
    expect(r.name).not.toMatch(/[\r\n]/)
    expect(r.email).not.toMatch(/[\r\n]/)
    expect(r.item).toHaveLength(supportLimits.item)
    expect(r.plan).toBe("free")
    expect(parseSupport(null)).toBeNull()
    expect(parseSupport("text")).toBeNull()
  })
})

describe("support emails", () => {
  const r = parseSupport({ ...good, name: `<script>alert(1)</script>`, message: `<img src=x onerror=alert(1)> & "quotes"` })!

  it("escapes everything a visitor typed in the HTML of both emails", () => {
    for (const html of [supportTeamEmail(r).html, supportUserEmail(r, "https://ui.example").html]) {
      expect(html).not.toContain("<script>")
      expect(html).not.toContain("<img src=x")
      expect(html).toContain("&lt;img src=x onerror=alert(1)&gt;")
    }
    expect(esc(`a<b>&"'`)).toBe("a&lt;b&gt;&amp;&quot;&#39;")
  })

  it("puts the topic, plan and a short summary in the team subject", () => {
    const s = supportTeamEmail(parseSupport(good)!).subject
    expect(s).toBe("[Ballmac UI Pro] Bug report: The hero headline wraps badly on a 320px screen.")
    expect(supportTeamEmail(parseSupport({ ...good, message: "y".repeat(200) })!).subject.length).toBeLessThan(120)
  })

  it("greets the sender by first name and links to the support page", () => {
    const u = supportUserEmail(parseSupport(good)!, "https://ui.example")
    expect(u.subject).toBe("We've received your message: Bug report")
    expect(u.text).toContain("Thanks, Ada.")
    expect(u.text).toContain("https://ui.example/support")
  })

  it("never contains a private address, which only lives in the environment", () => {
    expect(JSON.stringify(supportTeamEmail(r))).not.toMatch(/gmail\.com/)
  })
})

describe("rate limiter", () => {
  it("limits a sender after the allowed number in the window, then frees them", () => {
    let t = 0
    const limited = createRateLimiter({ max: 2, windowMs: 1000, now: () => t })
    expect([limited("a"), limited("a"), limited("a")]).toEqual([false, false, true])
    expect(limited("b")).toBe(false)
    t = 1500
    expect(limited("a")).toBe(false)
  })
})
