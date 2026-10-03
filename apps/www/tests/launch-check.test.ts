import { describe, expect, it } from "vitest"

import { evaluate } from "../../../scripts/launch-check"

const good = {
  BALLMAC_LICENSE_PROVIDER: "polar",
  POLAR_ORGANIZATION_ID: "org",
  POLAR_BENEFIT_IDS: "b1",
  NEXT_PUBLIC_PRO_CHECKOUT_URL: "https://buy.example.com/pro",
  NEXT_PUBLIC_PRO_PRICE: "299",
  NEXT_PUBLIC_PRO_LICENSE_URL: "https://example.com/pro-license",
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
  it("only warns outside production", () => {
    expect(levels({}, false)).not.toContain("fail")
  })
})
