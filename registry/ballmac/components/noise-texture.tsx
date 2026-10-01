// Ballmac UI: Noise Texture. https://ui.ballmac.com/components/noise-texture
"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

type NoiseTextureProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Strength of the grain, from 0 to 1. */
  opacity?: number
  /** Fineness of the grain. Higher is finer. */
  frequency?: number
  /** Side of the repeating tile in pixels. */
  tile?: number
  /** How the grain mixes with what is behind it. "overlay" adds grain to light and dark areas alike. */
  blend?: "overlay" | "soft-light" | "multiply" | "screen" | "normal"
  /** Make the grain shimmer like film. */
  animated?: boolean
}

function noiseImage(frequency: number, tile: number) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${tile}' height='${tile}'><filter id='n' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='${frequency}' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

/** A film-grain layer for gradients, cards and photos. Put it inside a positioned parent. Decorative. */
function NoiseTexture({ opacity = 0.14, frequency = 0.8, tile = 220, blend = "overlay", animated = false, className, style, ...props }: NoiseTextureProps) {
  const reduce = useReducedMotion()
  const image = React.useMemo(() => noiseImage(frequency, tile), [frequency, tile])
  const steps = [0, 0.3, 0.6, 0.15, 0.85, 0.45].map((n) => `${Math.round(n * tile)}px ${Math.round(((n * 7) % 1) * tile)}px`)
  return (
    <div
      data-slot="noise-texture"
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      style={{ ...style }}
      {...props}
    >
      <motion.div
        className="absolute -inset-[20%]"
        style={{ backgroundImage: image, backgroundSize: `${tile}px ${tile}px`, opacity, mixBlendMode: blend }}
        animate={animated && !reduce ? { backgroundPosition: steps } : undefined}
        transition={{ duration: 0.9, repeat: Infinity, ease: "linear", times: [0, 0.2, 0.4, 0.6, 0.8, 1], type: "keyframes" }}
      />
    </div>
  )
}

export { NoiseTexture, type NoiseTextureProps }
