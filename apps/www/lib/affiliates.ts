/** Affiliate rules shared by the site and Worker. All money is integer USD cents. */
export const AFFILIATE = {
  commission: 30,
  discount: 10,
  cookieDays: 30,
  minimumPayout: 5000,
  termsVersion: "2026-10-22",
} as const
export const referralCode = (value: unknown): string | null =>
  typeof value === "string" && /^[a-z0-9][a-z0-9-]{2,31}$/.test(value) ? value : null
export const usd = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100)
/** Use Dodo's authoritative USD amounts; never interpret another currency's minor units as USD. */
export function paymentNetUsdCents(payment: Record<string, unknown>): number | null {
  const usdPayment = payment.currency === "USD"
  if (!usdPayment && payment.settlement_currency !== "USD") return null
  const total = usdPayment ? payment.total_amount : payment.settlement_amount
  const tax = usdPayment
    ? (payment.tax ?? 0)
    : (payment.settlement_tax ?? ((payment.tax ?? 0) === 0 ? 0 : null))
  if (
    typeof total !== "number" ||
    typeof tax !== "number" ||
    !Number.isSafeInteger(total) ||
    !Number.isSafeInteger(tax) ||
    total < 0 ||
    tax < 0 ||
    tax > total
  )
    return null
  return total - tax
}
export function commissionCents(net: number) {
  if (!Number.isSafeInteger(net) || net < 0) throw new Error("Invalid commission base")
  return Math.round((net * AFFILIATE.commission) / 100)
}
export async function hashToken(token: string) {
  return Array.from(
    new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token))),
    (b) => b.toString(16).padStart(2, "0"),
  ).join("")
}
/** Standard Webhooks verification: raw body, replay window and constant-time HMAC verification. */
export async function verifyAffiliateWebhook(
  body: string,
  headers: Headers,
  secret: string,
  now = Date.now(),
) {
  const id = headers.get("webhook-id"),
    timestamp = headers.get("webhook-timestamp")
  if (!id || !timestamp || !/^\d+$/.test(timestamp) || Math.abs(now / 1000 - Number(timestamp)) > 300)
    return false
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      Uint8Array.from(atob(secret.replace(/^whsec_/, "")), (c) => c.charCodeAt(0)),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    )
    for (const signature of (headers.get("webhook-signature") ?? "").split(" ")) {
      const [version, value] = signature.split(",")
      if (
        version === "v1" &&
        value &&
        (await crypto.subtle.verify(
          "HMAC",
          key,
          Uint8Array.from(atob(value), (c) => c.charCodeAt(0)),
          new TextEncoder().encode(`${id}.${timestamp}.${body}`),
        ))
      )
        return true
    }
  } catch {
    return false
  }
  return false
}
