// Ballmac UI: Animated Beam. https://ui.ballmac.com/components/animated-beam
// Based on Magic UI's Animated Beam (MIT, Copyright (c) Magic UI), rewritten: the pulse is a dash that follows the curve with a head-to-tail gradient, token colors, a glow, off-screen pausing and a static reduced-motion state.
"use client"

import * as React from "react"
import { useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

type AnimatedBeamProps = Omit<React.ComponentProps<"svg">, "children"> & {
  /** The positioned element both endpoints live in. The beam's SVG covers it. */
  containerRef: React.RefObject<HTMLElement | null>
  /** Element the beam starts from (its center, plus the start offsets). */
  fromRef: React.RefObject<HTMLElement | null>
  /** Element the beam ends at (its center, plus the end offsets). */
  toRef: React.RefObject<HTMLElement | null>
  /** How far the curve bows, in pixels. Positive bends up, negative bends down, 0 is straight. */
  curvature?: number
  /** Send the pulse from `toRef` to `fromRef`. */
  reverse?: boolean
  /** Seconds for the pulse to travel the path once. */
  duration?: number
  /** Seconds before the first pulse. Stagger beams with different delays. */
  delay?: number
  /** Seconds to wait between pulses. */
  repeatDelay?: number
  /** Length of the pulse as a fraction of the path (0–1). */
  pulseLength?: number
  /** Horizontal offset of the start point in pixels. */
  startXOffset?: number
  /** Vertical offset of the start point in pixels. */
  startYOffset?: number
  /** Horizontal offset of the end point in pixels. */
  endXOffset?: number
  /** Vertical offset of the end point in pixels. */
  endYOffset?: number
  /** Color of the resting path. Any CSS color or var(). */
  pathColor?: string
  /** Stroke width of the path and pulse in pixels. */
  pathWidth?: number
  /** Opacity of the resting path (0–1). */
  pathOpacity?: number
  /** Color at the tail of the pulse. */
  gradientStartColor?: string
  /** Color at the head of the pulse. */
  gradientStopColor?: string
}

type Geometry = { width: number; height: number; d: string }

// Gentle in-out so the pulse accelerates away and settles in, like a signal arriving.
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

function AnimatedBeam({
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  duration = 3.5,
  delay = 0,
  repeatDelay = 0.8,
  pulseLength = 0.35,
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
  pathColor = "var(--foreground)",
  pathWidth = 2,
  pathOpacity = 0.1,
  gradientStartColor = "var(--chart-1)",
  gradientStopColor = "var(--chart-4)",
  className,
  style,
  ...props
}: AnimatedBeamProps) {
  const uid = React.useId().replace(/[^a-zA-Z0-9_-]/g, "")
  const gradientId = `bm-beam-${uid}`
  const glowId = `bm-beam-glow-${uid}`
  const reduceMotion = useReducedMotion()
  const svgRef = React.useRef<SVGSVGElement>(null)
  const pulseRef = React.useRef<SVGPathElement>(null)
  const glowRef = React.useRef<SVGPathElement>(null)
  const gradientRef = React.useRef<SVGLinearGradientElement>(null)
  const [geometry, setGeometry] = React.useState<Geometry>({ width: 0, height: 0, d: "" })

  // Measure the endpoints relative to the container and rebuild the curve on any resize.
  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const update = () => {
      const from = fromRef.current
      const to = toRef.current
      if (!from || !to) return
      const box = container.getBoundingClientRect()
      const a = from.getBoundingClientRect()
      const b = to.getBoundingClientRect()
      const sx = a.left - box.left + a.width / 2 + startXOffset
      const sy = a.top - box.top + a.height / 2 + startYOffset
      const ex = b.left - box.left + b.width / 2 + endXOffset
      const ey = b.top - box.top + b.height / 2 + endYOffset
      const d = `M ${sx},${sy} Q ${(sx + ex) / 2},${(sy + ey) / 2 - curvature} ${ex},${ey}`
      setGeometry((prev) =>
        prev.d === d && prev.width === box.width && prev.height === box.height
          ? prev
          : { width: box.width, height: box.height, d }
      )
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(container)
    if (fromRef.current) observer.observe(fromRef.current)
    if (toRef.current) observer.observe(toRef.current)
    return () => observer.disconnect()
  }, [containerRef, fromRef, toRef, curvature, startXOffset, startYOffset, endXOffset, endYOffset])

  // Drive the pulse from one rAF loop: a dash slides along the path and the gradient follows it.
  React.useEffect(() => {
    const svg = svgRef.current
    const pulse = pulseRef.current
    const glow = glowRef.current
    const gradient = gradientRef.current
    if (!svg || !pulse || !glow || !gradient || !geometry.d || reduceMotion) return
    if (typeof pulse.getTotalLength !== "function") return
    const total = pulse.getTotalLength()
    if (!total) return
    const length = Math.min(Math.max(pulseLength, 0.05), 1)
    const cycle = duration + repeatDelay
    const at = (fraction: number) => {
      const along = Math.min(Math.max(fraction, 0), 1) * total
      return pulse.getPointAtLength(reverse ? total - along : along)
    }

    let frame = 0
    let visible = true
    let start: number | null = null
    const paint = (now: number) => {
      start ??= now
      const elapsed = (now - start) / 1000 - delay
      const local = elapsed < 0 ? -1 : (elapsed % cycle) / duration
      if (local < 0 || local > 1) {
        pulse.style.opacity = glow.style.opacity = "0"
      } else {
        const head = easeInOut(local) * (1 + length)
        const tail = head - length
        // The dash covers [tail, head] along the path, measured from the travel start.
        const offset = reverse ? String(-(1 - head)) : String(-tail)
        pulse.style.strokeDashoffset = glow.style.strokeDashoffset = offset
        pulse.style.opacity = "1"
        glow.style.opacity = "0.55"
        const t = at(tail)
        const h = at(head)
        gradient.setAttribute("x1", String(t.x))
        gradient.setAttribute("y1", String(t.y))
        gradient.setAttribute("x2", String(h.x))
        gradient.setAttribute("y2", String(h.y))
      }
      frame = requestAnimationFrame(paint)
    }
    const run = () => {
      cancelAnimationFrame(frame)
      if (visible && !document.hidden) frame = requestAnimationFrame(paint)
    }
    const io = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true
      run()
    })
    io.observe(svg)
    document.addEventListener("visibilitychange", run)
    run()
    return () => {
      cancelAnimationFrame(frame)
      io.disconnect()
      document.removeEventListener("visibilitychange", run)
    }
  }, [geometry.d, reduceMotion, duration, delay, repeatDelay, pulseLength, reverse])

  const staticBeam = reduceMotion === true
  const dash = staticBeam ? undefined : `${Math.min(Math.max(pulseLength, 0.05), 1)} 3`

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      data-slot="animated-beam"
      fill="none"
      width={geometry.width}
      height={geometry.height}
      viewBox={`0 0 ${geometry.width} ${geometry.height}`}
      className={cn("pointer-events-none absolute top-0 left-0 overflow-visible", className)}
      style={style}
      {...props}
    >
      <defs>
        <linearGradient
          ref={gradientRef}
          id={gradientId}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2={geometry.width}
          y2="0"
        >
          <stop offset="0%" style={{ stopColor: gradientStartColor, stopOpacity: 0 }} />
          <stop offset="35%" style={{ stopColor: gradientStartColor }} />
          <stop offset="100%" style={{ stopColor: gradientStopColor }} />
        </linearGradient>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={pathWidth * 1.5} />
        </filter>
      </defs>
      <path
        data-slot="animated-beam-path"
        d={geometry.d}
        strokeWidth={pathWidth}
        strokeLinecap="round"
        style={{ stroke: pathColor, strokeOpacity: pathOpacity }}
      />
      <path
        ref={glowRef}
        d={geometry.d}
        pathLength={1}
        stroke={`url(#${gradientId})`}
        strokeWidth={pathWidth * 3}
        strokeLinecap="round"
        strokeDasharray={dash}
        filter={`url(#${glowId})`}
        style={{ opacity: 0 }}
      />
      <path
        ref={pulseRef}
        data-slot="animated-beam-pulse"
        d={geometry.d}
        pathLength={1}
        stroke={`url(#${gradientId})`}
        strokeWidth={pathWidth}
        strokeLinecap="round"
        strokeDasharray={dash}
        style={{ opacity: staticBeam ? 0.45 : 0 }}
      />
    </svg>
  )
}

export { AnimatedBeam, type AnimatedBeamProps }
