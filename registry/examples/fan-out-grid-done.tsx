"use client"

import { FanOutGrid, type FanItem } from "@/components/ballmac/fan-out-grid"

const items: FanItem[] = Array.from({ length: 24 }, (_, i) => ({ id: String(i + 1), label: `customer-${i + 1}.csv`, status: "done", duration: "0.6 s", detail: "Imported without errors." }))

export default function FanOutGridDone() {
  return (
    <div className="w-full max-w-xl">
      <FanOutGrid title="Importing 24 customer files" items={items} />
    </div>
  )
}
