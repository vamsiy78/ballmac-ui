// Ballmac UI: Animated Grid. https://ui.ballmac.com/components/animated-grid
"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"
import { ease } from "@/lib/ballmac/motion"

type AnimatedGridProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Width and height of one cell in pixels. */
  cellSize?: number
  /** How many cells are lit at the same time. */
  count?: number
  /** Milliseconds between one cell fading out and a new one lighting up. */
  interval?: number
  /** Fade the grid out toward the edges with a radial mask. */
  fade?: boolean
}

type Cell = { id: number; col: number; row: number }

function AnimatedGrid({
  cellSize = 40,
  count = 8,
  interval = 700,
  fade = true,
  className,
  style,
  ...props
}: AnimatedGridProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const patternId = `bm-grid-${React.useId().replace(/[^a-zA-Z0-9_-]/g, "")}`
  const reduceMotion = useReducedMotion()
  const [grid, setGrid] = React.useState({ cols: 0, rows: 0 })
  // Lit cells are chosen on the client only, after mount, so server and client HTML match.
  const [cells, setCells] = React.useState<Cell[]>([])

  React.useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const measure = () => {
      const cols = Math.ceil(root.clientWidth / cellSize)
      const rows = Math.ceil(root.clientHeight / cellSize)
      setGrid((prev) => (prev.cols === cols && prev.rows === rows ? prev : { cols, rows }))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(root)
    return () => observer.disconnect()
  }, [cellSize])

  React.useEffect(() => {
    const { cols, rows } = grid
    if (reduceMotion || cols === 0 || rows === 0 || count <= 0) {
      setCells([])
      return
    }
    let nextId = 0
    const pick = (taken: Cell[]): Cell => {
      for (let attempt = 0; attempt < 12; attempt++) {
        const col = Math.floor(Math.random() * cols)
        const row = Math.floor(Math.random() * rows)
        if (!taken.some((c) => c.col === col && c.row === row)) return { id: nextId++, col, row }
      }
      return { id: nextId++, col: Math.floor(Math.random() * cols), row: Math.floor(Math.random() * rows) }
    }
    // Start empty and add one cell per tick; once full, the oldest makes room for a new one.
    setCells([])
    const timer = window.setInterval(() => {
      setCells((prev) => {
        const kept = prev.length >= count ? prev.slice(prev.length - count + 1) : prev
        return [...kept, pick(kept)]
      })
    }, interval)
    return () => window.clearInterval(timer)
  }, [grid, count, interval, reduceMotion])

  // Each cell lives for count × interval; it has fully faded out just before it is replaced.
  const life = (count * interval * 0.95) / 1000
  const mask = fade ? "radial-gradient(ellipse 75% 70% at 50% 45%, black 35%, transparent 85%)" : undefined

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      data-slot="animated-grid"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden [--grid-light:color-mix(in_oklch,var(--ring)_20%,transparent)] [--grid-line:color-mix(in_oklch,var(--foreground)_8%,transparent)]",
        className
      )}
      style={{ maskImage: mask, WebkitMaskImage: mask, ...style }}
      {...props}
    >
      <svg className="absolute inset-0 size-full">
        <defs>
          <pattern id={patternId} width={cellSize} height={cellSize} patternUnits="userSpaceOnUse">
            <path
              d={`M ${cellSize} 0.5 H 0.5 V ${cellSize}`}
              fill="none"
              stroke="var(--grid-line)"
              strokeWidth={1}
              shapeRendering="crispEdges"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
        {cells.map((cell) => (
          <motion.rect
            key={cell.id}
            data-slot="animated-grid-cell"
            x={cell.col * cellSize + 1}
            y={cell.row * cellSize + 1}
            width={cellSize - 1}
            height={cellSize - 1}
            fill="var(--grid-light)"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: life, times: [0, 0.2, 0.7, 1], ease: ease.inOut }}
          />
        ))}
      </svg>
    </div>
  )
}

export { AnimatedGrid, type AnimatedGridProps }
