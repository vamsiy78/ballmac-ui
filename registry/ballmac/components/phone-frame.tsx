// Ballmac UI: Phone Frame. https://ui.ballmac.com/components/phone-frame
"use client"

import * as React from "react"
import { useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

type PhoneFrameProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Screen content, laid out below the status bar. Ignored when `src` or `videoSrc` is set. */
  children?: React.ReactNode
  /** Finish of the frame. "auto" is natural titanium in light mode and black titanium in dark mode. */
  variant?: "auto" | "natural" | "black"
  /** Image shown on the screen, cropped to fill it (status bar and island stay on top). */
  src?: string
  /** Alternative text for `src`. */
  alt?: string
  /** Video shown on the screen: muted, looping, and paused under reduced motion. */
  videoSrc?: string
  /** Poster image for `videoSrc`. */
  poster?: string
  /**
   * Width in CSS pixels that the screen content is laid out at (393 matches a 6.1" phone); it is
   * then scaled to fit. Omit to lay content out at the frame's actual size.
   */
  screenWidth?: number
  /** Show the status bar (time, signal, Wi-Fi, battery). */
  statusBar?: boolean
  /** Time shown in the status bar. */
  time?: string
  /** Show the home indicator bar at the bottom of the screen. */
  homeIndicator?: boolean
  /** Class names for the screen element (inside the bezel). Use "dark" to give the screen its own theme. */
  screenClassName?: string
}

const NATURAL =
  "[--pf-hi:color-mix(in_oklch,white_92%,black)] [--pf-mid:color-mix(in_oklch,white_74%,black)] [--pf-lo:color-mix(in_oklch,white_56%,black)] [--pf-btn:color-mix(in_oklch,white_66%,black)]"
const BLACK =
  "[--pf-hi:color-mix(in_oklch,white_42%,black)] [--pf-mid:color-mix(in_oklch,white_20%,black)] [--pf-lo:color-mix(in_oklch,white_10%,black)] [--pf-btn:color-mix(in_oklch,white_24%,black)]"
const BLACK_DARK =
  "dark:[--pf-hi:color-mix(in_oklch,white_42%,black)] dark:[--pf-mid:color-mix(in_oklch,white_20%,black)] dark:[--pf-lo:color-mix(in_oklch,white_10%,black)] dark:[--pf-btn:color-mix(in_oklch,white_24%,black)]"

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

function StatusBar({ time }: { time: string }) {
  return (
    <div
      data-slot="phone-frame-status-bar"
      className="relative z-20 flex h-[13cqw] shrink-0 items-center justify-between px-[8.5cqw] pt-[1.2cqw] text-[4.1cqw] font-semibold tracking-tight text-foreground"
    >
      <span className="w-[20cqw] text-center tabular-nums">{time}</span>
      <span aria-hidden="true" className="flex items-center gap-[1.4cqw]">
        {/* Cellular */}
        <svg viewBox="0 0 18 12" className="h-[2.9cqw]" fill="currentColor">
          <rect x="0" y="8" width="3" height="4" rx="0.8" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="0.8" />
          <rect x="10" y="3" width="3" height="9" rx="0.8" />
          <rect x="15" y="0" width="3" height="12" rx="0.8" />
        </svg>
        {/* Wi-Fi */}
        <svg viewBox="0 0 16 12" className="h-[2.9cqw]" fill="currentColor">
          <path d="M8 2.2c2.4 0 4.6.9 6.2 2.5l1.3-1.3A10.6 10.6 0 0 0 8 .4 10.6 10.6 0 0 0 .5 3.4l1.3 1.3A8.8 8.8 0 0 1 8 2.2Z" />
          <path d="M8 5.8c1.4 0 2.7.5 3.7 1.4L13 5.9A7 7 0 0 0 8 4a7 7 0 0 0-5 1.9l1.3 1.3c1-.9 2.3-1.4 3.7-1.4Z" />
          <path d="M8 9.3c.5 0 1 .2 1.3.5L8 11.6 6.7 9.8c.3-.3.8-.5 1.3-.5Z" />
        </svg>
        {/* Battery */}
        <svg viewBox="0 0 27 13" className="h-[3.1cqw]">
          <rect x="0.5" y="0.5" width="23" height="12" rx="3.6" fill="none" stroke="currentColor" strokeOpacity="0.4" />
          <rect x="2" y="2" width="17" height="9" rx="2.2" fill="currentColor" />
          <path d="M25 4.5v4c.8-.3 1.4-1.1 1.4-2s-.6-1.7-1.4-2Z" fill="currentColor" fillOpacity="0.45" />
        </svg>
      </span>
    </div>
  )
}

