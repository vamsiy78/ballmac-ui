/** Small in-memory limiter for failed licence attempts. Per instance, which is enough to slow key guessing. */
export function createFailureLimiter({ max = 20, windowMs = 10 * 60 * 1000, now = Date.now } = {}) {
  const hits = new Map<string, { count: number; reset: number }>()
  return {
    blocked(id: string) {
      const h = hits.get(id)
      if (!h) return false
      if (h.reset <= now()) return hits.delete(id), false
      return h.count >= max
    },
    fail(id: string) {
      const t = now()
      const h = hits.get(id)
      if (!h || h.reset <= t) {
        if (hits.size > 10_000) hits.clear()
        hits.set(id, { count: 1, reset: t + windowMs })
      } else h.count++
    },
  }
}

export function clientId(headers: Headers) {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "unknown"
}

export const licenseFailures = createFailureLimiter()

/** A best-effort limiter for form endpoints: more than `max` requests in `windowMs` from one key is limited. Per instance, which blunts casual abuse. */
export function createRateLimiter({ max, windowMs, now = Date.now }: { max: number; windowMs: number; now?: () => number }) {
  const hits = new Map<string, number[]>()
  return function isLimited(key: string): boolean {
    const t = now()
    const recent = (hits.get(key) ?? []).filter((x) => t - x < windowMs)
    recent.push(t)
    hits.set(key, recent)
    if (hits.size > 5_000) hits.clear()
    return recent.length > max
  }
}
