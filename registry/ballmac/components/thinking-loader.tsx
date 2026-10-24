// Ballmac UI: Thinking Loader. https://ui.ballmac.com/components/thinking-loader
"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"
import { useLoopsPaused } from "@/lib/ballmac/motion"

type ThinkingLoaderProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** What the assistant is doing, in order. The label rolls through them. Defaults to four general phases. */
  phases?: string[]
  /** How long each phase shows, in milliseconds. */
  interval?: number
  /** Turns the pill into a finished state: a check and `doneLabel`. */
  done?: boolean
  /** The text of the finished state, for example "Answered with 3 sources". */
  doneLabel?: string
}

const RAYS = Array.from({ length: 8 }, (_, i) => i)

/**
 * A small working pill for an AI reply: an eight-ray spinner and a shimmering label that rolls through what the assistant is doing, then settles on a check.
 * Screen readers hear "Working" once and the finished text when it ends, not every phase. With reduced motion (or the theme's loops off) nothing spins or shimmers.
 */
function ThinkingLoader({ phases, interval = 1800, done = false, doneLabel, className, ...props }: ThinkingLoaderProps) {
  const msg = useMessages()
  const paused = useLoopsPaused()
  const list = phases && phases.length ? phases : [msg("thinking-loader.p1", "Thinking"), msg("thinking-loader.p2", "Searching the web"), msg("thinking-loader.p3", "Reading sources"), msg("thinking-loader.p4", "Writing the answer")]
  const [i, setI] = React.useState(0)
  React.useEffect(() => {
    if (done || list.length < 2) return
    const t = setInterval(() => setI((n) => (n + 1) % list.length), interval)
    return () => clearInterval(t)
  }, [done, list.length, interval])
  const text = done ? (doneLabel ?? msg("thinking-loader.done", "Done")) : list[i % list.length]

  return (
    <div data-slot="thinking-loader" data-done={done || undefined} className={cn("bg-card text-card-foreground inline-flex items-center gap-2 rounded-full border py-1.5 ps-2.5 pe-3.5 text-[13px] shadow-xs", className)} {...props}>
      <span aria-hidden="true" className="flex size-4 items-center justify-center">
        {done ? (
          <Check className="size-3.5" />
        ) : (
          <svg viewBox="0 0 16 16" className={cn("size-4", !paused && "animate-[spin_0.9s_steps(8)_infinite]")}>
            {RAYS.map((r) => (
              <rect key={r} x="7.25" y="1" width="1.5" height="4" rx="0.75" fill="currentColor" opacity={0.2 + (r / 8) * 0.8} transform={`rotate(${r * 45} 8 8)`} />
            ))}
          </svg>
        )}
      </span>
      <span role="status" className="sr-only">
        {done ? text : msg("thinking-loader.working", "Working")}
      </span>
      <motion.span
        aria-hidden="true"
        key={text}
        initial={paused ? false : { opacity: 0.25, y: 3 }}
        animate={paused ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="relative inline-block"
      >
        <span className={cn(done ? "text-foreground" : "text-muted-foreground")}>{text}</span>
        {!done && !paused && (
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 bg-clip-text text-transparent [background-image:linear-gradient(100deg,transparent_35%,var(--foreground)_50%,transparent_65%)] [background-size:250%_100%]"
            initial={{ backgroundPositionX: "150%" }}
            animate={{ backgroundPositionX: "-50%" }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
          >
            {text}
          </motion.span>
        )}
      </motion.span>
    </div>
  )
}

export { ThinkingLoader, type ThinkingLoaderProps }
