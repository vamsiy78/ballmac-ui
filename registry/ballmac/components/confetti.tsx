// Ballmac UI: Confetti. https://ui.ballmac.com/components/confetti
"use client"

import * as React from "react"
import confetti from "canvas-confetti"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ballmac/button"
import { cssColorToRgba } from "@/lib/ballmac/color"

type ConfettiPreset = "burst" | "sides" | "stars" | "fireworks"

type FireConfettiOptions = Omit<confetti.Options, "colors" | "origin"> & {
  /** Shape of the effect. */
  preset?: ConfettiPreset
  /** Theme variables ("--chart-1") or CSS colors. Defaults to the five chart tokens. */
  colors?: string[]
  /** Where the burst starts, 0–1 of the viewport. Ignored when `element` is set. */
  origin?: { x?: number; y?: number }
  /** Start the burst from the center of this element. */
  element?: Element | null
}

const DEFAULT_COLORS = ["--chart-1", "--chart-2", "--chart-3", "--chart-4", "--chart-5"]
const REDUCED_QUERY = "(prefers-reduced-motion: reduce)"

function prefersReducedMotion() {
  return typeof window !== "undefined" && !!window.matchMedia?.(REDUCED_QUERY).matches
}

/** canvas-confetti only parses hex strings, so theme colors are resolved and converted first. */
function toHex(color: string) {
  const [r, g, b] = cssColorToRgba(document.documentElement, color)
  return "#" + [r, g, b].map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("")
}

function originOf(element: Element) {
  const rect = element.getBoundingClientRect()
  return {
    x: (rect.left + rect.width / 2) / window.innerWidth,
    y: (rect.top + rect.height / 2) / window.innerHeight,
  }
}

/**
 * Fires confetti in theme colors. Resolves when the particles have settled.
 * Does nothing (and resolves at once) on the server or when the user prefers reduced motion.
 */
function fireConfetti({ preset = "burst", colors, origin, element, ...options }: FireConfettiOptions = {}): Promise<void> {
  if (typeof window === "undefined" || prefersReducedMotion()) return Promise.resolve()
  const palette = (colors ?? DEFAULT_COLORS).map(toHex)
  const from = { x: 0.5, y: 0.6, ...(element ? originOf(element) : origin) }
  const base: confetti.Options = { colors: palette, disableForReducedMotion: true, zIndex: 100, ...options }
  const shots: confetti.Options[] = []

  if (preset === "sides") {
    shots.push(
      { ...base, particleCount: 60, angle: 60, spread: 55, startVelocity: 55, origin: { x: 0, y: 0.75 } },
      { ...base, particleCount: 60, angle: 120, spread: 55, startVelocity: 55, origin: { x: 1, y: 0.75 } }
    )
  } else if (preset === "stars") {
    const star = { ...base, shapes: ["star"] as confetti.Shape[], spread: 360, ticks: 70, gravity: 0, decay: 0.94, startVelocity: 22, origin: from }
    shots.push({ ...star, particleCount: 36, scalar: 1.1 }, { ...star, particleCount: 14, scalar: 0.7, shapes: ["circle"] })
  } else if (preset === "fireworks") {
    for (let i = 0; i < 4; i++) {
      shots.push({
        ...base,
        particleCount: 50,
        spread: 360,
        startVelocity: 28,
        ticks: 70,
        origin: { x: 0.2 + Math.random() * 0.6, y: 0.2 + Math.random() * 0.3 },
      })
    }
  } else {
    shots.push(
      { ...base, particleCount: 70, spread: 70, startVelocity: 38, scalar: 0.9, origin: from },
      { ...base, particleCount: 30, spread: 110, startVelocity: 24, scalar: 0.7, decay: 0.92, origin: from }
    )
  }

  // Fireworks go off one after another; other presets fire together.
  const stagger = preset === "fireworks" ? 260 : 0
  return Promise.all(
    shots.map(
      (shot, i) =>
        new Promise<void>((resolve) => {
          const run = () => Promise.resolve(confetti(shot)).then(() => resolve(), () => resolve())
          if (stagger && i) window.setTimeout(run, i * stagger)
          else run()
        })
    )
  ).then(() => undefined)
}

/** Stable helpers for firing confetti from event handlers. */
function useConfetti() {
  return React.useMemo(
    () => ({
      /** Fires confetti; see fireConfetti for options. */
      fire: fireConfetti,
      /** Fires confetti from the center of an element, such as the button that was clicked. */
      fireFrom: (element: Element | null, options?: Omit<FireConfettiOptions, "element">) =>
        fireConfetti({ ...options, element }),
    }),
    []
  )
}

type ConfettiButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    /** Confetti options; the burst starts from the button unless `origin` is set. */
    options?: Omit<FireConfettiOptions, "element">
  }

function ConfettiButton({ options, variant, size, shape, className, onClick, type = "button", ...props }: ConfettiButtonProps) {
  return (
    <button
      data-slot="confetti-button"
      type={type}
      className={cn(buttonVariants({ variant, size, shape }), className)}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) {
          void fireConfetti({ ...options, element: options?.origin ? undefined : event.currentTarget })
        }
      }}
      {...props}
    />
  )
}

export { ConfettiButton, fireConfetti, useConfetti, type ConfettiButtonProps, type ConfettiPreset, type FireConfettiOptions }
