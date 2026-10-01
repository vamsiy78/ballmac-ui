// Ballmac UI: Sparkles Text. https://ui.ballmac.com/components/sparkles-text
"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

const TONES = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]

type Spark = { id: number; x: number; y: number; size: number; tone: string; duration: number; delay: number }

function makeSpark(id: number): Spark {
  return {
    id,
    x: Math.random() * 110 - 5,
    y: Math.random() * 120 - 10,
    size: 12 + Math.random() * 14,
    tone: TONES[Math.floor(Math.random() * TONES.length)]!,
    duration: 1.4 + Math.random() * 1.2,
    delay: Math.random() * 1.2,
  }
}

function Star({ spark, onDone }: { spark: Spark; onDone: (id: number) => void }) {
  return (
    <motion.svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="pointer-events-none absolute"
      style={{ left: `${spark.x}%`, top: `${spark.y}%`, width: spark.size, height: spark.size, marginLeft: -spark.size / 2, marginTop: -spark.size / 2, color: spark.tone }}
      initial={{ scale: 0, rotate: 0, opacity: 0 }}
      animate={{ scale: [0, 1, 0], rotate: [0, 90, 180], opacity: [0, 1, 0] }}
      transition={{ duration: spark.duration, delay: spark.delay, ease: "easeInOut" }}
      onAnimationComplete={() => onDone(spark.id)}
    >
      <path d="M12 0c.6 6.4 5 11.4 12 12-7 .6-11.4 5.6-12 12-.6-6.4-5-11.4-12-12 7-.6 11.4-5.6 12-12Z" fill="currentColor" />
    </motion.svg>
  )
}

type SparklesTextProps = Omit<React.ComponentProps<"span">, "children"> & {
  /** The text to decorate. */
  children: React.ReactNode
  /** How many sparkles twinkle at once. */
  count?: number
  /** Show a soft gradient fill on the text itself. */
  gradient?: boolean
}

function SparklesText({ children, count = 8, gradient = false, className, ...props }: SparklesTextProps) {
  const reduce = useReducedMotion()
  const [sparks, setSparks] = React.useState<Spark[]>([])
  const next = React.useRef(0)

  // Random positions can only be picked after mount, or the server and browser would disagree.
  React.useEffect(() => {
    if (reduce) return setSparks([])
    setSparks(Array.from({ length: count }, () => makeSpark(next.current++)))
  }, [count, reduce])

  const replace = React.useCallback((id: number) => {
    setSparks((all) => all.map((s) => (s.id === id ? makeSpark(next.current++) : s)))
  }, [])

  return (
    <span data-slot="sparkles-text" className={cn("relative inline-block", className)} {...props}>
      <span
        className={cn(gradient && "bg-[linear-gradient(90deg,var(--foreground),color-mix(in_oklab,var(--chart-4)_60%,var(--foreground)),var(--foreground))] bg-clip-text text-transparent")}
      >
        {children}
      </span>
      {sparks.map((s) => (
        <Star key={s.id} spark={s} onDone={replace} />
      ))}
    </span>
  )
}

export { SparklesText, type SparklesTextProps }
