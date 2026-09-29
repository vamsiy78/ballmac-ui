"use client"

import * as React from "react"

/**
 * Lays a demo out at its design width (the preview stage it was made for), then scales it so the
 * demo itself, not the design box, fits the container with some breathing room. Measuring the
 * rendered demo keeps wide demos from touching the card edges and letterboxing.
 */
export function FitPreview({
  children,
  width = 720,
  height = 480,
  inset = 0.08,
}: {
  children: React.ReactNode
  width?: number
  height?: number
  /** Share of the container kept free on each side. */
  inset?: number
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const stage = React.useRef<HTMLDivElement>(null)
  const [scale, setScale] = React.useState<number | null>(null)
  React.useLayoutEffect(() => {
    const el = ref.current
    const box = stage.current
    if (!el || !box) return
    const update = () => {
      const demo = box.firstElementChild as HTMLElement | null
      // Layout sizes ignore the transform, so this is the demo's natural size.
      const w = Math.max(1, demo?.offsetWidth ?? width)
      const h = Math.max(1, demo?.offsetHeight ?? height)
      const free = 1 - inset * 2
      setScale(Math.min(1, (el.clientWidth * free) / w, (el.clientHeight * free) / h))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    if (box.firstElementChild) ro.observe(box.firstElementChild)
    return () => ro.disconnect()
  }, [width, height, inset])
  return (
    <div ref={ref} className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <div
        ref={stage}
        className="flex shrink-0 items-center justify-center"
        style={{ width, minHeight: height, transform: `scale(${scale ?? 0.5})`, opacity: scale === null ? 0 : 1, transition: "opacity 200ms" }}
      >
        {children}
      </div>
    </div>
  )
}

/** Lays a page out at desktop width and scales it to the container's width (top-left aligned). */
export function FitWidth({ children, width = 1280 }: { children: React.ReactNode; width?: number }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [scale, setScale] = React.useState<number | null>(null)
  React.useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setScale(el.clientWidth / width)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [width])
  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 overflow-hidden" inert>
      <div style={{ width, transform: `scale(${scale ?? 0.5})`, transformOrigin: "top left", opacity: scale === null ? 0 : 1, transition: "opacity 200ms" }}>
        {children}
      </div>
    </div>
  )
}
