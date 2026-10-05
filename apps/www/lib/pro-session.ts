import "server-only"

import { validateLicense } from "@/lib/license"
import { createProGate } from "@/lib/pro-gate-core"
import { openSession, readCookie, SESSION_COOKIE } from "@/lib/pro-session-core"
import { clientId, licenseFailures } from "@/lib/rate-limit"
import { SITE_URL } from "@/lib/registry"

/** The secret that seals session cookies. Only a development fallback exists: a production server without the variable has no browser login. */
export const sessionSecret = () => process.env.PRO_SESSION_SECRET || (process.env.NODE_ENV === "production" ? "" : "ballmac-development-session-secret")
export const sessionConfigured = () => Boolean(sessionSecret())

/** Cookies are marked Secure everywhere except plain http on localhost. */
export const secureCookies = (req: Request) => new URL(req.url).protocol === "https:" || req.headers.get("x-forwarded-proto") === "https"

/** The licence key in the request's session cookie, or null. */
export const keyFromSession = (headers: Headers) => openSession(readCookie(headers.get("cookie"), SESSION_COOKIE), sessionSecret())

/** The same licence check as the CLI gate, for requests that carry the browser session instead of a header. */
export const sessionGate = createProGate({
  validate: validateLicense,
  limiter: licenseFailures,
  keyFromHeaders: keyFromSession,
  clientId,
  siteUrl: SITE_URL,
  missing: `Log in with your licence key at ${SITE_URL}/pro`,
})
