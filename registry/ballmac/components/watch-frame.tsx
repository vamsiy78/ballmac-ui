// Ballmac UI: Watch Frame. https://ui.ballmac.com/components/watch-frame
"use client"

import * as React from "react"
import { useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"
import { Media } from "@/components/ballmac/media"

type WatchFrameProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Screen content. Ignored when `src` or `videoSrc` is set. Defaults to a dark screen. */
  children?: React.ReactNode
  /** Finish of the aluminum case. "auto" is silver in light mode and black in dark mode. */
  variant?: "auto" | "silver" | "black" | "gold"
  /** Strap style and color. */
  band?: "sport" | "loop" | "leather" | "none"
  /** Strap color, taken from the theme's chart colors. */
  bandTone?: "blue" | "teal" | "orange" | "purple" | "graphite" | "red"
  /** Image shown on the screen, cropped to fill it. */
  src?: string
  /** Alternative text for `src`. */
  alt?: string
  /** Video shown on the screen: muted, looping, and paused under reduced motion. */
  videoSrc?: string
  /** Poster image for `videoSrc`. */
  poster?: string
  /**
   * Width in CSS pixels that the screen content is laid out at (208 matches a 46 mm watch);
   * it is then scaled to fit. Omit to lay content out at the frame's actual size.
   */
  screenWidth?: number
  /** Class names for the screen element. */
  screenClassName?: string
}

const SILVER =
  "[--wf-hi:color-mix(in_oklch,white_96%,black)] [--wf-mid:color-mix(in_oklch,white_80%,black)] [--wf-lo:color-mix(in_oklch,white_58%,black)]"
const BLACK =
  "[--wf-hi:color-mix(in_oklch,white_32%,black)] [--wf-mid:color-mix(in_oklch,white_16%,black)] [--wf-lo:color-mix(in_oklch,white_8%,black)]"
const BLACK_DARK =
  "dark:[--wf-hi:color-mix(in_oklch,white_32%,black)] dark:[--wf-mid:color-mix(in_oklch,white_16%,black)] dark:[--wf-lo:color-mix(in_oklch,white_8%,black)]"
const GOLD =
  "[--wf-hi:color-mix(in_oklch,var(--chart-3)_35%,white)] [--wf-mid:color-mix(in_oklch,var(--chart-3)_60%,white)] [--wf-lo:color-mix(in_oklch,var(--chart-3)_75%,black)]"

const TONES = {
  blue: "[--wf-band:color-mix(in_oklch,var(--chart-1)_92%,black)]",
  teal: "[--wf-band:color-mix(in_oklch,var(--chart-2)_92%,black)]",
  orange: "[--wf-band:color-mix(in_oklch,var(--chart-5)_92%,black)]",
  purple: "[--wf-band:color-mix(in_oklch,var(--chart-4)_92%,black)]",
  red: "[--wf-band:color-mix(in_oklch,var(--destructive)_92%,black)]",
  graphite: "[--wf-band:color-mix(in_oklch,white_26%,black)]",
}

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

/**
 * A smartwatch drawn in CSS: rounded case with a brushed highlight, digital crown, side button, curved glass and a strap
 * that fades out above and below. The screen is always dark. Children render as the screen, laid out at a watch resolution and scaled to fit.
 */
