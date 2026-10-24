/**
 * Words from real buyers, shown on /pro and /pricing. Add one only with the buyer's written permission, using their own words. While the list is empty no
 * proof section is drawn at all: an empty or invented one costs more trust than it earns.
 */
export type Proof = { quote: string; name: string; role?: string; company?: string; href?: string }

export const PROOF: Proof[] = []
