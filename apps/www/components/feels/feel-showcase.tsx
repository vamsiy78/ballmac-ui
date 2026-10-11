"use client"

import * as React from "react"
import { Monitor, Smartphone, SquareStack } from "lucide-react"
import { FEELS, type FeelId } from "@ballmac-ui/theme-engine"

import { SegmentedControl, SegmentedControlItem } from "@/components/ballmac/segmented-control"
import { MiniApp } from "@/components/themes/feel-compare"
import { cn } from "@/lib/utils"

const px = (v: string) => (v.startsWith("calc(var(--spacing) * ") ? Number.parseFloat(v.slice(22)) * 4 : v.endsWith("rem") ? Number.parseFloat(v) * 16 : Number.parseFloat(v))
const WHERE: Record<FeelId, { icon: React.ElementType; line: string }> = {
  web: { icon: SquareStack, line: "The neutral default" },
  macos: { icon: Monitor, line: "Tauri and Electron apps on a Mac" },
  windows: { icon: Monitor, line: "Tauri and Electron apps on Windows" },
  ios: { icon: Smartphone, line: "Phones, PWAs and webviews" },
}

/** One live app, four ways to handle. The facts under it are read from the same values the components use. */
export function FeelShowcase() {
  const [feel, setFeel] = React.useState<FeelId>("macos")
  const f = FEELS.find((x) => x.slug === feel)!
  const facts = [
    { label: "Controls", value: `${px(f.tokens.control.h)} px` },
    { label: "Corners", value: `${Number((f.spec.radius * 16).toFixed(1))} px` },
    { label: "Focus ring", value: `${f.tokens.focus.width}, ${f.tokens.focus.alpha}` },
    { label: "Text", value: `${px(f.tokens.text.sm[0])} px` },
    { label: "Window controls", value: f.controls === "left" ? "Left" : f.controls === "right" ? "Right" : "None" },
    { label: "Menu rows", value: `${px(f.tokens.menu.itemH)} px` },
  ]
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl aria-label="Platform feel" value={feel} onValueChange={(v) => setFeel(v as FeelId)}>
          {FEELS.map((x) => (
            <SegmentedControlItem key={x.slug} value={x.slug}>
              {x.title}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
        <p className="text-muted-foreground text-sm">{WHERE[feel].line}</p>
      </div>

      {/* data-feel scopes the feel to this block; the page around it is unchanged */}
      <div data-feel={feel} className="bg-muted/40 relative isolate overflow-hidden rounded-3xl border p-4 sm:p-10">
        <div aria-hidden="true" className="bm-grid pointer-events-none absolute inset-0 -z-10 opacity-60" />
        <div className="mx-auto max-w-xl">
          <MiniApp feel={feel} />
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {facts.map((x) => (
          <div key={x.label} className={cn("bg-card rounded-xl border p-3.5")}>
            <dt className="text-muted-foreground text-xs">{x.label}</dt>
            <dd className="mt-1 text-lg font-semibold tracking-tight tabular-nums">{x.value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-muted-foreground max-w-3xl text-sm leading-6">{f.description}</p>
    </div>
  )
}
