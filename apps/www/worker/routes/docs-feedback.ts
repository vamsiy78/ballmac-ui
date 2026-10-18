import { feedbackEmail, parseFeedback } from "../../lib/docs-feedback"
import { clientId, createRateLimiter } from "../../lib/rate-limit"
import { resend } from "../../lib/resend"
import { SITE_URL } from "../../lib/site-url"

/**
 * `POST /api/docs-feedback` { page, helpful, comment? }. Every vote is written to the Worker's log as one JSON line (event "docs-feedback"), which Cloudflare's
 * Workers Logs can filter and count by page. A "no" with a comment is also emailed to the team (the private inbox, as for the support form) when email is set up.
 */
const limited = createRateLimiter({ max: 20, windowMs: 10 * 60_000 })
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "cache-control": "no-store" } })

export async function POST(request: Request) {
  const raw = await request.text()
  if (raw.length > 4_000) return json({ error: "Too long." }, 413)
  let body: unknown
  try {
    body = JSON.parse(raw)
  } catch {
    return json({ error: "Invalid request." }, 400)
  }
  if (limited(clientId(request.headers))) return json({ error: "Too many requests." }, 429)
  const feedback = parseFeedback(body)
  if (!feedback) return json({ error: "Invalid request." }, 400)

  console.log(JSON.stringify({ event: "docs-feedback", ...feedback }))
  const to = process.env.CONTACT_TO_EMAIL
  const from = process.env.RESEND_FROM
  if (feedback.comment && process.env.RESEND_API_KEY && to && from) {
    try {
      await resend("/emails", { method: "POST", body: { from, to: [to], ...feedbackEmail(feedback, SITE_URL) } })
    } catch (err) {
      // The vote is already logged; a failed email is not the reader's problem.
      console.error("docs-feedback: email failed", err instanceof Error ? err.message : err)
    }
  }
  return json({ ok: true })
}
