/**
 * Licence checks for Ballmac UI Pro, with no Next.js imports so it can be tested on its own.
 * Providers: Lemon Squeezy, Polar or Dodo Payments (all are merchants of record and issue licence keys), plus test keys for development.
 */
export type LicenseResult = { valid: boolean; reason?: string }

export type LicenseEnv = {
  VERCEL_ENV?: string
  BALLMAC_LICENSE_PROVIDER?: string
  BALLMAC_PRO_TEST_KEYS?: string
  LEMONSQUEEZY_STORE_ID?: string
  LEMONSQUEEZY_PRODUCT_IDS?: string
  POLAR_ORGANIZATION_ID?: string
  POLAR_BENEFIT_IDS?: string
  POLAR_API_URL?: string
  /** Dodo Payments: "test" uses test.dodopayments.com, anything else the live API. */
  DODO_MODE?: string
  DODO_API_URL?: string
  /**
   * Restricts which Dodo products unlock Pro. Dodo's public validate answer only says valid or not, so with an API key (below)
   * the key is looked up in the list of keys issued for these products. Without an API key, keys are refused.
   */
  DODO_PRODUCT_IDS?: string
  /** A Dodo API key for the same mode (test or live) as DODO_MODE. Only used to list the licence keys of DODO_PRODUCT_IDS. Secret. */
  DODO_API_KEY?: string
}

const VALID_TTL = 10 * 60 * 1000
const INVALID_TTL = 60 * 1000
const MAX_CACHE = 5000
/** The set of keys issued for the Pro product is kept for five minutes, and reloaded at most every thirty seconds when an unknown key shows up. */
const KEYSET_TTL = 5 * 60 * 1000
const KEYSET_MIN_REFRESH = 30 * 1000
const KEYS_PER_PAGE = 100
const MAX_KEY_PAGES = 100

const list = (v?: string) => (v ?? "").split(",").map((s) => s.trim()).filter(Boolean)

