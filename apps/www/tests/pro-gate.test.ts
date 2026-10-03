import { describe, expect, it } from "vitest"

import { createProGate } from "../lib/pro-gate-core"
import { createFailureLimiter } from "../lib/rate-limit"
import { keyFromHeaders } from "../lib/license-core"

const make = (validate: (k: string) => Promise<{ valid: boolean; reason?: string }>, max = 3) => {
  const limiter = createFailureLimiter({ max, windowMs: 60_000 })
  const gate = createProGate({ validate, limiter, keyFromHeaders, clientId: (h) => h.get("x-forwarded-for") ?? "unknown", siteUrl: "https://ui.example" })
  return { gate, limiter }
}
const req = (headers: Record<string, string> = {}) => new Request("https://ui.example/r/pro/x", { headers })

describe("Pro gate", () => {
  it("asks for a key when none is sent", async () => {
    const res = await make(async () => ({ valid: true })).gate(req())
    expect(res?.status).toBe(401)
    expect(res?.headers.get("www-authenticate")).toContain("Bearer")
    expect(res?.headers.get("cache-control")).toBe("private, no-store")
  })

  it("lets a valid key through, whichever header carries it", async () => {
    const { gate } = make(async (k) => ({ valid: k === "good" }))
    expect(await gate(req({ authorization: "Bearer good" }))).toBeNull()
    expect(await gate(req({ "x-ballmac-license": "good" }))).toBeNull()
  })

  it("rejects an invalid key with the reason, never caches, and counts the failure", async () => {
    const { gate, limiter } = make(async () => ({ valid: false, reason: "This licence key is expired." }))
    const res = await gate(req({ authorization: "Bearer old", "x-forwarded-for": "1.1.1.1" }))
    expect(res?.status).toBe(403)
    expect((await res!.json()).message).toContain("expired")
    expect(limiter.blocked("1.1.1.1")).toBe(false)
  })

  it("blocks an address after too many invalid attempts, even for a valid key", async () => {
    const { gate } = make(async (k) => ({ valid: k === "good" }), 2)
    const bad = req({ authorization: "Bearer nope", "x-forwarded-for": "2.2.2.2" })
    await gate(bad)
    await gate(bad)
    const blocked = await gate(req({ authorization: "Bearer good", "x-forwarded-for": "2.2.2.2" }))
    expect(blocked?.status).toBe(429)
    expect(blocked?.headers.get("retry-after")).toBe("600")
    expect(await gate(req({ authorization: "Bearer good", "x-forwarded-for": "3.3.3.3" }))).toBeNull()
  })

  it("answers 503 when the licence server is down, and does not count it against the visitor", async () => {
    const { gate, limiter } = make(async () => {
      throw new Error("timeout")
    })
    const res = await gate(req({ authorization: "Bearer any", "x-forwarded-for": "4.4.4.4" }))
    expect(res?.status).toBe(503)
    expect(limiter.blocked("4.4.4.4")).toBe(false)
  })
})
