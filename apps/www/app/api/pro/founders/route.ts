import { cleanName, FOUNDERS_EMAIL, isVoteId, maskKey, voteOptions } from "@/lib/founders"
import { founders } from "@/lib/offer"
import { proHeaders as headers } from "@/lib/pro-gate"
import { sameOrigin } from "@/lib/pro-session-core"
import { keyFromSession, sessionGate } from "@/lib/pro-session"
import { clientId, createRateLimiter } from "@/lib/rate-limit"
import { resend } from "@/lib/resend"

// The Founders desk in the Pro library: only for buyers of the founding product. They can ask to be listed on the Founders page (by name) and vote on the next blocks.
// Both arrive in the private inbox (CONTACT_TO_EMAIL) with the licence key masked, and are added by hand. Nothing here is public.
export const dynamic = "force-dynamic"

const limited = createRateLimiter({ max: 10, windowMs: 10 * 60_000 })
const reply = (body: unknown, status = 200) => Response.json(body, { status, headers })

async function founderKey(req: Request) {
  const denied = await sessionGate(req)
  if (denied) return { denied }
  const key = await keyFromSession(req.headers)
  return { key, eligible: key ? await founders.isFounder(key) : false }
}

export async function GET(req: Request) {
  const who = await founderKey(req)
  if (who.denied) return who.denied
  return reply({ eligible: who.eligible, configured: founders.configured, email: FOUNDERS_EMAIL, options: who.eligible ? voteOptions : [] })
}

export async function POST(req: Request) {
  if (!sameOrigin(req.headers, true)) return reply({ error: "This request came from another site." }, 403)
  const who = await founderKey(req)
  if (who.denied) return who.denied
  if (!who.eligible || !who.key) return reply({ error: "The Founders desk is for founding licences." }, 403)
  if (limited(clientId(req.headers))) return reply({ error: "Too many requests. Please try again in a few minutes." }, 429)
  const to = process.env.CONTACT_TO_EMAIL
  const from = process.env.RESEND_FROM
  if (!process.env.RESEND_API_KEY || !to || !from) return reply({ error: "This is not set up yet. Please email us instead." }, 503)

  const raw = await req.text()
  if (raw.length > 4_000) return reply({ error: "That request is too long." }, 413)
  let body: { kind?: unknown; name?: unknown; choices?: unknown }
  try {
    body = JSON.parse(raw)
  } catch {
    return reply({ error: "Invalid request." }, 400)
  }
  const who_ = `Licence ${maskKey(who.key)}`
  let subject: string
  let text: string
  if (body.kind === "name") {
    const name = cleanName(body.name)
    if (name.length < 2) return reply({ error: "Please enter the name you want listed." }, 422)
    subject = "[Founders] List my name"
    text = `${who_} asks to be listed on the Founders page as:\n\n${name}\n\nAdd it to founderNames in apps/www/lib/founders.ts.`
  } else if (body.kind === "vote") {
    const choices = Array.isArray(body.choices) ? [...new Set(body.choices.filter(isVoteId))].slice(0, 3) : []
    if (choices.length === 0) return reply({ error: "Choose at least one." }, 422)
    subject = "[Founders] Vote for the next blocks"
    text = `${who_} votes for:\n\n${choices.map((id) => `- ${voteOptions.find((o) => o.id === id)!.label}`).join("\n")}`
  } else {
    return reply({ error: "Invalid request." }, 400)
  }
  try {
    await resend("/emails", { method: "POST", body: { from, to: [to], subject, text } })
  } catch (err) {
    console.error("founders: could not send", err instanceof Error ? err.message : err)
    return reply({ error: "We could not send that. Please try again, or email us." }, 502)
  }
  return reply({ ok: true })
}
