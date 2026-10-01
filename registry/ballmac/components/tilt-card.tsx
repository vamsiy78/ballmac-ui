// Ballmac UI: Tilt Card. https://ui.ballmac.com/components/tilt-card
"use client"

import * as React from "react"
import { motion, type MotionStyle, useMotionTemplate, useMotionValue, useSpring, useTransform } from "motion/react"

import { cn } from "@/lib/utils"
import { useReducedMotionSafe } from "@/lib/ballmac/motion"

type TiltCardProps = Omit<
  React.ComponentProps<"div">,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "style"
> & {
  /** Largest rotation on each axis, in degrees. */
  maxTilt?: number
  /** Distance of the viewer in pixels. Smaller values exaggerate depth. */
  perspective?: number
  /** Scale while the pointer is over the card. */
  hoverScale?: number
  /** Draw a soft light highlight that follows the pointer. */
  glare?: boolean
  /** Peak opacity of the glare, 0 to 1. */
  glareOpacity?: number
  /** Inline styles for the card. */
  style?: React.CSSProperties
}

const SPRING = { stiffness: 220, damping: 22, mass: 0.6 }

function isFocusVisible(element: Element) {
  try {
    return element.matches(":focus-visible")
  } catch {
    return false
  }
}

function TiltCard({
  maxTilt = 10,
  perspective = 900,
  hoverScale = 1.02,
  glare = true,
  glareOpacity = 0.28,
  className,
  style,
  children,
  onPointerMove,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ...props
}: TiltCardProps) {
  const reduceMotion = useReducedMotionSafe()
  // Pointer position over the card, 0–1 on each axis; 0.5 is the center.
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const active = useMotionValue(0)
  const sx = useSpring(px, SPRING)
  const sy = useSpring(py, SPRING)
  const sActive = useSpring(active, SPRING)

  const rotateX = useTransform(sy, [0, 1], [maxTilt, -maxTilt])
  const rotateY = useTransform(sx, [0, 1], [-maxTilt, maxTilt])
  const scale = useTransform(sActive, [0, 1], [1, hoverScale])
  const glareX = useTransform(sx, (v) => `${v * 100}%`)
  const glareY = useTransform(sy, (v) => `${v * 100}%`)
  const glareAlpha = useTransform(sActive, (v) => v * glareOpacity)
  const glareBackground = useMotionTemplate`radial-gradient(farthest-corner circle at ${glareX} ${glareY}, rgb(255 255 255 / ${glareAlpha}), transparent 62%)`

  const moveTo = (x: number, y: number, on: number) => {
    px.set(x)
    py.set(y)
    active.set(on)
  }
  const reset = () => moveTo(0.5, 0.5, 0)

  return (
    <motion.div
      data-slot="tilt-card"
      className={cn(
        "group/tilt relative rounded-xl border bg-card text-card-foreground outline-none transform-3d focus-visible:ring-[3px] focus-visible:ring-ring/50",
        className
      )}
      style={
        reduceMotion
          ? (style as MotionStyle)
          : ({
              ...style,
              rotateX,
              rotateY,
              scale,
              transformPerspective: perspective,
              // Exposed for custom effects (holographic foil, parallax gradients): 0% to 100%.
              "--tilt-x": glareX,
              "--tilt-y": glareY,
            } as MotionStyle)
      }
      onPointerEnter={(event) => {
        if (!reduceMotion && event.pointerType !== "touch") active.set(1)
        onPointerEnter?.(event)
      }}
      onPointerMove={(event) => {
        if (!reduceMotion && event.pointerType !== "touch") {
          const rect = event.currentTarget.getBoundingClientRect()
          moveTo((event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height, 1)
        }
        onPointerMove?.(event)
      }}
      onPointerLeave={(event) => {
        reset()
        onPointerLeave?.(event)
      }}
      onFocus={(event) => {
        // Keyboard focus gets a gentle, fixed tilt toward the top-right corner.
        if (!reduceMotion && isFocusVisible(event.target)) moveTo(0.68, 0.36, 0.7)
        onFocus?.(event)
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) reset()
        onBlur?.(event)
      }}
      {...props}
    >
      {children}
      {glare && !reduceMotion && (
        <motion.span
          aria-hidden="true"
          data-slot="tilt-card-glare"
          className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] mix-blend-soft-light"
          style={{ background: glareBackground }}
        />
      )}
      {glare && !reduceMotion && (
        <motion.span
          aria-hidden="true"
          data-slot="tilt-card-sheen"
          className="pointer-events-none absolute inset-0 z-10 rounded-[inherit]"
          style={{ background: glareBackground, opacity: 0.6 }}
        />
      )}
    </motion.div>
  )
}

type TiltCardLayerProps = React.ComponentProps<"div"> & {
  /** How far the layer floats above the card, in pixels. Larger values move more with the tilt. */
  depth?: number
}

function TiltCardLayer({ depth = 24, className, style, ...props }: TiltCardLayerProps) {
  return (
    <div
      data-slot="tilt-card-layer"
      className={cn("transform-3d", className)}
      style={{ transform: `translateZ(${depth}px)`, ...style }}
      {...props}
    />
  )
}

export { TiltCard, TiltCardLayer, type TiltCardProps, type TiltCardLayerProps }
