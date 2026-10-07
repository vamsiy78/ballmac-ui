import { reminderContextFromEnv } from "@/lib/reminder-emails"
import { sameOrigin } from "@/lib/pro-session-core"
import { readProItem } from "@/lib/pro-source"
import { clientId, createRateLimiter } from "@/lib/rate-limit"
import { resend } from "@/lib/resend"
import { SAMPLER_BLOCKS } from "@/lib/sampler"
import { SITE_URL } from "@/lib/site-url"
import { parseSubscribe } from "@/lib/subscribe"

// The free Pro sampler: three blocks, in return for an email address. The address joins the reminder audience (the form says so), so the buyer also gets the two
// deadline reminders. The code is returned straight away; failing to save the address does not withhold it, but is logged.
export const dynamic = "force-dynamic"

const limited = createRateLimiter({ max: 6, windowMs: 10 * 60_000 })
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "cache-control": "private, no-store", "x-robots-tag": "noindex" } })

export async function POST(request: Request) {
  if (!sameOrigin(request.headers, true)) return json({ error: "This request came from another site." }, 403)
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
  if (parsed.bot) return json({ ok: true, items: [] })
  if (limited(clientId(request.headers))) return json({ error: "Too many requests. Please try again in a few minutes." }, 429)

  const items = (await Promise.all(SAMPLER_BLOCKS.map((name) => readProItem(name)))).filter((i) => i !== null)
  if (items.length === 0) return json({ error: "The sampler is not available in this build." }, 503)

  // Only while a founding offer with a deadline is running is there anything to remind them about.
  const audience = process.env.RESEND_AUDIENCE_ID
  if (audience && process.env.RESEND_API_KEY && reminderContextFromEnv(process.env, SITE_URL)) {
    try {
      await resend("/contacts", { method: "POST", body: { email: parsed.email, unsubscribed: false, segments: [{ id: audience }] } })
    } catch (err) {
      console.error("sampler: could not save the address", err instanceof Error ? err.message : err)
    }
  }
  return json({ ok: true, items })
}