export function createLicenseValidator(env: LicenseEnv, fetchImpl: typeof fetch = fetch, now: () => number = Date.now) {
  const cache = new Map<string, { result: LicenseResult; until: number }>()
  // Test keys never unlock anything on Vercel production, even if the variable is set by mistake.
  const testKeys = new Set(env.VERCEL_ENV === "production" ? [] : list(env.BALLMAC_PRO_TEST_KEYS))
  const provider = (env.BALLMAC_LICENSE_PROVIDER ?? "").toLowerCase()
  const keysets = new Map<string, { keys: Set<string>; at: number }>()
  const loading = new Map<string, Promise<Set<string>>>()

  async function lemonSqueezy(key: string): Promise<LicenseResult> {
    const res = await fetchImpl("https://api.lemonsqueezy.com/v1/licenses/validate", {
      method: "POST",
      headers: { accept: "application/json", "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ license_key: key }).toString(),
      signal: AbortSignal.timeout(10_000),
    })
    const data = (await res.json().catch(() => ({}))) as {
      valid?: boolean
      license_key?: { status?: string }
      meta?: { store_id?: number | string; product_id?: number | string }
    }
    if (!data.valid) return { valid: false, reason: "This licence key is not valid." }
    if (data.license_key?.status === "expired" || data.license_key?.status === "disabled") return { valid: false, reason: `This licence key is ${data.license_key.status}.` }
    if (env.LEMONSQUEEZY_STORE_ID && String(data.meta?.store_id) !== env.LEMONSQUEEZY_STORE_ID) return { valid: false, reason: "This licence key is for another store." }
    const products = list(env.LEMONSQUEEZY_PRODUCT_IDS)
    if (products.length && !products.includes(String(data.meta?.product_id))) return { valid: false, reason: "This licence key is for another product." }
    return { valid: true }
  }

  async function polar(key: string): Promise<LicenseResult> {
    if (!env.POLAR_ORGANIZATION_ID) return { valid: false, reason: "Licence checks are not configured." }
    const res = await fetchImpl(`${env.POLAR_API_URL ?? "https://api.polar.sh"}/v1/customer-portal/license-keys/validate`, {
      method: "POST",
      headers: { accept: "application/json", "content-type": "application/json" },
      body: JSON.stringify({ key, organization_id: env.POLAR_ORGANIZATION_ID }),
      signal: AbortSignal.timeout(10_000),
    })
    if (res.status === 404 || res.status === 422) return { valid: false, reason: "This licence key is not valid." }
    if (!res.ok) throw new Error(`Polar returned ${res.status}`)
    const data = (await res.json()) as { status?: string; benefit_id?: string }
    if (data.status !== "granted") return { valid: false, reason: `This licence key is ${data.status ?? "not active"}.` }
    const benefits = list(env.POLAR_BENEFIT_IDS)
    if (benefits.length && !benefits.includes(String(data.benefit_id))) return { valid: false, reason: "This licence key is for another product." }
    return { valid: true }
  }

  const dodoBase = () => env.DODO_API_URL ?? (env.DODO_MODE === "test" ? "https://test.dodopayments.com" : "https://live.dodopayments.com")

  /** Every active licence key issued for the given products, from Dodo's authenticated list (100 per page). */
  async function listDodoKeys(products: string[]): Promise<Set<string>> {
    const keys = new Set<string>()
    for (const product of products) {
      for (let page = 0; ; page++) {
        if (page >= MAX_KEY_PAGES) throw new Error(`Dodo Payments has more than ${MAX_KEY_PAGES * KEYS_PER_PAGE} keys for ${product}; the product check cannot list them all`)
        const query = new URLSearchParams({ product_id: product, status: "active", page_size: String(KEYS_PER_PAGE), page_number: String(page) })
        const res = await fetchImpl(`${dodoBase()}/license_keys?${query}`, {
          headers: { accept: "application/json", authorization: `Bearer ${env.DODO_API_KEY}` },
          signal: AbortSignal.timeout(15_000),
        })
        if (!res.ok) throw new Error(`Dodo Payments returned ${res.status} for the licence key list (is DODO_API_KEY a ${env.DODO_MODE === "test" ? "test" : "live"} mode key?)`)
        const body = (await res.json().catch(() => ({}))) as { items?: { key?: unknown }[] } | { key?: unknown }[]
        const items = Array.isArray(body) ? body : (body.items ?? [])
        for (const item of items) if (typeof item.key === "string") keys.add(item.key)
        if (items.length < KEYS_PER_PAGE) break
      }
    }
    return keys
  }

  /** True when the key was issued for one of the products. Uses the cached list; a key that is not in it triggers one reload at most every thirty seconds. */
  async function issuedFor(products: string[], key: string): Promise<boolean> {
    const id = products.join(",")
    const entry = keysets.get(id)
    const age = entry ? now() - entry.at : Infinity
    if (entry && age < KEYSET_TTL && entry.keys.has(key)) return true
    if (entry && age < KEYSET_MIN_REFRESH) return false
    let load = loading.get(id)
    if (!load) {
      load = listDodoKeys(products).finally(() => loading.delete(id))
      loading.set(id, load)
    }
    const keys = await load
    keysets.set(id, { keys, at: now() })
    return keys.has(key)
  }

  /**
   * Dodo Payments: POST /licenses/validate with the key; the public answer is only `valid` (true for an active, unexpired key).
   * DODO_PRODUCT_IDS limits which products unlock Pro. If the answer names the product that is used; otherwise, with DODO_API_KEY,
   * the key is looked up in the keys issued for those products; with neither, keys are refused rather than accepted unchecked.
   */
  async function dodo(key: string): Promise<LicenseResult> {
    const res = await fetchImpl(`${dodoBase()}/licenses/validate`, {
      method: "POST",
      headers: { accept: "application/json", "content-type": "application/json" },
      body: JSON.stringify({ license_key: key }),
      signal: AbortSignal.timeout(10_000),
    })
    if (res.status >= 400 && res.status < 500) return { valid: false, reason: "This licence key is not valid." }
    if (!res.ok) throw new Error(`Dodo Payments returned ${res.status}`)
    const data = (await res.json().catch(() => ({}))) as { valid?: boolean; product_id?: string; product?: { product_id?: string; id?: string } }
    if (data.valid !== true) return { valid: false, reason: "This licence key is not valid." }
    const products = list(env.DODO_PRODUCT_IDS)
    if (products.length) {
      const named = data.product_id ?? data.product?.product_id ?? data.product?.id
      if (named) {
        if (!products.includes(String(named))) return { valid: false, reason: "This licence key is for another product." }
      } else if (env.DODO_API_KEY?.trim()) {
        try {
          if (!(await issuedFor(products, key))) return { valid: false, reason: "This licence key is for another product." }
        } catch (e) {
          console.error(`Pro product check failed: ${(e as Error).message}`)
          throw e
        }
      } else {
        return { valid: false, reason: "This licence key could not be matched to a product." }
      }
    }
    return { valid: true }
  }

  /** Checks a key. Answers are cached: ten minutes when valid, one minute when not. Provider outages are not cached. */
  return async function validate(rawKey: string | null | undefined): Promise<LicenseResult> {
    const key = (rawKey ?? "").trim()
    if (!key) return { valid: false, reason: "No licence key was sent." }
    if (key.length > 200) return { valid: false, reason: "This licence key is not valid." }
    if (testKeys.has(key)) return { valid: true }
    const hit = cache.get(key)
    if (hit && hit.until > now()) return hit.result
    let result: LicenseResult
    if (provider === "lemonsqueezy") result = await lemonSqueezy(key)
    else if (provider === "polar") result = await polar(key)
    else if (provider === "dodopayments" || provider === "dodo") result = await dodo(key)
    else return { valid: false, reason: "Licence checks are not configured yet." }
    if (cache.size >= MAX_CACHE) cache.delete(cache.keys().next().value!)
    cache.set(key, { result, until: now() + (result.valid ? VALID_TTL : INVALID_TTL) })
    return result
  }
}

/** The key from `Authorization: Bearer <key>` or `x-ballmac-license: <key>`. */
export function keyFromHeaders(headers: Headers) {
  const auth = headers.get("authorization")
  if (auth?.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim()
  return headers.get("x-ballmac-license")?.trim() ?? null
}
