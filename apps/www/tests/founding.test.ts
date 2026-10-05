import { describe, expect, it } from "vitest"

import { founding } from "../lib/founding"

const on = { NEXT_PUBLIC_PRO_FOUNDING_LIMIT: "25", NEXT_PUBLIC_PRO_PRICE: "49", NEXT_PUBLIC_PRO_CHECKOUT_URL: "https://pay.example/buy" }

describe("founding offer", () => {
  it("shows with a limit, a price and a checkout link", () => {
    expect(founding(on)).toEqual({ limit: 25, price: "49" })
  })
  it("is off without the limit, so unsetting the variable ends the offer", () => {
    expect(founding({ ...on, NEXT_PUBLIC_PRO_FOUNDING_LIMIT: "" })).toBeNull()
    expect(founding({ ...on, NEXT_PUBLIC_PRO_FOUNDING_LIMIT: undefined })).toBeNull()
  })
  it("is off when Pro is not on sale", () => {
    expect(founding({ ...on, NEXT_PUBLIC_PRO_PRICE: "" })).toBeNull()
    expect(founding({ ...on, NEXT_PUBLIC_PRO_CHECKOUT_URL: "" })).toBeNull()
  })
  it("ignores a limit that is not a sensible whole number", () => {
    for (const bad of ["0", "-3", "2.5", "abc", "100000"]) expect(founding({ ...on, NEXT_PUBLIC_PRO_FOUNDING_LIMIT: bad })).toBeNull()
  })
})
