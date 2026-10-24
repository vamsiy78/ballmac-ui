"use client"

import * as React from "react"

import { SegmentedControl, SegmentedControlItem } from "@/components/ballmac/segmented-control"
import { Themed } from "@/components/pro/shots"
import { cn } from "@/lib/utils"

const BLOCKS = [
  { id: "dashboard-pro-1", label: "Dashboard", alt: "Revenue dashboard with cards, a chart and a quarterly goal" },
  { id: "settings-pro-1", label: "Settings", alt: "Notification settings with a grid of switches and quiet hours" },
  { id: "billing-pro-1", label: "Billing", alt: "Billing with plan usage, a payment method and invoices" },
] as const

const FEELS = [
  { id: "web", label: "Web" },
  { id: "macos", label: "macOS" },
  { id: "windows", label: "Windows" },
  { id: "ios", label: "iOS" },
] as const

/**
 * The paid product itself, in each platform feel: the same real Pro blocks, captured with one attribute changed on the page. The pictures are screenshots
 * of the blocks' own preview routes, so what is shown is what installs.
 */
export function FeelBlocks({ className }: { className?: string }) {
  const [block, setBlock] = React.useState<(typeof BLOCKS)[number]["id"]>("settings-pro-1")
  const [feel, setFeel] = React.useState<(typeof FEELS)[number]["id"]>("macos")
  const current = BLOCKS.find((b) => b.id === block)!
  return (
    <div className={cn("grid min-w-0 gap-4", className)}>
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
        <SegmentedControl aria-label="Pro block" value={block} onValueChange={(v) => setBlock(v as typeof block)}>
          {BLOCKS.map((b) => (
            <SegmentedControlItem key={b.id} value={b.id}>
              {b.label}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
        <SegmentedControl aria-label="Platform feel" value={feel} onValueChange={(v) => setFeel(v as typeof feel)}>
          {FEELS.map((f) => (
            <SegmentedControlItem key={f.id} value={f.id}>
              {f.label}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
      </div>
      <div className="bg-background overflow-hidden rounded-2xl border shadow-[0_28px_70px_-40px_rgb(0_0_0/0.45)]">
        <div className="bg-muted/50 flex h-8 items-center gap-1.5 border-b px-3" aria-hidden="true">
          <span className="bg-foreground/15 size-2.5 rounded-full" />
          <span className="bg-foreground/15 size-2.5 rounded-full" />
          <span className="bg-foreground/15 size-2.5 rounded-full" />
          <span className="text-muted-foreground ms-3 truncate font-mono text-[11px]">{block} · data-feel=&quot;{feel}&quot;</span>
        </div>
        <div className="p-3 sm:p-5" aria-live="polite">
          <Themed key={`${block}-${feel}`} base={`/marketing/feels/${block}-${feel}`} alt={`${current.alt}, in the ${FEELS.find((f) => f.id === feel)!.label} feel`} width={1200} height={750} />
        </div>
      </div>
      <p className="text-muted-foreground text-center text-sm">Same block, same code. Only one attribute on the page changes.</p>
    </div>
  )
}
