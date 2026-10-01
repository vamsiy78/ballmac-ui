// Ballmac UI: Animated Number Flow. https://ui.ballmac.com/components/animated-number-flow
"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

type AnimatedNumberFlowProps = Omit<React.ComponentProps<"span">, "children"> & {
  /** The number to show. Change it and the digits roll to the new value. */
  value: number
  /** BCP 47 locale for grouping and decimals. Fixed by default so the server and browser agree. */
  locale?: string
  /** Intl.NumberFormat options: currency, percent, compact, fraction digits and so on. */
  format?: Intl.NumberFormatOptions
  /** Text before the number, such as a unit label. */
  prefix?: string
  /** Text after the number. */
  suffix?: string
  /** Read each change aloud politely. Off by default because values that change often are noisy. */
  announce?: boolean
  /** Fade the top and bottom edge of each rolling digit. */
  fade?: boolean
}

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

function Digit({ digit, reduce, fade }: { digit: number; reduce: boolean | null; fade: boolean }) {
  return (
    <motion.span
      layout="position"
      initial={reduce ? false : { opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={reduce ? undefined : { opacity: 0, scale: 0.6 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn("relative inline-grid overflow-hidden leading-none", fade && "[mask-image:linear-gradient(to_bottom,transparent,black_22%,black_78%,transparent)]")}
      style={{ height: "1em", lineHeight: 1 }}
    >
      {/* An invisible zero gives the column its width. */}
      <span className="invisible col-start-1 row-start-1 leading-none">0</span>
      <motion.span
        className="col-start-1 row-start-1 flex flex-col"
        style={{ height: "10em", lineHeight: 1 }}
        initial={false}
        animate={{ y: `${-digit * 10}%` }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 140, damping: 20, mass: 0.9 }}
      >
        {DIGITS.map((n) => (
          <span key={n} className="flex items-center justify-center" style={{ height: "1em", lineHeight: 1 }}>
            {n}
          </span>
        ))}
      </motion.span>
    </motion.span>
  )
}

function AnimatedNumberFlow({
  value,
  locale = "en-US",
  format,
  prefix,
  suffix,
  announce = false,
  fade = true,
  className,
  ...props
}: AnimatedNumberFlowProps) {
  const reduce = useReducedMotion()
  const formatter = React.useMemo(() => new Intl.NumberFormat(locale, format), [locale, format])
  const parts = formatter.formatToParts(Number.isFinite(value) ? value : 0)
  const text = `${prefix ?? ""}${formatter.format(Number.isFinite(value) ? value : 0)}${suffix ?? ""}`

  // Digits are keyed by place value counted from the decimal point, so a ones column stays a ones column
  // when a thousands column appears or disappears.
  const intDigits = parts.filter((p) => p.type === "integer").reduce((n, p) => n + p.value.length, 0)
  let intSeen = 0
  let fracSeen = 0
  const nodes: React.ReactNode[] = []

  parts.forEach((part, index) => {
    if (part.type === "integer") {
      for (const ch of part.value) nodes.push(<Digit key={`i${intDigits - 1 - intSeen++}`} digit={Number(ch)} reduce={reduce} fade={fade} />)
    } else if (part.type === "fraction") {
      for (const ch of part.value) nodes.push(<Digit key={`f${fracSeen++}`} digit={Number(ch)} reduce={reduce} fade={fade} />)
    } else {
      nodes.push(
        <motion.span key={`${part.type}${index}`} layout="position" className="inline-block whitespace-pre">
          {part.value}
        </motion.span>
      )
    }
  })

  return (
    <span
      data-slot="animated-number-flow"
      className={cn("inline-flex items-center align-baseline tabular-nums", className)}
      {...props}
    >
      <span className="sr-only" aria-live={announce ? "polite" : undefined}>
        {text}
      </span>
      <span aria-hidden="true" className="inline-flex items-center">
        {prefix && <span className="mr-[0.25em] whitespace-pre">{prefix}</span>}
        <AnimatePresence initial={false} mode="popLayout">
          {nodes}
        </AnimatePresence>
        {suffix && <span className="ml-[0.25em] whitespace-pre">{suffix}</span>}
      </span>
    </span>
  )
}

export { AnimatedNumberFlow, type AnimatedNumberFlowProps }
