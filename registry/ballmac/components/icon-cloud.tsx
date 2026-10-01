// Ballmac UI: Icon Cloud. https://ui.ballmac.com/components/icon-cloud
"use client"

import * as React from "react"
import { useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

type IconCloudProps = Omit<React.ComponentProps<"ul">, "children"> & {
  /** The items on the sphere: icons, logos, short labels, links or buttons. Each one is a list item. */
  children: React.ReactNode
  /** Diameter of the sphere in pixels. */
  size?: number
  /** Turns per minute when left alone. */
  speed?: number
  /** Accessible name of the list. */
  label?: string
}

type Vec = { x: number; y: number; z: number }

/** Spreads n points evenly over a sphere (the Fibonacci spiral). */
function spherePoints(n: number): Vec[] {
  if (n === 1) return [{ x: 0, y: 0, z: 1 }]
  const golden = Math.PI * (3 - Math.sqrt(5))
  return Array.from({ length: n }, (_, i) => {
    const y = 1 - (i / (n - 1)) * 2
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = golden * i
    return { x: Math.cos(theta) * r, y, z: Math.sin(theta) * r }
  })
}

/**
 * Items orbiting on a 3D sphere. Drag to spin it; it eases to a stop under the pointer and while any item has
 * focus, so links stay clickable. Updates go straight to the DOM, so React does not re-render each frame.
 */
function IconCloud({ children, size = 320, speed = 1.2, label = "Items", className, style, ...props }: IconCloudProps) {
  const reduce = useReducedMotion()
  const items = React.Children.toArray(children)
  const refs = React.useRef<(HTMLLIElement | null)[]>([])
  const rootRef = React.useRef<HTMLUListElement>(null)
  const points = React.useMemo(() => spherePoints(items.length), [items.length])
  const state = React.useRef({ ax: 0.3, ay: 0, vx: 0, vy: 0, paused: false, down: false, dragging: false, last: { x: 0, y: 0 } })

  const render = React.useCallback(() => {
    const { ax, ay } = state.current
    const R = Math.max(40, Math.min(size, (rootRef.current?.clientWidth ?? size + 64) - 64) / 2)
    const cosX = Math.cos(ax)
    const sinX = Math.sin(ax)
    const cosY = Math.cos(ay)
    const sinY = Math.sin(ay)
    points.forEach((p, i) => {
      const el = refs.current[i]
      if (!el) return
      // Spin around the vertical axis, then tilt around the horizontal one.
      const x1 = p.x * cosY + p.z * sinY
      const z1 = -p.x * sinY + p.z * cosY
      const y2 = p.y * cosX - z1 * sinX
      const z2 = p.y * sinX + z1 * cosX
      const depth = (z2 + 1) / 2
      const scale = 0.55 + depth * 0.65
      el.style.transform = `translate3d(${(x1 * R).toFixed(1)}px, ${(y2 * R).toFixed(1)}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`
      el.style.opacity = String((0.62 + depth * 0.38).toFixed(3))
      el.style.zIndex = String(Math.round(depth * 100))
      el.style.filter = depth < 0.35 ? "blur(0.6px)" : ""
    })
  }, [points, size])

  React.useEffect(() => {
    render()
    if (reduce) {
      const still = new ResizeObserver(() => render())
      if (rootRef.current) still.observe(rootRef.current)
      return () => still.disconnect()
    }
    let frame = 0
    let last = 0
    let visible = true
    const loop = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0
      last = now
      const s = state.current
      if (!s.dragging) {
        const idle = s.paused ? 0 : (speed * Math.PI * 2) / 60
        s.vy += (idle - s.vy) * Math.min(1, dt * 3)
        s.vx += (0 - s.vx) * Math.min(1, dt * 3)
        s.ay += s.vy * dt
        s.ax += s.vx * dt
      }
      render()
      frame = requestAnimationFrame(loop)
    }
    const ro = new ResizeObserver(() => render())
    if (rootRef.current) ro.observe(rootRef.current)
    const io = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true
      cancelAnimationFrame(frame)
      last = 0
      if (visible) frame = requestAnimationFrame(loop)
    })
    if (rootRef.current) io.observe(rootRef.current)
    frame = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(frame)
      io.disconnect()
      ro.disconnect()
    }
  }, [render, reduce, speed])

  return (
    <ul
      ref={rootRef}
      data-slot="icon-cloud"
      aria-label={label}
      className={cn("relative m-0 list-none touch-pan-y p-0 select-none", !reduce && "cursor-grab active:cursor-grabbing", className)}
      style={{ width: size + 64, maxWidth: "100%", aspectRatio: "1 / 1", ...style }}
      onPointerDown={(e) => {
        if (reduce) return
        state.current.down = true
        state.current.last = { x: e.clientX, y: e.clientY }
      }}
      onPointerMove={(e) => {
        const s = state.current
        if (!s.down) return
        const dx = e.clientX - s.last.x
        const dy = e.clientY - s.last.y
        // Wait for a real drag before capturing the pointer, so a plain click still reaches the item under it.
        if (!s.dragging) {
          if (Math.hypot(dx, dy) < 5) return
          s.dragging = true
          ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
        }
        s.last = { x: e.clientX, y: e.clientY }
        s.ay += dx * 0.008
        s.ax -= dy * 0.008
        s.vy = dx * 0.25
        s.vx = -dy * 0.25
      }}
      onPointerUp={() => {
        state.current.down = false
        state.current.dragging = false
      }}
      onPointerCancel={() => {
        state.current.down = false
        state.current.dragging = false
      }}
      onPointerEnter={() => {
        state.current.paused = true
      }}
      onPointerLeave={() => {
        state.current.paused = false
        state.current.down = false
        state.current.dragging = false
      }}
      onFocusCapture={() => {
        state.current.paused = true
      }}
      onBlurCapture={() => {
        state.current.paused = false
      }}
      {...props}
    >
      {items.map((child, i) => (
        <li
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          className="absolute top-1/2 left-1/2 flex items-center justify-center will-change-transform"
        >
          {child}
        </li>
      ))}
    </ul>
  )
}

export { IconCloud, type IconCloudProps }
