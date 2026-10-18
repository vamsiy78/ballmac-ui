"use client"

import { Calculator1, type Calculator1Plan } from "@/components/ballmac/blocks/calculator-1/calculator-1"

// Only small plans: the default 12 people is already beyond them, so the page shows its Talk to us path.
const plans: Calculator1Plan[] = [
  { id: "solo", name: "Solo", base: 0, perSeat: 0, maxSeats: 3, includedRequests: 10_000, perThousand: 0, includedStorage: 5, perGb: 0 },
  { id: "small", name: "Small team", base: 0, perSeat: 14, maxSeats: 10, includedRequests: 250_000, perThousand: 0.4, includedStorage: 100, perGb: 0.12 },
]

export default function Calculator1Enterprise() {
  return <Calculator1 plans={plans} title="Bigger than a small team?" description="Past ten people we price it together." />
}
