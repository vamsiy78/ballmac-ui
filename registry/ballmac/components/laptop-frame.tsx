// Ballmac UI: Laptop Frame. https://ui.ballmac.com/components/laptop-frame
"use client"

import * as React from "react"
import { animate, motion, useInView, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react"

import { cn } from "@/lib/utils"
import { Media } from "@/components/ballmac/media"

type LaptopFrameProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Screen content. Ignored when `src` or `videoSrc` is set. */
  children?: React.ReactNode
  /** Finish of the aluminium. "auto" is silver in light mode and midnight in dark mode. */
  variant?: "auto" | "silver" | "midnight"
  /** Image shown on the screen, cropped to fill it. */
  src?: string
  /** Alternative text for `src`. */
  alt?: string
  /** Video shown on the screen: muted, looping, and paused under reduced motion. */
  videoSrc?: string
  /** Poster image for `videoSrc`. */
  poster?: string
  /**
   * Width in CSS pixels that the screen content is laid out at; it is then scaled to fit the screen,
   * like a real display resolution. Omit to lay content out at the frame's actual size.
   */
  screenWidth?: number
  /**
   * Opens the lid: "in-view" plays once when the laptop scrolls into view, "scroll" ties the hinge to
   * scroll position. Reduced motion always shows the laptop open.
   */
  openAnimation?: "none" | "in-view" | "scroll"
  /** Class names for the screen element (the area inside the bezel). */
  screenClassName?: string
}

// Aluminium palettes as CSS variables, so "auto" can switch with the theme in plain CSS.
const SILVER =
  "[--lf-shell-hi:color-mix(in_oklch,white_97%,black)] [--lf-shell:color-mix(in_oklch,white_86%,black)] [--lf-shell-lo:color-mix(in_oklch,white_70%,black)] [--lf-edge:color-mix(in_oklch,white_60%,black)] [--lf-scoop:color-mix(in_oklch,white_74%,black)]"
const MIDNIGHT =
  "[--lf-shell-hi:color-mix(in_oklch,white_52%,black)] [--lf-shell:color-mix(in_oklch,white_30%,black)] [--lf-shell-lo:color-mix(in_oklch,white_16%,black)] [--lf-edge:color-mix(in_oklch,white_30%,black)] [--lf-scoop:color-mix(in_oklch,white_14%,black)]"
const MIDNIGHT_DARK =
  "dark:[--lf-shell-hi:color-mix(in_oklch,white_52%,black)] dark:[--lf-shell:color-mix(in_oklch,white_30%,black)] dark:[--lf-shell-lo:color-mix(in_oklch,white_16%,black)] dark:[--lf-edge:color-mix(in_oklch,white_30%,black)] dark:[--lf-scoop:color-mix(in_oklch,white_14%,black)]"

const CLOSED_ANGLE = -90

/** Lays screen content out at `screenWidth` CSS pixels and scales it to fit, without re-rendering. */
function useScreenScale(screenWidth: number | undefined) {
  const ref = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    const screen = ref.current
    if (!screen || !screenWidth) return
    const measure = () => screen.style.setProperty("--screen-scale", String(screen.clientWidth / screenWidth))
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(screen)
    return () => observer.disconnect()
  }, [screenWidth])
  return ref
}

function ScreenContent({
  children,
  src,
  alt = "",
  videoSrc,
  poster,
  screenWidth,
  reduceMotion,
}: Pick<LaptopFrameProps, "children" | "src" | "alt" | "videoSrc" | "poster" | "screenWidth"> & { reduceMotion: boolean }) {
  if (videoSrc) {
    return (
      <video
        data-slot="laptop-frame-video"
        className="size-full object-cover"
        src={videoSrc}
        poster={poster}
        autoPlay={!reduceMotion}
        muted
        loop
        playsInline
      />
    )
  }
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <Media data-slot="laptop-frame-image" media={src} alt={alt} fill className="size-full" />
  }
  if (!screenWidth) return <>{children}</>
  return (
    <div
      data-slot="laptop-frame-viewport"
      className="absolute top-0 left-0 origin-top-left"
      style={{
        width: screenWidth,
        height: "calc(100% / var(--screen-scale, 1))",
        transform: "scale(var(--screen-scale, 1))",
      }}
    >
      {children}
    </div>
  )
}

