// Ballmac UI: Text Reveal. https://ui.ballmac.com/components/text-reveal
"use client"

import * as React from "react"
import { motion, useInView, type Variants } from "motion/react"

import { cn } from "@/lib/utils"
import { stagger, variants } from "@/lib/ballmac/motion"

type TextRevealElement = "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div"

type TextRevealProps = Omit<React.ComponentProps<"span">, "children"> & {
  /** The text to reveal. Plain text only, so it can be split and read out once. */
  children: string
  /** Split into words (default) or single characters. */
  by?: "word" | "char"
  /** The element to render. Defaults to "p". */
  as?: TextRevealElement
  /** "inView" (default) waits until the text scrolls into view; "mount" starts right away. */
  trigger?: "inView" | "mount"
  /** Play only the first time the text enters the viewport. Defaults to true. */
  once?: boolean
  /** Seconds before the first piece appears. */
  delay?: number
  /** Seconds between pieces. Defaults to 0.06 for words and 0.018 for characters. */
  step?: number
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

function TextReveal({
  children,
  by = "word",
  as = "p",
  trigger = "inView",
  once = true,
  delay = 0,
  step,
  className,
  ...props
}: TextRevealProps) {
  const Comp = as as React.ElementType
  const ref = React.useRef<HTMLElement>(null)
  const inView = useInView(ref, { once, amount: 0.4 })
  const reduceMotion = useReducedMotionSafe()
  const text = children

  const container = React.useMemo<Variants>(
    () => ({
      hidden: {},
      visible: { transition: stagger(step ?? (by === "char" ? 0.018 : 0.06), delay) },
    }),
    [by, step, delay]
  )

  if (reduceMotion) {
    return (
      <Comp ref={ref} data-slot="text-reveal" className={className} {...props}>
        {text}
      </Comp>
    )
  }

  const show = trigger === "mount" || inView
  // Split on whitespace but keep it, so the browser still wraps lines normally.
  const tokens = text.split(/(\s+)/).filter(Boolean)

  return (
    <Comp ref={ref} data-slot="text-reveal" className={className} {...props}>
      <span className="sr-only">{text}</span>
      <motion.span
        aria-hidden="true"
        data-slot="text-reveal-content"
        initial="hidden"
        animate={show ? "visible" : "hidden"}
        variants={container}
      >
        {tokens.map((token, i) => {
          if (/^\s+$/.test(token)) return " "
          if (by === "word") {
            return (
              <motion.span key={i} className="inline-block" variants={variants.fadeUp}>
                {token}
              </motion.span>
            )
          }
          return (
            // Keep each word's characters together so lines never break mid-word.
            <span key={i} className="inline-block whitespace-nowrap">
              {Array.from(token).map((char, j) => (
                <motion.span key={j} className="inline-block" variants={variants.fadeUp}>
                  {char}
                </motion.span>
              ))}
            </span>
          )
        })}
      </motion.span>
    </Comp>
  )
}

export { TextReveal, type TextRevealProps }
