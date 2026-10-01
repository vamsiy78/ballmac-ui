// Ballmac UI: Tablet Frame. https://ui.ballmac.com/components/tablet-frame
"use client"

import * as React from "react"
import { useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

type TabletFrameProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Screen content, laid out below the status bar. Ignored when `src` or `videoSrc` is set. */
  children?: React.ReactNode
  /** Which way the tablet is held. The frame keeps the real aspect ratio either way. */
  orientation?: "landscape" | "portrait"
  /** Finish of the aluminum frame. "auto" is silver in light mode and space black in dark mode. */
  variant?: "auto" | "silver" | "black"
  /** Image shown on the screen, cropped to fill it. */
  src?: string
  /** Alternative text for `src`. */
  alt?: string
  /** Video shown on the screen: muted, looping, and paused under reduced motion. */
  videoSrc?: string
  /** Poster image for `videoSrc`. */
  poster?: string
  /**
   * Width in CSS pixels that the screen content is laid out at (1194 landscape or 834 portrait match an 11" tablet);
   * it is then scaled to fit. Omit to lay content out at the frame's actual size.
   */
  screenWidth?: number
  /** Show the status bar (time, date, Wi-Fi, battery). */
  statusBar?: boolean
  /** Time shown in the status bar. */
  time?: string
  /** Date shown next to the time. */
  date?: string
  /** Show the home indicator bar at the bottom of the screen. */
  homeIndicator?: boolean
  /** Class names for the screen element (inside the bezel). Use "dark" to give the screen its own theme. */
  screenClassName?: string
}

const SILVER =
  "[--tf-hi:color-mix(in_oklch,white_96%,black)] [--tf-mid:color-mix(in_oklch,white_82%,black)] [--tf-lo:color-mix(in_oklch,white_62%,black)]"
const BLACK =
  "[--tf-hi:color-mix(in_oklch,white_36%,black)] [--tf-mid:color-mix(in_oklch,white_18%,black)] [--tf-lo:color-mix(in_oklch,white_9%,black)]"
const BLACK_DARK =
  "dark:[--tf-hi:color-mix(in_oklch,white_36%,black)] dark:[--tf-mid:color-mix(in_oklch,white_18%,black)] dark:[--tf-lo:color-mix(in_oklch,white_9%,black)]"

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

/**
 * A modern tablet drawn in CSS: aluminum frame with a brushed highlight, thin glass bezel, front camera,
 * status bar and home indicator. Sizes use one unit (`--u`, one percent of the short side), so portrait and
 * landscape share the same proportions. Children render as the screen, laid out at a tablet resolution and scaled to fit.
 */
