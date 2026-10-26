import { describe, expect, it } from "vitest"

import { PPP_PERCENT, pppPrice } from "../lib/ppp"

describe("pppPrice", () => {
  it("gives Dodo's price for a country below the list price", () => {
    expect(pppPrice(99, "IN")).toEqual({ price: 29.7, percent: 30 })
    expect(pppPrice(99, "BR")).toEqual({ price: 44.55, percent: 45 })
    expect(pppPrice(99, "GB")).toEqual({ price: 84.15, percent: 85 })
  })
  it("says nothing for countries that pay the full price, unknown countries and bad input", () => {
    for (const country of ["US", "CH", "VE", "ZZ", "us", "", null, undefined, 5]) expect(pppPrice(99, country)).toBeNull()
    expect(pppPrice(0, "IN")).toBeNull()
    expect(pppPrice(Number.NaN, "IN")).toBeNull()
  })
  it("keeps every percentage between Dodo's floor of 30 and 100", () => {
    for (const [code, percent] of Object.entries(PPP_PERCENT)) {
      expect(code).toMatch(/^[A-Z]{2}$/)
      expect(percent).toBeGreaterThanOrEqual(30)
      expect(percent).toBeLessThan(100)
    }
  })
})
