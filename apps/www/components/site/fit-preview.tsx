"use client"

import * as React from "react"

/**
 * Renders a demo at its design size (the preview stage it was made for) and scales it down
 * to fit the container, so catalog thumbnails match the component page exactly.
 */
export function FitPreview({ children, width = 720, height = 480 }: { children: React.ReactNode; width?: number; height?: number }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [scale, setScale] = React.useState<number | null>(null)
  React.useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setScale(Math.min(1, el.clientWidth / width, el.clientHeight / height))
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [width, height])
  return (
    <div ref={ref} className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <div
        className="flex shrink-0 items-center justify-center"
        style={{ width, height, transform: `scale(${scale ?? 0.5})`, opacity: scale === null ? 0 : 1, transition: "opacity 200ms" }}
      >
        {children}
      </div>
    </div>
  )
}
