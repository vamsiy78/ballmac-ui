import { describe, expect, it } from "vitest"

import { founding } from "../lib/founding"
import { createLicenseValidator } from "../lib/license-core"
import { paymentsLive, testModeInProduction } from "../lib/payments"

const dodo = { BALLMAC_LICENSE_PROVIDER: "dodopayments" }
const on = { NEXT_PUBLIC_PRO_FOUNDING_LIMIT: "25", NEXT_PUBLIC_PRO_PRICE: "49", NEXT_PUBLIC_PRO_CHECKOUT_URL: "https://pay.example/buy" }

describe("test mode never goes live in production", () => {
  it("is detected only on Vercel production with DODO_MODE=test", () => {
    expect(testModeInProduction({ VERCEL_ENV: "production", DODO_MODE: "test" })).toBe(true)
    expect(testModeInProduction({ VERCEL_ENV: "preview", DODO_MODE: "test" })).toBe(false)
    expect(testModeInProduction({ VERCEL_ENV: "production", DODO_MODE: "" })).toBe(false)
    expect(testModeInProduction({ DODO_MODE: "test" })).toBe(false)
    expect(paymentsLive({ VERCEL_ENV: "production" })).toBe(true)
  })

  it("refuses every licence key without calling the provider", async () => {
    let calls = 0
    const fetchImpl = (async () => (calls++, new Response(JSON.stringify({ valid: true })))) as typeof fetch
    const v = createLicenseValidator({ ...dodo, VERCEL_ENV: "production", DODO_MODE: "test" }, fetchImpl)
    expect(await v("any-key")).toEqual({ valid: false, reason: "Licence checks are not live yet." })
    expect(calls).toBe(0)
  })

  it("still validates in a preview with test mode, and in production with live mode", async () => {
    const ok = (async () => new Response(JSON.stringify({ valid: true }))) as typeof fetch
    expect((await createLicenseValidator({ ...dodo, VERCEL_ENV: "preview", DODO_MODE: "test" }, ok)("k")).valid).toBe(true)
    expect((await createLicenseValidator({ ...dodo, VERCEL_ENV: "production" }, ok)("k")).valid).toBe(true)
  })

  it("hides the founding offer in production test mode, and shows it elsewhere", () => {
    expect(founding({ ...on, VERCEL_ENV: "production", DODO_MODE: "test" })).toBeNull()
    expect(founding({ ...on, VERCEL_ENV: "production" })).toEqual({ limit: 25, price: "49", listPrice: null, endsAt: null })
    expect(founding({ ...on, VERCEL_ENV: "preview", DODO_MODE: "test" })).toEqual({ limit: 25, price: "49", listPrice: null, endsAt: null })
  })
})
