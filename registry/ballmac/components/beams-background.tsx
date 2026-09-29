// Ballmac UI: Beams Background. https://ui.ballmac.com/components/beams-background
"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { cssColorToRgba, observeTheme } from "@/lib/ballmac/color"

type BeamsBackgroundProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Distance between the hairline rails in pixels. Beams travel along the rails. */
  gap?: number
  /** Beams in flight per 1000 px of width. */
  density?: number
  /** Beam colors: CSS variable names ("--chart-1") or any CSS colors. Each beam picks one. */
  colors?: string[]
  /** Which way the beams travel. */
  direction?: "up" | "down"
  /** Speed multiplier. 1 is a calm rise. */
  speed?: number
  /** Opacity of the resting hairline rails (0–1). */
  railOpacity?: number
  /** Add a soft glow where the beams are born. */
  glow?: boolean
}

type Beam = { col: number; y: number; length: number; speed: number; color: number; width: number; life: number }

function BeamsBackground({
  gap = 36,
  density = 30,
  colors = ["--chart-1", "--chart-2", "--chart-4"],
  direction = "up",
  speed = 1,
  railOpacity = 0.07,
  glow = true,
  className,
  ...props
}: BeamsBackgroundProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const colorsKey = colors.join("|")

  React.useEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!root || !canvas || !ctx) return
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const palette = colorsKey.split("|")

    let width = 0
    let height = 0
    let cols = 0
    let offset = 0
    let rgba: [number, number, number][] = []
    let rail = "transparent"
    let beams: Beam[] = []

    const readColors = () => {
      rgba = palette.map((c) => cssColorToRgba(root, c).slice(0, 3).map((v) => Math.round(v * 255)) as [number, number, number])
      const [r, g, b] = cssColorToRgba(root, "--foreground")
      rail = `rgb(${Math.round(r * 255)} ${Math.round(g * 255)} ${Math.round(b * 255)} / ${railOpacity})`
    }

    const spawn = (anywhere: boolean): Beam => {
      const length = 80 + Math.random() * Math.min(280, height * 0.7)
      return {
        col: Math.floor(Math.random() * cols),
        // New beams start just past the edge they enter from; the first batch is scattered.
        y: anywhere ? Math.random() * (height + length) : height + length,
        length,
        speed: (0.5 + Math.random() * 1.4) * speed,
        color: Math.floor(Math.random() * rgba.length),
        width: Math.random() < 0.2 ? 1.5 : 1,
        life: 0.55 + Math.random() * 0.45,
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
      cols = Math.max(1, Math.floor(width / gap))
      // Center the rails so both edges get the same margin.
      offset = (width - (cols - 1) * gap) / 2
      const count = Math.max(3, Math.round((density * width) / 1000))
      beams = Array.from({ length: count }, () => spawn(true))
    }

    const drawBeam = (beam: Beam) => {
      const x = Math.round(offset + beam.col * gap) + 0.5
      // Travel is computed bottom-up; flip for downward beams.
      const head = direction === "up" ? beam.y - beam.length : height - beam.y + beam.length
      const tail = direction === "up" ? beam.y : height - beam.y
      const [r, g, b] = rgba[beam.color] ?? [255, 255, 255]
      // Fade out as the beam nears the far edge, so beams dissolve instead of exiting.
      const progress = 1 - (direction === "up" ? head : height - head) / height
      const fade = Math.max(0, Math.min(1, (1 - progress) / 0.3)) * beam.life
      if (fade <= 0) return
      const gradient = ctx.createLinearGradient(x, tail, x, head)
      gradient.addColorStop(0, `rgb(${r} ${g} ${b} / 0)`)
      gradient.addColorStop(0.75, `rgb(${r} ${g} ${b} / ${0.55 * fade})`)
      gradient.addColorStop(1, `rgb(${r} ${g} ${b} / ${fade})`)
      ctx.strokeStyle = gradient
      ctx.lineWidth = beam.width
      ctx.beginPath()
      ctx.moveTo(x, tail)
      ctx.lineTo(x, head)
      ctx.stroke()
      // A small soft head, like light gathering at the tip.
      const halo = ctx.createRadialGradient(x, head, 0, x, head, 6)
      halo.addColorStop(0, `rgb(${r} ${g} ${b} / ${0.9 * fade})`)
      halo.addColorStop(1, `rgb(${r} ${g} ${b} / 0)`)
      ctx.fillStyle = halo
      ctx.fillRect(x - 6, head - 6, 12, 12)
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      ctx.strokeStyle = rail
      ctx.lineWidth = 1
      ctx.beginPath()
      for (let c = 0; c < cols; c++) {
        const x = Math.round(offset + c * gap) + 0.5
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
      }
      ctx.stroke()
      for (const beam of beams) drawBeam(beam)
    }

    const step = () => {
      for (let i = 0; i < beams.length; i++) {
        const beam = beams[i]!
        beam.y -= beam.speed
        if (beam.y < height * 0.1) beams[i] = spawn(false)
      }
    }

    let frame = 0
    let visible = true
    const loop = () => {
      step()
      draw()
      frame = requestAnimationFrame(loop)
    }
    const sync = () => {
      cancelAnimationFrame(frame)
      if (reduceMotion) draw()
      else if (visible && !document.hidden) frame = requestAnimationFrame(loop)
    }

    readColors()
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
      readColors()
      if (reduceMotion) draw()
    })
    document.addEventListener("visibilitychange", sync)
    return () => {
      cancelAnimationFrame(frame)
      ro.disconnect()
      io.disconnect()
      stopTheme()
      document.removeEventListener("visibilitychange", sync)
    }
  }, [gap, density, colorsKey, direction, speed, railOpacity])

  const edge = direction === "up" ? "100%" : "0%"
  const first = colors[0] ?? "--chart-1"
  const glowColor = first.startsWith("--") ? `var(${first})` : first
  const fadeMask = "linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)"

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      data-slot="beams-background"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      {...props}
    >
      {glow && (
        <div
          data-slot="beams-background-glow"
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 55% 45% at 50% ${edge}, color-mix(in oklch, ${glowColor} 30%, transparent), transparent 70%)`,
          }}
        />
      )}
      <canvas ref={canvasRef} className="absolute inset-0 block" style={{ maskImage: fadeMask, WebkitMaskImage: fadeMask }} />
    </div>
  )
}

export { BeamsBackground, type BeamsBackgroundProps }
