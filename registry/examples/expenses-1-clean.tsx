"use client"

import { Expenses1, type Expenses1Line } from "@/components/ballmac/blocks/expenses-1/expenses-1"

const lines: Expenses1Line[] = [
  { id: "a", date: "2026-10-05", merchant: "Eurostar", category: "travel", amount: 189, receipt: "eurostar.pdf" },
  { id: "b", date: "2026-10-05", merchant: "Pret A Manger", category: "meals", amount: 11.4 },
  { id: "c", date: "2026-10-06", merchant: "The Hoxton", category: "lodging", amount: 164, receipt: "hoxton.pdf" },
]

export default function Expenses1Clean() {
  return <Expenses1 report="Client visit in Paris" lines={lines} />
}
