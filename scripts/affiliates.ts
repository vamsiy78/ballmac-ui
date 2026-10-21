/** Private operator CLI. Credentials come from the environment; never print them. */
import { randomBytes } from "node:crypto"
import { hashToken } from "../apps/www/lib/affiliates"

const [action, email, value, reference] = process.argv.slice(2)
const required = (name: string) => {
  const value = process.env[name]
  if (!value) throw new Error(`Set ${name}`)
  return value
}
async function query(sql: string, params: unknown[] = []) {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${required("CLOUDFLARE_ACCOUNT_ID")}/d1/database/${required("AFFILIATES_DATABASE_ID")}/query`,
    {
      method: "POST",
      headers: { authorization: `Bearer ${required("CLOUDFLARE_API_TOKEN")}`, "content-type": "application/json" },
      body: JSON.stringify({ sql, params }),
    }
  )
  const body = (await response.json()) as { success: boolean; result: { results: Record<string, unknown>[] }[] }
  if (!response.ok || !body.success) throw new Error("D1 operation failed")
  return body.result[0].results
}
async function main() {
  if (action === "list") {
    console.table(
      await query("SELECT email,name,channel,code,status,created_at FROM affiliates ORDER BY created_at DESC LIMIT 100")
    )
    return
  }
  if (!email)
    throw new Error(
      "Usage: affiliates.ts list | approve <email> <discount-code> | pause <email> | payout <email> <USD-cents> <transfer-reference>"
    )
  const [affiliate] = await query("SELECT id,status FROM affiliates WHERE email=?", [email.toLowerCase()])
  if (!affiliate) throw new Error("Application not found")
  if (action === "approve") {
    if (!value) throw new Error("Provide a Dodo 10% discount code")
    const product = required("DODO_AFFILIATE_PRODUCT_ID")
    if (product === process.env.DODO_FOUNDING_PRODUCT_ID)
      throw new Error("The founding product cannot earn affiliate commissions")
    const response = await fetch(
      `https://${process.env.DODO_MODE === "test" ? "test" : "live"}.dodopayments.com/discounts/code/${encodeURIComponent(value)}`,
      { headers: { authorization: `Bearer ${required("DODO_API_KEY")}` } }
    )
    const discount = (await response.json()) as {
      type: string
      amount: number
      restricted_to: string[]
      expires_at?: string
      code: string
    }
    if (
      !response.ok ||
      discount.type !== "percentage" ||
      discount.amount !== 1000 ||
      discount.restricted_to?.length !== 1 ||
      discount.restricted_to[0] !== product ||
      (discount.expires_at && Date.parse(discount.expires_at) <= Date.now())
    )
      throw new Error("Discount must be an active 10% code restricted to the regular Pro product")
    const token = randomBytes(32).toString("hex")
    await query(
      "UPDATE affiliates SET status='active',review_state=NULL,reviewed_at=strftime('%Y-%m-%dT%H:%M:%fZ','now'),revision=revision+1,discount_code=?,token_hash=? WHERE id=?",
      [discount.code, await hashToken(token), affiliate.id]
    )
    await query("DELETE FROM affiliate_sessions WHERE affiliate_id=?", [affiliate.id])
    await query("DELETE FROM affiliate_challenges WHERE affiliate_id=?", [affiliate.id])
    // Access key is intentionally written to a private file, never stdout or logs. Deliver it securely to the approved partner.
    const { writeFile } = await import("node:fs/promises")
    const { tmpdir } = await import("node:os")
    const { join } = await import("node:path")
    const file = join(tmpdir(), `ballmac-partner-${randomBytes(8).toString("hex")}.txt`)
    await writeFile(file, `Dashboard: https://ui.ballmac.com/affiliates/dashboard\nAccess key: ${token}\n`, {
      mode: 0o600,
      flag: "wx",
    })
    console.log(`Approved. Private delivery file: ${file}. Send securely, then delete it. Previous key revoked.`)
  } else if (action === "pause") {
    if (affiliate.status !== "active") throw new Error("Only active partners can be paused")
    await query("UPDATE affiliates SET status='paused',review_state=NULL,revision=revision+1 WHERE id=?", [
      affiliate.id,
    ])
    console.log("Partner paused. Dashboard remains available.")
  } else if (action === "payout") {
    const amount = Number(value)
    if (!Number.isSafeInteger(amount) || amount < 5000 || !reference || reference.length > 200)
      throw new Error("Provide at least 5000 USD cents and a unique completed transfer reference")
    // Only prior-month earnings are available. One atomic conditional INSERT prevents concurrent overpayment records.
    const result = await query(
      `INSERT INTO affiliate_payouts (id,affiliate_id,amount_cents,reference)
      SELECT ?,?,?,? WHERE ? <= (
        SELECT COALESCE(SUM(CASE WHEN state='earned' AND datetime(created_at) < datetime('now','start of month') THEN commission_cents WHEN state='reversed' THEN 0 ELSE 0 END),0)
        FROM affiliate_sales WHERE affiliate_id=?
      ) - (SELECT COALESCE(SUM(amount_cents),0) FROM affiliate_payouts WHERE affiliate_id=?) RETURNING id`,
      [crypto.randomUUID(), affiliate.id, amount, reference, amount, affiliate.id, affiliate.id]
    )
    if (!result.length) throw new Error("Insufficient prior-month balance")
    console.log("Completed payout recorded. This command does not transfer money.")
  } else throw new Error("Unknown action")
}
main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Operation failed")
  process.exitCode = 1
})
