"use client"

import { animate, useInView, useReducedMotion } from "motion/react"
import * as React from "react"

import { cn } from "@/lib/utils"

/** A number that counts up from zero the first time it scrolls into view. It renders the final value first, so the number is right without the script. */
export function CountUp({ value, className, duration = 1.6 }: { value: number; className?: string; duration?: number }) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const reduce = useReducedMotion()
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const armed = React.useRef(false)

  React.useEffect(() => {
    const el = ref.current
    if (!el || reduce || armed.current) return
    const r = el.getBoundingClientRect()
    if (r.top < window.innerHeight) return // already visible at load: keep the final value
    armed.current = true
    el.textContent = "0"
  }, [reduce])

  React.useEffect(() => {
    const el = ref.current
    if (!el || !inView || !armed.current) return
    const controls = animate(0, value, { duration, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => (el.textContent = Math.round(v).toLocaleString("en-US")) })
    return () => controls.stop()
  }, [inView, value, duration])

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {value.toLocaleString("en-US")}
    </span>
  )
}

/** A soft light that follows the pointer across a card. Decorative only; on touch and with less motion asked for it stays off. */
export function Spotlight({ id, className, children, color = "rgb(255 255 255 / 0.14)" }: { id?: string; className?: string; children: React.ReactNode; color?: string }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  function move(e: React.PointerEvent) {
    if (reduce || e.pointerType !== "mouse" || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    ref.current.style.setProperty("--sx", `${e.clientX - r.left}px`)
    ref.current.style.setProperty("--sy", `${e.clientY - r.top}px`)
    ref.current.style.setProperty("--so", "1")
  }
  return (
    <div ref={ref} id={id} onPointerMove={move} onPointerLeave={() => ref.current?.style.setProperty("--so", "0")} className={cn("relative isolate", className)}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] opacity-[var(--so,0)] transition-opacity duration-500" style={{ background: `radial-gradient(520px circle at var(--sx, 50%) var(--sy, 0%), ${color}, transparent 45%)` }} />
      {children}
    </div>
  )
}
