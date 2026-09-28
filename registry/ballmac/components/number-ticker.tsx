// Ballmac UI: Number Ticker. https://ui.ballmac.com/components/number-ticker
"use client"

import * as React from "react"
import { animate, useInView, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

type NumberTickerProps = Omit<React.ComponentProps<"span">, "children"> & {
  /** The number to count to. */
  value: number
  /** Where the count starts. Defaults to 0. */
  from?: number
  /** Seconds. Defaults to 1.4. */
  duration?: number
  /** Seconds to wait after the number scrolls into view. */
  delay?: number
  /** Intl.NumberFormat options, for example { style: "currency", currency: "USD" }. */
  format?: Intl.NumberFormatOptions
  /** BCP 47 locale. Fixed (not the browser's) so server and client render the same text. */
  locale?: string
}

function NumberTicker({
  value,
  from = 0,
  duration = 1.4,
  delay = 0,
  format,
  locale = "en-US",
  className,
  ...props
}: NumberTickerProps) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" })
  const reduceMotion = useReducedMotion()
  const formatter = React.useMemo(() => new Intl.NumberFormat(locale, format), [locale, format])

  React.useEffect(() => {
    const node = ref.current
    if (!node) return
    if (reduceMotion) {
      node.textContent = formatter.format(value)
      return
    }
    node.textContent = formatter.format(from)
    if (!inView) return
    const controls = animate(from, value, {
      duration,
      delay,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => {
        const decimals = format?.maximumFractionDigits ?? (Number.isInteger(value) ? 0 : 2)
        node.textContent = formatter.format(Number(latest.toFixed(decimals)))
      },
    })
    return () => controls.stop()
  }, [inView, reduceMotion, value, from, duration, delay, formatter, format?.maximumFractionDigits])

  return (
    <span
      ref={ref}
      data-slot="number-ticker"
      className={cn("inline-block tabular-nums tracking-tight", className)}
      {...props}
    >
      {formatter.format(reduceMotion ? value : from)}
    </span>
  )
}

export { NumberTicker, type NumberTickerProps }
