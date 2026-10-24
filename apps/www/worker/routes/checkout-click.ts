import { clickEmail, isBot, parseClick } from "../../lib/checkout-click"
import { clientId, createRateLimiter } from "../../lib/rate-limit"
import { resend } from "../../lib/resend"
import { SITE_URL } from "../../lib/site-url"

/**
 * `POST /api/checkout-click` { plan, page, utm?, from? }, sent by the Buy buttons as the visitor leaves for the Dodo checkout. Every click is written to the
 * Worker's log as one JSON line (event "checkout-click"), which Workers Logs can count by page and plan, and the owner gets an email. The email is held back for
 * crawlers, requests from other sites, and repeats: one per visitor and plan every ten minutes, and a small ceiling per hour, so a script cannot flood the inbox.
 */
const perVisitor = createRateLimiter({ max: 1, windowMs: 10 * 60_000 })
const overall = createRateLimiter({ max: 30, windowMs: 60 * 60_000 })
const ok = () => new Response(null, { status: 204, headers: { "cache-control": "no-store" } })

export async function POST(request: Request) {
  // The beacon is sent as text/plain, which needs no CORS preflight; the body is still JSON.
  const raw = await request.text()
  if (raw.length > 1_000) return new Response(null, { status: 413 })
  let body: unknown
  try {
    body = JSON.parse(raw)
  } catch {
    return new Response(null, { status: 400 })
  }
  const click = parseClick(body)
  if (!click) return new Response(null, { status: 400 })

  const origin = request.headers.get("origin")
  const sameSite = !origin || new URL(origin).host === new URL(request.url).host || origin === SITE_URL
  if (!sameSite || isBot(request.headers.get("user-agent"))) return ok()

  console.log(JSON.stringify({ event: "checkout-click", ...click, country: request.headers.get("cf-ipcountry") ?? undefined }))

  if (perVisitor(`${clientId(request.headers)}:${click.plan}`) || overall("all")) return ok()
  const to = process.env.CONTACT_TO_EMAIL
  const from = process.env.RESEND_FROM
  if (process.env.RESEND_API_KEY && to && from) {
    try {
      await resend("/emails", { method: "POST", body: { from, to: [to], ...clickEmail(click, { country: request.headers.get("cf-ipcountry"), siteUrl: SITE_URL }) } })
    } catch (err) {
      console.error("checkout-click: email failed", err instanceof Error ? err.message : err)
    }
  }
  return ok()
}
