import { clientId, createRateLimiter } from "@/lib/rate-limit"
import { resend } from "@/lib/resend"
import { parseSupport, validateSupport } from "@/lib/support"
import { supportTeamEmail, supportUserEmail } from "@/lib/support-emails"
import { SITE_URL } from "@/lib/site-url"

// The support form: emails the team (the private inbox in CONTACT_TO_EMAIL, never shown to anyone) with the sender as Reply-To, and sends the
// sender a confirmation whose Reply-To is the public address (CONTACT_REPLY_TO). Same setup as ballmac.com.
export const dynamic = "force-dynamic"

const MAX_BODY_BYTES = 16_000
const limited = createRateLimiter({ max: 5, windowMs: 10 * 60_000 })
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "cache-control": "no-store" } })

export async function POST(request: Request) {
  const to = process.env.CONTACT_TO_EMAIL
  const from = process.env.RESEND_FROM
  // Never falls back to CONTACT_TO_EMAIL: that inbox is private.
  const replyTo = process.env.CONTACT_REPLY_TO
  if (!process.env.RESEND_API_KEY || !to || !from) {
    console.error("support: RESEND_API_KEY, CONTACT_TO_EMAIL and RESEND_FROM must be set")
    return json({ error: "Support messages are not set up yet. Please email us instead." }, 503)
  }

  const raw = await request.text()
  if (raw.length > MAX_BODY_BYTES) return json({ error: "That message is too long." }, 413)
  let body: unknown
  try {
    body = JSON.parse(raw)
  } catch {
    return json({ error: "Invalid request." }, 400)
  }

  // Honeypot: a hidden field people never fill in. Pretend success for bots.
  if ((body as { website?: unknown })?.website) return json({ ok: true, confirmation: true })
  if (limited(clientId(request.headers))) return json({ error: "Too many messages. Please try again in a few minutes." }, 429)

  const support = parseSupport(body)
  if (!support) return json({ error: "Invalid request." }, 400)
  const errors = validateSupport(support)
  if (Object.keys(errors).length) return json({ error: "Please check the form.", errors }, 422)

  try {
    await resend("/emails", { method: "POST", body: { from, to: [to], reply_to: support.email, ...supportTeamEmail(support) } })
  } catch (err) {
    console.error("support: team notification failed", err instanceof Error ? err.message : err)
    return json({ error: "We could not send your message. Please try again, or email us." }, 502)
  }

  // The confirmation is a courtesy: the message has already reached us.
  let confirmation = true
  try {
    await resend("/emails", { method: "POST", body: { from, to: [support.email], ...(replyTo && { reply_to: replyTo }), ...supportUserEmail(support, SITE_URL) } })
  } catch (err) {
    confirmation = false
    console.error("support: confirmation failed", err instanceof Error ? err.message : err)
  }
  return json({ ok: true, confirmation })
}
