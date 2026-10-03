import { describe, expect, it } from "vitest"

import { createFailureLimiter } from "../lib/rate-limit"

describe("failure limiter", () => {
  it("blocks after max failures and recovers after the window", () => {
    let t = 0
    const l = createFailureLimiter({ max: 3, windowMs: 1000, now: () => t })
    for (let i = 0; i < 3; i++) {
      expect(l.blocked("a")).toBe(false)
      l.fail("a")
    }
    expect(l.blocked("a")).toBe(true)
    expect(l.blocked("b")).toBe(false)
    t = 1001
    expect(l.blocked("a")).toBe(false)
  })
})
