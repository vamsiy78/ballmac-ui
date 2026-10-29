/** The Team licence: one organisation, up to ten named people. The checkout link and price come from the environment once the Team product exists in Dodo. No framework imports. */
export const TEAM_SEATS = 10
export const TEAM_PRICE = process.env.NEXT_PUBLIC_PRO_TEAM_PRICE || "179"
export const TEAM_CHECKOUT = process.env.NEXT_PUBLIC_PRO_TEAM_CHECKOUT_URL || ""
export const teamPerSeat = (price: number = Number(TEAM_PRICE)) => (price / TEAM_SEATS).toFixed(2).replace(/\.00$/, "")
