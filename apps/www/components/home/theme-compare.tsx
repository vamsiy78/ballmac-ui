"use client"

import * as React from "react"
import { GripVertical } from "lucide-react"

import { Agent10 } from "@/components/ballmac/blocks/agent-10/agent-10"
import { Alerts1 } from "@/components/ballmac/blocks/alerts-1/alerts-1"
import { Billing1 } from "@/components/ballmac/blocks/billing-1/billing-1"
import { Dashboard1 } from "@/components/ballmac/blocks/dashboard-1/dashboard-1"
import { cn } from "@/lib/utils"

const SCREENS = [
  { id: "dashboard-1", name: "Dashboard", render: () => <Dashboard1 /> },
  { id: "billing-1", name: "Billing", render: () => <Billing1 /> },
  { id: "agent-10", name: "Agent console", render: () => <Agent10 /> },
  { id: "alerts-1", name: "Alerts", render: () => <Alerts1 /> },
] as const

/**
 * One real screen from the library, drawn twice: light on the left, dark on the right, with a handle to drag between them. Both halves are the
 * same code with only the theme changed. The handle is a real slider (arrow keys, Home and End) and the screens are decoration for assistive tech.
 */
export function ThemeCompare({ className }: { className?: string }) {
  const [id, setId] = React.useState<(typeof SCREENS)[number]["id"]>("dashboard-1")
  const [pos, setPos] = React.useState(50)
  const area = React.useRef<HTMLDivElement>(null)
  const dragging = React.useRef(false)
  const screen = SCREENS.find((s) => s.id === id)!

  const move = (clientX: number) => {
    const r = area.current?.getBoundingClientRect()
    if (!r || r.width === 0) return
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)))
  }

  return (
    <div className={cn("grid gap-6", className)}>
      <div role="group" aria-label="Screen" className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1">
        {SCREENS.map((s) => (
          <button
            key={s.id}
            type="button"
            aria-pressed={id === s.id}
            onClick={() => setId(s.id)}
            className={cn(
              "focus-visible:ring-ring/50 relative rounded-md px-3 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px] motion-reduce:transition-none",
              id === s.id ? "text-foreground after:bg-foreground after:absolute after:inset-x-3 after:-bottom-px after:h-px" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className="bg-background overflow-hidden rounded-2xl border shadow-[0_30px_80px_-30px_rgb(0_0_0/0.3)]">
        <div className="bg-muted/60 flex h-10 items-center gap-3 border-b px-4" aria-hidden="true">
          <span className="flex w-20 gap-1.5">
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
          </span>
          <span className="text-muted-foreground bg-background/70 mx-auto w-full max-w-xs truncate rounded-md px-3 py-0.5 text-center text-xs">app.acme.com</span>
          <span className="text-muted-foreground w-20 text-end text-xs whitespace-nowrap">Light | Dark</span>
        </div>
        <div
          ref={area}
          className="relative h-[520px] touch-pan-y overflow-hidden select-none sm:h-[620px]"
          onPointerDown={(e) => { dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); move(e.clientX) }}
          onPointerMove={(e) => { if (dragging.current) move(e.clientX) }}
          onPointerUp={() => { dragging.current = false }}
          onPointerCancel={() => { dragging.current = false }}
        >
          <div inert aria-hidden="true" data-theme-scope="light" className="bm-light bg-background text-foreground absolute inset-0 overflow-hidden">
            {screen.render()}
          </div>
          <div inert aria-hidden="true" className="dark bg-background text-foreground absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
            {screen.render()}
          </div>
          <div className="pointer-events-none absolute inset-y-0 w-px bg-white/90 shadow-[0_0_0_1px_rgb(0_0_0/0.15)]" style={{ left: `${pos}%` }} />
          <button
            type="button"
            role="slider"
            aria-label="Compare light and dark"
            aria-orientation="horizontal"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(pos)}
            aria-valuetext={`${Math.round(pos)}% light`}
            onKeyDown={(e) => {
              const step = e.shiftKey ? 20 : 5
              if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - step))
              else if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + step))
              else if (e.key === "Home") setPos(0)
              else if (e.key === "End") setPos(100)
              else return
              e.preventDefault()
            }}
            className="focus-visible:ring-ring/60 absolute top-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border bg-white text-black shadow-lg outline-none focus-visible:ring-[3px]"
            style={{ left: `${pos}%` }}
          >
            <GripVertical aria-hidden="true" className="size-4" />
          </button>
        </div>
      </div>
      <p className="text-muted-foreground text-center text-sm">Drag to compare. It is the same code in both halves, with only the theme changed.</p>
    </div>
  )
}
