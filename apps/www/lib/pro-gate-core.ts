import type { LicenseResult } from "@/lib/license-core"

type Limiter = { blocked(id: string): boolean; fail(id: string): void }

export const proHeaders = { "cache-control": "private, no-store", "x-robots-tag": "noindex" }

/**
 * The licence check shared by everything private under /r/pro: the registry JSON and the starter downloads.
 * Returns null when the request may continue, or the response to send. Failed attempts are rate limited per address.
 */
export function createProGate({
  validate,
  limiter,
  keyFromHeaders,
  clientId,
  siteUrl,
}: {
  validate: (key: string) => Promise<LicenseResult>
  limiter: Limiter
  keyFromHeaders: (h: Headers) => string | null
  clientId: (h: Headers) => string
  siteUrl: string
}) {
  return async function gate(req: Request): Promise<Response | null> {
    const key = keyFromHeaders(req.headers)
    if (!key) {
      return Response.json(
        { error: "license_required", message: `Ballmac UI Pro items need a licence key. Set BALLMAC_LICENSE_KEY and add the @ballmac-pro registry: ${siteUrl}/docs/pro` },
        { status: 401, headers: { ...proHeaders, "www-authenticate": 'Bearer realm="Ballmac UI Pro"' } }
      )
    }
    const id = clientId(req.headers)
    if (limiter.blocked(id)) {
      return Response.json({ error: "rate_limited", message: "Too many invalid attempts. Try again in a few minutes." }, { status: 429, headers: { ...proHeaders, "retry-after": "600" } })
    }
    let check: LicenseResult
    try {
      check = await validate(key)
    } catch {
      return Response.json({ error: "license_check_failed", message: "The licence server could not be reached. Try again in a minute." }, { status: 503, headers: proHeaders })
    }
    if (!check.valid) {
      limiter.fail(id)
      return Response.json({ error: "license_invalid", message: `${check.reason ?? "This licence key is not valid."} Manage your licence at ${siteUrl}/docs/pro` }, { status: 403, headers: proHeaders })
    }
    return null
  }
}
