// Ballmac UI: Ripple. https://ui.ballmac.com/components/ripple
"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

type RippleProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Number of rings. */
  circles?: number
  /** Diameter of the innermost ring in pixels. */
  size?: number
  /** Extra diameter added by each ring in pixels. */
  gap?: number
  /** Seconds for one slow breath of the rings. */
  duration?: number
}

/** Concentric rings that breathe outward from the center of the nearest positioned parent. Decorative. */
function Ripple({ circles = 7, size = 200, gap = 70, duration = 4, className, ...props }: RippleProps) {
  const reduce = useReducedMotion()
  return (
    <div
      data-slot="ripple"
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 flex items-center justify-center [mask-image:linear-gradient(to_bottom,black,transparent_90%)]", className)}
      {...props}
    >
      {Array.from({ length: circles }, (_, i) => {
        const d = size + i * gap
        return (
          <motion.span
            key={i}
            className="absolute rounded-full border border-foreground/15 bg-foreground/[0.03]"
            style={{ width: d, height: d, opacity: Math.max(0.15, 1 - i * 0.14) }}
            animate={reduce ? undefined : { scale: [1, 0.9, 1] }}
            transition={{ duration, delay: i * 0.12, repeat: Infinity, ease: "easeInOut" }}
          />
        )
      })}
    </div>
  )
}

type RippleBurst = { id: number; x: number; y: number; size: number }

type ClickRippleProps = React.ComponentProps<"div"> & {
  /** Seconds a ripple takes to spread and fade. */
  duration?: number
  /** Ripples start from the center of the element instead of the pointer. */
  centered?: boolean
}

/** Wrap any surface so a press sends a ripple out from the pointer. Keyboard activation ripples from the center. */
function ClickRipple({ duration = 0.7, centered = false, className, children, onPointerDown, onKeyDown, ...props }: ClickRippleProps) {
  const reduce = useReducedMotion()
  const ref = React.useRef<HTMLDivElement>(null)
  const [bursts, setBursts] = React.useState<RippleBurst[]>([])
  const next = React.useRef(0)

  function spawn(clientX?: number, clientY?: number) {
    const el = ref.current
    if (!el || reduce) return
    const box = el.getBoundingClientRect()
    const x = centered || clientX === undefined ? box.width / 2 : clientX - box.left
    const y = centered || clientY === undefined ? box.height / 2 : clientY - box.top
    const size = Math.hypot(Math.max(x, box.width - x), Math.max(y, box.height - y)) * 2
    setBursts((all) => [...all, { id: next.current++, x, y, size }])
  }

  return (
    <div
      ref={ref}
      data-slot="click-ripple"
      onPointerDown={(e) => {
        onPointerDown?.(e)
        spawn(e.clientX, e.clientY)
      }}
      onKeyDown={(e) => {
        onKeyDown?.(e)
        if ((e.key === "Enter" || e.key === " ") && e.target === e.currentTarget) spawn()
      }}
      className={cn("relative isolate overflow-hidden", className)}
      {...props}
    >
      {children}
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-[inherit]">
        {bursts.map((b) => (
          <motion.span
            key={b.id}
            className="absolute rounded-full bg-foreground/20"
            style={{ left: b.x - b.size / 2, top: b.y - b.size / 2, width: b.size, height: b.size }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 1, opacity: 0 }}
            transition={{ duration, ease: "easeOut" }}
            onAnimationComplete={() => setBursts((all) => all.filter((x) => x.id !== b.id))}
          />
        ))}
      </span>
    </div>
  )
}

export { Ripple, ClickRipple, type RippleProps, type ClickRippleProps }
