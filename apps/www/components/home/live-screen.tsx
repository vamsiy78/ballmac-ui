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
const Agent13 = React.lazy(() => import("@/components/ballmac/blocks/agent-13/agent-13").then((m) => ({ default: m.Agent13 })))
const Agent16 = React.lazy(() => import("@/components/ballmac/blocks/agent-16/agent-16").then((m) => ({ default: m.Agent16 })))
const Agent17 = React.lazy(() => import("@/components/ballmac/blocks/agent-17/agent-17").then((m) => ({ default: m.Agent17 })))
const Alerts1 = React.lazy(() => import("@/components/ballmac/blocks/alerts-1/alerts-1").then((m) => ({ default: m.Alerts1 })))

export const LIVE_SCREENS = {
  "dashboard-1": { title: "Dashboard", width: 1152, render: () => <Dashboard1 /> },
  "billing-1": { title: "Billing", width: 1024, render: () => <Billing1 /> },
  "agent-12": { title: "Agent mission control", width: 1280, render: () => <Agent12 /> },
  "analytics-1": { title: "Analytics", width: 1152, render: () => <Analytics1 /> },
  "alerts-1": { title: "Alerts", width: 896, render: () => <Alerts1 /> },
  "agent-13": { title: "Review desk", width: 1024, render: () => <Agent13 /> },
  "agent-16": { title: "Answers with sources", width: 1152, render: () => <Agent16 /> },
  "agent-17": { title: "Prompt evaluation", width: 896, render: () => <Agent17 /> },
} as const

/** The width the thumbnails were captured at. A block drawn at a different width has its picture enlarged by the same amount, so the two always match. */
const THUMB_WIDTH = 1280

export type LiveScreenId = keyof typeof LIVE_SCREENS

/**
 * A real block, laid out at its own design width and scaled to fit its frame by width alone, so nothing is ever stretched. A picture of the same block sits
 * underneath, enlarged by the same amount (and never cropped to fill), so the frame is never empty while the live block loads and nothing jumps when it arrives.
 * It is decoration for assistive technology; the block has its own page where it can be used.
 */
export function LiveScreen({ id, poster, className, theme, style }: { id: LiveScreenId; poster?: React.ReactNode; className?: string; theme?: "light" | "dark"; style?: React.CSSProperties }) {
  const screen = LIVE_SCREENS[id]
  return (
    <div aria-hidden="true" style={style} className={cn("bg-background text-foreground relative isolate aspect-[16/10] w-full overflow-hidden", theme === "dark" && "dark", theme === "light" && "bm-light", className)}>
      {poster && (
        <div className="absolute top-0 [&_img]:h-auto [&_img]:w-full" style={{ width: `${(THUMB_WIDTH / screen.width) * 100}%`, insetInlineStart: "50%", transform: "translateX(-50%)" }}>
          {poster}
        </div>
      )}
      <LazyMount className="absolute inset-0" rootMargin="400px">
        <div className="bg-background text-foreground absolute inset-0">
          <React.Suspense fallback={null}><FitWidth width={screen.width}>{screen.render()}</FitWidth></React.Suspense>
        </div>
      </LazyMount>
    </div>
  )
}
