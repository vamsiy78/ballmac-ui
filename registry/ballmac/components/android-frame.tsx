// Ballmac UI: Android Frame. https://ui.ballmac.com/components/android-frame
"use client"

import * as React from "react"
import { useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

type AndroidFrameProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Screen content, laid out below the status bar. Ignored when `src` or `videoSrc` is set. */
  children?: React.ReactNode
  /** Finish of the frame. "auto" is porcelain in light mode and obsidian in dark mode. */
  variant?: "auto" | "porcelain" | "obsidian" | "sage"
  /** Image shown on the screen, cropped to fill it. */
  src?: string
  /** Alternative text for `src`. */
  alt?: string
  /** Video shown on the screen: muted, looping, and paused under reduced motion. */
  videoSrc?: string
  /** Poster image for `videoSrc`. */
  poster?: string
  /**
   * Width in CSS pixels that the screen content is laid out at (412 matches a 6.3" phone);
   * it is then scaled to fit. Omit to lay content out at the frame's actual size.
   */
  screenWidth?: number
  /** Show the status bar (time, signal, Wi-Fi, battery). */
  statusBar?: boolean
  /** Time shown in the status bar. */
  time?: string
  /** System navigation: the gesture pill, three buttons, or nothing. */
  navigation?: "gesture" | "buttons" | "none"
  /** Class names for the screen element (inside the bezel). Use "dark" to give the screen its own theme. */
  screenClassName?: string
}

const PORCELAIN =
  "[--af-hi:color-mix(in_oklch,white_95%,black)] [--af-mid:color-mix(in_oklch,white_80%,black)] [--af-lo:color-mix(in_oklch,white_62%,black)]"
const OBSIDIAN =
  "[--af-hi:color-mix(in_oklch,white_34%,black)] [--af-mid:color-mix(in_oklch,white_17%,black)] [--af-lo:color-mix(in_oklch,white_8%,black)]"
const OBSIDIAN_DARK =
  "dark:[--af-hi:color-mix(in_oklch,white_34%,black)] dark:[--af-mid:color-mix(in_oklch,white_17%,black)] dark:[--af-lo:color-mix(in_oklch,white_8%,black)]"
const SAGE =
  "[--af-hi:color-mix(in_oklch,var(--chart-2)_30%,white)] [--af-mid:color-mix(in_oklch,var(--chart-2)_45%,white)] [--af-lo:color-mix(in_oklch,var(--chart-2)_62%,black)]"

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
 * A modern Android phone drawn in CSS: flat satin frame, thin even bezels, centered punch-hole camera, Material-style
 * status bar and a gesture or button navigation bar. Children render as the screen, laid out at a phone resolution and scaled to fit.
 */
