// Shared by the support form (client) and /api/support (server). No framework imports, so it can be tested on its own.

export const supportTopics = [
  { id: "bug", label: "Report a bug", hint: "Something does not work as it should", subject: "Bug report" },
  { id: "help", label: "Ask for help", hint: "Setup, installing or using an item", subject: "Help request" },
  { id: "license", label: "Licence or billing", hint: "Your Pro key, a purchase or a refund", subject: "Licence or billing" },
  { id: "feature", label: "Suggest something", hint: "A feature or a block you would like", subject: "Suggestion" },
] as const

export type SupportTopic = (typeof supportTopics)[number]["id"]

export const supportPlans = [
  { id: "free", label: "Free" },
  { id: "pro", label: "Pro" },
] as const

export type SupportPlan = (typeof supportPlans)[number]["id"]

export const supportLimits = { name: 100, email: 254, item: 80, message: 5000, minMessage: 15 } as const

export type SupportRequest = {
  topic: SupportTopic
  plan: SupportPlan
  name: string
  email: string
  /** The component, block or page the message is about. Optional. */
  item: string
  message: string
}

export type SupportErrors = Partial<Record<"topic" | "email" | "message", string>>

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const isSupportTopic = (v: unknown): v is SupportTopic => supportTopics.some((t) => t.id === v)
export const isSupportPlan = (v: unknown): v is SupportPlan => supportPlans.some((p) => p.id === v)
export const topicSubject = (t: SupportTopic) => supportTopics.find((x) => x.id === t)?.subject ?? "Support request"

export function validateSupport(r: SupportRequest): SupportErrors {
  const e: SupportErrors = {}
  if (!isSupportTopic(r.topic)) e.topic = "Choose what you need help with."
  if (!EMAIL.test(r.email.trim()) || r.email.length > supportLimits.email) e.email = "Please enter a valid email address so we can reply."
  const message = r.message.trim()
  if (message.length < supportLimits.minMessage) e.message = "Please describe it in a sentence or two."
  else if (message.length > supportLimits.message) e.message = `Please keep it under ${supportLimits.message} characters.`
  return e
}

/** Coerces untrusted JSON into a SupportRequest: trims lengths and strips control characters. Single-line fields can end up in email subjects. */
export function parseSupport(raw: unknown): SupportRequest | null {
  if (!raw || typeof raw !== "object") return null
  const r = raw as Record<string, unknown>
  const line = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/[\u0000-\u001f\u007f]+/g, " ").trim().slice(0, max) : "")
  const text = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "").trim().slice(0, max + 1) : "")
  return {
    topic: isSupportTopic(r.topic) ? r.topic : ("" as SupportTopic),
    plan: isSupportPlan(r.plan) ? r.plan : "free",
    name: line(r.name, supportLimits.name),
    email: line(r.email, supportLimits.email),
    item: line(r.item, supportLimits.item),
    message: text(r.message, supportLimits.message),
  }
}
