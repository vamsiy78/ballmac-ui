"use client"

import { Terminal } from "lucide-react"
import * as React from "react"

import { Themed } from "@/components/pro/shots"
import { cn } from "@/lib/utils"

type StateInfo = { key: string; label: string; text: string; alt: string }

/**
 * The same Pro block in each of its states, one at a time and large enough to read. The buttons switch between them, and the line of code beneath shows
 * the one prop that does it. Every picture is in the page (they are a few kilobytes), so switching never waits on the network.
 */
export function StateSwitcher({ states, block }: { states: StateInfo[]; block: string }) {
  const [active, setActive] = React.useState(states[0]?.key ?? "")
  const current = states.find((s) => s.key === active) ?? states[0]
  if (!current) return null
  return (
    <div>
      <div role="group" aria-label="Show the block in a state" className="bg-muted/60 mx-auto flex w-fit gap-1 rounded-full border p-1">
        {states.map((s) => (
          <button
            key={s.key}
            type="button"
            aria-pressed={active === s.key}
            onClick={() => setActive(s.key)}
            className={cn(
              "focus-visible:ring-ring/50 rounded-full px-5 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px]",
              active === s.key ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="bg-card mt-8 overflow-hidden rounded-2xl border shadow-[0_28px_70px_-40px_rgb(0_0_0/0.35)]">
        {states.map((s) => (
          <div key={s.key} hidden={active !== s.key}>
            <Themed base={`/marketing/state-${s.key}`} alt={s.alt} width={1800} height={575} />
          </div>
        ))}
      </div>
      <p className="text-muted-foreground mx-auto mt-5 max-w-xl text-center text-[15px] leading-relaxed" aria-live="polite">
        {current.text}
      </p>
      <div role="region" aria-label="How the state is set" tabIndex={0} className="bg-muted/50 focus-visible:ring-ring/50 mx-auto mt-6 flex w-fit max-w-full items-center gap-3 overflow-x-auto rounded-xl border px-4 py-3 font-mono text-[13px] outline-none focus-visible:ring-[3px]">
        <Terminal className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
        <code className="whitespace-nowrap">{`<${block} state="${current.key}" onRetry={refetch} />`}</code>
      </div>
    </div>
  )
}
