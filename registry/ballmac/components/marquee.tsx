// Ballmac UI: Marquee. https://ui.ballmac.com/components/marquee
"use client"

import * as React from "react"
import { animate, type AnimationPlaybackControls } from "motion/react"

import { cn } from "@/lib/utils"

type MarqueeProps = React.ComponentProps<"div"> & {
  /** Scroll top to bottom instead of left to right. Give the marquee a height. */
  vertical?: boolean
  /** Run the other way (right to left becomes left to right, up becomes down). */
  reverse?: boolean
  /** Speed in pixels per second, so long and short content move at the same pace. */
  speed?: number
  /** Pause while the pointer is over the marquee. Keyboard focus inside always pauses. */
  pauseOnHover?: boolean
  /** Space between items and between loops. A number is pixels; strings are any CSS length. */
  gap?: number | string
  /** Fade the leading and trailing edges into the background. */
  fade?: boolean
}

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)"

function subscribeReducedMotion(onChange: () => void) {
  const media = window.matchMedia(REDUCED_QUERY)
  media.addEventListener("change", onChange)
  return () => media.removeEventListener("change", onChange)
}

/** Reduced-motion preference that is false on the server and during hydration, so markup always matches. */
function useReducedMotionSafe() {
  return React.useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_QUERY).matches,
    () => false
  )
}

const MAX_COPIES = 12

function Marquee({
  vertical = false,
  reverse = false,
  speed = 40,
  pauseOnHover = true,
  gap = 16,
  fade = true,
  className,
  style,
  children,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ...props
}: MarqueeProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const trackRef = React.useRef<HTMLDivElement>(null)
  const firstCopyRef = React.useRef<HTMLDivElement>(null)
  const controls = React.useRef<AnimationPlaybackControls | null>(null)
  const hovered = React.useRef(false)
  const focused = React.useRef(false)
  const reduceMotion = useReducedMotionSafe()

  // One copy's length (content + trailing gap) and how many copies fill the viewport.
  const [loop, setLoop] = React.useState({ length: 0, copies: 2 })

  React.useEffect(() => {
    const root = rootRef.current
    const copy = firstCopyRef.current
    if (!root || !copy || reduceMotion) return
    const measure = () => {
      const length = vertical ? copy.offsetHeight : copy.offsetWidth
      const viewport = vertical ? root.clientHeight : root.clientWidth
      // Capped: in a container that sizes to its content, each copy would widen the viewport and loop forever.
      const copies = length > 0 ? Math.min(MAX_COPIES, Math.max(2, Math.ceil(viewport / length) + 1)) : 2
      setLoop((prev) => (prev.length === length && prev.copies === copies ? prev : { length, copies }))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(root)
    observer.observe(copy)
    return () => observer.disconnect()
  }, [vertical, reduceMotion])

  React.useEffect(() => {
    const track = trackRef.current
    if (!track || reduceMotion || loop.length <= 0 || speed <= 0) return
    const axis = vertical ? "translateY" : "translateX"
    const start = `${axis}(0px)`
    const end = `${axis}(${-loop.length}px)`
    controls.current = animate(
      track,
      { transform: reverse ? [end, start] : [start, end] },
      { duration: loop.length / speed, ease: "linear", repeat: Infinity }
    )
    if (focused.current || (pauseOnHover && hovered.current)) controls.current.pause()
    return () => {
      controls.current?.stop()
      controls.current = null
      track.style.transform = ""
    }
  }, [loop.length, speed, reverse, vertical, reduceMotion, pauseOnHover])

  const sync = () => {
    const paused = focused.current || (pauseOnHover && hovered.current)
    if (paused) controls.current?.pause()
    else controls.current?.play()
  }

  const copies = reduceMotion ? 1 : loop.copies
  const gapValue = typeof gap === "number" ? `${gap}px` : gap
  const fadeMask = fade
    ? `linear-gradient(${vertical ? "to bottom" : "to right"}, transparent, black 10%, black 90%, transparent)`
    : undefined

  return (
    <div
      ref={rootRef}
      data-slot="marquee"
      // Scrollable instead of animated under reduced motion, so keyboard users need to reach it.
      tabIndex={reduceMotion ? 0 : undefined}
      data-orientation={vertical ? "vertical" : "horizontal"}
      className={cn(
        "relative flex max-w-full min-w-0",
        vertical ? "flex-col" : "flex-row",
        reduceMotion
          ? cn(vertical ? "overflow-y-auto" : "overflow-x-auto", "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50")
          : "overflow-hidden",
        className
      )}
      style={{ "--marquee-gap": gapValue, maskImage: fadeMask, WebkitMaskImage: fadeMask, ...style } as React.CSSProperties}
      onPointerEnter={(event) => {
        hovered.current = true
        sync()
        onPointerEnter?.(event)
      }}
      onPointerLeave={(event) => {
        hovered.current = false
        sync()
        onPointerLeave?.(event)
      }}
      onFocus={(event) => {
        focused.current = true
        sync()
        onFocus?.(event)
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          focused.current = false
          sync()
        }
        onBlur?.(event)
      }}
      {...props}
    >
      <div
        ref={trackRef}
        data-slot="marquee-track"
        className={cn("flex shrink-0", vertical ? "h-max flex-col" : "w-max flex-row")}
      >
        {Array.from({ length: copies }, (_, i) => (
          <div
            key={i}
            ref={i === 0 ? firstCopyRef : undefined}
            data-slot="marquee-content"
            aria-hidden={i > 0 || undefined}
            inert={i > 0 || undefined}
            className={cn(
              "flex shrink-0 gap-(--marquee-gap)",
              vertical ? "flex-col pb-(--marquee-gap)" : "flex-row pe-(--marquee-gap)"
            )}
          >
            {children}
          </div>
        ))}
      </div>
    </div>
  )
}

export { Marquee, type MarqueeProps }
