/**
 * Licence checks for Ballmac UI Pro, with no Next.js imports so it can be tested on its own.
 * Providers: Lemon Squeezy or Polar (both are merchants of record and issue licence keys), plus test keys for development.
 */
export type LicenseResult = { valid: boolean; reason?: string }

export type LicenseEnv = {
  BALLMAC_LICENSE_PROVIDER?: string
  BALLMAC_PRO_TEST_KEYS?: string
  LEMONSQUEEZY_STORE_ID?: string
  LEMONSQUEEZY_PRODUCT_IDS?: string
  POLAR_ORGANIZATION_ID?: string
  POLAR_BENEFIT_IDS?: string
  POLAR_API_URL?: string
}

const VALID_TTL = 10 * 60 * 1000
const INVALID_TTL = 60 * 1000
const MAX_CACHE = 5000

const list = (v?: string) => (v ?? "").split(",").map((s) => s.trim()).filter(Boolean)

export function createLicenseValidator(env: LicenseEnv, fetchImpl: typeof fetch = fetch, now: () => number = Date.now) {
  const cache = new Map<string, { result: LicenseResult; until: number }>()
  const testKeys = new Set(list(env.BALLMAC_PRO_TEST_KEYS))
  const provider = (env.BALLMAC_LICENSE_PROVIDER ?? "").toLowerCase()

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
