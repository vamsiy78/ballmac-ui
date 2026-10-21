import type { D1Database } from "@cloudflare/workers-types"
import { affiliateOrigin, affiliateOwners, partnerEmail, type PartnerEmail } from "@/lib/affiliate-email"
import { hashToken } from "@/lib/affiliates"
import { resend, ResendError } from "@/lib/resend"

type DB = D1Database
export function applicationNotifications(
  db: DB,
  id: string,
  applicant: { name: string; email: string; channel: string },
) {
  const owners = affiliateOwners()
  const messages = owners.map((recipient) => ({
    recipient,
    kind: "application-owner",
    email: partnerEmail({
      eyebrow: "Application awaiting review",
      title: "A new partner wants to join",
      intro: `${applicant.name} applied to the Ballmac UI partner program.`,
      details: [
        ["Applicant", applicant.name],
        ["Email", applicant.email],
        ["Audience link", applicant.channel],
      ],
      paragraphs: [
        "Review the audience and application before approving. Approval activates a product-restricted 10% discount and a 30% commission. Our review goal is within three business days.",
      ],
      action: {
        label: "Review the application",
        url: `${affiliateOrigin()}/affiliates/admin?view=applications`,
      },
    }),
  }))
  messages.push({
    recipient: applicant.email,
    kind: "application-received",
    email: partnerEmail({
      eyebrow: "Ballmac Partners",
      title: "Your application is in",
      intro: `Thanks, ${applicant.name}. We received your partner application.`,
      paragraphs: [
        "We aim to review applications within three business days. We’ll email you if your partnership is approved; your dashboard becomes available after approval.",
        "You do not need to apply again. In the meantime, explore the product and review the program terms.",
      ],
      action: { label: "Explore the partner program", url: `${affiliateOrigin()}/affiliates#program-terms` },
    }),
  })
  return messages.map(({ recipient, kind, email }) =>
    notificationStatement(db, `${kind}:${id}:${recipient}`, id, recipient, email, true),
  )
}
export function notificationStatement(
  db: DB,
  id: string,
  affiliateId: string,
  recipient: string,
  email: PartnerEmail,
  requireApplication = false,
  guard?: { table: "affiliate_payouts"; id: string },
) {
  return db
    .prepare(
      `INSERT OR IGNORE INTO affiliate_notifications (id,affiliate_id,recipient,payload) SELECT ?,?,?,? WHERE EXISTS(SELECT 1 FROM affiliates WHERE id=?${requireApplication ? " AND status='pending'" : ""})${guard ? ` AND EXISTS(SELECT 1 FROM ${guard.table} WHERE id=?)` : ""}`,
    )
    .bind(id, affiliateId, recipient, JSON.stringify(email), affiliateId, ...(guard ? [guard.id] : []))
}
/** Durable lease + bounded retry. Only provider-accepted mail is marked sent; payload and idempotency key stay stable. */
export async function deliverAffiliateNotifications(db?: DB, limit = 5) {
  if (!db || !process.env.RESEND_API_KEY || !process.env.RESEND_FROM) return
  for (let i = 0; i < limit; i++) {
    const now = Date.now(),
      lease = crypto.randomUUID()
    const row = await db
      .prepare(
        "UPDATE affiliate_notifications SET lease_until=?,lease_token=?,attempts=attempts+1 WHERE id=(SELECT id FROM affiliate_notifications WHERE state='pending' AND attempts<10 AND created_at>strftime('%Y-%m-%dT%H:%M:%fZ','now','-23 hours') AND next_attempt_at<=? AND lease_until<=? ORDER BY created_at,id LIMIT 1) AND state='pending' AND lease_until<=? RETURNING id,recipient,payload,attempts",
      )
      .bind(now + 90_000, lease, now, now, now)
      .first<{ id: string; recipient: string; payload: string; attempts: number }>()
    if (!row) break
    if (row.id.startsWith("application-owner:") && !affiliateOwners().includes(row.recipient.toLowerCase())) {
      await db
        .prepare(
          "UPDATE affiliate_notifications SET state='cancelled',lease_until=0,lease_token=NULL,last_error='owner_access_removed' WHERE id=? AND lease_token=?",
        )
        .bind(row.id, lease)
        .run()
      continue
    }
    try {
      const email = JSON.parse(row.payload) as PartnerEmail
      await resend("/emails", {
        method: "POST",
        idempotencyKey: `partner/${await hashToken(row.id)}`,
        body: { from: process.env.RESEND_FROM, to: [row.recipient], ...email },
      })
      await db
        .prepare(
          "UPDATE affiliate_notifications SET state='sent',sent_at=?,lease_until=0,lease_token=NULL,last_error=NULL WHERE id=? AND lease_token=?",
        )
        .bind(new Date().toISOString(), row.id, lease)
        .run()
    } catch (error) {
      const reason = error instanceof ResendError ? `email_provider_${error.status}` : "delivery_failed"
      await db
        .prepare(
          "UPDATE affiliate_notifications SET next_attempt_at=?,lease_until=0,lease_token=NULL,last_error=? WHERE id=? AND lease_token=?",
        )
        .bind(now + Math.min(6 * 3600_000, 60_000 * 2 ** Math.min(row.attempts, 8)), reason, row.id, lease)
        .run()
    }
  }
}
