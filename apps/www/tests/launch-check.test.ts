import { describe, expect, it } from "vitest"

import { evaluate } from "../../../scripts/launch-check"

const good = {
  BALLMAC_LICENSE_PROVIDER: "polar",
  POLAR_ORGANIZATION_ID: "org",
  POLAR_BENEFIT_IDS: "b1",
  NEXT_PUBLIC_PRO_CHECKOUT_URL: "https://buy.example.com/pro",
  NEXT_PUBLIC_PRO_PRICE: "299",
  NEXT_PUBLIC_PRO_LICENSE_URL: "https://example.com/pro-license",
  PRO_SESSION_SECRET: "x".repeat(32),
}
const levels = (env: Record<string, string>, production = true, proBuilt = 150) => evaluate({ env, proSource: 150, proBuilt, production }).map((c) => c.level)

describe("launch readiness", () => {
  it("passes a fully configured production env", () => {
    expect(levels(good)).not.toContain("fail")
  })
  it("fails production when anything is missing", () => {
    expect(levels({})).toContain("fail")
    expect(levels({ ...good, POLAR_BENEFIT_IDS: "" })).toContain("fail")
    expect(levels({ ...good, NEXT_PUBLIC_PRO_CHECKOUT_URL: "http://x" })).toContain("fail")
    expect(levels(good, true, 10)).toContain("fail")
  })
  it("fails production without a session secret long enough for browser login", () => {
    expect(levels({ ...good, PRO_SESSION_SECRET: "" })).toContain("fail")
    expect(levels({ ...good, PRO_SESSION_SECRET: "short" })).toContain("fail")
  })
  it("warns about a portal link that is not https, without failing", () => {
    const l = levels({ ...good, NEXT_PUBLIC_PRO_PORTAL_URL: "http://portal" })
    expect(l).toContain("warn")
    expect(l).not.toContain("fail")
  })
  it("needs an API key whenever Dodo products are restricted, and warns when nothing restricts them", () => {
    const dodo = { ...good, BALLMAC_LICENSE_PROVIDER: "dodopayments", DODO_MODE: "", POLAR_ORGANIZATION_ID: "", POLAR_BENEFIT_IDS: "" }
    expect(levels({ ...dodo, DODO_PRODUCT_IDS: "pdt_1" })).toContain("fail")
    expect(levels({ ...dodo, DODO_PRODUCT_IDS: "pdt_1", DODO_API_KEY: "k" })).not.toContain("fail")
    expect(levels(dodo)).not.toContain("fail")
    expect(levels(dodo)).toContain("warn")
  })
  it("only warns outside production", () => {
    expect(levels({}, false)).not.toContain("fail")
  })

  describe("founding offer", () => {
    const soon = new Date(Date.now() + 5 * 86_400_000).toISOString()
    const offer = { ...good, NEXT_PUBLIC_PRO_PRICE: "49", NEXT_PUBLIC_PRO_FOUNDING_LIMIT: "25", NEXT_PUBLIC_PRO_FOUNDING_ENDS: soon, NEXT_PUBLIC_PRO_LIST_PRICE: "99", NEXT_PUBLIC_PRO_STANDARD_CHECKOUT_URL: "https://buy.example.com/regular" }
    it("fails production when a deadline has nothing to switch to, so Pro would sell nothing after it", () => {
      expect(levels({ ...offer, NEXT_PUBLIC_PRO_STANDARD_CHECKOUT_URL: "" })).toContain("fail")
      expect(levels({ ...offer, NEXT_PUBLIC_PRO_LIST_PRICE: "" })).toContain("fail")
      expect(levels({ ...offer, NEXT_PUBLIC_PRO_LIST_PRICE: "30" })).toContain("fail")
    })
    it("fails a deadline that is not a real date, and warns about one in the past", () => {
      expect(levels({ ...offer, NEXT_PUBLIC_PRO_FOUNDING_ENDS: "soon" })).toContain("fail")
      const past = levels({ ...offer, NEXT_PUBLIC_PRO_FOUNDING_ENDS: "2020-01-01T00:00:00Z" })
      expect(past).toContain("warn")
    })
    it("warns, without failing, when the licence cap and the reminder emails are not set up", () => {
      const l = levels(offer)
      expect(l).toContain("warn")
      expect(l).not.toContain("fail")
    })
    it("is quiet about all of it when there is no offer", () => {
      expect(levels(good)).not.toContain("fail")
    })
  })
})