function WatchFrame({
  variant = "auto",
  band = "sport",
  bandTone = "graphite",
  src,
  alt = "",
  videoSrc,
  poster,
  screenWidth,
  screenClassName,
  className,
  children,
  ...props
}: WatchFrameProps) {
  const media = !!(src || videoSrc)
  const viewportRef = useScreenScale(media ? undefined : screenWidth)
  const reduceMotion = !!useReducedMotion()
  const strap = (side: "top" | "bottom") => (
    <span
      aria-hidden="true"
      data-slot="watch-frame-band"
      className={cn(
        "absolute left-1/2 h-[34cqw] w-[78cqw] -translate-x-1/2 bg-(--wf-band)",
        side === "top"
          ? "top-0 rounded-t-[8cqw] [mask-image:linear-gradient(to_top,black_55%,transparent)]"
          : "bottom-0 rounded-b-[8cqw] [mask-image:linear-gradient(to_bottom,black_55%,transparent)]",
        band === "sport" && "bg-[linear-gradient(90deg,rgb(0_0_0/0.28),transparent_14%,transparent_86%,rgb(0_0_0/0.28)),linear-gradient(var(--wf-band),var(--wf-band))]",
        band === "loop" &&
          "bg-[repeating-linear-gradient(0deg,rgb(255_255_255/0.1)_0_0.5cqw,transparent_0.5cqw_1.4cqw),linear-gradient(90deg,rgb(0_0_0/0.28),transparent_14%,transparent_86%,rgb(0_0_0/0.28)),linear-gradient(var(--wf-band),var(--wf-band))]",
        band === "leather" &&
          "bg-[linear-gradient(90deg,rgb(0_0_0/0.3),transparent_12%,transparent_88%,rgb(0_0_0/0.3)),linear-gradient(color-mix(in_oklch,var(--wf-band)_70%,black),color-mix(in_oklch,var(--wf-band)_70%,black))]"
      )}
    >
      {band === "sport" && side === "bottom" && (
        <>
          <span className="absolute top-[9cqw] left-1/2 size-[2.4cqw] -translate-x-1/2 rounded-full bg-black/35" />
          <span className="absolute top-[15cqw] left-1/2 size-[2.4cqw] -translate-x-1/2 rounded-full bg-black/35" />
          <span className="absolute top-[21cqw] left-1/2 size-[2.4cqw] -translate-x-1/2 rounded-full bg-black/35" />
        </>
      )}
      {band === "leather" && <span className="absolute inset-y-0 left-[6cqw] border-l-[0.5cqw] border-dashed border-white/30" />}
    </span>
  )

  return (
    <div
      data-slot="watch-frame"
      data-variant={variant}
      className={cn(
        "@container relative aspect-[100/181] w-full max-w-[200px] select-none",
        variant === "silver" && SILVER,
        variant === "black" && BLACK,
        variant === "gold" && GOLD,
        variant === "auto" && cn(SILVER, BLACK_DARK),
        TONES[bandTone],
        className
      )}
      {...props}
    >
      {band !== "none" && (
        <>
          {strap("top")}
          {strap("bottom")}
        </>
      )}

      {/* Digital crown and side button */}
      <span
        aria-hidden="true"
        className="absolute top-[63cqw] right-[-2.6cqw] h-[16cqw] w-[4.6cqw] rounded-r-[1.8cqw] bg-[repeating-linear-gradient(0deg,var(--wf-hi)_0_0.6cqw,var(--wf-lo)_0.6cqw_1.2cqw)] shadow-[0_0.4cqw_1cqw_rgb(0_0_0/0.3)]"
      />
      <span
        aria-hidden="true"
        className="absolute top-[88cqw] right-[-1.6cqw] h-[16cqw] w-[2.8cqw] rounded-r-[1.2cqw] bg-[linear-gradient(90deg,var(--wf-lo),var(--wf-hi)_60%,var(--wf-mid))]"
      />

      {/* Case */}
      <div
        data-slot="watch-frame-body"
        className="absolute top-[30cqw] left-0 h-[121cqw] w-full rounded-[27cqw] bg-[linear-gradient(135deg,var(--wf-hi),var(--wf-mid)_30%,var(--wf-lo)_56%,var(--wf-mid)_80%,var(--wf-hi))] p-[1.6cqw] shadow-[inset_0_0_0_0.3cqw_rgb(255_255_255/0.16),0_3cqw_7cqw_-1.5cqw_rgb(0_0_0/0.45),0_0.6cqw_1.6cqw_rgb(0_0_0/0.25)]"
      >
        <div className="size-full rounded-[25.6cqw] bg-black p-[3.2cqw] shadow-[inset_0_0_0_0.4cqw_rgb(255_255_255/0.08)]">
          <div
            data-slot="watch-frame-screen"
            className={cn("dark relative isolate flex size-full flex-col overflow-hidden rounded-[22.4cqw] bg-black text-white", screenClassName)}
          >
            {media ? (
              videoSrc ? (
                <video
                  data-slot="watch-frame-video"
                  className="absolute inset-0 size-full object-cover"
                  src={videoSrc}
                  poster={poster}
                  autoPlay={!reduceMotion}
                  muted
                  loop
                  playsInline
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <Media data-slot="watch-frame-image" media={src} alt={alt} fill className="absolute inset-0" />
              )
            ) : (
              <div ref={viewportRef} data-slot="watch-frame-content" className="relative min-h-0 flex-1">
                {screenWidth ? (
                  <div
                    className="absolute top-0 left-0 origin-top-left"
                    style={{ width: screenWidth, height: "calc(100% / var(--screen-scale, 1))", transform: "scale(var(--screen-scale, 1))" }}
                  >
                    {children}
                  </div>
                ) : (
                  children
                )}
              </div>
            )}
            {/* Curved glass */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-40 rounded-[inherit] bg-[linear-gradient(125deg,rgb(255_255_255/0.14)_0%,rgb(255_255_255/0.02)_32%,transparent_32.2%)] shadow-[inset_0_0_6cqw_rgb(255_255_255/0.05)]"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export { WatchFrame, type WatchFrameProps }
