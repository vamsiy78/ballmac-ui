// Ballmac UI: Highlighter. https://ui.ballmac.com/components/highlighter
"use client"

import * as React from "react"
import { motion, useInView, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

type HighlighterAction = "highlight" | "underline" | "box" | "circle" | "strike" | "bracket"
type HighlighterTone = "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5" | "destructive" | "foreground"

const TONE: Record<HighlighterTone, string> = {
  "chart-1": "text-chart-1",
  "chart-2": "text-chart-2",
  "chart-3": "text-chart-3",
  "chart-4": "text-chart-4",
  "chart-5": "text-chart-5",
  destructive: "text-destructive",
  foreground: "text-foreground",
}

// Drawn in a 100 x 40 box and stretched to the text, with a little wobble so it reads as hand drawn.
/** Scales a path made only of absolute coordinate pairs from the 100 x 40 drawing box to real pixels. */
function scalePath(d: string, sx: number, sy: number) {
  let axis = 0
  return d.replace(/-?\d*\.?\d+/g, (n) => {
    const v = parseFloat(n) * (axis % 2 === 0 ? sx : sy)
    axis++
    return v.toFixed(2)
  })
}

const PATHS: Record<Exclude<HighlighterAction, "highlight">, string[]> = {
  underline: ["M1 33 C20 28 38 36 56 31 S88 29 99 33"],
  strike: ["M0 21 C22 17 46 24 70 19 S92 20 100 18"],
  box: ["M3 6 C30 3 70 4 97 5 C98 14 97 27 96 35 C66 37 34 36 4 35 C3 25 2 14 3 6"],
  circle: ["M8 20 C8 6 40 1 62 3 C88 5 99 14 96 24 C93 35 62 39 38 37 C14 35 2 28 6 15 C9 8 22 3 36 2"],
  bracket: ["M10 4 C4 4 3 6 3 10 L3 30 C3 34 4 36 10 36", "M90 4 C96 4 97 6 97 10 L97 30 C97 34 96 36 90 36"],
}

type HighlighterProps = Omit<React.ComponentProps<"span">, "children"> & {
  /** The phrase to mark. Short phrases work best because the mark is drawn around one box. */
  children: React.ReactNode
  /** The kind of mark. */
  action?: HighlighterAction
  /** Mark color. */
  tone?: HighlighterTone
  /** Stroke width in pixels (not used by "highlight"). */
  strokeWidth?: number
  /** Extra space around the text in pixels, so the mark does not touch the letters. */
  padding?: number
  /** Seconds the drawing takes. */
  duration?: number
  /** Seconds before it starts. */
  delay?: number
  /** Wait until the phrase scrolls into view. */
  inView?: boolean
}

function Highlighter({
  children,
  action = "highlight",
  tone = "chart-3",
  strokeWidth = 2.5,
  padding = 4,
  duration = 0.7,
  delay = 0,
  inView = true,
  className,
  ...props
}: HighlighterProps) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const seen = useInView(ref, { once: true, margin: "0px 0px -10% 0px" })
  const reduce = useReducedMotion()
  const show = reduce || !inView || seen
  const pad = padding
  const horizontal = action === "bracket" ? padding + 6 : padding
  const [size, setSize] = React.useState<{ w: number; h: number } | null>(null)

  // Strokes are drawn in real pixels so their width and dash animation stay true at any text size.
  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setSize({ w: el.offsetWidth + horizontal * 2, h: el.offsetHeight + pad * 2 })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [horizontal, pad])

  return (
    <span ref={ref} data-slot="highlighter" className={cn("relative isolate inline-block whitespace-nowrap text-foreground", className)} {...props}>
      {size && (
        <svg
          aria-hidden="true"
          viewBox={`0 0 ${size.w} ${size.h}`}
          className={cn("pointer-events-none absolute overflow-visible", TONE[tone], action === "highlight" && "-z-10")}
          style={{ left: -horizontal, top: -pad, width: size.w, height: size.h }}
        >
          {action === "highlight" ? (
            <motion.path
              d={scalePath("M1 9 C18 5 40 8 62 5 S90 6 99 8 L98 33 C80 36 55 33 34 36 S10 34 2 35 Z", size.w / 100, size.h / 40)}
              fill="currentColor"
              fillOpacity={0.35}
              initial={false}
              animate={{ clipPath: show ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)" }}
              transition={{ duration: reduce ? 0 : duration, delay: show ? delay : 0, ease: [0.22, 1, 0.36, 1] }}
            />
          ) : (
            PATHS[action].map((d, i) => (
              <motion.path
                key={i}
                d={scalePath(d, size.w / 100, size.h / 40)}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={false}
                animate={{ pathLength: show ? 1 : 0, opacity: show ? 1 : 0 }}
                transition={{ duration: reduce ? 0 : duration, delay: show ? delay + i * 0.15 : 0, ease: [0.65, 0, 0.35, 1] }}
              />
            ))
          )}
        </svg>
      )}
      <span className="relative">{children}</span>
    </span>
  )
}

export { Highlighter, type HighlighterProps, type HighlighterAction, type HighlighterTone }
