/**
 * The two deadline reminders (about 72 and 24 hours before the founding price ends) and the note sent when someone signs up. Plain, true statements only: the
 * price, the deadline, what is included and the refund. No framework imports, so they can be tested on their own.
 */
import { endsLabel, founding, REFUND_DAYS } from "./founding"

export type ReminderKind = "72h" | "24h"
export const REMINDER_HOURS: Record<ReminderKind, number> = { "72h": 72, "24h": 24 }

export type ReminderContext = { endsAt: string; price: string; listPrice: string | null; limit: number; siteUrl: string; refundDays: number }

/** When a reminder goes out: the stated number of hours before the deadline. */
export const reminderSendAt = (endsAt: string, kind: ReminderKind) => new Date(Date.parse(endsAt) - REMINDER_HOURS[kind] * 3_600_000)

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

const shell = (title: string, paragraphs: string[], ctaLabel: string, ctaUrl: string, footer: string) => `<!doctype html><html><body style="margin:0;background:#f4f2ec;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#141414">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;padding:32px">
<tr><td>
<p style="margin:0 0 20px;font-size:14px;color:#5c5953;font-weight:600">Ballmac UI Pro</p>
<h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;letter-spacing:-0.02em">${esc(title)}</h1>
${paragraphs.map((p) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.55">${p}</p>`).join("\n")}
<p style="margin:24px 0"><a href="${esc(ctaUrl)}" style="display:inline-block;background:#141414;color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;padding:14px 24px;border-radius:999px">${esc(ctaLabel)}</a></p>
<p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:#5c5953">${footer}</p>
</td></tr></table></td></tr></table></body></html>`

function offerLines(c: ReminderContext) {
  const after = c.listPrice ? `, then $${esc(c.listPrice)}` : ""
  return {
    price: `$${esc(c.price)}${after}`,
    when: esc(endsLabel(c.endsAt)),
    refund: `${c.refundDays}-day refund if it is not for you.`,
    included: "150 premium blocks, two SaaS starter apps (Beacon and Quire) and Figma tokens, with light, dark and right-to-left support.",
  }
}

/** One of the two scheduled reminders, as a Resend broadcast. The unsubscribe link is Resend's own placeholder. */
export function reminderEmail(kind: ReminderKind, c: ReminderContext): { subject: string; html: string; text: string } {
  const o = offerLines(c)
  const pricing = `${c.siteUrl}/pricing`
  const subject = kind === "72h" ? `The Ballmac UI Pro founding price ends in 3 days` : `24 hours left on the Ballmac UI Pro founding price`
  const lead = kind === "72h" ? "The founding price for Ballmac UI Pro ends in about three days." : "The founding price for Ballmac UI Pro ends in about 24 hours."
  const paragraphs = [
    lead,
    `Price: <strong>${o.price}</strong>. It ends <strong>${o.when}</strong>, or earlier if all ${c.limit} founding licences are taken.`,
    `Included: ${o.included} Founding buyers also keep their price for every future Pro update, can vote on the next blocks, and can ask to be listed on the Founders page. ${o.refund}`,
  ]
  const footer = `You are getting this because you asked for a reminder on ui.ballmac.com. This is the ${kind === "72h" ? "first of two" : "second and last"} reminder. <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#5c5953">Unsubscribe</a>.`
  const text = [
    lead,
    "",
    `Price: $${c.price}${c.listPrice ? `, then $${c.listPrice}` : ""}. It ends ${endsLabel(c.endsAt)}, or earlier if all ${c.limit} founding licences are taken.`,
    "",
    `Included: ${o.included} Founding buyers also keep their price for every future Pro update, can vote on the next blocks, and can ask to be listed on the Founders page. ${o.refund}`,
    "",
    `Get Pro: ${pricing}`,
    "",
    `You are getting this because you asked for a reminder on ui.ballmac.com. This is the ${kind === "72h" ? "first of two" : "second and last"} reminder. Unsubscribe: {{{RESEND_UNSUBSCRIBE_URL}}}`,
  ].join("\n")
  return { subject, html: shell(subject, paragraphs, "See Ballmac UI Pro", pricing, footer), text }
}

/** The note sent straight after someone asks for reminders. */
export function reminderConfirmEmail(c: ReminderContext): { subject: string; html: string; text: string } {
  const o = offerLines(c)
  const subject = "You will get two reminders before the founding price ends"
  const paragraphs = [
    `Thanks. We will email you twice: about 72 hours and about 24 hours before the founding price ends on <strong>${o.when}</strong>. After that, nothing more unless you buy.`,
    `The price is <strong>${o.price}</strong> for the first ${c.limit} buyers. ${o.refund}`,
  ]
  const footer = "Wrong address? Ignore this and you will not hear from us again, or reply to this email and ask to be removed."
  const text = `Thanks. We will email you twice: about 72 hours and about 24 hours before the founding price ends on ${endsLabel(c.endsAt)}. After that, nothing more unless you buy.\n\nThe price is $${c.price}${c.listPrice ? `, then $${c.listPrice}` : ""} for the first ${c.limit} buyers. ${o.refund}\n\n${c.siteUrl}/pricing\n\n${footer}`
  return { subject, html: shell(subject, paragraphs, "See the offer", `${c.siteUrl}/pricing`, footer), text }
}

/** Which reminders are still to be scheduled at `now`: a reminder whose time has already passed is skipped, never sent late. */
export function planReminders(endsAt: string, now: Date): { kind: ReminderKind; sendAt: Date }[] {
  return (["72h", "24h"] as const).map((kind) => ({ kind, sendAt: reminderSendAt(endsAt, kind) })).filter((r) => r.sendAt.getTime() > now.getTime())
}

/** The facts the emails state, read from the same variables as the pricing page. Null unless a founding offer with a deadline is configured and running. */
export function reminderContextFromEnv(env: Record<string, string | undefined>, siteUrl: string, now: Date = new Date()): ReminderContext | null {
  const f = founding(env, now)
  if (!f?.endsAt) return null
  return { endsAt: f.endsAt, price: f.price, listPrice: f.listPrice, limit: f.limit, siteUrl, refundDays: REFUND_DAYS }
}
