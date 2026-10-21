import { signInEmail } from "@/lib/affiliate-email"
import { hashToken } from "@/lib/affiliates"
import { sameOrigin, readCookie } from "@/lib/pro-session-core"
import { createRateLimiter, clientId } from "@/lib/rate-limit"
import { resend } from "@/lib/resend"

type Context = { env: { AFFILIATES?: import("@cloudflare/workers-types").D1Database } }
const limited = createRateLimiter({ max: 12, windowMs: 600_000 })
const COOKIE = "bm_partner"
const cookie = (req: Request, token: string, age: number) =>
  `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${age}${new URL(req.url).protocol === "https:" ? "; Secure" : ""}`
const json = (body: unknown, status = 200, session?: string) =>
  Response.json(body, {
    status,
    headers: { "cache-control": "no-store", ...(session ? { "set-cookie": session } : {}) },
  })
const generic = () =>
  json({ ok: true, message: "If this email belongs to an approved partner, a sign-in code is on its way." })

export async function POST(req: Request, { env }: Context) {
  if (!sameOrigin(req.headers, true)) return json({ error: "Please sign in from this site." }, 403)
  if (!env.AFFILIATES) return json({ error: "Partner sign-in is not available yet." }, 503)
  if (limited(clientId(req.headers)))
    return json({ error: "Too many attempts. Try again in a few minutes." }, 429)
  const raw = await req.text()
  if (raw.length > 2000) return json({ error: "Invalid request." }, 413)
  let body: { action?: string; email?: string; code?: string; key?: string }
  try {
    body = JSON.parse(raw)
  } catch {
    return json({ error: "Invalid request." }, 400)
  }
  if (!body || typeof body !== "object") return json({ error: "Invalid request." }, 400)
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
  let affiliate: { id: string } | null = null
  if (body.action === "request") {
    if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM)
      return json({ error: "Email sign-in is not set up yet. Use your partner access key below." }, 503)
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return json({ error: "Enter a valid email address." }, 422)
    affiliate = await env.AFFILIATES.prepare(
      "SELECT id FROM affiliates WHERE email=? AND status IN ('active','paused')",
    )
      .bind(email)
      .first<{ id: string }>()
    if (!affiliate) return generic()
    const now = Date.now()
    const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1000000).padStart(6, "0")
    const challenge = await env.AFFILIATES.prepare(
      "INSERT INTO affiliate_challenges (email,affiliate_id,code_hash,expires_at,requested_at,attempts) VALUES (?,?,?,?,?,0) ON CONFLICT(email) DO UPDATE SET code_hash=excluded.code_hash, expires_at=excluded.expires_at, requested_at=excluded.requested_at, attempts=0 WHERE affiliate_challenges.requested_at < ? RETURNING email",
    )
      .bind(email, affiliate.id, await hashToken(`${email}:${code}`), now + 600_000, now, now - 60_000)
      .first()
    if (!challenge) return generic()
    try {
      await resend("/emails", {
        method: "POST",
        body: {
          from: process.env.RESEND_FROM,
          to: [email],
          ...signInEmail(code),
        },
      })
    } catch {
      return json(
        { error: "We couldn’t send a code. Try again in a minute or use your partner access key." },
        502,
      )
    }
    return generic()
  }
  if (body.action === "verify") {
    if (
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      typeof body.code !== "string" ||
      !/^\d{6}$/.test(body.code)
    )
      return json({ error: "Enter the six-digit code from your email." }, 422)
    // The durable counter bounds guesses across Worker isolates. Consumption is atomic and one-time.
    const attempt = await env.AFFILIATES.prepare(
      "UPDATE affiliate_challenges SET attempts=attempts+1 WHERE email=? AND attempts<5 AND expires_at>? RETURNING affiliate_id",
    )
      .bind(email, Date.now())
      .first()
    if (attempt)
      affiliate = await env.AFFILIATES.prepare(
        "DELETE FROM affiliate_challenges WHERE email=? AND code_hash=? AND expires_at>? AND attempts<=5 RETURNING affiliate_id AS id",
      )
        .bind(email, await hashToken(`${email}:${body.code}`), Date.now())
        .first<{ id: string }>()
  } else if (body.action === "key") {
    if (typeof body.key === "string" && /^[a-f0-9]{64}$/.test(body.key.trim()))
      affiliate = await env.AFFILIATES.prepare(
        "SELECT id FROM affiliates WHERE token_hash=? AND status IN ('active','paused')",
      )
        .bind(await hashToken(body.key.trim()))
        .first<{ id: string }>()
  } else return json({ error: "Invalid sign-in request." }, 400)
  if (!affiliate)
    return json(
      {
        error:
          body.action === "verify"
            ? "That code is invalid or expired. Request a new one."
            : "That access key is not valid.",
      },
      401,
    )
  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), (n) =>
    n.toString(16).padStart(2, "0"),
  ).join("")
  await env.AFFILIATES.batch([
    env.AFFILIATES.prepare("DELETE FROM affiliate_sessions WHERE expires_at < ?").bind(Date.now()),
    env.AFFILIATES.prepare(
      "INSERT INTO affiliate_sessions (token_hash,affiliate_id,expires_at) VALUES (?,?,?)",
    ).bind(await hashToken(token), affiliate.id, Date.now() + 30 * 86400_000),
  ])
  return json({ ok: true }, 200, cookie(req, token, 30 * 86400))
}
export async function DELETE(req: Request, { env }: Context) {
  if (!sameOrigin(req.headers, true)) return json({ error: "Please sign out from this site." }, 403)
  const token = readCookie(req.headers.get("cookie"), COOKIE)
  if (token && env.AFFILIATES)
    await env.AFFILIATES.prepare("DELETE FROM affiliate_sessions WHERE token_hash=?")
      .bind(await hashToken(token))
      .run()
  return json({ ok: true }, 200, cookie(req, "", 0))
}
