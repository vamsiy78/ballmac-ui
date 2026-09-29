// Ballmac UI: Particles. https://ui.ballmac.com/components/particles
"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { observeTheme, resolveCssColor } from "@/lib/ballmac/color"

type ParticlesProps = Omit<React.ComponentProps<"div">, "children" | "color"> & {
  /** Number of particles. Scaled down on small containers so density stays even. */
  quantity?: number
  /** Base particle radius in pixels; each particle varies around it. */
  size?: number
  /** Particle color: a CSS variable name ("--foreground") or any CSS color. */
  color?: string
  /** How the field reacts to the pointer. */
  interaction?: "attract" | "repel" | "none"
  /** Radius of pointer influence in pixels. */
  radius?: number
  /** Smoothing of the pointer response; higher is slower and softer. */
  ease?: number
  /** Constant horizontal drift in pixels per frame. */
  vx?: number
  /** Constant vertical drift in pixels per frame (negative rises). */
  vy?: number
  /** Maximum particle opacity (0–1). */
  maxOpacity?: number
}

type Particle = {
  x: number
  y: number
  dx: number
  dy: number
  r: number
  alpha: number
  target: number
  ox: number
  oy: number
  depth: number
}

function Particles({
  quantity = 120,
  size = 0.7,
  color = "--foreground",
  interaction = "attract",
  radius = 140,
  ease = 24,
  vx = 0,
  vy = 0,
  maxOpacity = 0.7,
  className,
  ...props
}: ParticlesProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!root || !canvas || !ctx) return
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    let width = 0
    let height = 0
    let fill = resolveCssColor(root, color)
    let particles: Particle[] = []
    const pointer = { x: -9999, y: -9999, inside: false }

    const spawn = (): Particle => {
      const depth = Math.random()
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        dx: (Math.random() - 0.5) * 0.18 * (0.4 + depth),
        dy: (Math.random() - 0.5) * 0.18 * (0.4 + depth),
        r: size * (0.5 + depth * 1.3),
        alpha: 0,
        target: (0.25 + Math.random() * 0.75) * maxOpacity,
        ox: 0,
        oy: 0,
        depth,
      }
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = root.clientWidth
      height = root.clientHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      // Density follows area: the given quantity is for a ~ 800×500 surface.
      const count = Math.max(12, Math.round((quantity * width * height) / (800 * 500)))
      particles = Array.from({ length: Math.min(count, quantity * 2) }, spawn)
      if (reduceMotion) for (const p of particles) p.alpha = p.target
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = fill
      for (const p of particles) {
        if (!reduceMotion) {
          p.x += p.dx + vx * (0.5 + p.depth)
          p.y += p.dy + vy * (0.5 + p.depth)
          // Wrap around the edges so the field never empties.
          if (p.x < -10) p.x = width + 10
          else if (p.x > width + 10) p.x = -10
          if (p.y < -10) p.y = height + 10
          else if (p.y > height + 10) p.y = -10

          let tx = 0
          let ty = 0
          if (interaction !== "none" && pointer.inside) {
            const ddx = pointer.x - p.x
            const ddy = pointer.y - p.y
            const dist = Math.hypot(ddx, ddy)
            if (dist < radius && dist > 0.001) {
              const force = (1 - dist / radius) ** 2 * radius * 0.35 * (0.4 + p.depth)
              const sign = interaction === "attract" ? 1 : -1
              tx = (ddx / dist) * force * sign
              ty = (ddy / dist) * force * sign
            }
          }
          p.ox += (tx - p.ox) / ease
          p.oy += (ty - p.oy) / ease
          // Slow twinkle: ease toward a target opacity, then pick a new one.
          p.alpha += (p.target - p.alpha) * 0.02
          if (Math.abs(p.target - p.alpha) < 0.01) p.target = (0.2 + Math.random() * 0.8) * maxOpacity
        }
        const x = p.x + p.ox
        const y = p.y + p.oy
        // Fade particles near the edges.
        const edge = Math.min(x, y, width - x, height - y)
        const fade = Math.min(Math.max(edge / 40, 0), 1)
        ctx.globalAlpha = p.alpha * fade
        ctx.beginPath()
        ctx.arc(x, y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    let frame = 0
    let visible = true
    const loop = () => {
      draw()
      frame = requestAnimationFrame(loop)
    }
    const sync = () => {
      cancelAnimationFrame(frame)
      if (reduceMotion) draw()
      else if (visible && !document.hidden) frame = requestAnimationFrame(loop)
    }

    const onPointerMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect()
      pointer.x = event.clientX - rect.left
      pointer.y = event.clientY - rect.top
      pointer.inside = pointer.x >= 0 && pointer.y >= 0 && pointer.x <= rect.width && pointer.y <= rect.height
    }
    const onPointerLeave = () => {
      pointer.inside = false
    }

    resize()
    sync()
    const ro = new ResizeObserver(() => {
      resize()
      if (reduceMotion) draw()
    })
    ro.observe(root)
    const io = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true
      sync()
    })
    io.observe(root)
    const stopTheme = observeTheme(() => {
      fill = resolveCssColor(root, color)
      if (reduceMotion) draw()
    })
    document.addEventListener("visibilitychange", sync)
    window.addEventListener("pointermove", onPointerMove, { passive: true })
    document.documentElement.addEventListener("pointerleave", onPointerLeave)
    return () => {
      cancelAnimationFrame(frame)
      ro.disconnect()
      io.disconnect()
      stopTheme()
      document.removeEventListener("visibilitychange", sync)
      window.removeEventListener("pointermove", onPointerMove)
      document.documentElement.removeEventListener("pointerleave", onPointerLeave)
    }
  }, [quantity, size, color, interaction, radius, ease, vx, vy, maxOpacity])

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      data-slot="particles"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      {...props}
    >
      <canvas ref={canvasRef} className="block" />
    </div>
  )
}

export { Particles, type ParticlesProps }
