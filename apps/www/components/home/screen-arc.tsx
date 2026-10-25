"use client"

import { Pause, Play } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"

export type ArcCard = { name: string; title: string; href: string; src: string }

// All measurements are in "frame units": a 1440 unit wide frame on a desktop, and 640 units on a phone, scaled to the real width.
const PITCH = 196
const BASE_W = 170
const BASE_H = 280
const AUTO_SPEED = -50 // units per second, right to left
const RADIUS = 15

type Pt = [number, number]

/** A polygon with rounded corners, as an SVG path. */
function roundedPath(pts: Pt[], r: number) {
  const n = pts.length
  let d = ""
  for (let i = 0; i < n; i++) {
    const prev = pts[(i + n - 1) % n]
    const cur = pts[i]
    const next = pts[(i + 1) % n]
    const l1 = Math.hypot(prev[0] - cur[0], prev[1] - cur[1]) || 1
    const l2 = Math.hypot(next[0] - cur[0], next[1] - cur[1]) || 1
    const rr = Math.min(r, l1 / 2, l2 / 2)
    const a: Pt = [cur[0] + ((prev[0] - cur[0]) / l1) * rr, cur[1] + ((prev[1] - cur[1]) / l1) * rr]
    const b: Pt = [cur[0] + ((next[0] - cur[0]) / l2) * rr, cur[1] + ((next[1] - cur[1]) / l2) * rr]
    d += `${i === 0 ? "M" : "L"}${a[0].toFixed(1)} ${a[1].toFixed(1)}Q${cur[0].toFixed(1)} ${cur[1].toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`
  }
  return `${d}Z`
}

/**
 * A row of tall screens bent like the inside of a cylinder: cards in the middle stand upright, cards near the edges grow taller and lean in. The row drifts to the
 * left on its own, can be dragged with a pointer or a finger and keeps its momentum when let go, then carries on drifting. A real button stops it. Every card is a link
 * to the screen it shows. With reduced motion it does not drift by itself.
 */
