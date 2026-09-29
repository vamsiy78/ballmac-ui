import { Activity, Gauge, Rocket, Settings2 } from "lucide-react"

import {
  AnimatedTabs,
  AnimatedTabsContent,
  AnimatedTabsList,
  AnimatedTabsTrigger,
} from "@/components/ballmac/animated-tabs"

const bars = [42, 58, 50, 72, 64, 80, 76, 92, 70, 88, 96, 84]

export default function AnimatedTabsDemo() {
  return (
    <AnimatedTabs defaultValue="overview" className="w-full max-w-md">
      <AnimatedTabsList aria-label="Project" className="self-center">
        <AnimatedTabsTrigger value="overview" className="max-sm:px-3 max-sm:[&_svg]:hidden">
          <Gauge aria-hidden="true" />
          Overview
        </AnimatedTabsTrigger>
        <AnimatedTabsTrigger value="activity" className="max-sm:px-3 max-sm:[&_svg]:hidden">
          <Activity aria-hidden="true" />
          Activity
        </AnimatedTabsTrigger>
        <AnimatedTabsTrigger value="deploys" className="max-sm:px-3 max-sm:[&_svg]:hidden">
          <Rocket aria-hidden="true" />
          Deploys
        </AnimatedTabsTrigger>
        <AnimatedTabsTrigger value="settings" aria-label="Settings">
          <Settings2 aria-hidden="true" />
        </AnimatedTabsTrigger>
      </AnimatedTabsList>

      <div className="min-h-52 rounded-xl border bg-card p-5 shadow-xs">
        <AnimatedTabsContent value="overview">
          <p className="text-sm text-muted-foreground">Requests, last 12 hours</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">1.28M</p>
          <div className="mt-4 flex h-24 items-end gap-1.5" aria-hidden="true">
            {bars.map((h, i) => (
              <span
                key={i}
                className="flex-1 rounded-t-sm bg-[linear-gradient(180deg,var(--chart-1),color-mix(in_oklch,var(--chart-1)_30%,transparent))]"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </AnimatedTabsContent>
        <AnimatedTabsContent value="activity">
          <ul className="space-y-3 text-sm">
            {[
              ["Maya merged", "feat/billing-v2", "2m"],
              ["Deploy promoted", "v2.4.0 → production", "9m"],
              ["Alert resolved", "p95 latency back under 200 ms", "31m"],
            ].map(([what, detail, when]) => (
              <li key={what} className="flex items-start gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-chart-2" aria-hidden="true" />
                <span className="flex-1">
                  <span className="font-medium">{what}</span>
                  <span className="block text-muted-foreground">{detail}</span>
                </span>
                <span className="font-mono text-xs text-muted-foreground">{when}</span>
              </li>
            ))}
          </ul>
        </AnimatedTabsContent>
        <AnimatedTabsContent value="deploys">
          <div className="space-y-2 font-mono text-xs">
            {[
              ["v2.4.0", "production", "Ready"],
              ["v2.4.0-rc.2", "preview", "Ready"],
              ["v2.3.9", "production", "Retired"],
            ].map(([v, env, state]) => (
              <div key={v} className="flex items-center gap-3 rounded-md border bg-background px-3 py-2">
                <span className="font-medium">{v}</span>
                <span className="text-muted-foreground">{env}</span>
                <span className="ml-auto">{state}</span>
              </div>
            ))}
          </div>
        </AnimatedTabsContent>
        <AnimatedTabsContent value="settings">
          <p className="text-sm font-medium">Project settings</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Rename the project, rotate deploy keys or transfer it to another team.
          </p>
        </AnimatedTabsContent>
      </div>
    </AnimatedTabs>
  )
}
