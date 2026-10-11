"use client"

import * as React from "react"
import { RefreshCw } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { SegmentedControl, SegmentedControlItem } from "@/components/ballmac/segmented-control"
import { Skeleton } from "@/components/ballmac/skeleton"
import { StateView } from "@/components/ballmac/state-view"
import { useResource } from "@/lib/ballmac/use-resource"

type Scenario = "normal" | "empty" | "fail"
type Invoice = { id: string; customer: string; amount: string; status: "Paid" | "Due" }

const invoices: Invoice[] = [
  { id: "INV-1042", customer: "Northwind", amount: "$2,400.00", status: "Paid" },
  { id: "INV-1043", customer: "Acme Co.", amount: "$860.00", status: "Due" },
  { id: "INV-1044", customer: "Globex", amount: "$12,150.00", status: "Paid" },
]

/** A fake API: waits, then answers the way the scenario says. Replace it with fetch(). */
function fakeApi(scenario: Scenario, signal: AbortSignal) {
  return new Promise<Invoice[]>((resolve, reject) => {
    const t = setTimeout(() => (scenario === "fail" ? reject(new Error("503 Service Unavailable")) : resolve(scenario === "empty" ? [] : invoices)), 1100)
    signal.addEventListener("abort", () => clearTimeout(t))
  })
}

export default function StateViewResource() {
  const [scenario, setScenario] = React.useState<Scenario>("normal")
  const invoicesResource = useResource((signal) => fakeApi(scenario, signal), { deps: [scenario] })
  return (
    <div className="bg-card w-full max-w-lg rounded-2xl border p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold tracking-tight">Invoices</h3>
        <div className="flex items-center gap-2">
          <SegmentedControl aria-label="What the API returns" value={scenario} onValueChange={(v) => setScenario(v as Scenario)}>
            <SegmentedControlItem value="normal">Data</SegmentedControlItem>
            <SegmentedControlItem value="empty">None</SegmentedControlItem>
            <SegmentedControlItem value="fail">Fails</SegmentedControlItem>
          </SegmentedControl>
          <Button variant="ghost" size="icon-sm" aria-label="Reload" onClick={invoicesResource.retry}>
            <RefreshCw />
          </Button>
        </div>
      </div>
      <StateView
        state={invoicesResource.state}
        loading={
          <div className="grid gap-2" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-11 w-full" />
            ))}
          </div>
        }
        empty={{ title: "No invoices", description: "Invoices appear here once you bill a customer." }}
        error={{ title: "Invoices are unavailable", details: invoicesResource.error instanceof Error ? invoicesResource.error.message : undefined }}
        onRetry={invoicesResource.retry}
      >
        <ul className="grid gap-2">
          {invoicesResource.data?.map((inv) => (
            <li key={inv.id} className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm">
              <div className="min-w-0">
                <p className="font-medium">{inv.customer}</p>
                <p className="text-muted-foreground text-xs">{inv.id}</p>
              </div>
              <div className="text-end">
                <p className="font-medium tabular-nums">{inv.amount}</p>
                <p className={inv.status === "Paid" ? "text-chart-2 text-xs" : "text-muted-foreground text-xs"}>{inv.status}</p>
              </div>
            </li>
          ))}
        </ul>
      </StateView>
    </div>
  )
}
