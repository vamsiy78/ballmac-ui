// Ballmac UI: Aurora Background. https://ui.ballmac.com/components/aurora-background
"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type AuroraBackgroundProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Colors of the light, from left to right. Any CSS colors or var(). */
  colors?: string[]
  /** Seconds for one slow drift of the light. Higher is calmer. */
  duration?: number
  /** Overall strength of the light (0–1). */
  intensity?: number
  /** Blur radius of the light in pixels. */
  blur?: number
  /** Draw fine vertical curtains through the light, like a real aurora. */
  curtains?: boolean
  /** Fade the aurora out toward the bottom and sides with an elliptical mask. */
  radialMask?: boolean
}

// Where each light sits and how it drifts: [left %, top %, width %, drift x %, drift y %, scale].
const lights = [
  [-10, -14, 62, 14, 8, 1.15],
  [20, -22, 58, -10, 12, 1.2],
  [46, -16, 60, 12, 6, 1.1],
  [68, -24, 52, -14, 10, 1.25],
] as const

function AuroraBackground({
  colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-4)", "var(--chart-1)"],
  duration = 22,
  intensity = 0.75,
  blur = 64,
  curtains = true,
  radialMask = true,
  className,
  style,
  ...props
}: AuroraBackgroundProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const root = rootRef.current
    if (!root || typeof root.animate !== "function") return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const animations: Animation[] = []
    root.querySelectorAll<HTMLElement>("[data-slot=aurora-light]").forEach((node, i) => {
      const [, , , dx, dy, scale] = lights[i % lights.length]!
      animations.push(
        node.animate(
          [
            { transform: "translate3d(0, 0, 0) scale(1) rotate(0deg)" },
            { transform: `translate3d(${dx}%, ${dy}%, 0) scale(${scale}) rotate(${i % 2 ? -8 : 8}deg)` },
          ],
          {
            duration: duration * 1000 * (0.8 + i * 0.15),
            delay: -i * 3000,
            direction: "alternate",
            iterations: Infinity,
            easing: "cubic-bezier(0.45, 0, 0.55, 1)",
          }
        )
      )
    })
    const rays = root.querySelector<HTMLElement>("[data-slot=aurora-curtains]")
    if (rays) {
      animations.push(
        rays.animate([{ backgroundPosition: "0% 0%" }, { backgroundPosition: "200% 0%" }], {
          duration: duration * 2500,
          iterations: Infinity,
          easing: "linear",
        })
      )
    }
    let visible = true
    const sync = () => {
      for (const a of animations) {
        if (visible && !document.hidden) a.play()
        else a.pause()
      }
    }
    const io = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true
      sync()
    })
    io.observe(root)
    document.addEventListener("visibilitychange", sync)
    return () => {
      io.disconnect()
      document.removeEventListener("visibilitychange", sync)
      for (const a of animations) a.cancel()
    }
  }, [duration, colors.length, curtains])

  const mask = radialMask ? "radial-gradient(ellipse 100% 80% at 50% 0%, black 35%, transparent 85%)" : undefined

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      data-slot="aurora-background"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      style={{ maskImage: mask, WebkitMaskImage: mask, ...style }}
      {...props}
    >
      <div
        className="absolute -inset-[10%] will-change-transform"
        style={{ filter: `blur(${blur}px) saturate(1.2)`, opacity: intensity }}
      >
        {colors.map((color, i) => {
          const [left, top, width] = lights[i % lights.length]!
          return (
            <span
              key={i}
              data-slot="aurora-light"
              className="absolute block aspect-[1.6/1] rounded-full"
              style={{
                left: `${left + (i >= lights.length ? 10 : 0)}%`,
                top: `${top}%`,
                width: `${width}%`,
                background: `radial-gradient(closest-side, ${color}, color-mix(in oklch, ${color} 40%, transparent) 55%, transparent)`,
              }}
            />
          )
        })}
      </div>
      {curtains && (
        <div
          data-slot="aurora-curtains"
          className="absolute -inset-[5%] opacity-60 blur-[6px]"
          style={{
            // Stripes of the page color cut soft vertical curtains through the light.
            backgroundImage:
              "repeating-linear-gradient(98deg, var(--background) 0%, var(--background) 4%, transparent 7%, transparent 9%, var(--background) 13%)",
            backgroundSize: "200% 100%",
            maskImage: "linear-gradient(to bottom, black, transparent 85%)",
            WebkitMaskImage: "linear-gradient(to bottom, black, transparent 85%)",
          }}
        />
      )}
    </div>
  )
}

export { AuroraBackground, type AuroraBackgroundProps }
