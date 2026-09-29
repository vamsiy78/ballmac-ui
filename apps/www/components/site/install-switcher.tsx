"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/** CLI / Manual tabs for an item's installation section. Both panels are server-rendered. */
export function InstallSwitcher({ cli, manual }: { cli: React.ReactNode; manual: React.ReactNode }) {
  const [tab, setTab] = React.useState<"cli" | "manual">("cli")
  const id = React.useId()
  const tabs = [
    ["cli", "CLI"],
    ["manual", "Manual"],
  ] as const
  return (
    <div className="space-y-4">
      <div
        role="tablist"
        aria-label="Installation method"
        className="flex gap-5 border-b"
        onKeyDown={(e) => {
          if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return
          const next = tab === "cli" ? "manual" : "cli"
          setTab(next)
          document.getElementById(`${id}-${next}`)?.focus()
        }}
      >
        {tabs.map(([value, label]) => (
          <button
            key={value}
            role="tab"
            id={`${id}-${value}`}
            aria-selected={tab === value}
            aria-controls={`${id}-${value}-panel`}
            tabIndex={tab === value ? 0 : -1}
            onClick={() => setTab(value)}
            className={cn(
              "focus-visible:ring-ring/50 -mb-px border-b-2 pb-2 text-sm font-medium outline-none transition-colors focus-visible:rounded-sm focus-visible:ring-[3px]",
              tab === value ? "border-foreground text-foreground" : "text-muted-foreground hover:text-foreground border-transparent"
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div id={`${id}-cli-panel`} role="tabpanel" aria-labelledby={`${id}-cli`} hidden={tab !== "cli"}>
        {cli}
      </div>
      <div id={`${id}-manual-panel`} role="tabpanel" aria-labelledby={`${id}-manual`} hidden={tab !== "manual"}>
        {manual}
      </div>
    </div>
  )
}
