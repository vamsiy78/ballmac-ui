// Ballmac UI: Particle Tree. https://ui.ballmac.com/components/particle-tree
"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { observeTheme, resolveCssColor } from "@/lib/ballmac/color"

type ParticleTreeProps = Omit<React.ComponentProps<"div">, "children" | "color"> & {
  /** Color of the trunk and branches: a CSS variable name ("--foreground") or any CSS color. */
  color?: string
  /** Color of the leaves and the rings on the ground. */
  accent?: string
  /** How many particles to draw, from 0.3 to 2. Scaled with the size of the container. */
  density?: number
  /** Changes the shape of the tree. The same seed always grows the same tree. */
  seed?: number
  /** How far the pointer pushes particles away, in pixels. Zero turns it off. */
  radius?: number
  /** Draw the rings that spread out from the foot of the tree. */
  rings?: boolean
}

type Dot = { x: number; y: number; r: number; a: number; phase: number; leaf: boolean; ox: number; oy: number }

/** A small seeded random number generator, so the same seed grows the same tree on every visit. */
function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Grows the tree in its own space: x sideways, y upwards, the whole tree about one unit tall. */
function grow(seed: number, density: number): Dot[] {
  const rand = mulberry32(seed)
  const dots: Dot[] = []
  const spacing = 0.0048 / density
  const maxDepth = 5
  const branch = (x: number, y: number, angle: number, length: number, depth: number) => {
    const steps = Math.max(2, Math.round(length / spacing))
    for (let i = 0; i < steps; i++) {
      x += Math.sin(angle) * spacing
      y += Math.cos(angle) * spacing
      angle += (rand() - 0.5) * 0.045
      dots.push({ x: x + (rand() - 0.5) * 0.002, y, r: 0.45 + (maxDepth - depth) * 0.22, a: 0.35 + rand() * 0.5, phase: rand() * 6.28, leaf: false, ox: 0, oy: 0 })
    }
    if (depth < maxDepth) {
      const children = depth === 0 ? 3 : rand() < 0.25 ? 3 : 2
      for (let c = 0; c < children; c++) {
        const side = children === 2 ? (c === 0 ? -1 : 1) : c - 1
        branch(x, y, angle + side * (0.3 + rand() * 0.4) + (rand() - 0.5) * 0.15, length * (0.68 + rand() * 0.08), depth + 1)
      }
    } else {
      const leaves = Math.round(90 * density)
      for (let i = 0; i < leaves; i++) {
        const dist = Math.abs((rand() + rand() + rand() - 1.5) / 1.5) * 0.07
        const dir = rand() * 6.28
        dots.push({ x: x + Math.cos(dir) * dist, y: y + Math.sin(dir) * dist, r: 0.5 + rand() * 0.9, a: 0.25 + rand() * 0.75, phase: rand() * 6.28, leaf: true, ox: 0, oy: 0 })
      }
    }
  }
  branch(0, 0, 0, 0.26, 0)
  return dots
}

/**
 * A tree made of thousands of small points, standing on rings that spread across the ground. It sways a little, the points near the pointer part and settle back, and
 * it stops drawing when it is off screen. Under reduced motion it is drawn once and holds still. It fills its container and is hidden from assistive technology.
 */
function ParticleTree({ color = "--foreground", accent = "--chart-1", density = 1, seed = 7, radius = 90, rings = true, className, ...props }: ParticleTreeProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!root || !canvas || !ctx) return
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const dots = grow(seed, Math.min(2, Math.max(0.3, density)))
    let width = 0
    let height = 0
    let scale = 1
    let cx = 0
    let ground = 0
    let wood = resolveCssColor(root, color)
    let leaf = resolveCssColor(root, accent)
    const pointer = { x: -9999, y: -9999, inside: false }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = root.clientWidth
      height = root.clientHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      scale = Math.min(height * 0.4, width * 0.9)
      cx = width / 2
      ground = height * 0.93
    }

    const draw = (t: number) => {
      ctx.clearRect(0, 0, width, height)
      if (rings) {
        ctx.strokeStyle = leaf
        ctx.lineWidth = 1
        for (let i = 0; i < 5; i++) {
          const p = reduceMotion ? 0.12 + i * 0.17 : (t * 0.00018 + i / 5) % 1
          const rx = (0.1 + p * 0.85) * scale
          ctx.globalAlpha = (1 - p) * 0.4
          ctx.beginPath()
          ctx.ellipse(cx, ground + 6, rx, rx * 0.2, 0, 0, Math.PI * 2)
          ctx.stroke()
        }
      }
      for (const d of dots) {
        const sway = reduceMotion ? 0 : Math.sin(t * 0.0007 + d.phase * 0.25 + d.y * 3) * 0.012 * d.y * d.y
        let x = cx + (d.x + sway) * scale
        let y = ground - d.y * scale
        if (!reduceMotion && radius > 0) {
          let tx = 0
          let ty = 0
          if (pointer.inside) {
            const ddx = x - pointer.x
            const ddy = y - pointer.y
            const dist = Math.hypot(ddx, ddy)
            if (dist < radius && dist > 0.001) {
              const push = (1 - dist / radius) ** 2 * radius * 0.5
              tx = (ddx / dist) * push
              ty = (ddy / dist) * push
            }
          }
          d.ox += (tx - d.ox) * 0.12
          d.oy += (ty - d.oy) * 0.12
          x += d.ox
          y += d.oy
        }
        const twinkle = reduceMotion ? 1 : 0.75 + 0.25 * Math.sin(t * 0.0012 + d.phase)
        ctx.globalAlpha = d.a * twinkle
        ctx.fillStyle = d.leaf ? leaf : wood
        ctx.beginPath()
        ctx.arc(x, y, d.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    let frame = 0
    let visible = true
    const loop = (t: number) => {
      draw(t)
      frame = requestAnimationFrame(loop)
    }
    const sync = () => {
      cancelAnimationFrame(frame)
      if (reduceMotion) draw(0)
      else if (visible && !document.hidden) frame = requestAnimationFrame(loop)
    }
    const onMove = (e: PointerEvent) => {
      const r = root.getBoundingClientRect()
      pointer.x = e.clientX - r.left
      pointer.y = e.clientY - r.top
      pointer.inside = pointer.x >= 0 && pointer.y >= 0 && pointer.x <= r.width && pointer.y <= r.height
    }
    const onLeave = () => {
      pointer.inside = false
    }

    resize()
    sync()
    const ro = new ResizeObserver(() => {
      resize()
      if (reduceMotion) draw(0)
    })
    ro.observe(root)
    const io = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true
      sync()
    })
    io.observe(root)
    const stopTheme = observeTheme(() => {
      wood = resolveCssColor(root, color)
      leaf = resolveCssColor(root, accent)
      if (reduceMotion) draw(0)
    })
    document.addEventListener("visibilitychange", sync)
    window.addEventListener("pointermove", onMove, { passive: true })
    document.documentElement.addEventListener("pointerleave", onLeave)
    return () => {
      cancelAnimationFrame(frame)
      ro.disconnect()
      io.disconnect()
      stopTheme()
      document.removeEventListener("visibilitychange", sync)
      window.removeEventListener("pointermove", onMove)
      document.documentElement.removeEventListener("pointerleave", onLeave)
    }
  }, [color, accent, density, seed, radius, rings])

  return (
    <div ref={rootRef} aria-hidden="true" data-slot="particle-tree" className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} {...props}>
      <canvas ref={canvasRef} className="block" />
    </div>
  )
}

export { ParticleTree, type ParticleTreeProps }
