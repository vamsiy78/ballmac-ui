/** Transactional partner email templates. User content is escaped in HTML and never interpolated into URLs. */
export const escapeEmail = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  )
export const affiliateOrigin = () =>
  process.env.DEPLOY_ENV === "production" ? "https://ui.ballmac.com" : "https://preprod.ui.ballmac.com"
export const affiliateOwners = (): string[] =>
  [
    ...new Set<string>(
      (process.env.AFFILIATE_ADMIN_EMAILS ?? "")
        .split(",")
        .map((v: string) => v.trim().toLowerCase())
        .filter((v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)),
    ),
  ].slice(0, 10)
export type PartnerEmail = { subject: string; text: string; html: string }
export function partnerEmail(options: {
  eyebrow: string
  title: string
  intro: string
  paragraphs?: string[]
  details?: [string, string][]
  code?: string
  action?: { label: string; url: string }
  footer?: string
}): PartnerEmail {
  const {
    eyebrow,
    title,
    intro,
    paragraphs = [],
    details = [],
    code,
    action,
    footer = "Ballmac UI · Partner program",
  } = options
  const e = escapeEmail
  const safeAction = action && new URL(action.url).origin === affiliateOrigin() ? action : undefined
  const text = [
    eyebrow,
    title,
    intro,
    code ? `Your sign-in code is ${code}.` : "",
    ...details.map(([k, v]) => `${k}: ${v}`),
    ...paragraphs,
    safeAction ? `${safeAction.label}: ${safeAction.url}` : "",
    footer,
  ]
    .filter(Boolean)
    .join("\n\n")
  // Email clients require inline styles; these are original brand styles, independent of site theme tokens.
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e(title)}</title></head><body style="margin:0;background:#f5f5f4;color:#18181b;font-family:Arial,Helvetica,sans-serif"><div style="display:none;max-height:0;overflow:hidden">${e(intro)}</div><table role="presentation" style="width:100%;border-collapse:collapse"><tr><td style="padding:40px 16px"><table role="presentation" style="max-width:560px;width:100%;margin:auto;border-collapse:collapse;background:#ffffff;border:1px solid #e4e4e7;border-radius:16px"><tr><td style="padding:28px 32px;border-bottom:1px solid #e4e4e7;font-size:16px;font-weight:700;letter-spacing:-0.5px">Ballmac UI <span style="font-size:12px;font-weight:400;color:#52525b">/ Partners</span></td></tr><tr><td style="padding:32px"><p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#52525b">${e(eyebrow)}</p><h1 style="font-size:28px;line-height:1.2;letter-spacing:-1px;margin:16px 0">${e(title)}</h1><p style="font-size:15px;line-height:1.7;color:#3f3f46">${e(intro)}</p>${code ? `<p style="padding:22px;background:#f4f4f5;border-radius:12px;text-align:center;font-family:monospace;font-size:34px;letter-spacing:10px;font-weight:700">${e(code)}</p>` : ""}${details.length ? `<table role="presentation" style="width:100%;margin:24px 0;border-collapse:collapse">${details.map(([k, v]) => `<tr><td style="padding:12px 0;border-bottom:1px solid #e4e4e7;font-size:13px;color:#52525b;vertical-align:top">${e(k)}</td><td style="padding:12px 0 12px 16px;border-bottom:1px solid #e4e4e7;font-size:13px;text-align:right;word-break:break-word">${e(v)}</td></tr>`).join("")}</table>` : ""}${paragraphs.map((p) => `<p style="font-size:14px;line-height:1.7;color:#52525b">${e(p)}</p>`).join("")}${safeAction ? `<p style="margin:28px 0"><a href="${e(safeAction.url)}" style="display:inline-block;padding:14px 20px;border-radius:9px;background:#18181b;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600">${e(safeAction.label)} &rarr;</a></p>` : ""}</td></tr><tr><td style="padding:20px 32px;border-top:1px solid #e4e4e7;font-size:11px;line-height:1.6;color:#71717a">${e(footer)}<br>Questions? Visit <a href="${affiliateOrigin()}/support" style="color:#52525b">Ballmac support</a>.</td></tr></table></td></tr></table></body></html>`
  return { subject: title, text, html }
}
export function signInEmail(code: string, owner = false) {
  return partnerEmail({
    eyebrow: owner ? "Administration access" : "Your partner workspace",
    title: owner ? "Your owner sign-in code" : "Your partner sign-in code",
    intro: "Use this one-time code on the Ballmac UI page where you requested it.",
    code,
    paragraphs: [
      "It expires in 10 minutes and works once. Never share this code. Ballmac will never ask for it by email.",
      "If you did not request this code, you can ignore this email.",
    ],
    footer: "Ballmac UI · Secure sign-in",
  })
}
export function approvalEmail(name: string) {
  return partnerEmail({
    eyebrow: "Welcome to Ballmac Partners",
    title: "Your partnership is approved",
    intro: `Welcome, ${name}. Your referral link and partner workspace are ready.`,
    details: [
      ["Your commission", "30% of eligible Pro sales"],
      ["Your audience saves", "10% on regular Pro"],
      ["Referral window", "30 days"],
      ["Minimum payout", "$50 USD"],
    ],
    paragraphs: [
      "Sign in with your approved email to get your personal link, sharing resources and commission history.",
      "Commissions are calculated after the buyer discount and before tax. We review earlier-month eligible balances on the 1st–15th UTC; smaller balances carry forward.",
      "Clearly disclose your affiliate relationship when recommending Ballmac UI.",
    ],
    action: { label: "Open your partner workspace", url: `${affiliateOrigin()}/affiliates/dashboard` },
  })
}
