"use client"

import { Expenses1 } from "@/components/ballmac/blocks/expenses-1/expenses-1"

export default function Expenses1Demo() {
  return <Expenses1 onSubmit={() => new Promise((r) => setTimeout(r, 700))} />
}
