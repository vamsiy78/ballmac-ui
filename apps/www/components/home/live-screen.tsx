"use client"

import * as React from "react"

import { FitWidth } from "@/components/site/fit-preview"
import { LazyMount } from "@/components/site/lazy-mount"
import { cn } from "@/lib/utils"

/**
 * The real blocks from the library, by name. The homepage draws these, not pictures of them. Each is loaded on its own, only when it is about to be seen, so the
 * blocks and the chart library behind them stay out of the first page load.
 */
const Dashboard1 = React.lazy(() => import("@/components/ballmac/blocks/dashboard-1/dashboard-1").then((m) => ({ default: m.Dashboard1 })))
const Billing1 = React.lazy(() => import("@/components/ballmac/blocks/billing-1/billing-1").then((m) => ({ default: m.Billing1 })))
const Agent12 = React.lazy(() => import("@/components/ballmac/blocks/agent-12/agent-12").then((m) => ({ default: m.Agent12 })))
const Analytics1 = React.lazy(() => import("@/components/ballmac/blocks/analytics-1/analytics-1").then((m) => ({ default: m.Analytics1 })))
const Alerts1 = React.lazy(() => import("@/components/ballmac/blocks/alerts-1/alerts-1").then((m) => ({ default: m.Alerts1 })))

export const LIVE_SCREENS = {
  "dashboard-1": { title: "Dashboard", render: () => <Dashboard1 /> },
  "billing-1": { title: "Billing", render: () => <Billing1 /> },
  "agent-12": { title: "Agent mission control", render: () => <Agent12 /> },
  "analytics-1": { title: "Analytics", render: () => <Analytics1 /> },
  "alerts-1": { title: "Alerts", render: () => <Alerts1 /> },
} as const

export type LiveScreenId = keyof typeof LIVE_SCREENS

/**
 * A real block, laid out at desktop width and scaled to fit its frame. A picture of the same block sits underneath, so the frame is never empty while the live
 * one loads and nothing jumps when it arrives. It is decoration for assistive technology; the block has its own page where it can be used.
 */
export function LiveScreen({ id, poster, className, theme, style }: { id: LiveScreenId; poster?: React.ReactNode; className?: string; theme?: "light" | "dark"; style?: React.CSSProperties }) {
  const screen = LIVE_SCREENS[id]
  return (
    <div aria-hidden="true" style={style} className={cn("bg-background text-foreground relative isolate aspect-[16/10] w-full overflow-hidden", theme === "dark" && "dark", theme === "light" && "bm-light", className)}>
      {poster && <div className="absolute inset-0 [&_img]:size-full [&_img]:object-cover [&_img]:object-top">{poster}</div>}
      <LazyMount className="absolute inset-0" rootMargin="400px">
        <div className="bg-background text-foreground absolute inset-0">
          <React.Suspense fallback={null}><FitWidth>{screen.render()}</FitWidth></React.Suspense>
        </div>
      </LazyMount>
    </div>
  )
}
