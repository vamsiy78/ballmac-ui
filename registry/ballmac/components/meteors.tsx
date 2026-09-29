// Ballmac UI: Meteors. https://ui.ballmac.com/components/meteors
"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type MeteorsProps = Omit<React.ComponentProps<"div">, "children" | "color"> & {
  /** Number of meteors in flight at once. */
  count?: number
  /** Direction of travel in degrees: 0 is right, 90 is down, 135 is down-left. */
  angle?: number
  /** Shortest and longest seconds for one meteor to cross. */
  duration?: [number, number]
  /** Shortest and longest tail length in pixels. */
  tail?: [number, number]
  /** Meteor color. Any CSS color or var(). */
  color?: string
}

type Meteor = { id: number; left: number; top: number; delay: number; duration: number; tail: number }

function Meteors({
  count = 14,
  angle = 135,
  duration = [2.4, 5.5],
  tail = [60, 160],
  color = "color-mix(in oklch, var(--foreground) 70%, transparent)",
  className,
  style,
  ...props
}: MeteorsProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  // Positions are random, so they are created on the client after mount; the server renders an empty layer.
  const [meteors, setMeteors] = React.useState<Meteor[]>([])
  const [distance, setDistance] = React.useState(0)
  const [minDuration, maxDuration] = duration
  const [minTail, maxTail] = tail

  React.useEffect(() => {
    const root = rootRef.current
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const between = (a: number, b: number) => a + Math.random() * (b - a)
    const rad = (angle * Math.PI) / 180
    const goingLeft = Math.cos(rad) < 0
    setMeteors(
      Array.from({ length: count }, (_, id) => {
        const d = between(minDuration, maxDuration)
        return {
          id,
          // Start along the top edge, spread past the side the meteors travel away from.
          left: goingLeft ? between(10, 130) : between(-30, 90),
          top: between(-20, 30),
          delay: between(0, maxDuration * 2),
          duration: d,
          tail: between(minTail, maxTail),
        }
      })
    )
    const measure = () => setDistance(Math.hypot(root.clientWidth, root.clientHeight) * 1.1)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(root)
    return () => ro.disconnect()
  }, [count, angle, minDuration, maxDuration, minTail, maxTail])

  // Web Animations keep this free of global CSS and let us pause off-screen.
  React.useEffect(() => {
    const root = rootRef.current
    if (!root || !distance || !meteors.length) return
    const nodes = root.querySelectorAll<HTMLElement>("[data-slot=meteor]")
    const animations = Array.from(nodes).map((node, i) => {
      const m = meteors[i]!
      // Each loop is the flight plus a pause, so meteors don't fire back to back.
      const flight = m.duration * 1000
      const total = flight * 1.8
      return node.animate(
        [
          { transform: `rotate(${angle}deg) translateX(0px)`, opacity: 0, offset: 0 },
          { opacity: 1, offset: 0.06 },
          { opacity: 1, offset: (flight / total) * 0.7 },
          { transform: `rotate(${angle}deg) translateX(${distance}px)`, opacity: 0, offset: flight / total },
          { transform: `rotate(${angle}deg) translateX(${distance}px)`, opacity: 0, offset: 1 },
        ],
        { duration: total, delay: m.delay * 1000, iterations: Infinity, easing: "linear", fill: "backwards" }
      )
    })
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
  }, [meteors, distance, angle])

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      data-slot="meteors"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden", className)}
      style={{ ...style, ["--meteor" as string]: color }}
      {...props}
    >
      {meteors.map((m) => (
        <span
          key={m.id}
          data-slot="meteor"
          className="absolute size-[3px] rounded-full bg-(--meteor) opacity-0 shadow-[0_0_0_1px_color-mix(in_oklch,var(--meteor)_12%,transparent),0_0_10px_2px_color-mix(in_oklch,var(--meteor)_35%,transparent)]"
          style={{ left: `${m.left}%`, top: `${m.top}%`, transform: `rotate(${angle}deg)` }}
        >
          <span
            className="absolute top-1/2 right-1/2 h-px -translate-y-1/2 bg-linear-to-r from-transparent to-(--meteor)"
            style={{ width: m.tail }}
          />
        </span>
      ))}
    </div>
  )
}

export { Meteors, type MeteorsProps }
