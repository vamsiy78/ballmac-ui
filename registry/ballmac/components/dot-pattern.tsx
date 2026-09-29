// Ballmac UI: Dot Pattern. https://ui.ballmac.com/components/dot-pattern
"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type DotPatternProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Horizontal spacing between dots in pixels. */
  width?: number
  /** Vertical spacing between dots in pixels. */
  height?: number
  /** Dot radius in pixels. */
  radius?: number
  /** Make a few random dots glow and pulse softly. */
  glow?: boolean
  /** How many dots glow at once when `glow` is on. */
  glowCount?: number
  /** Color of the glowing dots. Any CSS color or var(). */
  glowColor?: string
  /** Fade the pattern out toward the edges with a radial mask. */
  radialMask?: boolean
}

type GlowDot = { id: number; x: number; y: number; delay: number; duration: number }

function DotPattern({
  width = 16,
  height = 16,
  radius = 1,
  glow = false,
  glowCount = 18,
  glowColor = "var(--chart-1)",
  radialMask = true,
  className,
  style,
  ...props
}: DotPatternProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const patternId = `bm-dots-${React.useId().replace(/[^a-zA-Z0-9_-]/g, "")}`
  // Glow positions are random, so they're picked on the client after mount (hydration-safe).
  const [dots, setDots] = React.useState<GlowDot[]>([])

  React.useEffect(() => {
    const root = rootRef.current
    if (!root || !glow) {
      setDots([])
      return
    }
    const pick = () => {
      const cols = Math.floor(root.clientWidth / width)
      const rows = Math.floor(root.clientHeight / height)
      if (cols < 1 || rows < 1) return
      setDots(
        Array.from({ length: glowCount }, (_, id) => ({
          id,
          x: (Math.floor(Math.random() * cols) + 0.5) * width,
          y: (Math.floor(Math.random() * rows) + 0.5) * height,
          delay: Math.random() * 4,
          duration: 2.5 + Math.random() * 3,
        }))
      )
    }
    pick()
    const ro = new ResizeObserver(pick)
    ro.observe(root)
    return () => ro.disconnect()
  }, [glow, glowCount, width, height])

  React.useEffect(() => {
    const root = rootRef.current
    if (!root || !dots.length || typeof root.animate !== "function") return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const animations = Array.from(root.querySelectorAll<SVGCircleElement>("[data-slot=dot-pattern-glow]")).map(
      (node, i) =>
        node.animate([{ opacity: 0.15 }, { opacity: 1 }, { opacity: 0.15 }], {
          duration: dots[i]!.duration * 1000,
          delay: -dots[i]!.delay * 1000,
          iterations: Infinity,
          easing: "ease-in-out",
        })
    )
    let visible = true
    const sync = () => {
      for (const a of animations) {
        if (visible && !document.hidden) a.play()
        else a.pause()
      }
    }
    const io = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true
      sync()
    })
    io.observe(root)
    document.addEventListener("visibilitychange", sync)
    return () => {
      io.disconnect()
      document.removeEventListener("visibilitychange", sync)
      for (const a of animations) a.cancel()
    }
  }, [dots])

  const mask = radialMask ? "radial-gradient(ellipse 70% 65% at 50% 50%, black 25%, transparent 80%)" : undefined

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      data-slot="dot-pattern"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden [--dot:color-mix(in_oklch,var(--foreground)_30%,transparent)]",
        className
      )}
      style={{ maskImage: mask, WebkitMaskImage: mask, ...style }}
      {...props}
    >
      <svg className="absolute inset-0 size-full">
        <defs>
          <pattern id={patternId} width={width} height={height} patternUnits="userSpaceOnUse">
            <circle cx={width / 2} cy={height / 2} r={radius} style={{ fill: "var(--dot)" }} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
        {dots.map((dot) => (
            <circle
              key={dot.id}
              data-slot="dot-pattern-glow"
              cx={dot.x}
              cy={dot.y}
              r={radius * 1.8}
              style={{
                fill: glowColor,
                opacity: 0.6,
                filter: `drop-shadow(0 0 ${radius * 4}px ${glowColor})`,
              }}
            />
        ))}
      </svg>
    </div>
  )
}

export { DotPattern, type DotPatternProps }
