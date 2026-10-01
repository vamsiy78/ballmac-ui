// Ballmac UI: Rainbow Button. https://ui.ballmac.com/components/rainbow-button
"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"

import { Button, type ButtonProps } from "@/components/ballmac/button"
import { cn } from "@/lib/utils"

type RainbowButtonProps = Omit<ButtonProps, "asChild"> & {
  /** Seconds for the colors to travel once around the border. */
  duration?: number
  /** Show a soft glow of the same colors under the button. */
  glow?: boolean
  /** Classes for the wrapper that draws the border. */
  wrapperClassName?: string
}

const GRADIENT =
  "conic-gradient(from 0deg, var(--chart-1), var(--chart-2), var(--chart-3), var(--chart-4), var(--chart-5), var(--chart-1))"

function RainbowButton({ duration = 4, glow = true, shape, className, wrapperClassName, disabled, children, ...props }: RainbowButtonProps) {
  const reduce = useReducedMotion()
  const radius = shape === "pill" ? "rounded-full" : "rounded-md"
  const innerRadius = shape === "pill" ? "rounded-full" : "rounded-[calc(var(--radius-md)-2px)]"

  return (
    <span
      data-slot="rainbow-button"
      className={cn("group/rainbow relative inline-flex isolate", radius, disabled && "opacity-60", wrapperClassName)}
    >
      {glow && (
        <span aria-hidden="true" className={cn("pointer-events-none absolute -inset-1 -z-10 overflow-hidden opacity-0 blur-md transition-opacity duration-300 group-hover/rainbow:opacity-60 group-focus-within/rainbow:opacity-60 motion-reduce:transition-none", radius)}>
          <motion.span
            className="absolute -inset-[100%]"
            style={{ background: GRADIENT }}
            animate={reduce ? undefined : { rotate: 360 }}
            transition={{ duration, repeat: Infinity, ease: "linear" }}
          />
        </span>
      )}
      <span aria-hidden="true" className={cn("pointer-events-none absolute inset-0 overflow-hidden", radius)}>
        <motion.span
          className="absolute -inset-[100%]"
          style={{ background: GRADIENT }}
          animate={reduce ? undefined : { rotate: 360 }}
          transition={{ duration, repeat: Infinity, ease: "linear" }}
        />
      </span>
      <Button
        shape={shape}
        disabled={disabled}
        className={cn("m-[2px] border-0", innerRadius, className)}
        {...props}
      >
        {children}
      </Button>
    </span>
  )
}

export { RainbowButton, type RainbowButtonProps }
