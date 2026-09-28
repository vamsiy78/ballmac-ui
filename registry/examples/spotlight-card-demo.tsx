import { Gauge } from "lucide-react"

import { SpotlightCard } from "@/components/ballmac/spotlight-card"

export default function SpotlightCardDemo() {
  return (
    <SpotlightCard className="w-full max-w-sm">
      <div className="flex size-9 items-center justify-center rounded-md border bg-background">
        <Gauge className="size-4" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-base font-semibold tracking-tight">Latency budgets</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Set a p95 target per route and get a warning in review when a change would push it over.
      </p>
      <p className="mt-4 font-mono text-xs text-muted-foreground">p95 · 180 ms target</p>
    </SpotlightCard>
  )
}
