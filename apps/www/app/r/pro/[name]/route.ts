import { readFile } from "node:fs/promises"
import { join } from "node:path"

import { keyFromHeaders, validateLicense } from "@/lib/license"
import { clientId, licenseFailures } from "@/lib/rate-limit"
import { SITE_URL } from "@/lib/registry"

// The private Pro registry. Every request is checked against the licence key, so nothing here is cached publicly.
export const dynamic = "force-dynamic"

const headers = { "cache-control": "private, no-store", "x-robots-tag": "noindex" }

export async function GET(req: Request, { params }: RouteContext<"/r/pro/[name]">) {
  const { name } = await params
  if (!/^[a-z0-9-]+\.json$/.test(name)) return Response.json({ error: "not_found", message: "No such Pro item." }, { status: 404, headers })
  const key = keyFromHeaders(req.headers)
  if (!key) {
    return Response.json(
      { error: "license_required", message: `Ballmac UI Pro items need a licence key. Set BALLMAC_LICENSE_KEY and add the @ballmac-pro registry: ${SITE_URL}/docs/pro` },
      { status: 401, headers: { ...headers, "www-authenticate": 'Bearer realm="Ballmac UI Pro"' } }
    )
  }
  const id = clientId(req.headers)
  if (licenseFailures.blocked(id)) return Response.json({ error: "rate_limited", message: "Too many invalid attempts. Try again in a few minutes." }, { status: 429, headers: { ...headers, "retry-after": "600" } })
  let check
  try {
    check = await validateLicense(key)
  } catch {
    return Response.json({ error: "license_check_failed", message: "The licence server could not be reached. Try again in a minute." }, { status: 503, headers })
  }
  if (!check.valid) licenseFailures.fail(id)
  if (!check.valid) return Response.json({ error: "license_invalid", message: `${check.reason ?? "This licence key is not valid."} Manage your licence at ${SITE_URL}/docs/pro` }, { status: 403, headers })
  try {
    const body = await readFile(join(process.cwd(), ".registry-pro", name), "utf8")
    return new Response(body, { headers: { ...headers, "content-type": "application/json; charset=utf-8" } })
  } catch {
    return Response.json({ error: "not_found", message: `No Pro item named "${name.replace(/\.json$/, "")}".` }, { status: 404, headers })
  }
}
