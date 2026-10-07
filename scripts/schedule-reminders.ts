/**
 * Schedules the two founding-price reminders (about 72 and 24 hours before the deadline) as Resend broadcasts to the reminder audience.
 *
 *   pnpm reminders:schedule --dry-run     show what would be scheduled, send nothing
 *   pnpm reminders:schedule               create and schedule the broadcasts
 *
 * Needs RESEND_API_KEY, RESEND_AUDIENCE_ID and RESEND_FROM, and the same founding variables as the site (NEXT_PUBLIC_PRO_PRICE, NEXT_PUBLIC_PRO_CHECKOUT_URL,
 * NEXT_PUBLIC_PRO_FOUNDING_LIMIT, NEXT_PUBLIC_PRO_FOUNDING_ENDS, NEXT_PUBLIC_PRO_LIST_PRICE). Pull them first, for example
 * `vercel env pull .env.production.local --environment=production`, then `set -a; . ./.env.production.local; set +a`.
 *
 * Safe to run again: a reminder whose broadcast already exists (same name) is skipped, and a reminder whose time has passed is never sent late.
 * A broadcast goes to everyone in the audience when it sends, so run this when the deadline and the copy are final. Unsubscribing is handled by Resend.
 */
import { planReminders, reminderContextFromEnv, reminderEmail } from "../apps/www/lib/reminder-emails"

const dry = process.argv.includes("--dry-run")
const env = process.env
const siteUrl = (env.SITE_URL ?? "https://ui.ballmac.com").replace(/\/$/, "")
const api = env.RESEND_API_URL ?? "https://api.resend.com"

async function resend<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const res = await fetch(`${api}${path}`, {
    method: init.method ?? "GET",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, ...(init.body !== undefined && { "Content-Type": "application/json" }) },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  })
  const data = (await res.json().catch(() => ({}))) as { message?: string }
  if (!res.ok) throw new Error(`Resend ${res.status} on ${path}: ${data.message ?? "unknown error"}`)
  return data as T
}

async function main() {
  const missing = ["RESEND_API_KEY", "RESEND_AUDIENCE_ID", "RESEND_FROM"].filter((k) => !env[k])
  if (missing.length && !dry) {
    console.error(`Missing ${missing.join(", ")}.`)
    process.exit(1)
  }
  const now = new Date()
  const context = reminderContextFromEnv(env, siteUrl, now)
  if (!context) {
    console.error("No running founding offer with a deadline. Set NEXT_PUBLIC_PRO_FOUNDING_LIMIT, _PRICE, _CHECKOUT_URL and _FOUNDING_ENDS, and check the deadline is in the future.")
    process.exit(1)
  }
  const plan = planReminders(context.endsAt, now)
  if (plan.length === 0) {
    console.log("Both reminder times have already passed. Nothing to schedule.")
    return
  }
  const stamp = context.endsAt.slice(0, 10)
  const existing = dry || missing.length ? [] : ((await resend<{ data?: { name?: string }[] }>("/broadcasts")).data ?? []).map((b) => b.name)
  for (const { kind, sendAt } of plan) {
    const name = `founding-reminder-${kind}-${stamp}`
    const email = reminderEmail(kind, context)
    console.log(`${dry ? "would schedule" : "scheduling"} ${name}: ${sendAt.toISOString()} | ${email.subject}`)
    if (dry) continue
    if (existing.includes(name)) {
      console.log("  already exists, skipped")
      continue
    }
    const created = await resend<{ id: string }>("/broadcasts", { method: "POST", body: { segment_id: env.RESEND_AUDIENCE_ID, from: env.RESEND_FROM, name, subject: email.subject, html: email.html, text: email.text } })
    await resend(`/broadcasts/${created.id}/send`, { method: "POST", body: { scheduled_at: sendAt.toISOString() } })
    console.log(`  scheduled (${created.id})`)
  }
  if (plan.length < 2) console.log("Note: one reminder time has already passed and was skipped.")
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
