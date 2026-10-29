import { sameOrigin } from "@/lib/pro-session-core"
import { clientId, createRateLimiter } from "@/lib/rate-limit"
import { resend } from "@/lib/resend"
import { SAMPLER_BLOCKS } from "@/lib/sampler"
import { SITE_URL } from "@/lib/site-url"
import { parseSubscribe } from "@/lib/subscribe"

import { readProItem } from "../pro-store"

// The free Pro sampler: three blocks, in return for an email address. The address joins the Ballmac UI audience (the form says so), so it also gets the two
// deadline reminders whenever a founding offer runs. The code is returned straight away; failing to save the address does not withhold it, but is logged.

const limited = createRateLimiter({ max: 6, windowMs: 10 * 60_000 })
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "cache-control": "private, no-store", "x-robots-tag": "noindex" } })

export async function POST(request: Request, { env }: { env: Env }) {
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

  const items = (await Promise.all(SAMPLER_BLOCKS.map((name) => readProItem(env, name)))).filter((i) => i !== null)
  if (items.length === 0) return json({ error: "The sampler is not available in this build." }, 503)

  // The address is always kept: the form says we keep it to tell them about Pro. The deadline reminders only go out while a founding offer is running
  // (scripts/schedule-reminders.ts refuses without one), so saving it outside one sends nothing on its own.
  const audience = process.env.RESEND_AUDIENCE_ID
  if (audience && process.env.RESEND_API_KEY) {
    try {
      await resend("/contacts", { method: "POST", body: { email: parsed.email, unsubscribed: false, segments: [{ id: audience }] } })
    } catch (err) {
      console.error("sampler: could not save the address", err instanceof Error ? err.message : err)
    }
  }
  // The form promises one short personal note, so the owner hears about every signup and can write it. Reply-to is the visitor, so answering is one click.
  const to = process.env.CONTACT_TO_EMAIL
  const from = process.env.RESEND_FROM
  if (process.env.RESEND_API_KEY && to && from) {
    try {
      const country = request.headers.get("cf-ipcountry") ?? "unknown country"
      await resend("/emails", { method: "POST", body: { from, to: [to], reply_to: parsed.email, subject: `Sampler signup: ${parsed.email}`, text: `${parsed.email} (${country}) took the free three-block sampler on ${SITE_URL}.\n\nThey were promised one short personal note. Reply to this email to write to them.` } })
    } catch (err) {
      console.error("sampler: owner email failed", err instanceof Error ? err.message : err)
    }
  }
  return json({ ok: true, items })
}
