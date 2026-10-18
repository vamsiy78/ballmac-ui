import * as React from "react"

import { DataGrid, type DataGridColumn } from "@/components/ballmac/data-grid"

type Order = { id: string; customer: string; city: string; plan: string; amount: number; paid: boolean }

const CITIES = ["Lisbon", "Osaka", "Nairobi", "Toronto", "Helsinki", "Lima", "Pune", "Gdańsk"]
const FIRST = ["Ana", "Ben", "Chloé", "Dev", "Elif", "Farid", "Gia", "Hugo", "Ines", "Jun", "Kofi", "Lena"]
const LAST = ["Okafor", "Lindqvist", "Moreau", "Tanaka", "Silva", "Novak", "Haddad", "Reyes", "Kowalski", "Singh"]
const PLANS = ["free", "team", "business"]

/** A repeatable pseudo-random sequence, so the server and the browser draw the same rows. */
function build(count: number): Order[] {
  let seed = 7
  const next = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }
  return Array.from({ length: count }, (_, i) => {
    const plan = PLANS[Math.floor(next() * 3)]!
    return {
      id: `ORD-${String(10000 + i)}`,
      customer: `${FIRST[Math.floor(next() * FIRST.length)]} ${LAST[Math.floor(next() * LAST.length)]}`,
      city: CITIES[Math.floor(next() * CITIES.length)]!,
      plan,
      amount: plan === "free" ? 0 : Math.round((plan === "team" ? 40 : 190) * (1 + next() * 6)) * 10,
      paid: next() > 0.2,
    }
  })
}

const columns: DataGridColumn<Order>[] = [
  { id: "id", header: "Order", accessorKey: "id", width: 120, pin: "start" },
  { id: "customer", header: "Customer", accessorKey: "customer", width: 180, editable: true },
  { id: "city", header: "City", accessorKey: "city", width: 130, editable: true },
  {
    id: "plan",
    header: "Plan",
    accessorKey: "plan",
    type: "select",
    width: 120,
    editable: true,
    options: [
      { value: "free", label: "Free" },
      { value: "team", label: "Team", tone: "success" },
      { value: "business", label: "Business", tone: "success" },
    ],
  },
  { id: "amount", header: "Amount", accessorKey: "amount", type: "number", width: 120, editable: true, numberFormat: { style: "currency", currency: "USD", maximumFractionDigits: 0 } },
  { id: "paid", header: "Paid", accessorKey: "paid", type: "boolean", width: 90, align: "center", editable: true },
]

export default function DataGridVirtualized() {
  const data = React.useMemo(() => build(20000), [])
  return <DataGrid label="Orders" columns={columns} defaultData={data} density="compact" height={296} className="w-full max-w-3xl" footer="Only the visible rows are drawn" />
}