function LaptopFrame({
  variant = "auto",
  src,
  alt,
  videoSrc,
  poster,
  screenWidth,
  openAnimation = "none",
  screenClassName,
  className,
  children,
  ...props
}: LaptopFrameProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const screenRef = useScreenScale(src || videoSrc ? undefined : screenWidth)
  const reduceMotion = !!useReducedMotion()
  const inView = useInView(rootRef, { once: true, amount: 0.35 })

  // Hinge angle in degrees: 0 is open, -90 is closed (lid flat on the base).
  const angle = useMotionValue(openAnimation === "none" ? 0 : CLOSED_ANGLE)
  const { scrollYProgress } = useScroll({ target: rootRef, offset: ["start end", "center 55%"] })
  const scrollAngle = useSpring(useTransform(scrollYProgress, [0, 1], [CLOSED_ANGLE, 0]), {
    stiffness: 140,
    damping: 26,
  })

  React.useEffect(() => {
    if (openAnimation === "none" || reduceMotion) {
      angle.set(0)
      return
    }
    if (openAnimation === "scroll") {
      angle.set(scrollAngle.get())
      return scrollAngle.on("change", (v) => angle.set(v))
    }
    if (!inView) {
      angle.set(CLOSED_ANGLE)
      return
    }
    const controls = animate(angle, 0, { type: "spring", stiffness: 60, damping: 16, mass: 1.1, delay: 0.15 })
    return () => controls.stop()
  }, [openAnimation, reduceMotion, inView, angle, scrollAngle])

  // The screen dims as the lid closes, like a display facing away from the light.
  const glare = useTransform(angle, [CLOSED_ANGLE, -30, 0], [0.9, 0.35, 0])

  return (
    <div
      ref={rootRef}
      data-slot="laptop-frame"
      data-variant={variant}
      className={cn(
        "@container relative w-full select-none",
        variant === "silver" && SILVER,
        variant === "midnight" && MIDNIGHT,
        variant === "auto" && cn(SILVER, MIDNIGHT_DARK),
        className
      )}
      {...props}
    >
      {/* Lid */}
      <div className="relative mx-auto w-[82%] perspective-[240cqw] perspective-origin-[50%_20%]">
        <motion.div
          data-slot="laptop-frame-lid"
          className="relative origin-bottom transform-3d"
          style={{ rotateX: angle }}
        >
          {/* Front: aluminium edge, black bezel, screen. */}
          <div className="relative rounded-t-[2.6cqw] rounded-b-[0.5cqw] bg-(--lf-edge) p-[0.28cqw] backface-hidden shadow-[0_0.6cqw_2cqw_-0.6cqw_rgb(0_0_0/0.35)]">
            <div className="relative rounded-t-[2.35cqw] rounded-b-[0.35cqw] bg-black p-[1.05cqw] pb-[1.3cqw] shadow-[inset_0_0_0_0.12cqw_rgb(255_255_255/0.08)]">
              <div
                ref={screenRef}
                data-slot="laptop-frame-screen"
                className={cn(
                  "relative isolate aspect-[16/10.3] overflow-hidden rounded-t-[1.35cqw] rounded-b-[0.2cqw] bg-background text-foreground",
                  screenClassName
                )}
              >
                <ScreenContent
                  src={src}
                  alt={alt}
                  videoSrc={videoSrc}
                  poster={poster}
                  screenWidth={screenWidth}
                  reduceMotion={reduceMotion}
                >
                  {children}
                </ScreenContent>
                {/* Glass: a soft diagonal reflection plus dimming while closed. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(115deg,rgb(255_255_255/0.07)_0%,rgb(255_255_255/0.02)_38%,transparent_38.2%)]"
                />
                <motion.span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-10 bg-black"
                  style={{ opacity: glare }}
                />
              </div>
              {/* Notch with camera. */}
              <span
                aria-hidden="true"
                data-slot="laptop-frame-notch"
                className="pointer-events-none absolute top-0 left-1/2 z-20 flex h-[2.15cqw] w-[11%] -translate-x-1/2 items-center justify-center rounded-b-[0.75cqw] bg-black"
              >
                <span className="size-[0.55cqw] rounded-full bg-[radial-gradient(circle_at_35%_35%,rgb(120_140_255/0.55),rgb(255_255_255/0.06)_45%,transparent_70%)] ring-[0.08cqw] ring-white/10" />
              </span>
            </div>
          </div>
          {/* Back of the lid, seen while it is closing. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 rotate-x-180 rounded-t-[0.5cqw] rounded-b-[2.6cqw] bg-[linear-gradient(180deg,var(--lf-shell-lo),var(--lf-shell)_55%,var(--lf-shell-hi))] backface-hidden"
          />
        </motion.div>
      </div>

      {/* Hinge */}
      <div
        aria-hidden="true"
        className="relative mx-auto h-[0.75cqw] w-[70%] rounded-b-[0.6cqw] bg-[linear-gradient(180deg,rgb(0_0_0/0.85),color-mix(in_oklch,var(--lf-shell-lo)_70%,black))]"
      />

      {/* Base */}
      <div aria-hidden="true" data-slot="laptop-frame-base" className="relative -mt-[0.1cqw] h-[2.1cqw] w-full">
        <div className="absolute inset-0 rounded-t-[0.4cqw] rounded-b-[4cqw_100%] bg-[linear-gradient(180deg,var(--lf-shell-hi)_0%,var(--lf-shell)_28%,var(--lf-shell-lo)_100%)] shadow-[inset_0_0.1cqw_0_rgb(255_255_255/0.6),inset_0_-0.15cqw_0.2cqw_rgb(0_0_0/0.18)]" />
        {/* Thumb scoop */}
        <div className="absolute top-0 left-1/2 h-[48%] w-[15%] -translate-x-1/2 rounded-b-[1cqw] bg-[linear-gradient(180deg,var(--lf-scoop),var(--lf-shell))] shadow-[inset_0_0.12cqw_0.25cqw_rgb(0_0_0/0.25)]" />
        {/* Contact shadow */}
        <div className="absolute inset-x-[4%] -bottom-[1.2cqw] -z-10 h-[1.6cqw] rounded-[100%] bg-black/35 blur-[1cqw] dark:bg-black/70" />
      </div>
    </div>
  )
}

export { LaptopFrame, type LaptopFrameProps }
