/**
 * The founding offer: the first N buyers get Pro at the launch price. It shows only while NEXT_PUBLIC_PRO_FOUNDING_LIMIT is set (and Pro is on sale),
 * so ending the offer means unsetting that variable and moving the price and checkout link to the regular ones. No framework imports.
 */
import { testModeInProduction } from "./payments"

export type Founding = { limit: number; price: string }

export function founding(env: Record<string, string | undefined> = process.env): Founding | null {
  if (testModeInProduction(env)) return null
  const limit = Number(env.NEXT_PUBLIC_PRO_FOUNDING_LIMIT)
  const price = env.NEXT_PUBLIC_PRO_PRICE?.trim()
  if (!Number.isInteger(limit) || limit < 1 || limit > 10_000) return null
  if (!price || !env.NEXT_PUBLIC_PRO_CHECKOUT_URL?.trim()) return null
  return { limit, price }
}
