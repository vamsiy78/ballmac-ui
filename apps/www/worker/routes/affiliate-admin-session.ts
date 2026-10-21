import { signInEmail } from "@/lib/affiliate-email"
import { hashToken } from "@/lib/affiliates"
import { sameOrigin, readCookie } from "@/lib/pro-session-core"
import { createRateLimiter, clientId } from "@/lib/rate-limit"
import { resend } from "@/lib/resend"

export type AdminContext = { env: { AFFILIATES?: import("@cloudflare/workers-types").D1Database } }
export const ownerEmails = () =>
  (process.env.AFFILIATE_ADMIN_EMAILS ?? "")
    .split(",")
    .map((value: string) => value.trim().toLowerCase())
    .filter(Boolean)
export const ownerJson = (body: unknown, status = 200, session?: string) =>
  Response.json(body, {
    status,
    headers: {
      "cache-control": "no-store",
      "referrer-policy": "no-referrer",
      ...(session ? { "set-cookie": session } : {}),
    },
  })
const COOKIE = "bm_partner_admin"
const cookie = (req: Request, value: string, age: number) =>
  `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${age}${new URL(req.url).protocol === "https:" ? "; Secure" : ""}`
const limited = createRateLimiter({ max: 10, windowMs: 600_000 })
export async function adminIdentity(req: Request, { env }: AdminContext): Promise<string | null> {
  if (!env.AFFILIATES || !sameOrigin(req.headers, false)) return null
  const token = readCookie(req.headers.get("cookie"), COOKIE)
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null
  const session = await env.AFFILIATES.prepare(
    "SELECT email FROM affiliate_owner_sessions WHERE token_hash=? AND expires_at>?",
  )
    .bind(await hashToken(token), Date.now())
    .first<{ email: string }>()
  return session && ownerEmails().includes(session.email.toLowerCase()) ? session.email : null
}
export async function POST(req: Request, { env }: AdminContext) {
  if (!sameOrigin(req.headers, true)) return ownerJson({ error: "Please sign in from this site." }, 403)
  if (!env.AFFILIATES || !ownerEmails().length || !process.env.RESEND_API_KEY || !process.env.RESEND_FROM)
    return ownerJson(
      { error: "Owner sign-in needs the database, owner email allowlist and email service configured." },
      503,
    )
  if (limited(clientId(req.headers)))
    return ownerJson({ error: "Too many attempts. Try again in a few minutes." }, 429)
  const raw = await req.text()
  if (raw.length > 2000) return ownerJson({ error: "Invalid request." }, 413)
  let body: { action?: string; email?: unknown; code?: unknown }
  try {
    body = JSON.parse(raw)
  } catch {
    return ownerJson({ error: "Invalid request." }, 400)
  }
  if (!body || typeof body !== "object") return ownerJson({ error: "Invalid request." }, 400)
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return ownerJson({ error: "Enter a valid owner email." }, 422)
  if (body.action === "request") {
    const generic = () =>
      ownerJson({
        ok: true,
        message: "If this email is authorized to manage the program, a sign-in code is on its way.",
      })
    if (!ownerEmails().includes(email)) return generic()
    const now = Date.now(),
      code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1000000).padStart(6, "0")
    const challenge = await env.AFFILIATES.prepare(
      "INSERT INTO affiliate_owner_challenges (email,code_hash,expires_at,requested_at,attempts) VALUES (?,?,?,?,0) ON CONFLICT(email) DO UPDATE SET code_hash=excluded.code_hash,expires_at=excluded.expires_at,requested_at=excluded.requested_at,attempts=0 WHERE affiliate_owner_challenges.requested_at < ? RETURNING email",
    )
      .bind(email, await hashToken(`owner:${email}:${code}`), now + 600_000, now, now - 60_000)
      .first()
    if (!challenge) return generic()
    try {
      await resend("/emails", {
        method: "POST",
        body: {
          from: process.env.RESEND_FROM,
          to: [email],
          ...signInEmail(code, true),
        },
      })
    } catch {
      return ownerJson({ error: "We couldn’t send a code. Please try again in a minute." }, 502)
    }
    return generic()
  }
  if (body.action !== "verify" || typeof body.code !== "string" || !/^\d{6}$/.test(body.code))
    return ownerJson({ error: "Enter the six-digit code from your email." }, 422)
  if (!ownerEmails().includes(email)) return ownerJson({ error: "Invalid or expired code." }, 401)
  const attempt = await env.AFFILIATES.prepare(
    "UPDATE affiliate_owner_challenges SET attempts=attempts+1 WHERE email=? AND attempts<5 AND expires_at>? RETURNING email",
  )
    .bind(email, Date.now())
    .first()
  const consumed = attempt
    ? await env.AFFILIATES.prepare(
        "DELETE FROM affiliate_owner_challenges WHERE email=? AND code_hash=? AND attempts<=5 AND expires_at>? RETURNING email",
      )
        .bind(email, await hashToken(`owner:${email}:${body.code}`), Date.now())
        .first()
    : null
  if (!consumed) return ownerJson({ error: "Invalid or expired code. Request a new one." }, 401)
  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), (value) =>
    value.toString(16).padStart(2, "0"),
  ).join("")
  await env.AFFILIATES.batch([
    env.AFFILIATES.prepare("DELETE FROM affiliate_owner_sessions WHERE expires_at<?").bind(Date.now()),
    env.AFFILIATES.prepare(
      "INSERT INTO affiliate_owner_sessions (token_hash,email,expires_at) VALUES (?,?,?)",
    ).bind(await hashToken(token), email, Date.now() + 8 * 3600_000),
  ])
  return ownerJson({ ok: true }, 200, cookie(req, token, 8 * 3600))
}
export async function DELETE(req: Request, { env }: AdminContext) {
  if (!sameOrigin(req.headers, true)) return ownerJson({ error: "Please sign out from this site." }, 403)
  const token = readCookie(req.headers.get("cookie"), COOKIE)
  if (token && env.AFFILIATES)
    await env.AFFILIATES.prepare("DELETE FROM affiliate_owner_sessions WHERE token_hash=?")
      .bind(await hashToken(token))
      .run()
  return ownerJson({ ok: true }, 200, cookie(req, "", 0))
}
