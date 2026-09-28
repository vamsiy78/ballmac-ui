// Ballmac UI: Magnetic Button. https://ui.ballmac.com/components/magnetic-button
"use client"

import * as React from "react"
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react"

import { Button, type ButtonProps } from "@/components/ballmac/button"
import { cn } from "@/lib/utils"
import { spring } from "@/lib/ballmac/motion"

type MagneticButtonProps = Omit<ButtonProps, "asChild"> & {
  /** How far the button follows the pointer, as a fraction of the pointer's offset from its center. */
  strength?: number
  /** Distance in pixels outside the button's edge where the pull starts. */
  radius?: number
  /** Classes for the wrapper that holds the button's place in the layout. */
  wrapperClassName?: string
}

/** The label travels this much further than the button, which reads as depth. */
const LABEL_DEPTH = 0.35

function MagneticButton({
  strength = 0.2,
  radius = 72,
  wrapperClassName,
  disabled,
  loading,
  children,
  ...props
}: MagneticButtonProps) {
  const anchorRef = React.useRef<HTMLSpanElement>(null)
  const reduceMotion = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, spring.snappy)
  const springY = useSpring(y, spring.snappy)
  const labelX = useTransform(springX, (v) => v * LABEL_DEPTH)
  const labelY = useTransform(springY, (v) => v * LABEL_DEPTH)
  const inactive = !!reduceMotion || !!disabled || !!loading

  React.useEffect(() => {
    if (inactive) {
      x.set(0)
      y.set(0)
      return
    }
    const anchor = anchorRef.current
    if (!anchor) return
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return
      // The anchor is never transformed, so its box is the button's resting position.
      const rect = anchor.getBoundingClientRect()
      const dx = event.clientX - (rect.left + rect.width / 2)
      const dy = event.clientY - (rect.top + rect.height / 2)
      // Distance from the button's edge (0 when the pointer is over it).
      const outsideX = Math.max(0, Math.abs(dx) - rect.width / 2)
      const outsideY = Math.max(0, Math.abs(dy) - rect.height / 2)
      const distance = Math.hypot(outsideX, outsideY)
      if (distance > radius) {
        x.set(0)
        y.set(0)
        return
      }
      const falloff = radius > 0 ? 1 - distance / radius : 1
      x.set(dx * strength * falloff)
      y.set(dy * strength * falloff)
    }
    const reset = () => {
      x.set(0)
      y.set(0)
    }
    // Pointer left the window: relatedTarget is null.
    const onOut = (event: PointerEvent) => {
      if (!event.relatedTarget) reset()
    }
    window.addEventListener("pointermove", onMove, { passive: true })
    document.addEventListener("pointerout", onOut)
    window.addEventListener("blur", reset)
    return () => {
      window.removeEventListener("pointermove", onMove)
      document.removeEventListener("pointerout", onOut)
      window.removeEventListener("blur", reset)
    }
  }, [inactive, radius, strength, x, y])

  return (
    <span ref={anchorRef} data-slot="magnetic-button" className={cn("inline-flex", wrapperClassName)}>
      <motion.span className="inline-flex" style={{ x: springX, y: springY }}>
        <Button disabled={disabled} loading={loading} {...props}>
          <motion.span data-slot="magnetic-button-label" className="inline-flex items-center gap-[inherit]" style={{ x: labelX, y: labelY }}>
            {children}
          </motion.span>
        </Button>
      </motion.span>
    </span>
  )
}

export { MagneticButton, type MagneticButtonProps }
