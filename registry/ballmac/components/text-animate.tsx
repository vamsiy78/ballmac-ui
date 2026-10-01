// Ballmac UI: Text Animate. https://ui.ballmac.com/components/text-animate
"use client"

import * as React from "react"
import { motion, useInView, useReducedMotion, type Variants } from "motion/react"

import { cn } from "@/lib/utils"

type TextAnimation = "fadeIn" | "blurIn" | "slideUp" | "slideDown" | "slideLeft" | "slideRight" | "scaleUp" | "rotateIn"

const PRESETS: Record<TextAnimation, { hidden: Record<string, number | string>; visible: Record<string, number | string> }> = {
  fadeIn: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
  blurIn: { hidden: { opacity: 0, filter: "blur(10px)" }, visible: { opacity: 1, filter: "blur(0px)" } },
  slideUp: { hidden: { opacity: 0, y: "0.6em" }, visible: { opacity: 1, y: 0 } },
  slideDown: { hidden: { opacity: 0, y: "-0.6em" }, visible: { opacity: 1, y: 0 } },
  slideLeft: { hidden: { opacity: 0, x: "0.6em" }, visible: { opacity: 1, x: 0 } },
  slideRight: { hidden: { opacity: 0, x: "-0.6em" }, visible: { opacity: 1, x: 0 } },
  scaleUp: { hidden: { opacity: 0, scale: 0.4 }, visible: { opacity: 1, scale: 1 } },
  rotateIn: { hidden: { opacity: 0, rotateX: -90, y: "0.4em" }, visible: { opacity: 1, rotateX: 0, y: 0 } },
}

type TextAnimateTag = "span" | "p" | "div" | "h1" | "h2" | "h3" | "h4"

type TextAnimateProps = Omit<React.ComponentProps<"span">, "children"> & {
  /** The text. Use a newline to break lines. */
  children: string
  /** What is animated one after another. */
  by?: "character" | "word" | "line"
  /** How each piece arrives. */
  animation?: TextAnimation
  /** Seconds between pieces. Defaults to a pace that suits `by`. */
  stagger?: number
  /** Seconds each piece takes. */
  duration?: number
  /** Seconds before the first piece. */
  delay?: number
  /** Wait for the text to scroll into view. */
  inView?: boolean
  /** Play once. */
  once?: boolean
  /** Element to render. */
  as?: TextAnimateTag
}

function TextAnimate({
  children: text,
  by = "word",
  animation = "blurIn",
  stagger,
  duration = 0.4,
  delay = 0,
  inView = true,
  once = true,
  as = "span",
  className,
  ...props
}: TextAnimateProps) {
  const ref = React.useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const seen = useInView(ref, { once, margin: "0px 0px -10% 0px" })
  const show = reduce || (inView ? seen : true)
  const step = stagger ?? (by === "character" ? 0.03 : by === "word" ? 0.07 : 0.15)
  const preset = PRESETS[animation]
  const Tag = as as React.ElementType

  const variants: Variants = {
    hidden: preset.hidden,
    visible: (i: number) => ({
      ...preset.visible,
      transition: { delay: delay + i * step, duration, ease: [0.22, 1, 0.36, 1] },
    }),
  }

  const lines = text.split("\n")
  let index = 0
  const piece = (content: string, key: React.Key) => (
    <motion.span
      key={key}
      custom={index++}
      variants={variants}
      initial={false}
      animate={show ? "visible" : "hidden"}
      style={{ display: "inline-block", whiteSpace: "pre", transformOrigin: "50% 100%" }}
      aria-hidden="true"
    >
      {content}
    </motion.span>
  )

  return (
    <Tag ref={ref} data-slot="text-animate" className={cn("inline-block", className)} style={{ perspective: 600 }} {...props}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {lines.map((line, li) => (
          <React.Fragment key={li}>
            {li > 0 && <br />}
            {by === "line"
              ? piece(line, li)
              : line.split(/(\s+)/).map((word, wi) => {
                  if (/^\s+$/.test(word)) return <React.Fragment key={wi}> </React.Fragment>
                  if (by === "word") return piece(word, wi)
                  return (
                    <span key={wi} style={{ display: "inline-block", whiteSpace: "nowrap" }}>
                      {Array.from(word).map((ch, ci) => piece(ch, ci))}
                    </span>
                  )
                })}
          </React.Fragment>
        ))}
      </span>
    </Tag>
  )
}

export { TextAnimate, type TextAnimateProps, type TextAnimation }
