/**
 * "Someone clicked Buy": what the browser sends when a visitor leaves for the Dodo checkout, and the email the owner gets. Nothing personal is collected: no
 * address, no IP, no cookie. The page, the campaign tags, the site they came from and the country (from Cloudflare's own header) are enough to see what works.
 * No framework imports.
 */
export const PLANS = { pro: "Pro", team: "Team", monthly: "Pro monthly" } as const
export type Plan = keyof typeof PLANS

export type CheckoutClick = { plan: Plan; page: string; utm?: string; from?: string }

const tag = (v: unknown) => (typeof v === "string" && /^[A-Za-z0-9_.:-]{1,60}$/.test(v) ? v : undefined)

/** The click in a request body, or null when it is not valid. Pages are paths on this site only; the referrer is a bare host name. */
export function parseClick(raw: unknown): CheckoutClick | null {
  if (!raw || typeof raw !== "object") return null
  const { plan, page, utm, from } = raw as Record<string, unknown>
  if (plan !== "pro" && plan !== "team" && plan !== "monthly") return null
  if (typeof page !== "string" || page.length > 200 || !/^\/[A-Za-z0-9/_.-]*$/.test(page) || page.includes("..")) return null
  const campaign = typeof utm === "string" ? utm.split("/").map(tag).filter(Boolean).slice(0, 3).join(" / ") : ""
  const host = typeof from === "string" && /^[a-z0-9.-]{3,80}$/i.test(from) ? from.toLowerCase() : undefined
  return { plan, page, ...(campaign ? { utm: campaign } : {}), ...(host ? { from: host } : {}) }
}

/** Crawlers and headless tools do not buy; they should not wake anyone up. */
export const isBot = (userAgent: string | null) => !userAgent || /bot|crawl|spider|slurp|headless|lighthouse|curl|wget|python|preview|monitor|uptime/i.test(userAgent)

const ist = (d: Date) => d.toLocaleString("en-GB", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })

export function clickEmail(c: CheckoutClick, meta: { country?: string | null; now?: Date; siteUrl: string }) {
  const now = meta.now ?? new Date()
  const country = meta.country && /^[A-Z]{2}$/.test(meta.country) ? meta.country : "unknown"
  return {
    subject: `Checkout opened: ${PLANS[c.plan]} from ${c.page}`,
    text: [
      `Someone clicked Buy and is on the ${PLANS[c.plan]} checkout page.`,
      "",
      `Plan:     ${PLANS[c.plan]}`,
      `Page:     ${meta.siteUrl}${c.page}`,
      `Country:  ${country}`,
      `Came from: ${c.from ?? "direct or hidden"}`,
      `Campaign: ${c.utm ?? "none"}`,
      `Time:     ${ist(now)} IST`,
      "",
      "They have not paid yet. A payment email from Dodo follows if they do.",
      "",
    ].join("\n"),
  }
}
