// Ballmac UI: Word Rotate. https://ui.ballmac.com/components/word-rotate
"use client"

import * as React from "react"
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"
import { duration, ease } from "@/lib/ballmac/motion"

type WordRotateProps = Omit<React.ComponentProps<"span">, "children"> & {
  /** Words to cycle through, in order. */
  words: string[]
  /** Milliseconds each word stays before the next slides in. */
  interval?: number
  /** Stop on the current word. */
  paused?: boolean
  /** Class names for each word (color, gradient, weight). */
  wordClassName?: string
  /**
   * What screen readers hear instead of the changing word. Defaults to the words joined with
   * commas, so the sentence reads once, completely, without live announcements.
   */
  srText?: string
}

const WIDTH_SPRING = { type: "spring", stiffness: 260, damping: 30 } as const

function WordRotate({
  words,
  interval = 2400,
  paused = false,
  wordClassName,
  srText,
  className,
  ...props
}: WordRotateProps) {
  const rootRef = React.useRef<HTMLSpanElement>(null)
  const measureRef = React.useRef<HTMLSpanElement>(null)
  const reduceMotion = useReducedMotion()
  const inView = useInView(rootRef)
  const [index, setIndex] = React.useState(0)
  const [widths, setWidths] = React.useState<number[]>([])
  const count = words.length
  const current = index % Math.max(count, 1)

  // Measure every word once (and again when fonts load or the size changes).
  React.useEffect(() => {
    const box = measureRef.current
    if (!box) return
    const measure = () => {
      const next = Array.from(box.children, (child) => (child as HTMLElement).getBoundingClientRect().width)
      setWidths((prev) => (prev.length === next.length && prev.every((w, i) => w === next[i]) ? prev : next))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(box)
    return () => observer.disconnect()
  }, [words])

  React.useEffect(() => {
    if (paused || !inView || count < 2) return
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % count), interval)
    return () => window.clearInterval(timer)
  }, [paused, inView, count, interval])

  const width = widths[current]
  const word = words[current] ?? ""
  const hidden = reduceMotion ? { opacity: 0 } : { opacity: 0, y: "0.6em", filter: "blur(6px)" }
  const leaving = reduceMotion ? { opacity: 0 } : { opacity: 0, y: "-0.6em", filter: "blur(6px)" }

  return (
    <span ref={rootRef} data-slot="word-rotate" className={cn("relative inline-block", className)} {...props}>
      <span className="sr-only">{srText ?? words.join(", ")}</span>
      <motion.span
        aria-hidden="true"
        data-slot="word-rotate-viewport"
        className="relative inline-block whitespace-nowrap [clip-path:inset(-0.3em_-0.12em)]"
        initial={false}
        animate={width ? { width } : undefined}
        transition={reduceMotion ? { duration: 0 } : WIDTH_SPRING}
      >
        {/* In-flow copy: gives the line its height and baseline. */}
        <span className={cn("invisible", wordClassName)}>{word}</span>
        <AnimatePresence initial={false}>
          <motion.span
            key={`${current}-${word}`}
            data-slot="word-rotate-word"
            className={cn("absolute top-0 start-0", wordClassName)}
            initial={hidden}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={leaving}
            transition={{ duration: duration.reveal, ease: ease.out }}
          >
            {word}
          </motion.span>
        </AnimatePresence>
      </motion.span>
      {/* Off-screen measurer with the same styles as the words. */}
      <span
        ref={measureRef}
        aria-hidden="true"
        className="pointer-events-none invisible absolute top-0 start-0 flex h-0 w-0 overflow-hidden whitespace-nowrap"
      >
        {words.map((w, i) => (
          <span key={i} className={cn("shrink-0", wordClassName)}>
            {w}
          </span>
        ))}
      </span>
    </span>
  )
}

export { WordRotate, type WordRotateProps }
