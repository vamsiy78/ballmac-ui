import { proOffer, type ProOffer } from "@/lib/founding"
import { createFoundingLedger } from "@/lib/founding-ledger"

// One ledger per server instance: it keeps its own five minute cache.
const ledger = createFoundingLedger(process.env)

/**
 * What Pro sells at this moment, for the pages that show a price. Pages are built ahead of time, so this is the
 * offer at build time. When it changes (the deadline passes, or the licence cap is reached) the Worker's scheduled check starts a new build; see worker/offer-watch.ts.
 */
export async function getOffer(now: Date = new Date()): Promise<ProOffer> {
  const running = proOffer(process.env, now)
  if (!running.founding) return running
  return proOffer(process.env, now, await ledger.isFull())
}

export const founders = ledger
