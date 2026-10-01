"use client"

import * as React from "react"

import { AnimatedNumberFlow } from "@/components/ballmac/animated-number-flow"

export default function AnimatedNumberFlowFormats() {
  const [n, setN] = React.useState(1284.5)
  return (
    <div className="grid w-full max-w-md gap-4">
      <dl className="grid grid-cols-2 gap-2">
        {[
          ["Revenue", <AnimatedNumberFlow key="a" value={n * 12.5} format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }} />],
          ["Growth", <AnimatedNumberFlow key="b" value={n / 10000} format={{ style: "percent", maximumFractionDigits: 1 }} />],
          ["Users", <AnimatedNumberFlow key="c" value={n * 80} format={{ notation: "compact", maximumFractionDigits: 1 }} />],
          ["Latency", <AnimatedNumberFlow key="d" value={n / 20} suffix="ms" format={{ maximumFractionDigits: 1, minimumFractionDigits: 1 }} />],
        ].map(([label, value]) => (
          <div key={label as string} className="rounded-xl border bg-card p-3">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="text-2xl font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="flex justify-center gap-2">
        <button type="button" onClick={() => setN((v) => Math.max(0, v - 417.3))} className="h-8 rounded-md border px-3 text-[13px] font-medium outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50">
          Lower
        </button>
        <button type="button" onClick={() => setN((v) => v + 982.7)} className="h-8 rounded-md border px-3 text-[13px] font-medium outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50">
          Raise
        </button>
      </div>
    </div>
  )
}
