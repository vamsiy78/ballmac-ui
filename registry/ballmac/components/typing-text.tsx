// Ballmac UI: Typing Text. https://ui.ballmac.com/components/typing-text
"use client"

import * as React from "react"
import { motion, useInView } from "motion/react"

import { cn } from "@/lib/utils"
import { useReducedMotionSafe } from "@/lib/ballmac/motion"

type TypingTextProps = Omit<React.ComponentProps<"span">, "children"> & {
  /** One string to type, or several to type and erase in turn. */
  text: string | string[]
  /** Milliseconds per typed character. */
  typingSpeed?: number
  /** Milliseconds per erased character. */
  deleteSpeed?: number
  /** Milliseconds to hold a finished string before erasing it. */
  pause?: number
  /** Start again after the last string. A single string only loops when this is set. */
  loop?: boolean
  /** Show a blinking caret. */
  cursor?: boolean
  /** Wait for the text to scroll into view before typing. */
  startOnView?: boolean
  /** Called after the final string is fully typed (when not looping). */
  onComplete?: () => void
}

function TypingText({
  text,
  typingSpeed = 55,
  deleteSpeed = 28,
  pause = 1600,
  loop,
  cursor = true,
  startOnView = false,
  onComplete,
  className,
  ...props
}: TypingTextProps) {
  const list = React.useMemo(() => (Array.isArray(text) ? text : [text]), [text])
  const looping = loop ?? list.length > 1
  const reduce = useReducedMotionSafe()
  const ref = React.useRef<HTMLSpanElement>(null)
  const seen = useInView(ref, { once: true })
  const active = !startOnView || seen
  const [shown, setShown] = React.useState("")
  const [done, setDone] = React.useState(false)
  const completeRef = React.useRef(onComplete)
  React.useEffect(() => {
    completeRef.current = onComplete
  })

  React.useEffect(() => {
    if (!active || reduce) return
    let cancelled = false
    let timer: ReturnType<typeof setTimeout>
    let item = 0
    let length = 0
    let erasing = false
    setDone(false)

    const tick = () => {
      if (cancelled) return
      const current = Array.from(list[item] ?? "")
      if (!erasing) {
        length++
        setShown(current.slice(0, length).join(""))
        if (length >= current.length) {
          const last = item === list.length - 1
          if (last && !looping) {
            setDone(true)
            completeRef.current?.()
            return
          }
          erasing = true
          timer = setTimeout(tick, pause)
          return
        }
        timer = setTimeout(tick, typingSpeed * (0.7 + ((length * 7) % 5) / 8))
      } else {
        length--
        setShown(current.slice(0, Math.max(length, 0)).join(""))
        if (length <= 0) {
          erasing = false
          item = (item + 1) % list.length
          timer = setTimeout(tick, typingSpeed * 4)
          return
        }
        timer = setTimeout(tick, deleteSpeed)
      }
    }
    timer = setTimeout(tick, typingSpeed * 3)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [active, reduce, list, looping, typingSpeed, deleteSpeed, pause])

  const visible = reduce ? (list[looping ? 0 : list.length - 1] ?? "") : shown
  const blinking = !reduce && !done

  return (
    <span ref={ref} data-slot="typing-text" className={cn("inline", className)} {...props}>
      <span className="sr-only">{list.join(". ")}</span>
      <span aria-hidden="true">
        {visible}
        {cursor && !reduce && (
          <motion.span
            className="ml-px inline-block h-[1.05em] w-[0.1em] translate-y-[0.14em] bg-current"
            animate={blinking ? { opacity: [1, 1, 0, 0] } : { opacity: 1 }}
            transition={blinking ? { duration: 1, repeat: Infinity, times: [0, 0.5, 0.5, 1] } : { duration: 0 }}
          />
        )}
      </span>
    </span>
  )
}

export { TypingText, type TypingTextProps }
