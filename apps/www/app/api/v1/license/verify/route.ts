import { keyFromHeaders, validateLicense } from "@/lib/license"
import { clientId, licenseFailures } from "@/lib/rate-limit"

// Lets the CLI setup guide, the MCP server and support check a key. Answers only valid or not, never details.
export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  const id = clientId(req.headers)
  if (licenseFailures.blocked(id)) return Response.json({ valid: false, reason: "Too many attempts. Try again in a few minutes." }, { status: 429, headers: { "cache-control": "no-store", "retry-after": "600" } })
  const body = (await req.json().catch(() => ({}))) as { key?: unknown }
  const key = typeof body.key === "string" ? body.key : keyFromHeaders(req.headers)
  try {
    const { valid, reason } = await validateLicense(key)
    if (!valid) licenseFailures.fail(id)
    return Response.json({ valid, ...(valid ? {} : { reason }) }, { headers: { "cache-control": "no-store" } })
  } catch {
    return Response.json({ valid: false, reason: "The licence server could not be reached. Try again in a minute." }, { status: 503, headers: { "cache-control": "no-store" } })
  }
}
