// Ballmac UI: Thinking Indicator. https://ui.ballmac.com/components/thinking-indicator
"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

type ThinkingIndicatorProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Animation shown beside the text. "dots" bounces three dots, "bars" is an equalizer, "wave" is a soft sine ribbon and "shimmer" sweeps light across the text only. */
  variant?: "dots" | "bars" | "wave" | "shimmer"
  /** One label, or several that take turns, such as "Reading the files" then "Drafting a reply". */
  label?: string | string[]
  /** Milliseconds each label stays before the next one. */
  interval?: number
  /** Shows a running timer such as "12s" or "1:05". */
  showTimer?: boolean
  /** Elapsed seconds. When set the timer follows this value instead of counting by itself. */
  elapsed?: number
  /** What screen readers hear when thinking starts. The cycling labels are visual only, so a long task does not chatter. */
  statusLabel?: string
  /** Text size of the label. */
  size?: "sm" | "default"
}

function formatElapsed(total: number) {
  const s = Math.max(0, Math.floor(total))
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`
}

function Dots({ reduce }: { reduce: boolean | null }) {
  return (
    <span aria-hidden="true" className="flex h-4 items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-foreground/70"
          animate={reduce ? { opacity: 0.6 } : { y: [0, -4, 0], opacity: [0.35, 1, 0.35] }}
          transition={reduce ? undefined : { duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
        />
      ))}
    </span>
  )
}

function Bars({ reduce }: { reduce: boolean | null }) {
  const heights = [0.45, 0.85, 0.6, 1, 0.5]
  return (
    <span aria-hidden="true" className="flex h-4 items-center gap-[3px]">
      {heights.map((h, i) => (
        <motion.span
          key={i}
          className="block w-[3px] origin-center rounded-full bg-foreground/70"
          style={{ height: "100%" }}
          initial={false}
          animate={reduce ? { scaleY: h } : { scaleY: [h * 0.45, 1, h * 0.45] }}
          transition={reduce ? undefined : { duration: 1.1, repeat: Infinity, delay: i * 0.12, ease: "easeInOut" }}
        />
      ))}
    </span>
  )
}

function Wave({ reduce }: { reduce: boolean | null }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 16" className="h-4 w-12 overflow-hidden text-foreground/70">
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(0 ${(i - 1) * 1.5})`}>
          <motion.path
            d="M0 8 Q 6 1, 12 8 T 24 8 T 36 8 T 48 8 T 60 8 T 72 8"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            opacity={1 - i * 0.32}
            animate={reduce ? undefined : { x: [0, -24] }}
            transition={reduce ? undefined : { duration: 1.6 + i * 0.4, repeat: Infinity, ease: "linear" }}
          />
        </g>
      ))}
    </svg>
  )
}

function ThinkingIndicator({
  variant = "dots",
  label = "Thinking",
  interval = 2600,
  showTimer = false,
  elapsed,
  statusLabel = "Assistant is thinking",
  size = "default",
  className,
  ...props
}: ThinkingIndicatorProps) {
  const reduce = useReducedMotion()
  const labels = React.useMemo(() => (Array.isArray(label) ? label : [label]), [label])
  const [index, setIndex] = React.useState(0)
  const [seconds, setSeconds] = React.useState(0)
  const controlled = elapsed !== undefined

  React.useEffect(() => {
    if (labels.length < 2) return
    const id = setInterval(() => setIndex((i) => (i + 1) % labels.length), interval)
    return () => clearInterval(id)
  }, [labels.length, interval])

  React.useEffect(() => {
    if (!showTimer || controlled) return
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [showTimer, controlled])

  const current = labels[Math.min(index, labels.length - 1)] ?? ""
  const shown = controlled ? elapsed : seconds
  const textClass = size === "sm" ? "text-xs" : "text-sm"

  const text = (
    <span className={cn("relative inline-grid overflow-hidden", textClass)} aria-hidden="true">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={current}
          className={cn(
            "block whitespace-nowrap",
            variant === "shimmer" && !reduce ? "bg-clip-text text-transparent" : "text-muted-foreground"
          )}
          style={
            variant === "shimmer" && !reduce
              ? {
                  backgroundImage:
                    "linear-gradient(90deg, var(--muted-foreground) 35%, var(--foreground) 50%, var(--muted-foreground) 65%)",
                  backgroundSize: "250% 100%",
                }
              : undefined
          }
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
          animate={
            variant === "shimmer" && !reduce
              ? { opacity: 1, y: 0, backgroundPosition: ["100% 0%", "0% 0%"] }
              : { opacity: 1, y: 0 }
          }
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={{
            duration: 0.22,
            backgroundPosition:
              variant === "shimmer" ? { duration: 1.8, repeat: Infinity, ease: "linear" } : undefined,
          }}
        >
          {current}
        </motion.span>
      </AnimatePresence>
    </span>
  )

  return (
    <div
      data-slot="thinking-indicator"
      data-variant={variant}
      role="status"
      className={cn("inline-flex items-center gap-2.5", className)}
      {...props}
    >
      {variant === "dots" && <Dots reduce={reduce} />}
      {variant === "bars" && <Bars reduce={reduce} />}
      {variant === "wave" && <Wave reduce={reduce} />}
      {text}
      {showTimer && (
        <span
          aria-hidden="true"
          className="font-mono text-[11px] text-muted-foreground tabular-nums before:mr-2 before:text-border before:content-['·']"
        >
          {formatElapsed(shown)}
        </span>
      )}
      <span className="sr-only">{statusLabel}</span>
    </div>
  )
}

export { ThinkingIndicator, formatElapsed, type ThinkingIndicatorProps }
