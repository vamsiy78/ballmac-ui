/**
 * Who holds a founding licence, read from Dodo's list of licence keys for the founding product. It does two quiet jobs and shows nothing to visitors:
 *   - ends the founding offer once the licence cap is reached, even before the deadline;
 *   - tells the founders area whether a key belongs to a founding buyer.
 *
 * Needs DODO_API_KEY and DODO_FOUNDING_PRODUCT_ID. With either missing it knows nothing: the offer ends only by the deadline and the founders area stays closed. If Dodo
 * cannot be reached it keeps the last list it had. No framework imports, so it can be tested on its own.
 */
/** The variables it reads: DODO_MODE, DODO_API_URL, DODO_API_KEY, DODO_FOUNDING_PRODUCT_ID and NEXT_PUBLIC_PRO_FOUNDING_LIMIT. */
export type LedgerEnv = Record<string, string | undefined>

const TTL = 5 * 60 * 1000
const PAGE = 100
const MAX_PAGES = 20

export function createFoundingLedger(env: LedgerEnv, fetchImpl: typeof fetch = fetch, now: () => number = Date.now) {
  const product = env.DODO_FOUNDING_PRODUCT_ID?.trim()
  const apiKey = env.DODO_API_KEY?.trim()
  const base = env.DODO_API_URL ?? (env.DODO_MODE === "test" ? "https://test.dodopayments.com" : "https://live.dodopayments.com")
  let cached: { keys: Set<string>; at: number } | null = null
  let loading: Promise<Set<string>> | null = null

  async function load(): Promise<Set<string>> {
    const keys = new Set<string>()
    for (let page = 0; page < MAX_PAGES; page++) {
      const query = new URLSearchParams({ product_id: product!, status: "active", page_size: String(PAGE), page_number: String(page) })
      const res = await fetchImpl(`${base}/license_keys?${query}`, { headers: { accept: "application/json", authorization: `Bearer ${apiKey}` }, signal: AbortSignal.timeout(15_000) })
      if (!res.ok) throw new Error(`Dodo Payments returned ${res.status} for the founding licence list`)
      const body = (await res.json().catch(() => ({}))) as { items?: { key?: unknown }[] } | { key?: unknown }[]
      const items = Array.isArray(body) ? body : (body.items ?? [])
      for (const item of items) if (typeof item.key === "string") keys.add(item.key)
      if (items.length < PAGE) break
    }
    return keys
  }

  /** The founding keys, or null when this deployment cannot know them (not configured, or Dodo has never answered). */
  async function keys(): Promise<Set<string> | null> {
    if (!product || !apiKey) return null
    if (cached && now() - cached.at < TTL) return cached.keys
    loading ??= load().finally(() => {
      loading = null
    })
    try {
      const fresh = await loading
      cached = { keys: fresh, at: now() }
      return fresh
    } catch (err) {
      console.error(`founding ledger: ${(err as Error).message}`)
      if (cached) return cached.keys
      return null
    }
  }

  return {
    configured: Boolean(product && apiKey),
    /** True when the founding product has reached the licence cap. False when it has not, or when that cannot be known. */
    async isFull(): Promise<boolean> {
      const limit = Number(env.NEXT_PUBLIC_PRO_FOUNDING_LIMIT)
      if (!Number.isInteger(limit) || limit < 1) return false
      const k = await keys()
      return k ? k.size >= limit : false
    },
    /** True when the key was issued for the founding product. */
    async isFounder(key: string): Promise<boolean> {
      const k = await keys()
      return Boolean(k?.has(key.trim()))
    },
  }
}

export type FoundingLedger = ReturnType<typeof createFoundingLedger>