export function ScreenArc({ cards, className }: { cards: ArcCard[]; className?: string }) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const items = React.useRef<(HTMLAnchorElement | null)[]>([])
  const [size, setSize] = React.useState({ width: 0, narrow: false })
  const [paused, setPaused] = React.useState(false)
  const pausedRef = React.useRef(false)
  const reducedRef = React.useRef(false)
  const state = React.useRef({ scroll: 0, vel: 0, dragging: false, lastX: 0, lastT: 0, moved: 0, hover: false, focus: false, visible: true })

  React.useEffect(() => {
    pausedRef.current = paused
  }, [paused])

  // Measure once and on resize. Phones use a narrower frame, so the cards stay a sensible size.
  React.useEffect(() => {
    const el = rootRef.current
    if (!el) return
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reducedRef.current) setPaused(true)
    const measure = () => setSize({ width: el.clientWidth, narrow: el.clientWidth < 820 })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const unit = size.width ? (size.narrow ? size.width / 640 : Math.min(size.width / 1440, 1.1)) : 1
  const frameW = size.width ? size.width / unit : 1440
  const count = Math.max(cards.length, Math.ceil((frameW + 4 * PITCH) / PITCH))
  const height = (size.narrow ? 330 : 380) * unit

  React.useEffect(() => {
    const el = rootRef.current
    if (!el || !size.width) return
    const u = unit
    const half = frameW / 2 - 14
    const centerX = frameW / 2
    const total = count * PITCH
    const cyBase = height / u / 2
    const s = state.current

    const place = () => {
      for (let i = 0; i < count; i++) {
        const node = items.current[i]
        if (!node) continue
        const x0 = ((((i * PITCH + s.scroll) % total) + total) % total) - 2 * PITCH
        const t = x0 - centerX
        const x = centerX + t * (1 + 0.083 * (t / half) ** 2)
        const d = Math.min(Math.abs(x - centerX) / half, 1.4)
        const w = BASE_W + 48 * d * d
        const xl = x - w / 2
        const xr = x + w / 2
        if (xr < -40 || xl > frameW + 40) {
          node.style.display = "none"
          continue
        }
        const ql = Math.abs(xl - centerX) / half
        const qr = Math.abs(xr - centerX) / half
        const hl = BASE_H + 92 * Math.min(ql, 1.5) ** 2.6
        const hr = BASE_H + 92 * Math.min(qr, 1.5) ** 2.6
        const maxH = Math.max(hl, hr)
        const cy = cyBase - 12 * d * d
        node.style.display = "block"
        node.style.left = `${xl * u}px`
        node.style.top = `${(cy - maxH / 2) * u}px`
        node.style.width = `${w * u}px`
        node.style.height = `${maxH * u}px`
        const pts: Pt[] = [
          [0, ((maxH - hl) / 2) * u],
          [w * u, ((maxH - hr) / 2) * u],
          [w * u, ((maxH + hr) / 2) * u],
          [0, ((maxH + hl) / 2) * u],
        ]
        node.style.clipPath = `path("${roundedPath(pts, RADIUS * u)}")`
      }
    }

    let frame = 0
    let last = performance.now()
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      if (!s.dragging) {
        const auto = pausedRef.current || s.hover || s.focus || reducedRef.current ? 0 : AUTO_SPEED
        s.scroll += (s.vel + auto) * dt
        s.vel *= Math.pow(0.05, dt) // about 95% of the speed is gone after a second
        if (Math.abs(s.vel) < 0.5) s.vel = 0
      }
      place()
      frame = requestAnimationFrame(loop)
    }
    place()
    const io = new IntersectionObserver(([e]) => {
      s.visible = e?.isIntersecting ?? true
      cancelAnimationFrame(frame)
      if (s.visible && !document.hidden) {
        last = performance.now()
        frame = requestAnimationFrame(loop)
      }
    })
    io.observe(el)
    const onVis = () => {
      cancelAnimationFrame(frame)
      if (!document.hidden && s.visible) {
        last = performance.now()
        frame = requestAnimationFrame(loop)
      }
    }
    document.addEventListener("visibilitychange", onVis)
    return () => {
      cancelAnimationFrame(frame)
      io.disconnect()
      document.removeEventListener("visibilitychange", onVis)
    }
  }, [size.width, unit, frameW, count, height])

  const s = state.current
  function down(e: React.PointerEvent) {
    s.dragging = true
    s.moved = 0
    s.lastX = e.clientX
    s.lastT = performance.now()
    s.vel = 0
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  function move(e: React.PointerEvent) {
    if (!s.dragging) return
    const now = performance.now()
    const dx = e.clientX - s.lastX
    const dt = Math.max((now - s.lastT) / 1000, 0.001)
    s.moved += Math.abs(dx)
    s.scroll += dx / unit
    s.vel = s.vel * 0.6 + (dx / unit / dt) * 0.4
    s.lastX = e.clientX
    s.lastT = now
  }
  function up(e: React.PointerEvent) {
    s.dragging = false
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
  }
  // Bring a card that gets keyboard focus to the middle, with the same easing as a flick.
  function focusCard(i: number) {
    s.focus = true
    const total = count * PITCH
    const x0 = ((((i * PITCH + s.scroll) % total) + total) % total) - 2 * PITCH
    s.vel = (frameW / 2 - x0) * 3
  }

  return (
    <div className={cn("relative", className)}>
      <div
        ref={rootRef}
        role="region"
        aria-label="Screens you can install. Drag to look through them."
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onPointerEnter={() => (s.hover = true)}
        onPointerLeave={() => (s.hover = false)}
        onBlur={() => (s.focus = false)}
        onClickCapture={(e) => {
          if (s.moved > 6) e.preventDefault()
        }}
        style={{ height, touchAction: "pan-y" }}
        className="relative w-full cursor-grab touch-pan-y overflow-hidden select-none active:cursor-grabbing motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-10 motion-safe:duration-1000 motion-safe:fill-mode-both"
      >
        {Array.from({ length: count }, (_, i) => {
          const c = cards[i % cards.length]
          return (
            <a
              key={i}
              ref={(el) => {
                items.current[i] = el
              }}
              href={c.href}
              draggable={false}
              aria-label={`${c.title}, a screen you can install`}
              aria-hidden={i >= cards.length ? true : undefined}
              tabIndex={i >= cards.length ? -1 : 0}
              onFocus={() => focusCard(i)}
              className="focus-visible:ring-ring/70 absolute block overflow-hidden bg-[#0b0b10] outline-none focus-visible:ring-[3px]"
              style={{ display: "none" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.src} alt="" draggable={false} loading={i < 6 ? "eager" : "lazy"} decoding="async" className="size-full object-cover object-top" />
              <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
            </a>
          )
        })}
      </div>
      <button
        type="button"
        aria-pressed={paused}
        onClick={() => setPaused((v) => !v)}
        className="focus-visible:ring-ring/70 absolute end-4 bottom-0 flex h-9 items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 text-xs font-medium text-white/80 outline-none backdrop-blur transition-colors hover:text-white focus-visible:ring-[3px] motion-reduce:transition-none"
      >
        {paused ? <Play className="size-3.5" aria-hidden="true" /> : <Pause className="size-3.5" aria-hidden="true" />}
        {paused ? "Play" : "Pause"}
        <span className="sr-only"> the moving screens</span>
      </button>
    </div>
  )
}
