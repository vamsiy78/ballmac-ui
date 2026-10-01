// Ballmac UI: Shiny Button. https://ui.ballmac.com/components/shiny-button
"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"

import { Button, type ButtonProps } from "@/components/ballmac/button"
import { cn } from "@/lib/utils"

type ShinyButtonProps = Omit<ButtonProps, "asChild"> & {
  /** "hover" sweeps the shine on hover and keyboard focus. "loop" sweeps it again every few seconds to draw the eye. */
  shine?: "hover" | "loop"
  /** Seconds between sweeps when `shine` is "loop". */
  interval?: number
}

function ShinyButton({ shine = "hover", interval = 3.5, className, children, ...props }: ShinyButtonProps) {
  const reduce = useReducedMotion()
  return (
    <Button
      data-slot="shiny-button"
      className={cn("group/shiny overflow-hidden", className)}
      {...props}
    >
      {children}
      {!reduce && (
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
          {shine === "loop" ? (
            <motion.span
              className="absolute inset-y-0 -left-1/3 w-1/3 -skew-x-[20deg] bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-black/20"
              animate={{ x: ["0%", "450%"] }}
              transition={{ duration: 0.9, ease: "easeInOut", repeat: Infinity, repeatDelay: interval }}
            />
          ) : (
            <span className="absolute inset-y-0 -left-1/3 w-1/3 -skew-x-[20deg] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-out group-hover/shiny:translate-x-[450%] group-focus-visible/shiny:translate-x-[450%] dark:via-black/20" />
          )}
        </span>
      )}
    </Button>
  )
}

export { ShinyButton, type ShinyButtonProps }
