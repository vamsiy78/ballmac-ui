// Ballmac UI: Progressive Blur. https://ui.ballmac.com/components/progressive-blur
import * as React from "react"

import { cn } from "@/lib/utils"

type ProgressiveBlurProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Edge the blur is attached to. It is strongest right at the edge. */
  position?: "top" | "bottom" | "left" | "right"
  /** Depth of the blurred band: a CSS length such as "6rem" or "30%". */
  size?: string
  /** Strongest blur in pixels, reached at the edge. */
  strength?: number
  /** Number of stacked layers. More layers make a smoother ramp and cost a little more to paint. */
  layers?: number
}

// The gradient runs from the inner edge of the band toward the attached edge, where the blur is strongest.
const TO = { top: "to top", bottom: "to bottom", left: "to left", right: "to right" } as const

/**
 * A blur that ramps up toward an edge instead of switching on at a line, made from stacked
 * backdrop-filter layers with staggered masks. Pointer events pass through it. Decorative.
 */
function ProgressiveBlur({ position = "bottom", size = "5rem", strength = 14, layers = 8, className, style, ...props }: ProgressiveBlurProps) {
  const horizontal = position === "left" || position === "right"
  const n = Math.max(2, Math.min(layers, 12))
  return (
    <div
      data-slot="progressive-blur"
      aria-hidden="true"
      className={cn("pointer-events-none absolute z-10", horizontal ? "inset-y-0" : "inset-x-0", className)}
      style={{ [position]: 0, [horizontal ? "width" : "height"]: size, ...style }}
      {...props}
    >
      {Array.from({ length: n }, (_, i) => {
        // Each layer fades in over a window of the band and is blurred a little more than the one before.
        const from = (i * 100) / (n + 1)
        const blur = (strength * (i + 1)) / n
        const mask = `linear-gradient(${TO[position]}, transparent ${from}%, black ${from + 100 / (n + 1)}%, black ${from + 200 / (n + 1)}%, transparent ${from + 300 / (n + 1)}%)`
        return (
          <span
            key={i}
            className="absolute inset-0"
            style={{
              backdropFilter: `blur(${blur.toFixed(2)}px)`,
              WebkitBackdropFilter: `blur(${blur.toFixed(2)}px)`,
              maskImage: mask,
              WebkitMaskImage: mask,
            }}
          />
        )
      })}
    </div>
  )
}

export { ProgressiveBlur, type ProgressiveBlurProps }
