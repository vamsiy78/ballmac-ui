// Ballmac UI: Flickering Grid. https://ui.ballmac.com/components/flickering-grid
"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { observeTheme, resolveCssColor } from "@/lib/ballmac/color"

type FlickeringGridProps = Omit<React.ComponentProps<"div">, "children" | "color"> & {
  /** Side of each square in pixels. */
  squareSize?: number
  /** Space between squares in pixels. */
  gap?: number
  /** Chance per second that a square picks a new brightness (0–1+). */
  flickerChance?: number
  /** Brightest a square gets (0–1). */
  maxOpacity?: number
  /** Square color: a CSS variable name ("--foreground") or any CSS color. */
  color?: string
  /** Fade the grid out toward the edges with a radial mask. */
  fade?: boolean
}

function FlickeringGrid({
  squareSize = 4,
  gap = 6,
  flickerChance = 0.3,
  maxOpacity = 0.3,
  color = "--foreground",
  fade = true,
  className,
  style,
  ...props
}: FlickeringGridProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!root || !canvas || !ctx) return
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const pitch = squareSize + gap

    let width = 0
    let height = 0
    let cols = 0
    let rows = 0
    let dpr = 1
    let opacities = new Float32Array(0)
    let fill = resolveCssColor(root, color)

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = root.clientWidth
      height = root.clientHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      cols = Math.ceil(width / pitch)
      rows = Math.ceil(height / pitch)
      opacities = new Float32Array(cols * rows)
      for (let i = 0; i < opacities.length; i++) opacities[i] = Math.random() * maxOpacity
    }

    const draw = () => {
      // Draw in device pixels and snap squares to whole pixels so they stay crisp.
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = fill
      const size = Math.max(1, Math.round(squareSize * dpr))
      for (let c = 0; c < cols; c++) {
        const x = Math.round(c * pitch * dpr)
        for (let r = 0; r < rows; r++) {
          ctx.globalAlpha = opacities[c * rows + r]!
          ctx.fillRect(x, Math.round(r * pitch * dpr), size, size)
        }
      }
      ctx.globalAlpha = 1
    }

    let frame = 0
    let last = 0
    let visible = true
    const loop = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0
      last = now
      const chance = flickerChance * dt
      for (let i = 0; i < opacities.length; i++) {
        if (Math.random() < chance) opacities[i] = Math.random() * maxOpacity
      }
      draw()
      frame = requestAnimationFrame(loop)
    }
    const sync = () => {
      cancelAnimationFrame(frame)
      last = 0
      if (reduceMotion) draw()
      else if (visible && !document.hidden) frame = requestAnimationFrame(loop)
    }

    resize()
    sync()
    const ro = new ResizeObserver(() => {
      resize()
      draw()
    })
    ro.observe(root)
    const io = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true
      sync()
    })
    io.observe(root)
    const stopTheme = observeTheme(() => {
      fill = resolveCssColor(root, color)
      draw()
    })
    document.addEventListener("visibilitychange", sync)
    return () => {
      cancelAnimationFrame(frame)
      ro.disconnect()
      io.disconnect()
      stopTheme()
      document.removeEventListener("visibilitychange", sync)
    }
  }, [squareSize, gap, flickerChance, maxOpacity, color])

  const mask = fade ? "radial-gradient(ellipse 70% 65% at 50% 50%, black 30%, transparent 80%)" : undefined

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      data-slot="flickering-grid"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      style={{ maskImage: mask, WebkitMaskImage: mask, ...style }}
      {...props}
    >
      <canvas ref={canvasRef} className="block" />
    </div>
  )
}

export { FlickeringGrid, type FlickeringGridProps }
