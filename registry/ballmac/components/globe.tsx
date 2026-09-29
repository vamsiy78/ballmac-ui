// Ballmac UI: Globe. https://ui.ballmac.com/components/globe
"use client"

import * as React from "react"
import createGlobe from "cobe"

import { cn } from "@/lib/utils"
import { cssColorToRgba, observeTheme } from "@/lib/ballmac/color"

type GlobeMarker = {
  /** [latitude, longitude] in degrees. */
  location: [number, number]
  /** Dot size, roughly 0.02–0.1. */
  size: number
}

type GlobeProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Points drawn on the globe, such as regions or offices. */
  markers?: GlobeMarker[]
  /** Color of the land dots. A CSS variable name ("--muted-foreground") or any CSS color. */
  baseColor?: string
  /** Color of the markers. */
  markerColor?: string
  /** Color of the atmosphere glow around the edge. */
  glowColor?: string
  /** Radians per frame of automatic rotation. Off under reduced motion. */
  speed?: number
  /** Starting longitude rotation in radians. */
  phi?: number
  /** Tilt toward the viewer in radians. */
  theta?: number
  /** Brightness of land dots (cobe mapBrightness). */
  mapBrightness?: number
  /** Number of land dots sampled on the sphere; higher is finer and slower. */
  mapSamples?: number
  /** Let people rotate the globe by dragging or with the arrow keys. */
  interactive?: boolean
  /** Accessible description of what the globe shows. */
  label?: string
}

const TAU = Math.PI * 2

/** True when the page background is dark, so the globe switches to its dark shading. */
function isDarkSurface(element: Element) {
  const [r, g, b] = cssColorToRgba(element, "--background")
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.5
}

function Globe({
  markers = [],
  baseColor,
  markerColor = "--chart-1",
  glowColor,
  speed = 0.0032,
  phi = 0,
  theta = 0.28,
  mapBrightness,
  mapSamples = 16000,
  interactive = true,
  label = "Rotating globe",
  className,
  ...props
}: GlobeProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  // Rotation lives in refs so pointer input never re-renders the component.
  const motion = React.useRef({ phi, theta, velocity: 0, thetaVelocity: 0, dragging: false, lastX: 0, lastY: 0 })
  const [ready, setReady] = React.useState(false)
  const [themeKey, setThemeKey] = React.useState(0)
  const markersKey = JSON.stringify(markers)

  React.useEffect(() => observeTheme(() => setThemeKey((k) => k + 1)), [])

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const dark = isDarkSurface(canvas)
    const rgb = (color: string) => cssColorToRgba(canvas, color).slice(0, 3) as [number, number, number]
    const base = rgb(baseColor ?? (dark ? "--muted-foreground" : "--background"))
    // Default glow: a soft tint of --chart-1, dimmed on dark surfaces and lifted toward the page on light ones.
    const tint = rgb("--chart-1")
    const page = rgb("--background")
    const glow = glowColor
      ? rgb(glowColor)
      : (tint.map((c, i) => (dark ? c * 0.6 : page[i]! * 0.75 + c * 0.25)) as [number, number, number])
    const state = motion.current
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let width = canvas.offsetWidth

    let globe: ReturnType<typeof createGlobe> | null = null
    let started = false
    let visible = false
    let firstFrame = true

    const start = () => {
      if (started) return
      started = true
      width = canvas.offsetWidth
      try {
        globe = createGlobe(canvas, {
          devicePixelRatio: dpr,
          width: width * dpr,
          height: width * dpr,
          phi: state.phi,
          theta: state.theta,
          dark: dark ? 1 : 0,
          diffuse: dark ? 1.4 : 1.1,
          mapSamples,
          mapBrightness: mapBrightness ?? (dark ? 5 : 1.6),
          mapBaseBrightness: dark ? 0.02 : 0,
          baseColor: dark ? base.map((c) => c * 0.55) as [number, number, number] : base,
          // cobe renders markers darker on light globes; lift them toward white to keep the token hue readable.
          markerColor: dark ? rgb(markerColor) : (rgb(markerColor).map((c) => c * 0.85 + 0.15) as [number, number, number]),
          glowColor: glow,
          opacity: dark ? 0.9 : 1,
          markers: JSON.parse(markersKey) as GlobeMarker[],
          onRender: (frame) => {
            if (!state.dragging) {
              if (!reduceMotion) state.phi += speed
              state.phi += state.velocity
              state.velocity *= 0.94
              // Tilt springs back toward its resting angle.
              state.thetaVelocity += (theta - state.theta) * 0.02
              state.thetaVelocity *= 0.82
              state.theta += state.thetaVelocity
            }
            state.phi %= TAU
            frame.phi = state.phi
            frame.theta = state.theta
            frame.width = width * dpr
            frame.height = width * dpr
            if (firstFrame) {
              firstFrame = false
              setReady(true)
            }
          },
        })
        globe.toggle(visible && !document.hidden)
      } catch {
        // No WebGL (old browsers, tests): leave the empty, labelled canvas.
      }
    }

    const sync = () => globe?.toggle(visible && !document.hidden)
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? true
        if (visible) start()
        sync()
      },
      { rootMargin: "120px" }
    )
    io.observe(canvas)
    const ro = new ResizeObserver(() => {
      width = canvas.offsetWidth
    })
    ro.observe(canvas)
    document.addEventListener("visibilitychange", sync)
    return () => {
      io.disconnect()
      ro.disconnect()
      document.removeEventListener("visibilitychange", sync)
      globe?.destroy()
    }
  }, [themeKey, markersKey, baseColor, markerColor, glowColor, speed, theta, mapBrightness, mapSamples])

  const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!interactive) return
    const state = motion.current
    state.dragging = true
    state.velocity = 0
    state.lastX = event.clientX
    state.lastY = event.clientY
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const state = motion.current
    if (!state.dragging) return
    const size = event.currentTarget.offsetWidth || 1
    const dx = ((event.clientX - state.lastX) / size) * Math.PI
    const dy = ((event.clientY - state.lastY) / size) * Math.PI
    state.lastX = event.clientX
    state.lastY = event.clientY
    state.phi += dx
    // Blend in the latest movement so a flick carries momentum after release.
    state.velocity = state.velocity * 0.5 + dx * 0.5
    state.theta = Math.min(Math.max(state.theta + dy * 0.5, -0.6), 0.9)
  }
  const onPointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    motion.current.dragging = false
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }
  const onKeyDown = (event: React.KeyboardEvent<HTMLCanvasElement>) => {
    if (!interactive) return
    const state = motion.current
    if (event.key === "ArrowLeft") state.velocity -= 0.04
    else if (event.key === "ArrowRight") state.velocity += 0.04
    else if (event.key === "ArrowUp") state.thetaVelocity -= 0.04
    else if (event.key === "ArrowDown") state.thetaVelocity += 0.04
    else return
    event.preventDefault()
  }

  return (
    <div data-slot="globe" className={cn("relative mx-auto aspect-square w-full max-w-[600px]", className)} {...props}>
      <canvas
        ref={canvasRef}
        data-slot="globe-canvas"
        role="img"
        aria-label={interactive ? `${label}. Drag or use the arrow keys to rotate.` : label}
        tabIndex={interactive ? 0 : undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        className={cn(
          "size-full rounded-full opacity-0 outline-none transition-opacity duration-700 ease-out [contain:layout_paint_size] focus-visible:ring-[3px] focus-visible:ring-ring/50",
          ready && "opacity-100",
          interactive && "cursor-grab touch-pan-y active:cursor-grabbing"
        )}
      />
    </div>
  )
}

export { Globe, type GlobeProps, type GlobeMarker }
