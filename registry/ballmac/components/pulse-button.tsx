// Ballmac UI: Pulse Button. https://ui.ballmac.com/components/pulse-button
"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"

import { Button, type ButtonProps } from "@/components/ballmac/button"
import { cn } from "@/lib/utils"

type PulseTone = "primary" | "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5" | "destructive"

const RING: Record<PulseTone, string> = {
  primary: "bg-primary",
  "chart-1": "bg-chart-1",
  "chart-2": "bg-chart-2",
  "chart-3": "bg-chart-3",
  "chart-4": "bg-chart-4",
  "chart-5": "bg-chart-5",
  destructive: "bg-destructive",
}

type PulseButtonProps = Omit<ButtonProps, "asChild"> & {
  /** Color of the rings. */
  tone?: PulseTone
  /** How many rings leave the button, one after another. */
  rings?: number
  /** Seconds one ring takes to fade out. */
  duration?: number
  /** Turn the pulse off, for example once the person has acted. */
  active?: boolean
  /** Classes for the wrapper around the button and rings. */
  wrapperClassName?: string
}

function PulseButton({ tone = "primary", rings = 2, duration = 2, active = true, shape, disabled, wrapperClassName, className, children, ...props }: PulseButtonProps) {
  const reduce = useReducedMotion()
  const [calm, setCalm] = React.useState(false)
  const pulsing = active && !disabled && !calm
  const radius = shape === "pill" ? "rounded-full" : "rounded-md"

  return (
    <span
      data-slot="pulse-button"
      data-pulsing={pulsing || undefined}
      onPointerEnter={() => setCalm(true)}
      onPointerLeave={() => setCalm(false)}
      onFocusCapture={() => setCalm(true)}
      onBlurCapture={() => setCalm(false)}
      className={cn("relative inline-flex", wrapperClassName)}
    >
      {active && !disabled &&
        Array.from({ length: rings }, (_, i) => (
          <motion.span
            key={i}
            aria-hidden="true"
            className={cn("pointer-events-none absolute inset-0 -z-10", radius, RING[tone])}
            initial={false}
            animate={reduce ? { scale: 1.12, opacity: 0.18 } : pulsing ? { scale: [1, 1.5], opacity: [0.35, 0] } : { scale: 1, opacity: 0 }}
            transition={reduce ? { duration: 0 } : pulsing ? { duration, delay: (i * duration) / rings, repeat: Infinity, ease: "easeOut" } : { duration: 0.2 }}
          />
        ))}
      <Button shape={shape} disabled={disabled} className={cn("relative z-0", className)} {...props}>
        {children}
      </Button>
    </span>
  )
}

export { PulseButton, type PulseButtonProps, type PulseTone }
