/**
 * The limited-time offer on Pro: the price being charged is the usual one (NEXT_PUBLIC_PRO_LIST_PRICE once the founding offer is over), and
 * NEXT_PUBLIC_PRO_REGULAR_PRICE is the higher price it normally sells for. While the regular price is set and higher, the pages show a banner and the regular
 * price struck through. Unset it to end the offer; no code change is needed. No framework imports.
 */
type Env = Record<string, string | undefined>

const money = (v: string | undefined) => {
  const s = v?.trim()
  return s && /^\d+(\.\d{1,2})?$/.test(s) && Number(s) > 0 ? s : null
}

/**
 * The standing Pro price and checkout for client components, which cannot call getOffer: read straight from the build-time variables, so they are inlined.
 * Empty while a founding offer is the only thing on sale; callers then fall back to a plain link to the pricing page.
 */
export const STANDING_PRICE = money(process.env.NEXT_PUBLIC_PRO_LIST_PRICE)
export const STANDING_CHECKOUT = process.env.NEXT_PUBLIC_PRO_STANDARD_CHECKOUT_URL?.trim() || ""
export const STANDING_REGULAR = STANDING_PRICE ? regularPrice(STANDING_PRICE, { NEXT_PUBLIC_PRO_REGULAR_PRICE: process.env.NEXT_PUBLIC_PRO_REGULAR_PRICE }) : null

/** The regular price to show struck through, or null when there is no limited-time offer (or it is not higher than the price charged). */
export function regularPrice(price: string | null | undefined, env: Env = process.env): string | null {
  const regular = money(env.NEXT_PUBLIC_PRO_REGULAR_PRICE)
  const now = money(price ?? undefined)
  return regular && now && Number(regular) > Number(now) ? regular : null
}
