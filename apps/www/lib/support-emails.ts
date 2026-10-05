// Email bodies for support requests. Server-only: imported by /api/support. Every user-supplied value is HTML-escaped.
import { topicSubject, supportPlans, type SupportRequest } from "./support"

export const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!)

const planLabel = (r: SupportRequest) => supportPlans.find((p) => p.id === r.plan)?.label ?? "Free"

function layout(title: string, inner: string) {
  return `<!doctype html><html><body style="margin:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#171717">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e5e5e5;border-radius:16px">
<tr><td style="padding:32px">
<p style="margin:0 0 24px;font-size:15px;font-weight:600;letter-spacing:-0.01em">Ballmac UI</p>
<h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;letter-spacing:-0.02em">${esc(title)}</h1>
${inner}
</td></tr></table>
</td></tr></table></body></html>`
}

function rows(r: SupportRequest): [string, string][] {
  return [
    ["Topic", topicSubject(r.topic)],
    ["Plan", planLabel(r)],
    ["Name", r.name || "—"],
    ["Email", r.email],
    ["About", r.item || "—"],
  ]
}

function details(r: SupportRequest) {
  const tr = rows(r)
    .map(([k, v]) => `<tr><td style="padding:6px 16px 6px 0;color:#737373;font-size:14px;white-space:nowrap;vertical-align:top">${k}</td><td style="padding:6px 0;font-size:14px">${esc(v)}</td></tr>`)
    .join("")
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px">${tr}</table>
<div style="padding:16px;background:#fafafa;border:1px solid #e5e5e5;border-radius:12px;font-size:14px;line-height:1.6;white-space:pre-wrap">${esc(r.message)}</div>`
}

const textDetails = (r: SupportRequest) => `${rows(r).map(([k, v]) => `${k}: ${v}`).join("\n")}\n\n${r.message}`

/** First line of the message, shortened, for a scannable subject. */
const summary = (message: string) => {
  const first = (message.split("\n")[0] ?? "").trim()
  return first.length > 60 ? `${first.slice(0, 57)}…` : first
}

/** Sent to the team. Reply-To is the sender, so Reply answers them. */
export function supportTeamEmail(r: SupportRequest) {
  return {
    subject: `[Ballmac UI ${planLabel(r)}] ${topicSubject(r.topic)}: ${summary(r.message)}`,
    html: layout(topicSubject(r.topic), `<p style="margin:0 0 20px;font-size:15px;line-height:1.6">Sent from the Ballmac UI support page. Reply to this email to answer ${esc(r.name || r.email)} directly.</p>${details(r)}`),
    text: `${topicSubject(r.topic)} from the Ballmac UI support page. Reply to this email to answer directly.\n\n${textDetails(r)}`,
  }
}

/** Confirmation sent to the person who asked for help. */
export function supportUserEmail(r: SupportRequest, siteUrl: string) {
  const greeting = r.name ? `Thanks, ${r.name.split(/\s+/)[0]}.` : "Thanks for reaching out."
  return {
    subject: `We've received your message: ${topicSubject(r.topic)}`,
    html: layout(
      greeting,
      `<p style="margin:0 0 16px;font-size:15px;line-height:1.6">We've received your message and will reply by email as soon as we can.</p>
<p style="margin:0 0 20px;font-size:15px;line-height:1.6">Here's a copy of what you sent. To add details or screenshots, just reply to this email.</p>
${details(r)}
<p style="margin:24px 0 0;font-size:13px;color:#737373">Ballmac UI · <a href="${esc(siteUrl)}/support" style="color:#737373">${esc(siteUrl.replace(/^https?:\/\//, ""))}/support</a></p>`
    ),
    text: `${greeting} We've received your message and will reply by email as soon as we can.\n\nHere's a copy of what you sent. To add details or screenshots, just reply to this email.\n\n${textDetails(r)}\n\nBallmac UI · ${siteUrl}/support`,
  }
}
