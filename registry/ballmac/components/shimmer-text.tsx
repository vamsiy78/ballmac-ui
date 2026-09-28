// Ballmac UI: Shimmer Text. https://ui.ballmac.com/components/shimmer-text
"use client"

import * as React from "react"
import { animate, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

type ShimmerTextElement = "span" | "p" | "div" | "h1" | "h2" | "h3" | "h4"

type ShimmerTextProps = React.ComponentProps<"span"> & {
  /** The element to render. Defaults to "span". */
  as?: ShimmerTextElement
  /** Seconds for one sweep across the text. */
  duration?: number
  /** Half-width of the highlight in em, so it scales with the font size. */
  spread?: number
}

function ShimmerText({
  as = "span",
  duration = 2,
  spread = 2,
  className,
  style,
  children,
  ...props
}: ShimmerTextProps) {
  const Comp = as as React.ElementType
  const ref = React.useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion()

  React.useEffect(() => {
    const node = ref.current
    if (!node || reduceMotion) return
    // The gradient is 250% wide: at 100% the highlight sits left of the text, at 0% right of it.
    const controls = animate(
      node,
      { backgroundPosition: ["100% 0%", "0% 0%"] },
      { duration, ease: "linear", repeat: Infinity }
    )
    return () => {
      controls.stop()
      node.style.backgroundPosition = ""
    }
  }, [duration, reduceMotion])

  return (
    <Comp
      ref={ref}
      data-slot="shimmer-text"
      className={cn(
        "inline-block bg-clip-text bg-no-repeat text-transparent forced-colors:bg-none forced-colors:text-[CanvasText]",
        className
      )}
      style={{
        // Outside the highlight the text is --muted-foreground, which keeps body-text contrast.
        backgroundImage: `linear-gradient(90deg, var(--muted-foreground) calc(50% - ${spread}em), var(--foreground) 50%, var(--muted-foreground) calc(50% + ${spread}em))`,
        backgroundSize: "250% 100%",
        backgroundPosition: "100% 0%",
        ...style,
      }}
      {...props}
    >
      {children}
    </Comp>
  )
}

export { ShimmerText, type ShimmerTextProps }
