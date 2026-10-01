"use client"

import { Dashboard1 } from "@/components/ballmac/blocks/dashboard-1/dashboard-1"

const week = [
  { label: "Mon", revenue: 8200, previous: 7600, orders: 61 },
  { label: "Tue", revenue: 9400, previous: 8100, orders: 70 },
  { label: "Wed", revenue: 8800, previous: 8700, orders: 66 },
  { label: "Thu", revenue: 11200, previous: 9000, orders: 84 },
  { label: "Fri", revenue: 12900, previous: 10400, orders: 96 },
  { label: "Sat", revenue: 7600, previous: 7900, orders: 52 },
  { label: "Sun", revenue: 6900, previous: 6100, orders: 47 },
]

export default function Dashboard1Week() {
  return (
    <Dashboard1
      title="This week"
      description="Your own numbers: pass getSeries and everything else follows."
      defaultRange="7d"
      getSeries={() => week}
      currency="EUR"
      channels={[{ name: "Web", share: 64 }, { name: "Marketplace", share: 26 }, { name: "Wholesale", share: 10 }]}
      orders={[
        { id: "ORD-2201", customer: "Fjord Labs", email: "pay@fjord.no", status: "paid", total: 1840, date: "2026-09-30" },
        { id: "ORD-2200", customer: "Paper Co.", email: "ap@paper.co", status: "pending", total: 620, date: "2026-09-29" },
      ]}
    />
  )
}
