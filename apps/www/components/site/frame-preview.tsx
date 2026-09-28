"use client"

import { ExternalLink, Monitor, RotateCcw, Smartphone, Tablet } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"

const viewports = [
  { id: "desktop", label: "Desktop", width: "100%", icon: Monitor },
  { id: "tablet", label: "Tablet", width: "768px", icon: Tablet },
  { id: "mobile", label: "Mobile", width: "375px", icon: Smartphone },
] as const

/** Full-page preview in an iframe with a viewport switcher, for blocks and templates. */
export function FramePreview({ src, title, code, height = 720 }: { src: string; title: string; code: React.ReactNode; height?: number }) {
  const [tab, setTab] = React.useState<"preview" | "code">("preview")
  const [viewport, setViewport] = React.useState<(typeof viewports)[number]["id"]>("desktop")
  const [run, setRun] = React.useState(0)
  const width = viewports.find((v) => v.id === viewport)!.width
  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="bg-card flex h-11 items-center justify-between gap-2 border-b px-2">
        <div role="tablist" className="flex gap-1">
          {(["preview", "code"] as const).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
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
          <div className="flex items-center gap-1">
            <div className="hidden items-center gap-0.5 rounded-lg border p-0.5 sm:flex" role="radiogroup" aria-label="Viewport">
              {viewports.map((v) => (
                <button
                  key={v.id}
                  role="radio"
                  aria-checked={viewport === v.id}
                  aria-label={v.label}
                  onClick={() => setViewport(v.id)}
                  className={cn(
                    "inline-flex size-7 items-center justify-center rounded-md transition-colors",
                    viewport === v.id ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <v.icon className="size-3.5" />
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setRun((r) => r + 1)} aria-label="Reload preview" className="text-muted-foreground hover:text-foreground hover:bg-accent inline-flex size-8 items-center justify-center rounded-md">
              <RotateCcw className="size-3.5" />
            </button>
            <a href={src} target="_blank" rel="noreferrer" aria-label="Open preview in a new tab" className="text-muted-foreground hover:text-foreground hover:bg-accent inline-flex size-8 items-center justify-center rounded-md">
              <ExternalLink className="size-3.5" />
            </a>
          </div>
        )}
      </div>
      <div hidden={tab !== "preview"} className="bm-stage flex justify-center">
        <iframe
          key={run}
          src={src}
          title={title}
          loading="lazy"
          className="bg-background block max-w-full border-x transition-[width] duration-300 ease-[var(--bm-ease-out)] first:border-x-0"
          style={{ width, height }}
        />
      </div>
      <div hidden={tab !== "code"}>{code}</div>
    </div>
  )
}
