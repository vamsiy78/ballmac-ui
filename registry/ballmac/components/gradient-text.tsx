// Ballmac UI: Gradient Text. https://ui.ballmac.com/components/gradient-text
"use client"

import * as React from "react"
import { animate, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

type GradientTextElement = "span" | "p" | "div" | "h1" | "h2" | "h3" | "h4"

type GradientTextProps = React.ComponentProps<"span"> & {
  /** The element to render. */
  as?: GradientTextElement
  /** "flow" drifts the gradient across the text; "shiny" keeps it still and sweeps a glint of light over it. */
  variant?: "flow" | "shiny"
  /** Gradient colors as CSS colors or variables. */
  colors?: string[]
  /** Seconds for one drift (flow) or one sweep (shiny). */
  duration?: number
  /** Shiny only: seconds between sweeps. */
  repeatDelay?: number
  /** Gradient angle in degrees. */
  angle?: number
  /** Shiny only: color of the glint. White reads best over saturated colors. */
  shineColor?: string
}

function GradientText({
  as = "span",
  variant = "flow",
  colors = ["var(--chart-1)", "var(--chart-4)", "var(--chart-5)", "var(--chart-3)"],
  duration,
  repeatDelay = 2.4,
  angle = 100,
  shineColor = "rgb(255 255 255 / 0.95)",
  className,
  style,
  ...props
}: GradientTextProps) {
  const Comp = as as React.ElementType
  const ref = React.useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion()
  const seconds = duration ?? (variant === "flow" ? 6 : 1.4)

  React.useEffect(() => {
    const node = ref.current
    if (!node || reduceMotion) return
    const controls =
      variant === "flow"
        ? animate(node, { "--gradient-x": ["0%", "100%"] }, { duration: seconds, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" })
        : animate(node, { "--shine-x": ["100%", "0%"] }, { duration: seconds, ease: [0.4, 0, 0.2, 1], repeat: Infinity, repeatDelay })
    return () => {
      controls.stop()
      node.style.removeProperty("--gradient-x")
      node.style.removeProperty("--shine-x")
    }
  }, [variant, seconds, repeatDelay, reduceMotion])

  // Flow repeats the first color at the end so the drift has no hard edge.
  const gradient = `linear-gradient(${angle}deg, ${[...colors, ...(variant === "flow" ? [colors[0]] : [])].join(", ")})`
  const glint = `linear-gradient(${angle + 10}deg, transparent 40%, ${shineColor} 50%, transparent 60%)`

  return (
    <Comp
      ref={ref}
      data-slot="gradient-text"
      data-variant={variant}
      className={cn(
        "inline-block bg-clip-text bg-no-repeat text-transparent [-webkit-background-clip:text] forced-colors:bg-none forced-colors:text-[CanvasText]",
        className
      )}
      style={{
        backgroundImage: variant === "flow" ? gradient : `${glint}, ${gradient}`,
        backgroundSize: variant === "flow" ? "300% 100%" : "250% 100%, 100% 100%",
        // Resting positions double as the reduced-motion state: a centered gradient, glint parked off the text.
        backgroundPosition: variant === "flow" ? "var(--gradient-x, 30%) 50%" : "var(--shine-x, 100%) 0%, 0% 0%",
        ...style,
      }}
      {...props}
    />
  )
}

export { GradientText, type GradientTextProps }
