// Ballmac UI: Streaming Text. https://ui.ballmac.com/components/streaming-text
"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

type StreamingCaretProps = React.ComponentProps<"span">

/** The blinking block caret shown at the end of text that is still arriving. Static under reduced motion. */
function StreamingCaret({ className, ...props }: StreamingCaretProps) {
  const reduceMotion = useReducedMotion()
  const classes = cn(
    "ml-0.5 inline-block h-[1.1em] w-[0.5ch] min-w-1.5 translate-y-[0.15em] rounded-[1px] bg-foreground/80",
    className
  )
  if (reduceMotion) {
    return <span data-slot="streaming-caret" aria-hidden="true" className={classes} {...props} />
  }
  return (
    <motion.span
      data-slot="streaming-caret"
      aria-hidden="true"
      className={classes}
      animate={{ opacity: [1, 1, 0, 0] }}
      transition={{ duration: 1.06, times: [0, 0.5, 0.5, 1], repeat: Infinity, ease: "linear" }}
      {...(props as React.ComponentProps<typeof motion.span>)}
    />
  )
}

type StreamingTextProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** The text received so far. Append to it as chunks arrive; whitespace and newlines are preserved. */
  text: string
  /** True while more text is expected. Shows the caret and sets aria-busy. */
  streaming?: boolean
  /** Reveal text that is already complete at `speed` characters per second (for demos and replays). Skipped under reduced motion. */
  animate?: boolean
  /** Characters per second when `animate` is on. */
  speed?: number
  /** Show the caret while streaming or revealing. */
  caret?: boolean
  /** Called once `animate` has revealed the whole text. */
  onAnimationComplete?: () => void
}

function StreamingText({
  text,
  streaming = false,
  animate = false,
  speed = 80,
  caret = true,
  onAnimationComplete,
  className,
  ...props
}: StreamingTextProps) {
  const reduceMotion = useReducedMotion()
  const revealing = animate && !reduceMotion
  const [count, setCount] = React.useState(0)
  const countRef = React.useRef(0)
  const completeRef = React.useRef(onAnimationComplete)
  React.useEffect(() => {
    completeRef.current = onAnimationComplete
  })

  React.useEffect(() => {
    if (!revealing) return
    // Text was replaced by something shorter: start over.
    if (countRef.current > text.length) countRef.current = 0
    const from = countRef.current
    if (from >= text.length) return
    const startedAt = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const next = Math.min(text.length, from + Math.floor(((now - startedAt) / 1000) * speed))
      if (next !== countRef.current) {
        countRef.current = next
        setCount(next)
      }
      if (next < text.length) frame = requestAnimationFrame(tick)
      else completeRef.current?.()
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [revealing, text, speed])

  const shown = revealing ? text.slice(0, count) : text
  const busy = streaming || (revealing && count < text.length)

  return (
    <div
      data-slot="streaming-text"
      data-streaming={busy || undefined}
      aria-live="polite"
      aria-busy={busy}
      className={cn("whitespace-pre-wrap break-words", className)}
      {...props}
    >
      {shown}
      {busy && caret ? <StreamingCaret /> : null}
    </div>
  )
}

export { StreamingText, StreamingCaret, type StreamingTextProps, type StreamingCaretProps }
