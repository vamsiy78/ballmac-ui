"use client"

import * as React from "react"

import { FanOutGrid, type FanItem } from "@/components/ballmac/fan-out-grid"

const failures: Record<number, string> = {
  7: "The total did not match the line items: $412.00 against $421.00.",
  19: "Unreadable scan. The second page is blank.",
  33: "The supplier is not in the vendor list.",
}

function build(): FanItem[] {
  return Array.from({ length: 48 }, (_, i) => {
    const n = i + 1
    const label = `invoice-${String(n).padStart(3, "0")}.pdf`
    if (failures[n]) return { id: String(n), label, status: "failed", detail: failures[n], duration: "0.9 s" }
    if (n <= 30) return { id: String(n), label, status: "done", detail: `Matched to purchase order PO-${4100 + n}.`, duration: `${(0.8 + (n % 5) * 0.3).toFixed(1)} s` }
    if (n <= 36) return { id: String(n), label, status: "running", detail: "Reading the line items." }
    if (n === 44) return { id: String(n), label, status: "skipped", detail: "A duplicate of invoice-012.pdf." }
    return { id: String(n), label, status: "queued" }
  })
}

export default function FanOutGridDemo() {
  const [items, setItems] = React.useState(build)
  return (
    <div className="w-full max-w-2xl">
      <FanOutGrid
        title="Matching 48 invoices to purchase orders"
        items={items}
        defaultSelected="7"
        onRetry={async (ids: string[]) => {
          setItems((all) => all.map((i) => (ids.includes(i.id) ? { ...i, status: "running", detail: "Trying again." } : i)))
          await new Promise((resolve) => setTimeout(resolve, 1500))
          setItems((all) => all.map((i) => (ids.includes(i.id) ? { ...i, status: "done", detail: "Matched on the second try.", duration: "1.1 s" } : i)))
        }}
      />
    </div>
  )
}
