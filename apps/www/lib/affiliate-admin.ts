/** Money parsing for operator-entered USD amounts. Avoid floating-point multiplication. */
export function payoutCents(value: unknown) {
  if (typeof value !== "string" || !/^\d{1,7}(\.\d{1,2})?$/.test(value.trim())) return null
  const [dollars, cents = ""] = value.trim().split(".")
  return Number(dollars) * 100 + Number(cents.padEnd(2, "0"))
}
export type AdminPartner = {
  id: string
  name: string
  email: string
  channel: string
  promotion_plan: string
  terms_version: string
  terms_accepted_at: string | null
  code: string
  status: string
  discount_code: string | null
  review_note: string
  created_at: string
  revision: number
  conversions: number
  earned: number
  paid: number
  prior: number
  eligible: number
  pending: number
  balance: number
}
export type AdminSale = {
  payment_id: string
  affiliate_id: string
  name: string
  email: string
  net_cents: number
  commission_cents: number
  state: string
  created_at: string
  updated_at: string
}
export type AdminPayout = {
  id: string
  affiliate_id: string
  name: string
  email: string
  amount_cents: number
  reference: string
  method: string
  paid_at: string
}
export type AdminAudit = {
  id: string
  actor: string
  action: string
  target: string
  note: string
  detail: string
  created_at: string
}
export type AdminView = "overview" | "applications" | "partners" | "sales" | "payouts" | "audit" | "settings"
export type AdminPayload = {
  owner: string
  view: AdminView
  page: number
  pages: number
  total: number
  summary: {
    pending: number
    active: number
    paused: number
    rejected: number
    earned: number
    paid: number
    eligible: number
    pendingEarnings: number
    sales: number
  }
  partners: AdminPartner[]
  sales: AdminSale[]
  payouts: AdminPayout[]
  audit: AdminAudit[]
  settings: { label: string; ready: boolean; help: string }[]
}
