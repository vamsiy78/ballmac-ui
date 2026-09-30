"use client"

import * as React from "react"

import { AiOrb, type OrbState } from "@/components/ballmac/ai-orb"

const states: OrbState[] = ["idle", "listening", "thinking", "speaking"]

export default function AiOrbDemo() {
  const [state, setState] = React.useState<OrbState>("thinking")
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <AiOrb size="xl" state={state} level={state === "speaking" ? 0.35 : 0} />
      <div role="group" aria-label="Orb state" className="inline-flex gap-1 rounded-lg bg-muted p-1">
        {states.map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={state === s}
            onClick={() => setState(s)}
            className="h-8 rounded-md px-3 text-[13px] font-medium text-muted-foreground capitalize outline-none transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:shadow-xs"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}
