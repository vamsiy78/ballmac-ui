import { proOffer, type ProOffer } from "@/lib/founding"
import { createFoundingLedger } from "@/lib/founding-ledger"

// One ledger per server instance: it keeps its own five minute cache.
const ledger = createFoundingLedger(process.env)

/**
 * What Pro sells at this moment, for the pages that show a price. Pages using it are regenerated every few minutes (see `revalidate`), so the switch at
 * the deadline, or when the licence cap is reached, reaches visitors within minutes without a redeploy.
 */
export async function getOffer(now: Date = new Date()): Promise<ProOffer> {
  const running = proOffer(process.env, now)
  if (!running.founding) return running
  return proOffer(process.env, now, await ledger.isFull())
}

export const founders = ledger
