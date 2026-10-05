import { validateLicense } from "@/lib/license"
import { proHeaders } from "@/lib/pro-gate"
import { secureCookies, sessionConfigured, sessionGate, keyFromSession, sessionSecret } from "@/lib/pro-session"
import { endCookies, sameOrigin, sealSession, startCookies } from "@/lib/pro-session-core"
import { clientId, licenseFailures } from "@/lib/rate-limit"

// The browser login for Ballmac UI Pro: paste a licence key, get a session cookie. See lib/pro-session-core.ts.
export const dynamic = "force-dynamic"

const json = (body: unknown, status = 200, cookies: string[] = []) => {
  const headers = new Headers(proHeaders)
  for (const c of cookies) headers.append("set-cookie", c)
  return Response.json(body, { status, headers })
}

/** Starts a session: validates the key and sets the cookies. */
export async function POST(req: Request) {
  if (!sameOrigin(req.headers, true)) return json({ valid: false, reason: "This request came from another site." }, 403)
  if (!sessionConfigured()) return json({ valid: false, reason: "Browser login is not set up on this site yet. Use the CLI with your key meanwhile." }, 503)
  const id = clientId(req.headers)
  if (licenseFailures.blocked(id)) return json({ valid: false, reason: "Too many attempts. Try again in a few minutes." }, 429)
  const body = (await req.json().catch(() => ({}))) as { key?: unknown }
  const key = typeof body.key === "string" ? body.key.trim() : ""
  if (!key) return json({ valid: false, reason: "Paste your licence key." }, 400)
  try {
    const { valid, reason } = await validateLicense(key)
    if (!valid) {
      licenseFailures.fail(id)
      return json({ valid: false, reason: reason ?? "This licence key is not valid." }, 403)
    }
  } catch {
    return json({ valid: false, reason: "The licence server could not be reached. Try again in a minute." }, 503)
  }
  return json({ valid: true }, 200, startCookies(await sealSession(key, sessionSecret()), secureCookies(req)))
}

/** The current session: the key (for the setup snippets) while it is still valid. A revoked key ends the session. */
export async function GET(req: Request) {
  if (!sameOrigin(req.headers, false)) return json({ valid: false }, 403)
  const key = await keyFromSession(req.headers)
  if (!key) return json({ valid: false }, 401, req.headers.get("cookie")?.includes("bm_pro") ? endCookies(secureCookies(req)) : [])
  const denied = await sessionGate(req)
  if (denied) return json({ valid: false }, denied.status === 403 ? 401 : denied.status, denied.status === 403 ? endCookies(secureCookies(req)) : [])
  return json({ valid: true, key })
}

/** Ends the session. */
export async function DELETE(req: Request) {
  if (!sameOrigin(req.headers, true)) return json({ ok: false }, 403)
  return json({ ok: true }, 200, endCookies(secureCookies(req)))
}