function AndroidFrame({
  variant = "auto",
  src,
  alt = "",
  videoSrc,
  poster,
  screenWidth,
  statusBar = true,
  time = "9:41",
  navigation = "gesture",
  screenClassName,
  className,
  children,
  ...props
}: AndroidFrameProps) {
  const media = !!(src || videoSrc)
  const viewportRef = useScreenScale(media ? undefined : screenWidth)
  const reduceMotion = !!useReducedMotion()

  return (
    <div
      data-slot="android-frame"
      data-variant={variant}
      className={cn(
        "@container relative aspect-[72/152.8] w-full max-w-[320px] select-none",
        variant === "porcelain" && PORCELAIN,
        variant === "obsidian" && OBSIDIAN,
        variant === "sage" && SAGE,
        variant === "auto" && cn(PORCELAIN, OBSIDIAN_DARK),
        className
      )}
      {...props}
    >
      {/* Power and volume on the right edge. */}
      {["right-[-0.9cqw] top-[21%] h-[7.5%] rounded-r-[0.6cqw]", "right-[-0.9cqw] top-[31.5%] h-[13%] rounded-r-[0.6cqw]"].map((position) => (
        <span
          key={position}
          aria-hidden="true"
          className={cn("absolute w-[1.4cqw] bg-[linear-gradient(90deg,var(--af-lo),var(--af-hi)_55%,var(--af-lo))]", position)}
        />
      ))}

      <div
        data-slot="android-frame-body"
        className="absolute inset-0 rounded-[13.5cqw] bg-[linear-gradient(135deg,var(--af-hi),var(--af-mid)_34%,var(--af-lo)_60%,var(--af-mid)_84%,var(--af-hi))] p-[1cqw] shadow-[inset_0_0_0_0.25cqw_rgb(255_255_255/0.14),0_2cqw_6cqw_-1cqw_rgb(0_0_0/0.35),0_0.5cqw_1.2cqw_rgb(0_0_0/0.18)]"
      >
        <div className="size-full rounded-[12.5cqw] bg-black p-[2.3cqw] shadow-[inset_0_0_0_0.3cqw_rgb(255_255_255/0.06)]">
          <div
            data-slot="android-frame-screen"
            className={cn(
              "relative isolate flex size-full flex-col overflow-hidden rounded-[10.3cqw] bg-background text-foreground",
              screenClassName
            )}
          >
            {media ? (
              videoSrc ? (
                <video
                  data-slot="android-frame-video"
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
                <img data-slot="android-frame-image" className="absolute inset-0 size-full object-cover" src={src} alt={alt} />
              )
            ) : null}
            {statusBar && (
              <div
                data-slot="android-frame-status-bar"
                className="relative z-20 flex h-[9.4cqw] shrink-0 items-center justify-between px-[7cqw] pt-[0.6cqw] text-[3.6cqw] font-medium text-foreground"
              >
                <span className="tabular-nums">{time}</span>
                <span aria-hidden="true" className="flex items-center gap-[1.5cqw]">
                  <svg viewBox="0 0 16 16" className="h-[3.4cqw]" fill="currentColor">
                    <path d="M8 13.5 15.5 3A12.6 12.6 0 0 0 8 .6 12.6 12.6 0 0 0 .5 3L8 13.5Z" />
                  </svg>
                  <svg viewBox="0 0 16 16" className="h-[3.4cqw]" fill="currentColor">
                    <path d="M16 16V0L0 16h16Z" />
                  </svg>
                  <svg viewBox="0 0 10 16" className="h-[3.6cqw]" fill="currentColor">
                    <path d="M3 0h4v1.5h1.2c.5 0 .8.4.8.8v12.9c0 .4-.3.8-.8.8H1.8a.8.8 0 0 1-.8-.8V2.3c0-.4.3-.8.8-.8H3V0Z" fillOpacity="0.35" />
                    <path d="M1 7h8v8.2c0 .4-.3.8-.8.8H1.8a.8.8 0 0 1-.8-.8V7Z" />
                  </svg>
                </span>
              </div>
            )}
            {!media && (
              <div ref={viewportRef} data-slot="android-frame-content" className="relative min-h-0 flex-1">
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
            {/* Punch-hole camera */}
            <span
              aria-hidden="true"
              data-slot="android-frame-camera"
              className="pointer-events-none absolute top-[3.4cqw] left-1/2 z-30 size-[3.4cqw] -translate-x-1/2 rounded-full bg-black ring-[0.35cqw] ring-white/5"
            >
              <span className="absolute inset-[0.8cqw] rounded-full bg-[radial-gradient(circle_at_35%_35%,rgb(90_110_200/0.5),transparent_70%)]" />
            </span>
            {navigation === "gesture" && (
              <span
                aria-hidden="true"
                data-slot="android-frame-gesture"
                className="pointer-events-none absolute bottom-[2cqw] left-1/2 z-30 h-[1.1cqw] w-[28cqw] -translate-x-1/2 rounded-full bg-foreground/80"
              />
            )}
            {navigation === "buttons" && (
              <span
                aria-hidden="true"
                data-slot="android-frame-buttons"
                className="pointer-events-none relative z-30 flex h-[11cqw] shrink-0 items-center justify-center gap-[17cqw] bg-background/80 text-foreground"
              >
                <svg viewBox="0 0 12 12" className="h-[3.4cqw]" fill="currentColor"><path d="M10 .5v11L1.5 6 10 .5Z" /></svg>
                <span className="size-[3.6cqw] rounded-full border-[0.5cqw] border-current" />
                <span className="size-[3.4cqw] rounded-[0.9cqw] border-[0.5cqw] border-current" />
              </span>
            )}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-40 bg-[linear-gradient(120deg,rgb(255_255_255/0.07)_0%,rgb(255_255_255/0.015)_36%,transparent_36.2%)]"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export { AndroidFrame, type AndroidFrameProps }
