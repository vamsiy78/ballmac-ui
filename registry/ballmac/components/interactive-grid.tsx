// Ballmac UI: Interactive Grid. https://ui.ballmac.com/components/interactive-grid
"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { observeTheme, resolveCssColor } from "@/lib/ballmac/color"

type InteractiveGridProps = Omit<React.ComponentProps<"div">, "children" | "color"> & {
  /** Side of one cell in pixels. */
  cell?: number
  /** Color of the lit cells: a CSS variable name such as "--chart-1", or any CSS color. */
  color?: string
  /** Color of the grid lines. */
  lineColor?: string
  /** How many cells around the pointer light up. */
  radius?: number
  /** Seconds a lit cell takes to fade away. */
  decay?: number
  /** Fade the grid toward the edges. */
  fade?: boolean
}

/**
 * A canvas grid whose cells light up under the pointer and fade out behind it, leaving a trail.
 * It listens on its positioned parent, so content placed above it does not block the effect. Decorative.
 */
function InteractiveGrid({ cell = 36, color = "--chart-1", lineColor = "--border", radius = 2.2, decay = 1.4, fade = true, className, style, ...props }: InteractiveGridProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    const host = root?.parentElement
    if (!root || !canvas || !ctx || !host) return
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    let width = 0
    let height = 0
    let cols = 0
    let rows = 0
    let dpr = 1
    let heat = new Float32Array(0)
    let lit = resolveCssColor(root, color)
    let lines = resolveCssColor(root, lineColor)
    let frame = 0
    let last = 0
    let active = false

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = root.clientWidth
      height = root.clientHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      cols = Math.ceil(width / cell)
      rows = Math.ceil(height / cell)
      heat = new Float32Array(cols * rows)
    }

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const h = heat[c * rows + r]!
          if (h > 0.01) {
            ctx.globalAlpha = h * 0.85
            ctx.fillStyle = lit
            ctx.fillRect(c * cell + 1, r * cell + 1, cell - 1, cell - 1)
          }
        }
      }
      ctx.globalAlpha = 1
      ctx.strokeStyle = lines
      ctx.lineWidth = 1
      ctx.beginPath()
      for (let c = 0; c <= cols; c++) {
        ctx.moveTo(c * cell + 0.5, 0)
        ctx.lineTo(c * cell + 0.5, height)
      }
      for (let r = 0; r <= rows; r++) {
        ctx.moveTo(0, r * cell + 0.5)
        ctx.lineTo(width, r * cell + 0.5)
      }
      ctx.stroke()
    }

    const loop = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0
      last = now
      let any = false
      for (let i = 0; i < heat.length; i++) {
        if (heat[i]! > 0) {
          heat[i] = Math.max(0, heat[i]! - dt / decay)
          any = any || heat[i]! > 0
        }
      }
      draw()
      if (any) frame = requestAnimationFrame(loop)
      else active = false
    }
    const wake = () => {
      if (active || reduceMotion) return
      active = true
      last = 0
      frame = requestAnimationFrame(loop)
    }

    const onMove = (e: PointerEvent) => {
      if (reduceMotion) return
      const box = root.getBoundingClientRect()
      const px = (e.clientX - box.left) / cell
      const py = (e.clientY - box.top) / cell
      if (px < -radius || py < -radius || px > cols + radius || py > rows + radius) return
      for (let c = Math.max(0, Math.floor(px - radius)); c <= Math.min(cols - 1, Math.ceil(px + radius)); c++) {
        for (let r = Math.max(0, Math.floor(py - radius)); r <= Math.min(rows - 1, Math.ceil(py + radius)); r++) {
          const d = Math.hypot(c + 0.5 - px, r + 0.5 - py)
          if (d < radius) heat[c * rows + r] = Math.max(heat[c * rows + r]!, 1 - d / radius)
        }
      }
      wake()
    }

    resize()
    draw()
    host.addEventListener("pointermove", onMove)
    const ro = new ResizeObserver(() => {
      resize()
      draw()
    })
    ro.observe(root)
    const stopTheme = observeTheme(() => {
      lit = resolveCssColor(root, color)
      lines = resolveCssColor(root, lineColor)
      draw()
    })
    return () => {
      cancelAnimationFrame(frame)
      host.removeEventListener("pointermove", onMove)
      ro.disconnect()
      stopTheme()
    }
  }, [cell, color, lineColor, radius, decay])

  const mask = fade ? "radial-gradient(ellipse 75% 75% at 50% 50%, black 35%, transparent 90%)" : undefined
  return (
    <div
      ref={rootRef}
      data-slot="interactive-grid"
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      style={{ maskImage: mask, WebkitMaskImage: mask, ...style }}
      {...props}
    >
      <canvas ref={canvasRef} className="size-full" />
    </div>
  )
}

export { InteractiveGrid, type InteractiveGridProps }