function PhoneFrame({
  variant = "auto",
  src,
  alt = "",
  videoSrc,
  poster,
  screenWidth,
  statusBar = true,
  time = "9:41",
  homeIndicator = true,
  screenClassName,
  className,
  children,
  ...props
}: PhoneFrameProps) {
  const media = !!(src || videoSrc)
  const viewportRef = useScreenScale(media ? undefined : screenWidth)
  const reduceMotion = !!useReducedMotion()

  return (
    <div
      data-slot="phone-frame"
      data-variant={variant}
      className={cn(
        "@container relative aspect-[71.6/146.6] w-full max-w-[320px] select-none",
        variant === "natural" && NATURAL,
        variant === "black" && BLACK,
        variant === "auto" && cn(NATURAL, BLACK_DARK),
        className
      )}
      {...props}
    >
      {/* Buttons: action and volume on the left, side button on the right. */}
      {[
        "left-[-0.9cqw] top-[18%] h-[5.2%] rounded-l-[0.6cqw]",
        "left-[-0.9cqw] top-[26.5%] h-[8.6%] rounded-l-[0.6cqw]",
        "left-[-0.9cqw] top-[37%] h-[8.6%] rounded-l-[0.6cqw]",
        "right-[-0.9cqw] top-[29%] h-[13.5%] rounded-r-[0.6cqw]",
      ].map((position) => (
        <span
          key={position}
          aria-hidden="true"
          className={cn(
            "absolute w-[1.4cqw] bg-[linear-gradient(90deg,var(--pf-lo),var(--pf-btn)_40%,var(--pf-hi)_55%,var(--pf-lo))]",
            position
          )}
        />
      ))}

      {/* Titanium band */}
      <div
        data-slot="phone-frame-body"
        className="absolute inset-0 rounded-[16.5cqw] bg-[linear-gradient(135deg,var(--pf-hi),var(--pf-mid)_30%,var(--pf-lo)_55%,var(--pf-mid)_80%,var(--pf-hi))] p-[1.25cqw] shadow-[inset_0_0_0_0.25cqw_rgb(255_255_255/0.12),0_2cqw_6cqw_-1cqw_rgb(0_0_0/0.35),0_0.5cqw_1.2cqw_rgb(0_0_0/0.18)]"
      >
        {/* Black border glass */}
        <div className="size-full rounded-[15.3cqw] bg-black p-[3.1cqw] shadow-[inset_0_0_0_0.35cqw_rgb(255_255_255/0.07)]">
          <div
            data-slot="phone-frame-screen"
            className={cn(
              "relative isolate flex size-full flex-col overflow-hidden rounded-[12.4cqw] bg-background text-foreground",
              screenClassName
            )}
          >
            {media ? (
              videoSrc ? (
                <video
                  data-slot="phone-frame-video"
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
                <img data-slot="phone-frame-image" className="absolute inset-0 size-full object-cover" src={src} alt={alt} />
              )
            ) : null}
            {statusBar && <StatusBar time={time} />}
            {!media && (
              <div ref={viewportRef} data-slot="phone-frame-content" className="relative min-h-0 flex-1">
                {screenWidth ? (
                  <div
                    className="absolute top-0 left-0 origin-top-left"
                    style={{
                      width: screenWidth,
                      height: "calc(100% / var(--screen-scale, 1))",
                      transform: "scale(var(--screen-scale, 1))",
                    }}
                  >
                    {children}
                  </div>
                ) : (
                  children
                )}
              </div>
            )}
            {/* Dynamic Island */}
            <span
              aria-hidden="true"
              data-slot="phone-frame-island"
              className="pointer-events-none absolute top-[2.6cqw] left-1/2 z-30 flex h-[8.8cqw] w-[30cqw] -translate-x-1/2 items-center justify-end rounded-full bg-black pr-[2.6cqw]"
            >
              <span className="size-[3cqw] rounded-full bg-[radial-gradient(circle_at_35%_35%,rgb(90_110_200/0.6),rgb(255_255_255/0.05)_50%,transparent_72%)] ring-[0.3cqw] ring-white/5" />
            </span>
            {homeIndicator && (
              <span
                aria-hidden="true"
                data-slot="phone-frame-home-indicator"
                className="pointer-events-none absolute bottom-[2.2cqw] left-1/2 z-30 h-[1.35cqw] w-[36cqw] -translate-x-1/2 rounded-full bg-foreground/85"
              />
            )}
            {/* Glass reflection */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-40 bg-[linear-gradient(120deg,rgb(255_255_255/0.08)_0%,rgb(255_255_255/0.02)_36%,transparent_36.2%)]"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export { PhoneFrame, type PhoneFrameProps }
