"use client"

import { Agent4 } from "@/components/ballmac/blocks/agent-4/agent-4"

export default function Agent4Demo() {
  return (
    <Agent4
      defaultResults={{
        a: {
          text: "Hi Jordan,\n\nYou were charged twice for order 4821. I’ve refunded the second charge of $129.00; it will reach your card in 5 to 10 business days. Your order is unaffected.\n\nSorry for the trouble,\nSam from Acme",
          latencyMs: 2140,
          tokens: { input: 212, output: 71 },
          cost: "$0.0041",
        },
        b: {
          text: "Hi Jordan, we refunded the duplicate $129.00 charge on order 4821. Expect it in 5–10 business days. Sorry about that! – Sam",
          latencyMs: 480,
          tokens: { input: 212, output: 38 },
          cost: "$0.0003",
        },
      }}
    />
  )
}