function TabletFrame({
  orientation = "landscape",
  variant = "auto",
  src,
  alt = "",
  videoSrc,
  poster,
  screenWidth,
  statusBar = true,
  time = "9:41 AM",
  date = "Thu Oct 1",
  homeIndicator = true,
  screenClassName,
  className,
  children,
  ...props
}: TabletFrameProps) {
  const landscape = orientation === "landscape"
  const media = !!(src || videoSrc)
  const viewportRef = useScreenScale(media ? undefined : (screenWidth ?? undefined))
  const reduceMotion = !!useReducedMotion()

  return (
    <div
      data-slot="tablet-frame"
      data-variant={variant}
      data-orientation={orientation}
      className={cn(
        "@container relative w-full select-none",
        landscape ? "aspect-[247.6/178.5] max-w-[640px] [--u:0.7209cqw]" : "aspect-[178.5/247.6] max-w-[460px] [--u:1cqw]",
        variant === "silver" && SILVER,
        variant === "black" && BLACK,
        variant === "auto" && cn(SILVER, BLACK_DARK),
        className
      )}
      {...props}
    >
      {/* Side buttons: power on the top edge, volume near the top-right of a landscape tablet. */}
      {(landscape
        ? ["top-[calc(var(--u)*-0.7)] left-[7%] h-[calc(var(--u)*1.1)] w-[4.5%] rounded-t-[0.4cqw]", "top-[calc(var(--u)*-0.7)] right-[7%] h-[calc(var(--u)*1.1)] w-[7%] rounded-t-[0.4cqw]"]
        : ["top-[calc(var(--u)*-0.7)] right-[9%] h-[calc(var(--u)*1.1)] w-[8%] rounded-t-[0.4cqw]", "right-[calc(var(--u)*-0.7)] top-[9%] h-[8%] w-[calc(var(--u)*1.1)] rounded-r-[0.4cqw]"]
      ).map((position) => (
        <span
          key={position}
          aria-hidden="true"
          className={cn("absolute bg-[linear-gradient(90deg,var(--tf-lo),var(--tf-hi)_50%,var(--tf-lo))]", position)}
        />
      ))}

      {/* Aluminum frame */}
      <div
        data-slot="tablet-frame-body"
        className="absolute inset-0 rounded-[calc(var(--u)*7.4)] bg-[linear-gradient(135deg,var(--tf-hi),var(--tf-mid)_32%,var(--tf-lo)_58%,var(--tf-mid)_82%,var(--tf-hi))] p-[calc(var(--u)*0.55)] shadow-[inset_0_0_0_0.2cqw_rgb(255_255_255/0.14),0_2.4cqw_6cqw_-1.6cqw_rgb(0_0_0/0.4),0_0.4cqw_1.2cqw_rgb(0_0_0/0.2)]"
      >
        {/* Glass bezel */}
        <div className="relative size-full rounded-[calc(var(--u)*6.9)] bg-black p-[calc(var(--u)*3.1)] shadow-[inset_0_0_0_0.25cqw_rgb(255_255_255/0.07)]">
          {/* Front camera, on the long edge */}
          <span
            aria-hidden="true"
            data-slot="tablet-frame-camera"
            className={cn(
              "absolute z-30 size-[calc(var(--u)*1.1)] rounded-full bg-[radial-gradient(circle_at_35%_35%,rgb(90_110_200/0.55),rgb(255_255_255/0.05)_50%,transparent_72%)] ring-[0.18cqw] ring-white/10",
              landscape ? "top-[calc(var(--u)*1)] left-1/2 -translate-x-1/2" : "top-1/2 left-[calc(var(--u)*1)] -translate-y-1/2"
            )}
          />
          <div
            data-slot="tablet-frame-screen"
            className={cn(
              "relative isolate flex size-full flex-col overflow-hidden rounded-[calc(var(--u)*4.4)] bg-background text-foreground",
              screenClassName
            )}
          >
            {media ? (
              videoSrc ? (
                <video
                  data-slot="tablet-frame-video"
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
                <img data-slot="tablet-frame-image" className="absolute inset-0 size-full object-cover" src={src} alt={alt} />
              )
            ) : null}
            {statusBar && (
              <div
                data-slot="tablet-frame-status-bar"
                className="relative z-20 flex h-[calc(var(--u)*4.6)] shrink-0 items-center justify-between px-[calc(var(--u)*4.6)] text-[calc(var(--u)*1.9)] font-semibold tracking-tight text-foreground"
              >
                <span className="flex gap-[calc(var(--u)*1.4)] tabular-nums">
                  <span>{time}</span>
                  <span className="font-medium opacity-80">{date}</span>
                </span>
                <span aria-hidden="true" className="flex items-center gap-[calc(var(--u)*1.1)]">
                  <svg viewBox="0 0 16 12" className="h-[calc(var(--u)*1.8)]" fill="currentColor">
                    <path d="M8 2.2c2.4 0 4.6.9 6.2 2.5l1.3-1.3A10.6 10.6 0 0 0 8 .4 10.6 10.6 0 0 0 .5 3.4l1.3 1.3A8.8 8.8 0 0 1 8 2.2Z" />
                    <path d="M8 5.8c1.4 0 2.7.5 3.7 1.4L13 5.9A7 7 0 0 0 8 4a7 7 0 0 0-5 1.9l1.3 1.3c1-.9 2.3-1.4 3.7-1.4Z" />
                    <path d="M8 9.3c.5 0 1 .2 1.3.5L8 11.6 6.7 9.8c.3-.3.8-.5 1.3-.5Z" />
                  </svg>
                  <span className="text-[calc(var(--u)*1.7)] font-medium opacity-80">100%</span>
                  <svg viewBox="0 0 27 13" className="h-[calc(var(--u)*1.9)]">
                    <rect x="0.5" y="0.5" width="23" height="12" rx="3.6" fill="none" stroke="currentColor" strokeOpacity="0.4" />
                    <rect x="2" y="2" width="20" height="9" rx="2.2" fill="currentColor" />
                    <path d="M25 4.5v4c.8-.3 1.4-1.1 1.4-2s-.6-1.7-1.4-2Z" fill="currentColor" fillOpacity="0.45" />
                  </svg>
                </span>
              </div>
            )}
            {!media && (
              <div ref={viewportRef} data-slot="tablet-frame-content" className="relative min-h-0 flex-1">
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
            {homeIndicator && (
              <span
                aria-hidden="true"
                data-slot="tablet-frame-home-indicator"
                className="pointer-events-none absolute bottom-[calc(var(--u)*1.2)] left-1/2 z-30 h-[calc(var(--u)*0.7)] w-[calc(var(--u)*18)] -translate-x-1/2 rounded-full bg-foreground/85"
              />
            )}
            {/* Glass reflection */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-40 bg-[linear-gradient(115deg,rgb(255_255_255/0.07)_0%,rgb(255_255_255/0.015)_34%,transparent_34.2%)]"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export { TabletFrame, type TabletFrameProps }
