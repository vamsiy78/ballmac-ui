// Ballmac UI: Spotlight Card. https://ui.ballmac.com/components/spotlight-card
"use client"

import * as React from "react"
import { useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

type SpotlightCardProps = React.ComponentProps<"div"> & {
  /** Radius of the glow in pixels. */
  size?: number
}

// Shows only the element's border box ring: the padding box is cut out of the full box.
const borderOnlyMask: React.CSSProperties = {
  WebkitMask: "linear-gradient(black, black) padding-box, linear-gradient(black, black)",
  WebkitMaskComposite: "xor",
  mask: "linear-gradient(black, black) padding-box exclude, linear-gradient(black, black)",
}

function isFocusVisible(element: Element) {
  try {
    return element.matches(":focus-visible")
  } catch {
    return false
  }
}

function SpotlightCard({
  size = 320,
  className,
  style,
  children,
  onPointerMove,
  onFocus,
  ...props
}: SpotlightCardProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  // Written straight to CSS variables: no React render per pointer move.
  const moveTo = (x: string, y: string) => {
    ref.current?.style.setProperty("--spotlight-x", x)
    ref.current?.style.setProperty("--spotlight-y", y)
  }

  return (
    <div
      ref={ref}
      data-slot="spotlight-card"
      className={cn(
        "group/spotlight relative isolate rounded-xl border bg-card p-6 text-card-foreground shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        className
      )}
      style={
        {
          "--spotlight-size": `${size}px`,
          "--spotlight-x": "50%",
          "--spotlight-y": "0%",
          ...style,
        } as React.CSSProperties
      }
      onPointerMove={(event) => {
        if (!reduceMotion && event.pointerType !== "touch") {
          const rect = event.currentTarget.getBoundingClientRect()
          moveTo(`${event.clientX - rect.left}px`, `${event.clientY - rect.top}px`)
        }
        onPointerMove?.(event)
      }}
      onFocus={(event) => {
        // Keyboard focus gets a steady glow from the top edge.
        if (isFocusVisible(event.target)) moveTo("50%", "0%")
        onFocus?.(event)
      }}
      {...props}
    >
      <span
        aria-hidden="true"
        data-slot="spotlight-card-surface"
        className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] opacity-0 transition-opacity duration-200 group-hover/spotlight:opacity-100 group-focus-visible/spotlight:opacity-100 group-has-[:focus-visible]/spotlight:opacity-100"
        style={{
          background:
            "radial-gradient(var(--spotlight-size) circle at var(--spotlight-x) var(--spotlight-y), color-mix(in oklch, var(--ring) 11%, transparent), transparent 70%)",
        }}
      />
      <span
        aria-hidden="true"
        data-slot="spotlight-card-border"
        className="pointer-events-none absolute -inset-px rounded-[inherit] border border-transparent opacity-0 transition-opacity duration-200 group-hover/spotlight:opacity-100 group-focus-visible/spotlight:opacity-100 group-has-[:focus-visible]/spotlight:opacity-100"
        style={{
          ...borderOnlyMask,
          background:
            "radial-gradient(calc(var(--spotlight-size) * 0.75) circle at var(--spotlight-x) var(--spotlight-y), color-mix(in oklch, var(--ring) 75%, transparent), transparent 70%) border-box",
        }}
      />
      {children}
    </div>
  )
}

export { SpotlightCard, type SpotlightCardProps }
