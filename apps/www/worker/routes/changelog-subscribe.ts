import { sameOrigin } from "../../lib/pro-session-core"
import { clientId, createRateLimiter } from "../../lib/rate-limit"
import { resend } from "../../lib/resend"
import { SITE_URL } from "../../lib/site-url"
import { parseSubscribe } from "../../lib/subscribe"

/**
 * `POST /api/changelog-subscribe` { email }: adds the address to the release notes audience in Resend (RESEND_CHANGELOG_AUDIENCE_ID) and sends a short confirmation.
 * Release notes themselves are sent from Resend as a broadcast to that audience, which carries its own unsubscribe link. Not set up until the audience id is.
 */
const limited = createRateLimiter({ max: 5, windowMs: 10 * 60_000 })
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "cache-control": "no-store" } })

export async function POST(request: Request) {
  if (!sameOrigin(request.headers, true)) return json({ error: "This request came from another site." }, 403)
  const audience = process.env.RESEND_CHANGELOG_AUDIENCE_ID
  const from = process.env.RESEND_FROM
  if (!process.env.RESEND_API_KEY || !audience || !from) return json({ error: "Release notes by email are not set up yet. Use the RSS feed for now." }, 503)

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
    await resend("/contacts", { method: "POST", body: { email: parsed.email, unsubscribed: false, segments: [{ id: audience }] } })
  } catch (err) {
    console.error("changelog-subscribe: could not save the address", err instanceof Error ? err.message : err)
    return json({ error: "We could not save your address. Please try again." }, 502)
  }
  // The confirmation is a courtesy: the address is already saved.
  try {
    const replyTo = process.env.CONTACT_REPLY_TO
    await resend("/emails", {
      method: "POST",
      body: {
        from,
        to: [parsed.email],
        ...(replyTo && { reply_to: replyTo }),
        subject: "You're subscribed to Ballmac UI release notes",
        text: `You'll get an email when we ship something new in Ballmac UI, about once or twice a month. Every email has an unsubscribe link.\n\nWhat's new so far: ${SITE_URL}/changelog\n`,
      },
    })
  } catch (err) {
    console.error("changelog-subscribe: confirmation failed", err instanceof Error ? err.message : err)
  }
  return json({ ok: true })
}
