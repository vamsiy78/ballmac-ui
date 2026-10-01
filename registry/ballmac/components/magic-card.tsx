// Ballmac UI: Magic Card. https://ui.ballmac.com/components/magic-card
"use client"

import * as React from "react"
import { useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

type MagicTone = "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5" | "primary"

const VAR: Record<MagicTone, string> = {
  "chart-1": "var(--chart-1)",
  "chart-2": "var(--chart-2)",
  "chart-3": "var(--chart-3)",
  "chart-4": "var(--chart-4)",
  "chart-5": "var(--chart-5)",
  primary: "var(--primary)",
}

type MagicCardProps = React.ComponentProps<"div"> & {
  /** Radius of the light that follows the pointer, in pixels. */
  size?: number
  /** First color of the border light. */
  from?: MagicTone
  /** Second color of the border light. */
  to?: MagicTone
  /** Also light the inside of the card faintly. */
  glow?: boolean
  /** Classes for the inner surface. */
  contentClassName?: string
}

function MagicCard({ size = 260, from = "chart-1", to = "chart-4", glow = true, className, contentClassName, children, onPointerMove, onPointerLeave, onFocus, onBlur, ...props }: MagicCardProps) {
  const reduce = useReducedMotion()
  const ref = React.useRef<HTMLDivElement>(null)

  // The pointer position goes straight into CSS variables, so moving never re-renders React.
  const place = React.useCallback((x: number, y: number, on: boolean) => {
    const el = ref.current
    if (!el) return
    el.style.setProperty("--mx", `${x}px`)
    el.style.setProperty("--my", `${y}px`)
    el.style.setProperty("--m-on", on ? "1" : "0")
  }, [])

  return (
    <div
      ref={ref}
      data-slot="magic-card"
      onPointerMove={(e) => {
        onPointerMove?.(e)
        if (reduce) return
        const box = e.currentTarget.getBoundingClientRect()
        place(e.clientX - box.left, e.clientY - box.top, true)
      }}
      onPointerLeave={(e) => {
        onPointerLeave?.(e)
        place(0, 0, false)
      }}
      onFocus={(e) => {
        onFocus?.(e)
        const box = e.currentTarget.getBoundingClientRect()
        place(box.width / 2, box.height / 2, true)
      }}
      onBlur={(e) => {
        onBlur?.(e)
        place(0, 0, false)
      }}
      className={cn("group/magic relative isolate rounded-xl p-px [--m-on:0]", className)}
      style={
        {
          "--from": VAR[from],
          "--to": VAR[to],
          "--size": `${size}px`,
          background:
            "radial-gradient(var(--size) circle at var(--mx, -999px) var(--my, -999px), var(--from), var(--to) 45%, transparent 75%), var(--border)",
        } as React.CSSProperties
      }
      {...props}
    >
      <div className={cn("relative h-full overflow-hidden rounded-[calc(var(--radius-xl)-1px)] bg-card text-card-foreground", contentClassName)}>
        {glow && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[calc(var(--m-on)*0.5)] transition-opacity duration-300 motion-reduce:transition-none"
            style={{ background: "radial-gradient(var(--size) circle at var(--mx, -999px) var(--my, -999px), color-mix(in oklab, var(--from) 18%, transparent), transparent 70%)" }}
          />
        )}
        <div className="relative">{children}</div>
      </div>
    </div>
  )
}

export { MagicCard, type MagicCardProps, type MagicTone }
