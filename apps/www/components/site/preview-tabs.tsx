"use client"

import { RotateCcw } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"

/** Preview / Code tabs. The preview can be replayed (remounted) for motion components. */
export function PreviewTabs({
  preview,
  code,
  className,
  minHeight = 320,
}: {
  preview: React.ReactNode
  code: React.ReactNode
  className?: string
  minHeight?: number
}) {
  const [tab, setTab] = React.useState<"preview" | "code">("preview")
  const [run, setRun] = React.useState(0)
  const id = React.useId()
  return (
    <div className={cn("overflow-hidden rounded-xl border", className)}>
      <div className="bg-card flex h-11 items-center justify-between border-b px-2">
        <div role="tablist" className="flex gap-1">
          {(["preview", "code"] as const).map((t) => (
            <button
              key={t}
              role="tab"
              id={`${id}-${t}`}
              aria-selected={tab === t}
              aria-controls={`${id}-${t}-panel`}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-md px-3 py-1.5 text-[13px] font-medium capitalize transition-colors",
                tab === t ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t}
            </button>
          ))}
        </div>
        {tab === "preview" && (
          <button
            type="button"
            onClick={() => setRun((r) => r + 1)}
            className="text-muted-foreground hover:text-foreground hover:bg-accent inline-flex size-8 items-center justify-center rounded-md"
            aria-label="Replay preview"
          >
            <RotateCcw className="size-3.5" />
          </button>
        )}
      </div>
      <div id={`${id}-preview-panel`} role="tabpanel" aria-labelledby={`${id}-preview`} hidden={tab !== "preview"}>
        <div className="bm-stage flex items-center justify-center p-8 sm:p-12" style={{ minHeight }}>
          <React.Fragment key={run}>{preview}</React.Fragment>
        </div>
      </div>
      <div id={`${id}-code-panel`} role="tabpanel" aria-labelledby={`${id}-code`} hidden={tab !== "code"}>
        {code}
      </div>
    </div>
  )
}
