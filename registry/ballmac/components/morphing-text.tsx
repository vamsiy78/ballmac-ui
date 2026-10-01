// Ballmac UI: Morphing Text. https://ui.ballmac.com/components/morphing-text
"use client"

import * as React from "react"
import { useInView, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

type MorphingTextProps = Omit<React.ComponentProps<"span">, "children"> & {
  /** The words or phrases to morph between, in order. */
  texts: string[]
  /** Milliseconds each text is held before the next morph starts. */
  hold?: number
  /** Milliseconds the morph itself takes. */
  morph?: number
}

function MorphingText({ texts, hold = 1400, morph = 1100, className, ...props }: MorphingTextProps) {
  const reduce = useReducedMotion()
  const id = React.useId().replace(/:/g, "")
  const root = React.useRef<HTMLSpanElement>(null)
  const a = React.useRef<HTMLSpanElement>(null)
  const b = React.useRef<HTMLSpanElement>(null)
  const visible = useInView(root)
  const [announced, setAnnounced] = React.useState(0)

  React.useEffect(() => {
    const first = a.current
    const second = b.current
    if (!first || !second || texts.length === 0) return
    first.textContent = texts[0]!
    first.style.cssText = "opacity:1;filter:blur(0px)"
    second.textContent = texts[1 % texts.length]!
    second.style.cssText = "opacity:0;filter:blur(0px)"
    if (reduce || !visible || texts.length < 2) return

    let index = 0
    let frontIsA = true
    let start = performance.now()
    let raf = 0
    let holding = true
    const apply = (el: HTMLElement, fraction: number) => {
      const f = Math.min(Math.max(fraction, 0.0001), 1)
      el.style.filter = `blur(${Math.min(8 / f - 8, 100)}px)`
      el.style.opacity = `${Math.pow(f, 0.4)}`
    }
    const frame = (now: number) => {
      const elapsed = now - start
      const front = frontIsA ? first : second
      const back = frontIsA ? second : first
      if (holding) {
        if (elapsed >= hold) {
          holding = false
          start = now
          back.textContent = texts[(index + 1) % texts.length]!
        }
      } else {
        const t = Math.min(elapsed / morph, 1)
        apply(back, t)
        apply(front, 1 - t)
        if (t >= 1) {
          front.style.cssText = "opacity:0;filter:blur(0px)"
          back.style.cssText = "opacity:1;filter:blur(0px)"
          frontIsA = !frontIsA
          index = (index + 1) % texts.length
          holding = true
          start = now
          setAnnounced(index)
        }
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [texts, hold, morph, reduce, visible])

  return (
    <span
      ref={root}
      data-slot="morphing-text"
      className={cn("relative inline-grid align-middle text-center font-semibold", className)}
      style={{ filter: `url(#${id}) blur(0.4px)` }}
      {...props}
    >
      <svg aria-hidden="true" className="pointer-events-none absolute size-0">
        <defs>
          <filter id={id}>
            <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 255 -140" />
          </filter>
        </defs>
      </svg>
      {/* Invisible copies reserve the width of the longest text so nothing jumps. */}
      {texts.map((t, i) => (
        <span key={i} aria-hidden="true" className="invisible col-start-1 row-start-1 whitespace-nowrap">
          {t}
        </span>
      ))}
      <span ref={a} aria-hidden="true" className="col-start-1 row-start-1 whitespace-nowrap" />
      <span ref={b} aria-hidden="true" className="col-start-1 row-start-1 whitespace-nowrap" />
      <span className="sr-only">{texts.join(", ")}</span>
      <span className="sr-only" aria-live="off" data-current={announced} />
    </span>
  )
}

export { MorphingText, type MorphingTextProps }
