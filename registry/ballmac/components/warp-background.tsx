// Ballmac UI: Warp Background. https://ui.ballmac.com/components/warp-background
"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { observeTheme, resolveCssColor } from "@/lib/ballmac/color"

type WarpBackgroundProps = Omit<React.ComponentProps<"div">, "color"> & {
  /** How many streaks fly past at once. */
  density?: number
  /** How fast they travel. 1 is a steady cruise. */
  speed?: number
  /** Colors of the streaks: CSS variable names such as "--chart-1", or any CSS colors. Streaks pick from these at random. */
  colors?: string[]
  /** Darken the middle so content on top stays readable. */
  vignette?: boolean
  /** The vanishing point follows the pointer a little. */
  parallax?: boolean
  /** Classes for the layer that holds the children. */
  contentClassName?: string
}

type Star = { angle: number; radius: number; speed: number; color: number; length: number }

/** A hyperspace tunnel: streaks fly outward from the center on a canvas, with your content on top. */
function WarpBackground({
  density = 240,
  speed = 1,
  colors = ["--foreground", "--chart-1", "--chart-4"],
  vignette = true,
  parallax = true,
  className,
  contentClassName,
  children,
  ...props
}: WarpBackgroundProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const colorKey = colors.join("|")

  React.useEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!root || !canvas || !ctx) return
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let width = 0
    let height = 0
    let dpr = 1
    let palette = colors.map((c) => resolveCssColor(root, c))
    let stars: Star[] = []
    let cx = 0.5
    let cy = 0.5
    let targetX = 0.5
    let targetY = 0.5
    let frame = 0
    let last = 0
    let visible = true

    const spawn = (initial: boolean): Star => ({
      angle: Math.random() * Math.PI * 2,
      radius: initial ? Math.random() ** 2 * 0.9 : 0.01 + Math.random() * 0.03,
      speed: 0.25 + Math.random() * 0.6,
      color: Math.floor(Math.random() * palette.length),
      length: 0.6 + Math.random() * 1.4,
    })

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = root.clientWidth
      height = root.clientHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
    }

    const draw = (dt: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)
      const reach = Math.hypot(width, height) / 2
      const ox = cx * width
      const oy = cy * height
      ctx.lineCap = "round"
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i]!
        const before = s.radius
        s.radius += dt * speed * s.speed * (0.12 + s.radius * 1.9)
        if (s.radius * reach > reach * 1.1) {
          stars[i] = spawn(false)
          continue
        }
        const tail = Math.max(before, s.radius - dt * speed * s.speed * (0.12 + s.radius * 1.9) * s.length * 3)
        const cos = Math.cos(s.angle)
        const sin = Math.sin(s.angle)
        ctx.globalAlpha = Math.min(1, s.radius * 2.2) * 0.9
        ctx.strokeStyle = palette[s.color % palette.length]!
        ctx.lineWidth = 0.6 + s.radius * 2.2
        ctx.beginPath()
        ctx.moveTo(ox + cos * tail * reach, oy + sin * tail * reach)
        ctx.lineTo(ox + cos * s.radius * reach, oy + sin * s.radius * reach)
        ctx.stroke()
      }
      ctx.globalAlpha = 1
    }

    const loop = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0
      last = now
      cx += (targetX - cx) * 0.06
      cy += (targetY - cy) * 0.06
      draw(dt)
      frame = requestAnimationFrame(loop)
    }
    const sync = () => {
      cancelAnimationFrame(frame)
      last = 0
      if (reduceMotion) draw(0.016 * 8)
      else if (visible && !document.hidden) frame = requestAnimationFrame(loop)
    }
    const onMove = (e: PointerEvent) => {
      if (!parallax || reduceMotion) return
      const box = root.getBoundingClientRect()
      targetX = 0.5 + ((e.clientX - box.left) / box.width - 0.5) * 0.14
      targetY = 0.5 + ((e.clientY - box.top) / box.height - 0.5) * 0.14
    }

    resize()
    stars = Array.from({ length: density }, () => spawn(true))
    sync()
    root.addEventListener("pointermove", onMove)
    const ro = new ResizeObserver(() => {
      resize()
      if (reduceMotion) draw(0.1)
    })
    ro.observe(root)
    const io = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true
      sync()
    })
    io.observe(root)
    const stopTheme = observeTheme(() => {
      palette = colors.map((c) => resolveCssColor(root, c))
      if (reduceMotion) draw(0.1)
    })
    document.addEventListener("visibilitychange", sync)
    return () => {
      cancelAnimationFrame(frame)
      root.removeEventListener("pointermove", onMove)
      ro.disconnect()
      io.disconnect()
      stopTheme()
      document.removeEventListener("visibilitychange", sync)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [density, speed, colorKey, parallax])

  return (
    <div ref={rootRef} data-slot="warp-background" className={cn("relative isolate overflow-hidden bg-background", className)} {...props}>
      <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 size-full" />
      {vignette && (
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_45%_45%_at_50%_50%,var(--background),transparent_75%)] opacity-80" />
      )}
      <div className={cn("relative z-10", contentClassName)}>{children}</div>
    </div>
  )
}

export { WarpBackground, type WarpBackgroundProps }
