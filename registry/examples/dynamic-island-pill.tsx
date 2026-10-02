"use client"

import * as React from "react"
import { Mic, Phone, PhoneOff } from "lucide-react"

import { DynamicIsland, DynamicIslandView } from "@/components/ballmac/dynamic-island"

export default function DynamicIslandPill() {
  const [view, setView] = React.useState<"idle" | "call" | "expanded">("call")

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-4">
      <DynamicIsland view={view}>
        <DynamicIslandView value="idle" radius={18} className="h-9 w-32" />
        <DynamicIslandView value="call" radius={18} label="Call in progress" className="h-9 w-56 justify-between px-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-chart-2 text-black">
            <Phone className="size-3.5" aria-hidden="true" />
          </span>
          <span className="pe-1 text-[13px] font-medium tabular-nums text-chart-2">12:04</span>
        </DynamicIslandView>
        <DynamicIslandView value="expanded" radius={34} label="Call with Design Review, 12 minutes" className="w-[min(340px,calc(100vw-3rem))] flex-col items-stretch gap-4 p-4">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-full bg-linear-to-b from-chart-4/80 to-chart-4 text-sm font-semibold">DR</span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs text-white/55">Acme Meet</span>
              <span className="block truncate text-[15px] font-semibold">Design Review</span>
            </span>
            <span className="text-[13px] tabular-nums text-chart-2">12:04</span>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" aria-label="Mute" className="flex size-10 items-center justify-center rounded-full bg-white/15 outline-none hover:bg-white/25 focus-visible:ring-2 focus-visible:ring-white/60">
              <Mic className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="End call"
              onClick={() => setView("idle")}
              className="flex size-10 items-center justify-center rounded-full bg-destructive outline-none hover:brightness-110 focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <PhoneOff className="size-5" aria-hidden="true" />
            </button>
          </div>
        </DynamicIslandView>
      </DynamicIsland>
      <div className="flex gap-2">
        {(["idle", "call", "expanded"] as const).map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={view === v}
            onClick={() => setView(v)}
            className="h-8 rounded-md border bg-background px-3 text-sm capitalize outline-none aria-pressed:bg-foreground aria-pressed:text-background focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  )
}
