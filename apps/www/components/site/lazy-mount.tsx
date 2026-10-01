"use client"

import * as React from "react"

/**
 * Mounts children only once the wrapper comes near the viewport. Keeps long galleries of live
 * previews (canvases, WebGL, springs) from hydrating and animating all at once on page load.
 */
export function LazyMount({
  children,
  className,
  style,
  rootMargin = "300px",
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  rootMargin?: string
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [shown, setShown] = React.useState(false)
  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    let idle = 0
    let timer = 0
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect()
          // Mount when the browser is idle, so heavy previews never block the first interaction.
          if (typeof window.requestIdleCallback === "function") idle = window.requestIdleCallback(() => setShown(true), { timeout: 1200 })
          else timer = window.setTimeout(() => setShown(true), 200)
        }
      },
      { rootMargin }
    )
    io.observe(el)
    return () => {
      io.disconnect()
      if (idle) window.cancelIdleCallback(idle)
      if (timer) window.clearTimeout(timer)
    }
  }, [rootMargin])
  return (
    <div ref={ref} className={className} style={style}>
      {shown ? children : null}
    </div>
  )
}
