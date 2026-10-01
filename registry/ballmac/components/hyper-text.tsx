// Ballmac UI: Hyper Text. https://ui.ballmac.com/components/hyper-text
"use client"

import * as React from "react"
import { motion, useInView, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

type HyperTextProps = Omit<React.ComponentProps<"span">, "children"> & {
  /** The final text. */
  children: string
  /** When to play. "hover" also plays on keyboard focus. */
  trigger?: "mount" | "inView" | "hover"
  /** "tiles" draws each character on a split-flap tile. */
  variant?: "plain" | "tiles"
  /** Milliseconds between flips of one character. */
  speed?: number
  /** Extra flips each character makes, per position, so the word settles left to right. */
  spread?: number
  /** Called when every character has settled. */
  onComplete?: () => void
}

function Flap({ target, run, steps, speed, tile }: { target: string; run: number; steps: number; speed: number; tile: boolean }) {
  const [char, setChar] = React.useState(target)
  const reduce = useReducedMotion()
  React.useEffect(() => {
    if (!run || reduce || target === " ") {
      setChar(target)
      return
    }
    let n = 0
    const id = setInterval(() => {
      n++
      if (n >= steps) {
        setChar(target)
        clearInterval(id)
      } else {
        setChar(ALPHABET[Math.floor(Math.random() * ALPHABET.length)]!)
      }
    }, speed)
    return () => clearInterval(id)
  }, [run, target, steps, speed, reduce])

  if (target === " ") return <span className={tile ? "w-[0.5em]" : "whitespace-pre"}>{tile ? "" : " "}</span>
  return (
    <span
      className={cn(
        "relative inline-flex h-[1.35em] min-w-[0.75em] items-center justify-center overflow-hidden",
        tile && "rounded-[0.18em] bg-foreground px-[0.12em] text-background shadow-[inset_0_-0.08em_0_0_rgb(0_0_0/0.25)] after:absolute after:inset-x-0 after:top-1/2 after:h-px after:bg-background/30 after:content-['']"
      )}
    >
      <motion.span
        key={char}
        className="inline-block"
        initial={reduce ? false : { y: "-70%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: Math.min(speed / 1000, 0.09), ease: "easeOut" }}
      >
        {char}
      </motion.span>
    </span>
  )
}

function HyperText({ children: text, trigger = "mount", variant = "plain", speed = 55, spread = 2, onComplete, className, onPointerEnter, onFocus, ...props }: HyperTextProps) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const seen = useInView(ref, { once: true })
  const [run, setRun] = React.useState(0)
  const chars = Array.from(text)
  const completeRef = React.useRef(onComplete)
  React.useEffect(() => {
    completeRef.current = onComplete
  })

  React.useEffect(() => {
    if (trigger === "mount" || (trigger === "inView" && seen)) setRun((r) => r + 1)
  }, [trigger, seen])

  React.useEffect(() => {
    if (!run) return
    const total = (4 + chars.length * spread) * speed + 60
    const id = setTimeout(() => completeRef.current?.(), total)
    return () => clearTimeout(id)
  }, [run, chars.length, spread, speed])

  const hover = trigger === "hover"
  return (
    <span
      ref={ref}
      data-slot="hyper-text"
      tabIndex={hover ? 0 : undefined}
      onPointerEnter={(e) => {
        onPointerEnter?.(e)
        if (hover) setRun((r) => r + 1)
      }}
      onFocus={(e) => {
        onFocus?.(e)
        if (hover) setRun((r) => r + 1)
      }}
      className={cn(
        "inline-flex flex-wrap items-center font-mono font-semibold tracking-tight",
        variant === "tiles" ? "gap-[0.12em]" : "gap-0",
        hover && "rounded-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        className
      )}
      {...props}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="inline-flex flex-wrap items-center gap-[inherit]">
        {chars.map((c, i) => (
          <Flap key={i} target={c.toUpperCase()} run={run} steps={4 + i * spread} speed={speed} tile={variant === "tiles"} />
        ))}
      </span>
    </span>
  )
}

export { HyperText, type HyperTextProps }
