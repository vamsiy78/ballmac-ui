/** The monthly Pro plan: Pro access for as long as the subscription is active. The checkout link comes from the environment once the Dodo subscription product exists; without it the monthly option is not shown. No framework imports. */
export const MONTHLY_PRICE = process.env.NEXT_PUBLIC_PRO_MONTHLY_PRICE || "9"
export const MONTHLY_CHECKOUT = process.env.NEXT_PUBLIC_PRO_MONTHLY_CHECKOUT_URL || ""
