/**
 * Founding members. Names are added here by hand, only for buyers who asked to be listed (they send their name from the Founders desk in the Pro library).
 * The vote options are the next batches of Pro blocks founding members choose between. No framework imports.
 */
export const founderNames: string[] = []

export const voteOptions = [
  { id: "auth", label: "More sign-in, onboarding and account screens" },
  { id: "ecommerce", label: "More ecommerce: carts, checkout and order pages" },
  { id: "ai", label: "Blocks for AI products: chat, agents, usage and billing" },
  { id: "dashboards", label: "More dashboards and data screens" },
  { id: "marketing", label: "More landing-page sections and pricing pages" },
  { id: "docs", label: "Docs, changelog and help-centre pages" },
] as const

export type VoteId = (typeof voteOptions)[number]["id"]
export const isVoteId = (v: unknown): v is VoteId => voteOptions.some((o) => o.id === v)

export const FOUNDERS_EMAIL = "hello@ballmac.com"

/** A name for the Founders page: one line, no control characters, at most 60 characters. */
export function cleanName(v: unknown): string {
  return typeof v === "string" ? v.replace(/<[^>]*>/g, " ").replace(/[\u0000-\u001f\u007f<>]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 60) : ""
}

/** A licence key shown as `abcd••••wxyz` in an email to the owner, so the key itself is never sent. */
export function maskKey(key: string) {
  return key.length <= 12 ? "•".repeat(key.length) : `${key.slice(0, 4)}${"•".repeat(8)}${key.slice(-4)}`
}
