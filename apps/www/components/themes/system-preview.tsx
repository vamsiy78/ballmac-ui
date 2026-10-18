"use client"

import * as React from "react"
import { ArrowUpRight, Search, TrendingUp } from "lucide-react"
import { reducedMotionFields, type ThemeSpec } from "@ballmac-ui/theme-engine"

import { AppWindow, AppWindowContent, AppWindowTitleBar } from "@/components/ballmac/app-window"
import { Badge } from "@/components/ballmac/badge"
import { Button } from "@/components/ballmac/button"
import { Input } from "@/components/ballmac/input"
import { Switch } from "@/components/ballmac/switch"
import { MotionProvider } from "@/lib/ballmac/motion"
import "@/lib/generated/fonts.css"
import { cn } from "@/lib/utils"

import { themeStyle, type Mode } from "./theme-style"

const bars = [38, 62, 48, 80, 58, 92, 70]

/**
 * A small product drawn with real Ballmac components in one design system: its colours, corners, typeface, platform feel and motion, scoped
 * to this element only. The window chrome follows the feel (traffic lights, caption buttons, or a plain bar).
 */
export function SystemPreview({ spec, mode, id, reduced = false, className }: { spec: ThemeSpec; mode: Mode; id: string; reduced?: boolean; className?: string }) {
  const m = reduced ? reducedMotionFields(spec) : spec
  const motion = React.useMemo(() => ({ speed: m.speed, bounce: m.bounce, travel: m.travel, hover: m.hover, stagger: m.stagger, ambient: m.ambient }), [m.speed, m.bounce, m.travel, m.hover, m.stagger, m.ambient])
  const [on, setOn] = React.useState(true)
  return (
    <div data-theme-scope={mode} data-feel={spec.feel} className={cn(mode === "dark" && "dark", "@container bg-background text-foreground", className)} style={themeStyle(spec, mode, reduced)}>
      <MotionProvider value={motion}>
        <AppWindow feel={spec.feel} active className="rounded-none border-0 shadow-none">
          <AppWindowTitleBar title="Northwind" icon={<span className="bg-primary size-3.5 rounded-[4px]" />} />
          <AppWindowContent className="grid gap-4 p-4 @md:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <Badge variant="secondary">Overview</Badge>
                <p className="mt-2 text-xl leading-tight font-semibold tracking-tight text-balance @md:text-2xl">Good morning, Maya</p>
                <p className="text-muted-foreground mt-1 text-sm">Three things need you today.</p>
              </div>
              <Button size="sm">
                Review <ArrowUpRight />
              </Button>
            </div>

            <div className="bg-card grid gap-3 rounded-xl border p-3.5">
              <div className="flex items-baseline justify-between gap-2">
                <div>
                  <p className="text-muted-foreground text-xs">Revenue, last 7 days</p>
                  <p className="text-2xl font-semibold tracking-tight tabular-nums">$48,210</p>
                </div>
                <Badge variant="outline" className="gap-1">
                  <TrendingUp aria-hidden="true" /> 12.4%
                </Badge>
              </div>
              <div className="flex h-14 items-end gap-1.5" aria-hidden="true">
                {bars.map((h, i) => (
                  <span key={i} className="flex-1 rounded-t-[min(var(--radius-sm),4px)]" style={{ height: `${h}%`, background: `var(--chart-${(i % 5) + 1})` }} />
                ))}
              </div>
            </div>

            <div className="grid gap-2.5">
              <div className="relative">
                <Search className="text-muted-foreground pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2" aria-hidden="true" />
                <Input aria-label={`Search projects (${id})`} placeholder="Search projects" className="ps-8" />
              </div>
              <label className="flex items-center justify-between gap-3 text-sm">
                Weekly digest
                <Switch checked={on} onCheckedChange={setOn} />
              </label>
              <div className="flex flex-wrap gap-2">
                <Button size="sm">Approve</Button>
                <Button size="sm" variant="outline">
                  Later
                </Button>
                <Button size="sm" variant="ghost">
                  Skip
                </Button>
              </div>
            </div>
          </AppWindowContent>
        </AppWindow>
      </MotionProvider>
    </div>
  )
}

/** A compact tile for choosing a system: its typeface, corner shape, button and the colours that matter, in the system's own tokens. */
export function SystemMini({ spec, mode, className }: { spec: ThemeSpec; mode: Mode; className?: string }) {
  return (
    <div data-theme-scope={mode} data-feel={spec.feel} className={cn(mode === "dark" && "dark", "@container bg-background text-foreground border-border grid gap-3 overflow-hidden rounded-xl border p-3.5", className)} style={themeStyle(spec, mode)} aria-hidden="true">
      <div className="flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="text-4xl leading-none font-semibold tracking-tight">Aa</p>
          <p className="text-muted-foreground mt-1.5 truncate text-xs">Quick brown fox 0123</p>
        </div>
        <div className="flex gap-1" aria-hidden="true">
          {[1, 2, 3].map((n) => (
            <span key={n} className="size-3.5 rounded-full" style={{ background: `var(--chart-${n})` }} />
          ))}
        </div>
      </div>
      <div className="bg-card border-border flex items-center justify-between gap-2 rounded-[var(--radius)] border p-2">
        <span className="bg-muted h-1.5 w-12 rounded-full" />
        <span className="bg-primary text-primary-foreground grid h-6 place-items-center rounded-[calc(var(--radius)-4px)] px-2.5 text-[11px] font-semibold">Button</span>
      </div>
    </div>
  )
}
