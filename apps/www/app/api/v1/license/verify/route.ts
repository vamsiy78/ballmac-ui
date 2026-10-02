import { keyFromHeaders, validateLicense } from "@/lib/license"

// Lets the CLI setup guide, the MCP server and support check a key. Answers only valid or not, never details.
export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { key?: unknown }
  const key = typeof body.key === "string" ? body.key : keyFromHeaders(req.headers)
  try {
    const { valid, reason } = await validateLicense(key)
    return Response.json({ valid, ...(valid ? {} : { reason }) }, { headers: { "cache-control": "no-store" } })
  } catch {
    return Response.json({ valid: false, reason: "The licence server could not be reached. Try again in a minute." }, { status: 503, headers: { "cache-control": "no-store" } })
  }
}
