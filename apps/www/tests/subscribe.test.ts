import { describe, expect, it } from "vitest"

import { parseSubscribe } from "../lib/subscribe"

describe("subscribe form", () => {
  it("accepts a sensible email and trims it", () => {
    expect(parseSubscribe({ email: "  maya@example.com " })).toEqual({ email: "maya@example.com", bot: false })
  })
  it("rejects what is not an email", () => {
    for (const bad of ["", "maya", "maya@", "@example.com", "a b@example.com", null, 42, undefined]) expect(parseSubscribe({ email: bad })).toHaveProperty("error")
    expect(parseSubscribe(null)).toHaveProperty("error")
    expect(parseSubscribe({ email: `${"a".repeat(250)}@example.com` })).toHaveProperty("error")
  })
  it("flags a filled honeypot, even without a valid email, so nothing is stored", () => {
    expect(parseSubscribe({ email: "x", website: "http://spam" })).toMatchObject({ bot: true })
    expect(parseSubscribe({ email: "maya@example.com", website: "" })).toMatchObject({ bot: false })
  })
  it("strips control characters, which could end up in email headers", () => {
    expect(parseSubscribe({ email: "maya@example.com\r\nBcc: x@y.z" })).toHaveProperty("error")
  })
})
