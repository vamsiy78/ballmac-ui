/**
 * What real buyers have said about Ballmac UI Pro, shown beside the buy buttons (home, /pricing, /pro). Only add a quote a buyer actually wrote and agreed
 * to have shown, with the name and role they agreed to; never write one. While the list is empty, nothing is shown anywhere.
 */
export type BuyerQuote = {
  quote: string
  name: string
  /** e.g. "Founder, Acme" or "Frontend engineer". */
  role?: string
  /** Where it was said, if public (a post on X, a GitHub issue). */
  href?: string
}

export const buyerQuotes: BuyerQuote[] = []
