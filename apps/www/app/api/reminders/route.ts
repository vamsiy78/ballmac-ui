import { reminderConfirmEmail, reminderContextFromEnv } from "@/lib/reminder-emails"
import { sameOrigin } from "@/lib/pro-session-core"
import { clientId, createRateLimiter } from "@/lib/rate-limit"
import { resend } from "@/lib/resend"
import { SITE_URL } from "@/lib/site-url"
import { parseSubscribe } from "@/lib/subscribe"

// "Remind me before the founding price ends": saves the address in a Resend audience, which the two deadline reminders are scheduled to
// (see scripts/schedule-reminders.ts), and sends a short confirmation. Nothing else is sent to this list.
export const dynamic = "force-dynamic"

const limited = createRateLimiter({ max: 5, windowMs: 10 * 60_000 })
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "cache-control": "no-store" } })

export async function POST(request: Request) {
  if (!sameOrigin(request.headers, true)) return json({ error: "This request came from another site." }, 403)
  const audience = process.env.RESEND_AUDIENCE_ID
  const from = process.env.RESEND_FROM
  const context = reminderContextFromEnv(process.env, SITE_URL)
  if (!process.env.RESEND_API_KEY || !audience || !from) {
    console.error("reminders: RESEND_API_KEY, RESEND_AUDIENCE_ID and RESEND_FROM must be set")
    return json({ error: "Reminders are not set up yet." }, 503)
  }
  if (!context) return json({ error: "There is no founding offer to remind you about right now." }, 409)

  const raw = await request.text()
  if (raw.length > 2_000) return json({ error: "That request is too long." }, 413)
  let body: unknown
  try {
    body = JSON.parse(raw)
  } catch {
    return json({ error: "Invalid request." }, 400)
  }
  const parsed = parseSubscribe(body)
  if ("error" in parsed) return json({ error: parsed.error }, 422)
  if (parsed.bot) return json({ ok: true })
  if (limited(clientId(request.headers))) return json({ error: "Too many requests. Please try again in a few minutes." }, 429)

  try {
    await resend(`/audiences/${audience}/contacts`, { method: "POST", body: { email: parsed.email, unsubscribed: false } })
  } catch (err) {
    console.error("reminders: could not save the address", err instanceof Error ? err.message : err)
    return json({ error: "We could not save your address. Please try again." }, 502)
  }
  // The confirmation is a courtesy: the address is already saved.
  let confirmation = true
  try {
    const replyTo = process.env.CONTACT_REPLY_TO
    await resend("/emails", { method: "POST", body: { from, to: [parsed.email], ...(replyTo && { reply_to: replyTo }), ...reminderConfirmEmail(context) } })
  } catch (err) {
    confirmation = false
    console.error("reminders: confirmation failed", err instanceof Error ? err.message : err)
  }
  return json({ ok: true, confirmation })
}
