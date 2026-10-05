import { describe, expect, it } from "vitest"

import { createLicenseValidator, keyFromHeaders } from "../lib/license-core"

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } })

describe("licence validation", () => {
  it("accepts test keys without calling a provider", async () => {
    let calls = 0
    const v = createLicenseValidator({ BALLMAC_PRO_TEST_KEYS: "dev-key, other" }, (async () => (calls++, json({}))) as typeof fetch)
    expect(await v("dev-key")).toEqual({ valid: true })
    expect(calls).toBe(0)
  })

  it("ignores test keys on Vercel production", async () => {
    const v = createLicenseValidator({ VERCEL_ENV: "production", BALLMAC_PRO_TEST_KEYS: "dev-key" })
    expect((await v("dev-key")).valid).toBe(false)
  })

  it("rejects empty keys and unconfigured providers", async () => {
    const v = createLicenseValidator({})
    expect((await v("")).valid).toBe(false)
    expect(await v("abc")).toEqual({ valid: false, reason: "Licence checks are not configured yet." })
  })

  it("validates with Lemon Squeezy and checks the store and product", async () => {
    let sent = ""
    const ls = (async (_url: string, init?: RequestInit) => {
      sent = String(init?.body)
      return json({ valid: true, license_key: { status: "active" }, meta: { store_id: 11, product_id: 22 } })
    }) as typeof fetch
    expect(await createLicenseValidator({ BALLMAC_LICENSE_PROVIDER: "lemonsqueezy", LEMONSQUEEZY_STORE_ID: "11", LEMONSQUEEZY_PRODUCT_IDS: "22,23" }, ls)("key-1")).toEqual({ valid: true })
    expect(sent).toBe("license_key=key-1")
    expect((await createLicenseValidator({ BALLMAC_LICENSE_PROVIDER: "lemonsqueezy", LEMONSQUEEZY_STORE_ID: "99" }, ls)("key-1")).valid).toBe(false)
    expect((await createLicenseValidator({ BALLMAC_LICENSE_PROVIDER: "lemonsqueezy", LEMONSQUEEZY_PRODUCT_IDS: "5" }, ls)("key-1")).valid).toBe(false)
  })

  it("rejects expired Lemon Squeezy keys", async () => {
    const ls = (async () => json({ valid: true, license_key: { status: "expired" }, meta: {} })) as typeof fetch
    expect(await createLicenseValidator({ BALLMAC_LICENSE_PROVIDER: "lemonsqueezy" }, ls)("k")).toEqual({ valid: false, reason: "This licence key is expired." })
  })

  it("validates with Polar and checks the benefit", async () => {
    let body: Record<string, unknown> = {}
    const polar = (async (_url: string, init?: RequestInit) => {
      body = JSON.parse(String(init?.body))
      return body.key === "good" ? json({ status: "granted", benefit_id: "b1" }) : json({ detail: "not found" }, 404)
    }) as typeof fetch
    const v = createLicenseValidator({ BALLMAC_LICENSE_PROVIDER: "polar", POLAR_ORGANIZATION_ID: "org", POLAR_BENEFIT_IDS: "b1" }, polar)
    expect(await v("good")).toEqual({ valid: true })
    expect(body).toEqual({ key: "good", organization_id: "org" })
    expect((await v("bad")).valid).toBe(false)
  })

  it("caches answers and expires them", async () => {
    let calls = 0
    let t = 0
    const ls = (async () => (calls++, json({ valid: true, license_key: { status: "active" }, meta: {} }))) as typeof fetch
    const v = createLicenseValidator({ BALLMAC_LICENSE_PROVIDER: "lemonsqueezy" }, ls, () => t)
    await v("k"); await v("k")
    expect(calls).toBe(1)
    t = 11 * 60 * 1000
    await v("k")
    expect(calls).toBe(2)
  })

  it("does not cache provider outages", async () => {
    let fail = true
    const polar = (async () => (fail ? json({}, 500) : json({ status: "granted" }))) as typeof fetch
    const v = createLicenseValidator({ BALLMAC_LICENSE_PROVIDER: "polar", POLAR_ORGANIZATION_ID: "o" }, polar)
    await expect(v("k")).rejects.toThrow()
    fail = false
    expect(await v("k")).toEqual({ valid: true })
  })

  it("reads the key from Authorization or x-ballmac-license", () => {
    expect(keyFromHeaders(new Headers({ authorization: "Bearer abc" }))).toBe("abc")
    expect(keyFromHeaders(new Headers({ "x-ballmac-license": "xyz" }))).toBe("xyz")
    expect(keyFromHeaders(new Headers())).toBeNull()
  })

  it("validates with Dodo Payments", async () => {
    let url = ""
    let body = ""
    const dodo = (async (u: string, init?: RequestInit) => {
      url = u
      body = String(init?.body)
      return json({ valid: true })
    }) as typeof fetch
    const live = createLicenseValidator({ BALLMAC_LICENSE_PROVIDER: "dodopayments" }, dodo)
    expect(await live("key-1")).toEqual({ valid: true })
    expect(url).toBe("https://live.dodopayments.com/licenses/validate")
    expect(JSON.parse(body)).toEqual({ license_key: "key-1" })
    await createLicenseValidator({ BALLMAC_LICENSE_PROVIDER: "dodo", DODO_MODE: "test" }, dodo)("key-2")
    expect(url).toBe("https://test.dodopayments.com/licenses/validate")
  })

  it("rejects invalid Dodo Payments keys, and treats a provider error as an outage", async () => {
    const env = { BALLMAC_LICENSE_PROVIDER: "dodopayments" }
    expect(await createLicenseValidator(env, (async () => json({ valid: false })) as typeof fetch)("k")).toEqual({ valid: false, reason: "This licence key is not valid." })
    expect((await createLicenseValidator(env, (async () => json({ message: "not found" }, 404)) as typeof fetch)("k")).valid).toBe(false)
    await expect(createLicenseValidator(env, (async () => json({}, 503)) as typeof fetch)("k")).rejects.toThrow(/503/)
  })

  it("restricts Dodo Payments to the configured products and fails closed when the answer names none", async () => {
    const env = { BALLMAC_LICENSE_PROVIDER: "dodopayments", DODO_PRODUCT_IDS: "pdt_pro" }
    expect((await createLicenseValidator(env, (async () => json({ valid: true, product_id: "pdt_pro" })) as typeof fetch)("k")).valid).toBe(true)
    expect((await createLicenseValidator(env, (async () => json({ valid: true, product: { product_id: "pdt_pro" } })) as typeof fetch)("k")).valid).toBe(true)
    expect((await createLicenseValidator(env, (async () => json({ valid: true, product_id: "pdt_other" })) as typeof fetch)("k")).reason).toMatch(/another product/)
    expect((await createLicenseValidator(env, (async () => json({ valid: true })) as typeof fetch)("k")).reason).toMatch(/could not be matched/)
  })

  describe("Dodo Payments product check with an API key", () => {
    const env = { BALLMAC_LICENSE_PROVIDER: "dodopayments", DODO_MODE: "test", DODO_PRODUCT_IDS: "pdt_pro", DODO_API_KEY: "dodo_test_secret" }
    /** A fake Dodo: every key validates; the list holds the keys given for pdt_pro. */
    const fakeDodo = (proKeys: () => string[]) => {
      const calls: { url: string; auth: string | null }[] = []
      const fetchImpl = (async (input: string, init?: RequestInit) => {
        const url = String(input)
        calls.push({ url, auth: new Headers(init?.headers).get("authorization") })
        if (url.endsWith("/licenses/validate")) return json({ valid: true })
        const q = new URL(url).searchParams
        const size = Number(q.get("page_size"))
        const all = q.get("product_id") === "pdt_pro" ? proKeys() : []
        return json({ items: all.slice(Number(q.get("page_number")) * size, (Number(q.get("page_number")) + 1) * size).map((key) => ({ key, product_id: q.get("product_id") })) })
      }) as typeof fetch
      return { fetchImpl, listCalls: () => calls.filter((c) => c.url.includes("/license_keys")), calls }
    }

    it("accepts a key issued for the Pro product and refuses a key from another product", async () => {
      const { fetchImpl, listCalls } = fakeDodo(() => ["PRO-1", "PRO-2"])
      const v = createLicenseValidator(env, fetchImpl)
      expect(await v("PRO-1")).toEqual({ valid: true })
      expect(await v("SIDEME-9")).toEqual({ valid: false, reason: "This licence key is for another product." })
      const first = listCalls()[0]!
      expect(first.url.startsWith("https://test.dodopayments.com/license_keys?")).toBe(true)
      expect(new URL(first.url).searchParams.get("product_id")).toBe("pdt_pro")
      expect(new URL(first.url).searchParams.get("status")).toBe("active")
      expect(first.auth).toBe("Bearer dodo_test_secret")
    })

    it("never sends the API key to the public validate endpoint", async () => {
      const { fetchImpl, calls } = fakeDodo(() => ["PRO-1"])
      await createLicenseValidator(env, fetchImpl)("PRO-1")
      expect(calls.find((c) => c.url.endsWith("/licenses/validate"))?.auth).toBeNull()
    })

    it("reads every page of keys", async () => {
      const many = Array.from({ length: 250 }, (_, i) => `PRO-${i}`)
      const { fetchImpl, listCalls } = fakeDodo(() => many)
      const v = createLicenseValidator(env, fetchImpl)
      expect((await v("PRO-249")).valid).toBe(true)
      expect(listCalls()).toHaveLength(3)
    })

    it("uses the cached list, and reloads for an unknown key only after thirty seconds", async () => {
      let keys = ["PRO-1"]
      let t = 1_000_000
      const { fetchImpl, listCalls } = fakeDodo(() => keys)
      const v = createLicenseValidator(env, fetchImpl, () => t)
      expect((await v("PRO-1")).valid).toBe(true)
      keys = ["PRO-1", "PRO-NEW"]
      t += 5_000
      expect((await v("PRO-NEW")).valid).toBe(false) // bought a moment ago, list reloaded too recently
      expect(listCalls()).toHaveLength(1)
      t += 61_000 // the one-minute cache for refused keys has passed, and so have thirty seconds
      expect((await v("PRO-NEW")).valid).toBe(true)
      expect(listCalls()).toHaveLength(2)
    })

    it("loads the list once for several keys arriving together", async () => {
      const { fetchImpl, listCalls } = fakeDodo(() => ["PRO-1", "PRO-2", "PRO-3"])
      const v = createLicenseValidator(env, fetchImpl)
      const results = await Promise.all(["PRO-1", "PRO-2", "PRO-3", "OTHER"].map((k) => v(k)))
      expect(results.map((r) => r.valid)).toEqual([true, true, true, false])
      expect(listCalls()).toHaveLength(1)
    })

    it("fails closed when the list cannot be read", async () => {
      const failing = (async (u: string) => (String(u).endsWith("/licenses/validate") ? json({ valid: true }) : json({ message: "unauthorized" }, 401))) as typeof fetch
      await expect(createLicenseValidator(env, failing)("PRO-1")).rejects.toThrow(/401/)
    })

    it("refuses every key when a product is set but there is no API key", async () => {
      const { fetchImpl } = fakeDodo(() => ["PRO-1"])
      const { DODO_API_KEY, ...noKey } = env
      void DODO_API_KEY
      expect((await createLicenseValidator(noKey, fetchImpl)("PRO-1")).reason).toMatch(/could not be matched/)
    })

    it("still trusts the product id when Dodo's answer names it", async () => {
      const named = (async (u: string) => (String(u).endsWith("/licenses/validate") ? json({ valid: true, product_id: "pdt_pro" }) : json({ items: [] }))) as typeof fetch
      expect((await createLicenseValidator(env, named)("PRO-1")).valid).toBe(true)
    })
  })
})
