// Ballmac UI: Scramble Text. https://ui.ballmac.com/components/scramble-text
"use client"

import * as React from "react"
import { useInView } from "motion/react"

import { cn } from "@/lib/utils"

type ScrambleTextElement = "span" | "p" | "div" | "h1" | "h2" | "h3" | "h4" | "code"

type ScrambleTextProps = Omit<React.ComponentProps<"span">, "children"> & {
  /** The final text. */
  children: string
  /** The element to render. */
  as?: ScrambleTextElement
  /** When to play: on mount, when scrolled into view (once), or on every hover and keyboard focus. */
  trigger?: "mount" | "inView" | "hover"
  /** Milliseconds from the first scrambled frame until the last character settles. */
  duration?: number
  /** Milliseconds to wait before starting. */
  delay?: number
  /** Milliseconds between frames; lower values cycle glyphs faster. */
  speed?: number
  /** Glyphs to cycle through before each character resolves. */
  characters?: string
  /** Use a monospace font so the width never changes while scrambling. */
  mono?: boolean
  /** Called after the text has fully resolved. */
  onComplete?: () => void
}

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)"

function subscribeReducedMotion(onChange: () => void) {
  const media = window.matchMedia(REDUCED_QUERY)
  media.addEventListener("change", onChange)
  return () => media.removeEventListener("change", onChange)
}

/** Reduced-motion preference that is false on the server and during hydration, so markup always matches. */
function useReducedMotionSafe() {
  return React.useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_QUERY).matches,
    () => false
  )
}

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!<>-_/[]{}=+*^?"

function ScrambleText({
  children: text,
  as = "span",
  trigger = "mount",
  duration = 900,
  delay = 0,
  speed = 40,
  characters = GLYPHS,
  mono = false,
  onComplete,
  className,
  onPointerEnter,
  onFocus,
  ...props
}: ScrambleTextProps) {
  const Comp = as as React.ElementType
  const rootRef = React.useRef<HTMLElement>(null)
  const outputRef = React.useRef<HTMLSpanElement>(null)
  const timers = React.useRef<{ interval?: number; timeout?: number }>({})
  const reduceMotion = useReducedMotionSafe()
  const inView = useInView(rootRef, { once: true, margin: "0px 0px -10% 0px" })
  const completeRef = React.useRef(onComplete)
  completeRef.current = onComplete

  const stop = React.useCallback(() => {
    window.clearInterval(timers.current.interval)
    window.clearTimeout(timers.current.timeout)
  }, [])

  const play = React.useCallback(() => {
    const output = outputRef.current
    if (!output || reduceMotion) return
    stop()
    const chars = Array.from(text)
    const frames = Math.max(1, Math.round(duration / speed))
    // Left to right with a little jitter, so it reads as decoding rather than a wipe.
    const settleAt = chars.map((_, i) => 1 + Math.round((i / Math.max(chars.length, 1)) * frames * 0.7 + Math.random() * frames * 0.3))
    const glyph = () => characters[Math.floor(Math.random() * characters.length)] ?? ""
    let frame = 0
    const render = () => {
      output.textContent = chars.map((c, i) => (c.trim() === "" || frame >= settleAt[i]! ? c : glyph())).join("")
    }
    const start = () => {
      render()
      timers.current.interval = window.setInterval(() => {
        frame++
        if (frame >= frames) {
          stop()
          output.textContent = text
          completeRef.current?.()
        } else render()
      }, speed)
    }
    if (delay > 0) {
      render()
      timers.current.timeout = window.setTimeout(start, delay)
    } else start()
  }, [text, duration, delay, speed, characters, reduceMotion, stop])

  // Layout effect: the first scrambled frame replaces the final text before the browser paints.
  React.useLayoutEffect(() => {
    if (reduceMotion) {
      if (outputRef.current) outputRef.current.textContent = text
      return
    }
    if (trigger === "mount" || (trigger === "inView" && inView)) play()
    return stop
  }, [trigger, inView, play, stop, reduceMotion, text])

  return (
    <Comp
      ref={rootRef}
      data-slot="scramble-text"
      className={cn("relative inline-block", mono && "font-mono", className)}
      onPointerEnter={(event: React.PointerEvent<HTMLSpanElement>) => {
        if (trigger === "hover") play()
        onPointerEnter?.(event)
      }}
      onFocus={(event: React.FocusEvent<HTMLSpanElement>) => {
        if (trigger === "hover") play()
        onFocus?.(event)
      }}
      {...props}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="relative block">
        {/* Invisible final text holds the layout; the scrambled copy is drawn over it. */}
        <span className="invisible">{text}</span>
        <span ref={outputRef} data-slot="scramble-text-output" className="absolute inset-0">
          {text}
        </span>
      </span>
    </Comp>
  )
}

export { ScrambleText, type ScrambleTextProps }
