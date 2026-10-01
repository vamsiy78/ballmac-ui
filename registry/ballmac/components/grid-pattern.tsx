// Ballmac UI: Grid Pattern. https://ui.ballmac.com/components/grid-pattern
"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

type GridPatternProps = Omit<React.ComponentProps<"svg">, "children"> & {
  /** Side of one cell in pixels. */
  cell?: number
  /** Horizontal shift of the pattern in pixels. */
  x?: number
  /** Vertical shift of the pattern in pixels. */
  y?: number
  /** Dash pattern for the lines, such as "4 3". "0" is solid. */
  strokeDasharray?: string
  /** Cells to fill, as [column, row] pairs counted from the top left. */
  squares?: [number, number][]
  /** How many extra random cells softly light up and fade. They are picked after mount. */
  flicker?: number
  /** Fade the pattern toward the edges. */
  fade?: "radial" | "top" | "bottom" | "none"
}

const MASK = {
  radial: "radial-gradient(ellipse 70% 70% at 50% 50%, black 25%, transparent 85%)",
  top: "linear-gradient(to bottom, black, transparent 90%)",
  bottom: "linear-gradient(to top, black, transparent 90%)",
  none: undefined,
}

/** A square grid background. Lines and filled cells use the border and foreground tokens. Decorative. */
function GridPattern({ cell = 40, x = -1, y = -1, strokeDasharray = "0", squares, flicker = 0, fade = "radial", className, style, ...props }: GridPatternProps) {
  const id = React.useId().replace(/:/g, "")
  const reduce = useReducedMotion()
  const ref = React.useRef<SVGSVGElement>(null)
  const [lit, setLit] = React.useState<[number, number][]>([])

  // Random cells are chosen after mount, so the server and browser markup stay identical.
  React.useEffect(() => {
    const el = ref.current
    if (!el || !flicker || reduce) return setLit([])
    const pick = () => {
      const cols = Math.max(1, Math.floor(el.clientWidth / cell))
      const rows = Math.max(1, Math.floor(el.clientHeight / cell))
      setLit(Array.from({ length: flicker }, () => [Math.floor(Math.random() * cols), Math.floor(Math.random() * rows)] as [number, number]))
    }
    pick()
    const timer = setInterval(pick, 3200)
    return () => clearInterval(timer)
  }, [flicker, cell, reduce])

  return (
    <svg
      ref={ref}
      data-slot="grid-pattern"
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 size-full text-foreground", className)}
      style={{ maskImage: MASK[fade], WebkitMaskImage: MASK[fade], ...style }}
      {...props}
    >
      <defs>
        <pattern id={id} width={cell} height={cell} patternUnits="userSpaceOnUse" x={x} y={y}>
          <path d={`M${cell} 0 H0 V${cell}`} fill="none" stroke="var(--border)" strokeWidth="1" strokeDasharray={strokeDasharray} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
      {squares?.map(([col, row]) => (
        <rect key={`s-${col}-${row}`} x={col * cell + x + 1} y={row * cell + y + 1} width={cell - 1} height={cell - 1} fill="currentColor" fillOpacity={0.07} />
      ))}
      {lit.map(([col, row], i) => (
        <motion.rect
          key={`${col}-${row}-${i}-${lit.length}`}
          x={col * cell + x + 1}
          y={row * cell + y + 1}
          width={cell - 1}
          height={cell - 1}
          fill="currentColor"
          initial={{ fillOpacity: 0 }}
          animate={{ fillOpacity: [0, 0.1, 0] }}
          transition={{ duration: 3, delay: i * 0.2, ease: "easeInOut" }}
        />
      ))}
    </svg>
  )
}

export { GridPattern, type GridPatternProps }
