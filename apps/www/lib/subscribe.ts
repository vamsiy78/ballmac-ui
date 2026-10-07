// Shared by the reminder and sampler forms (client) and their routes (server). No framework imports, so it can be tested on its own.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const emailMax = 254

/** The email in an untrusted JSON body, or null. A filled-in honeypot field (`website`) means a bot: `bot` is true and nothing is stored. */
export function parseSubscribe(raw: unknown): { email: string; bot: boolean } | { error: string } {
  if (!raw || typeof raw !== "object") return { error: "Invalid request." }
  const r = raw as Record<string, unknown>
  const bot = typeof r.website === "string" && r.website.trim() !== ""
  const email = typeof r.email === "string" ? r.email.replace(/[\u0000-\u001f\u007f]+/g, " ").trim() : ""
  if (!bot && (!EMAIL.test(email) || email.length > emailMax)) return { error: "Please enter a valid email address." }
  return { email, bot }
}
