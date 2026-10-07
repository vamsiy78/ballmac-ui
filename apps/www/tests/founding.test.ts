import { describe, expect, it } from "vitest"

import { endsLabel, endsShort, founding, foundingEnds, leftPhrase, nudgeText, proOffer, timeLeft } from "../lib/founding"

const on = { NEXT_PUBLIC_PRO_FOUNDING_LIMIT: "25", NEXT_PUBLIC_PRO_PRICE: "49", NEXT_PUBLIC_PRO_CHECKOUT_URL: "https://pay.example/buy" }
// 11:59 pm IST on 21 October 2026 is 18:29 UTC.
const full = { ...on, NEXT_PUBLIC_PRO_LIST_PRICE: "99", NEXT_PUBLIC_PRO_STANDARD_CHECKOUT_URL: "https://pay.example/regular", NEXT_PUBLIC_PRO_FOUNDING_ENDS: "2026-10-21T18:29:00Z" }
const before = new Date("2026-10-18T00:00:00Z")
const after = new Date("2026-10-21T18:29:00Z")

describe("founding offer", () => {
  it("shows with a limit, a price and a checkout link, and no deadline unless one is set", () => {
    expect(founding(on)).toEqual({ limit: 25, price: "49", listPrice: null, endsAt: null })
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
  it("carries the list price and the deadline, and the list price must be higher than the founding price", () => {
    expect(founding(full, before)).toEqual({ limit: 25, price: "49", listPrice: "99", endsAt: "2026-10-21T18:29:00.000Z" })
    expect(founding({ ...full, NEXT_PUBLIC_PRO_LIST_PRICE: "49" }, before)?.listPrice).toBeNull()
    expect(founding({ ...full, NEXT_PUBLIC_PRO_LIST_PRICE: "10" }, before)?.listPrice).toBeNull()
    expect(founding({ ...full, NEXT_PUBLIC_PRO_LIST_PRICE: "abc" }, before)?.listPrice).toBeNull()
  })
  it("ends at the deadline, to the second", () => {
    expect(founding(full, new Date("2026-10-21T18:28:59Z"))).not.toBeNull()
    expect(founding(full, after)).toBeNull()
    expect(founding(full, new Date("2027-01-01T00:00:00Z"))).toBeNull()
  })
  it("ignores a deadline that is not a real date", () => {
    expect(foundingEnds({ NEXT_PUBLIC_PRO_FOUNDING_ENDS: "soon" })).toBeNull()
    expect(founding({ ...full, NEXT_PUBLIC_PRO_FOUNDING_ENDS: "soon" }, after)).not.toBeNull()
  })
  it("never runs in test mode on production", () => {
    expect(founding({ ...full, VERCEL_ENV: "production", DODO_MODE: "test" }, before)).toBeNull()
  })
})

describe("what Pro sells right now", () => {
  it("sells the founding price and link while the offer runs", () => {
    expect(proOffer(full, before)).toMatchObject({ onSale: true, price: "49", checkout: "https://pay.example/buy" })
  })
  it("switches to the regular price and link at the deadline", () => {
    expect(proOffer(full, after)).toMatchObject({ onSale: true, price: "99", checkout: "https://pay.example/regular", founding: null })
  })
  it("switches when the licence cap is reached, before the deadline", () => {
    expect(proOffer(full, before, true)).toMatchObject({ onSale: true, price: "99", checkout: "https://pay.example/regular" })
  })
  it("sells nothing after the offer if there is no regular link, instead of advertising a price the checkout would not charge", () => {
    const noStandard = { ...full, NEXT_PUBLIC_PRO_STANDARD_CHECKOUT_URL: undefined }
    expect(proOffer(noStandard, after)).toMatchObject({ onSale: false, price: null, checkout: null })
  })
  it("keeps the old single-price behaviour when no founding offer was ever set", () => {
    expect(proOffer({ NEXT_PUBLIC_PRO_PRICE: "79", NEXT_PUBLIC_PRO_CHECKOUT_URL: "https://pay.example/buy" })).toMatchObject({ onSale: true, price: "79", founding: null })
    expect(proOffer({})).toMatchObject({ onSale: false })
  })
  it("sells nothing in test mode on production", () => {
    expect(proOffer({ ...full, VERCEL_ENV: "production", DODO_MODE: "test" }, before).onSale).toBe(false)
  })
})

describe("deadline wording", () => {
  it("reads the deadline in India time, the same everywhere", () => {
    expect(endsLabel("2026-10-21T18:29:00Z")).toBe("Wed 21 Oct 2026, 11:59 pm IST")
  })
  it("counts down in whole days, then hours, then minutes, and rounds down", () => {
    const end = "2026-10-21T18:29:00Z"
    expect(leftPhrase(end, new Date("2026-10-16T18:29:00Z"))).toBe("ends in 5 days")
    expect(leftPhrase(end, new Date("2026-10-16T18:30:00Z"))).toBe("ends in 4 days")
    expect(leftPhrase(end, new Date("2026-10-20T18:29:00Z"))).toBe("ends in 24 hours")
    expect(leftPhrase(end, new Date("2026-10-21T17:29:00Z"))).toBe("ends in about an hour")
    expect(leftPhrase(end, new Date("2026-10-21T18:00:00Z"))).toBe("ends in 29 minutes")
    expect(leftPhrase(end, new Date("2026-10-21T18:29:00Z"))).toBe("has ended")
  })
  it("splits the time left for a clock", () => {
    expect(timeLeft("2026-10-21T18:29:00Z", new Date("2026-10-19T15:27:30Z"))).toMatchObject({ ended: false, days: 2, hours: 3, minutes: 1, seconds: 30 })
    expect(timeLeft("2026-10-21T18:29:00Z", new Date("2027-01-01T00:00:00Z"))).toMatchObject({ ended: true, days: 0, totalMs: 0 })
  })
})

describe("prompts where the loss is felt", () => {
  it("names the real price, the real next price and the time left", () => {
    expect(nudgeText(founding(full, new Date("2026-10-16T18:29:00Z")), new Date("2026-10-16T18:29:00Z"))).toBe("Founding price ends in 5 days: $49, then $99.")
    expect(nudgeText(founding(full, new Date("2026-10-21T10:29:00Z")), new Date("2026-10-21T10:29:00Z"))).toBe("Founding price ends in 8 hours: $49, then $99.")
  })
  it("says nothing when there is no offer, and no invented deadline when there is none", () => {
    expect(nudgeText(null)).toBeNull()
    expect(nudgeText(founding(on))).toBe("Founding price for the first 25 buyers: $49.")
  })
  it("gives a short India-time date for banners", () => {
    expect(endsShort("2026-10-21T18:29:00Z")).toBe("21 Oct")
  })
})
