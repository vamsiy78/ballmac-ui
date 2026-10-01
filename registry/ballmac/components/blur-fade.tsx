// Ballmac UI: Blur Fade. https://ui.ballmac.com/components/blur-fade
"use client"

import * as React from "react"
import { motion, useInView, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

type BlurFadeTag = "div" | "span" | "section" | "li" | "p" | "article" | "figure"

type BlurFadeProps = Omit<React.ComponentProps<"div">, "ref"> & {
  /** Seconds to wait before starting. */
  delay?: number
  /** Seconds the fade takes. */
  duration?: number
  /** Where the content travels from. "none" only fades and unblurs. */
  direction?: "up" | "down" | "left" | "right" | "none"
  /** Distance in pixels travelled while fading in. */
  offset?: number
  /** Starting blur in pixels. */
  blur?: number
  /** Wait until the element scrolls into view before playing. */
  inView?: boolean
  /** Play only the first time it enters the view. */
  once?: boolean
  /** Element to render. */
  as?: BlurFadeTag
}

function BlurFade({
  delay = 0,
  duration = 0.5,
  direction = "up",
  offset = 10,
  blur = 8,
  inView = true,
  once = true,
  as = "div",
  className,
  children,
  ...props
}: BlurFadeProps) {
  const ref = React.useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const seen = useInView(ref, { once, margin: "0px 0px -12% 0px" })
  const show = inView ? seen : true
  const axis = direction === "left" || direction === "right" ? "x" : "y"
  const sign = direction === "up" || direction === "left" ? 1 : -1
  const from = direction === "none" ? {} : { [axis]: offset * sign }
  const Tag = motion[as] as typeof motion.div

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      data-slot="blur-fade"
      initial={false}
      animate={
        reduce || show
          ? { opacity: 1, x: 0, y: 0, filter: "blur(0px)" }
          : { opacity: 0, x: 0, y: 0, ...from, filter: `blur(${blur}px)` }
      }
      transition={reduce ? { duration: 0 } : { delay: show ? delay : 0, duration: show ? duration : 0, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...(props as object)}
    >
      {children}
    </Tag>
  )
}

type BlurFadeGroupProps = Omit<React.ComponentProps<"div">, "ref"> & {
  /** Seconds between each child. */
  stagger?: number
  /** Seconds before the first child starts. */
  delay?: number
  /** Settings passed to every child's BlurFade. */
  item?: Pick<BlurFadeProps, "direction" | "offset" | "blur" | "duration" | "inView" | "once">
  /** Element each child is wrapped in. */
  itemAs?: BlurFadeTag
}

/** Wraps each child in a BlurFade and staggers them. */
function BlurFadeGroup({ stagger = 0.08, delay = 0, item, itemAs = "div", className, children, ...props }: BlurFadeGroupProps) {
  const items = React.Children.toArray(children)
  return (
    <div data-slot="blur-fade-group" className={cn(className)} {...props}>
      {items.map((child, i) => (
        <BlurFade key={React.isValidElement(child) && child.key !== null ? child.key : i} as={itemAs} delay={delay + i * stagger} {...item}>
          {child}
        </BlurFade>
      ))}
    </div>
  )
}

export { BlurFade, BlurFadeGroup, type BlurFadeProps, type BlurFadeGroupProps }
