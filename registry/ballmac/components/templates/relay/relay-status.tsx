// Ballmac UI: Relay status page. https://ui.ballmac.com/templates/template-relay
import * as React from "react"
import { CheckCircle2 } from "lucide-react"

import { RelayShell, type RelayHrefs } from "@/components/ballmac/templates/relay/relay-theme"
import { cn } from "@/lib/utils"

const mono = { fontFamily: "var(--relay-mono)" } as const

type Day = "up" | "degraded" | "down"

/** Ninety days of history. Fixed, so the server and browser draw the same bars. */
function history(seed: number, degraded: number[], down: number[]): Day[] {
  return Array.from({ length: 90 }, (_, i) => (down.includes(i + seed) ? "down" : degraded.includes(i + seed) ? "degraded" : "up"))
}

const components: { name: string; uptime: string; days: Day[] }[] = [
  { name: "Event ingestion API", uptime: "99.998%", days: history(0, [41], []) },
  { name: "Delivery workers", uptime: "99.991%", days: history(0, [12, 57], [58]) },
  { name: "Dashboard", uptime: "99.987%", days: history(0, [23, 24, 71], []) },
  { name: "Replay and search", uptime: "99.996%", days: history(0, [66], []) },
  { name: "Webhooks to customers (global)", uptime: "99.994%", days: history(0, [57, 58], []) },
]

const incidents = [
  { date: "Sep 24, 2026", title: "Delayed deliveries in eu-central", status: "Resolved", body: "A partial network failure in Frankfurt slowed deliveries by up to 4 minutes. Events were queued and delivered in order; nothing was lost.", duration: "37 minutes" },
  { date: "Aug 15, 2026", title: "Dashboard search timeouts", status: "Resolved", body: "Searches over 30 days of history timed out for 11 minutes after an index rebuild. Ingestion and delivery were unaffected.", duration: "11 minutes" },
  { date: "Jul 29, 2026", title: "Elevated 5xx on the ingestion API", status: "Resolved", body: "A bad deploy returned errors for 0.4 percent of requests. We rolled back in 6 minutes. Clients using idempotency keys retried safely.", duration: "6 minutes" },
]

const tone: Record<Day, string> = { up: "bg-chart-2", degraded: "bg-chart-3", down: "bg-destructive" }
const word: Record<Day, string> = { up: "operational", degraded: "degraded", down: "outage" }

type RelayStatusProps = React.ComponentProps<"div"> & { hrefs?: Partial<RelayHrefs> }

/** Relay status: an overall banner, 90-day uptime bars per component and recent incidents. */
function RelayStatus({ hrefs, ...props }: RelayStatusProps) {
  return (
    <RelayShell page="status" hrefs={hrefs} {...props}>
      <main className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="text-chart-1 text-xs font-semibold tracking-wider uppercase" style={mono}>System status</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-balance sm:text-5xl">Status</h1>
        <div role="status" className="border-chart-2/40 bg-chart-2/10 mt-8 flex items-center gap-3 rounded-lg border px-5 py-4">
          <CheckCircle2 className="text-chart-2 size-6 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-semibold">All systems operational</p>
            <p className="text-muted-foreground text-sm">Updated 09:41 UTC · Median delivery latency 38 ms</p>
          </div>
        </div>

        <section aria-labelledby="relay-uptime" className="mt-12">
          <h2 id="relay-uptime" className="text-xl font-semibold tracking-[-0.02em]">Uptime, last 90 days</h2>
          <ul className="mt-5 space-y-3">
            {components.map((c) => (
              <li key={c.name} className="bg-card rounded-lg border p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-medium">{c.name}</h3>
                  <span className="text-chart-2 text-sm tabular-nums" style={mono}>{c.uptime}</span>
                </div>
                <div className="mt-4 flex h-8 gap-px" role="img" aria-label={`${c.name}: ${c.days.filter((d) => d === "up").length} of 90 days operational, ${c.days.filter((d) => d === "degraded").length} degraded, ${c.days.filter((d) => d === "down").length} outage`}>
                  {c.days.map((d, i) => <span key={i} className={cn("min-w-0 flex-1 rounded-[1px]", tone[d])} title={`${90 - i} days ago: ${word[d]}`} />)}
                </div>
                <div className="text-muted-foreground mt-2 flex justify-between text-xs" style={mono}><span>90 days ago</span><span>Today</span></div>
              </li>
            ))}
          </ul>
          <ul className="text-muted-foreground mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs">
            {(["up", "degraded", "down"] as Day[]).map((d) => <li key={d} className="flex items-center gap-1.5"><span className={cn("size-2.5 rounded-[2px]", tone[d])} aria-hidden="true" />{word[d][0].toUpperCase() + word[d].slice(1)}</li>)}
          </ul>
        </section>

        <section aria-labelledby="relay-incidents" className="mt-14">
          <h2 id="relay-incidents" className="text-xl font-semibold tracking-[-0.02em]">Past incidents</h2>
          <ol className="mt-5 space-y-6">
            {incidents.map((i) => (
              <li key={i.title} className="border-l-2 pl-5">
                <p className="text-muted-foreground text-xs" style={mono}>{i.date} · {i.duration}</p>
                <h3 className="mt-1 font-semibold">{i.title} <span className="bg-chart-2/15 ml-1 rounded px-1.5 py-0.5 text-[11px] font-medium">{i.status}</span></h3>
                <p className="text-muted-foreground mt-2 text-sm text-pretty">{i.body}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </RelayShell>
  )
}

export { RelayStatus, type RelayStatusProps }
