"use client"

import * as React from "react"

/**
 * A page-sized thumbnail: lays the page out at desktop width, scales it to the card's width and crops it to `height`.
 * Nothing mounts until the card is near the screen and the browser is idle, so a long gallery never competes with the first paint.
 * Pass `frame` (a /preview/<name> address) to show the page in a lazy iframe instead of rendering it into this document:
 * Pro previews are rendered on the server, and an iframe keeps their markup out of the gallery's HTML.
 */
export function PageThumb({ children, frame, title, width = 1280, height, rootMargin = "400px" }: { children?: React.ReactNode; frame?: string; title: string; width?: number; height: number; rootMargin?: string }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [shown, setShown] = React.useState(false)
  const [scale, setScale] = React.useState(0.5)

  React.useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setScale(el.clientWidth / width || 0.5)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [width])

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    let idle = 0
    let timer = 0
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return
        io.disconnect()
        // Mount when the browser is idle (or after a moment), so heavy previews never block the first interaction.
        if (typeof window.requestIdleCallback === "function") idle = window.requestIdleCallback(() => setShown(true), { timeout: 1200 })
        else timer = window.setTimeout(() => setShown(true), 200)
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
    <div ref={ref} className="bg-background pointer-events-none relative overflow-hidden" style={{ height }} inert>
      {shown ? (
        frame ? (
          <iframe
            src={frame}
            title={title}
            loading="lazy"
            tabIndex={-1}
            className="absolute top-0 left-0 border-0"
            style={{ width, height: height / scale, transform: `scale(${scale})`, transformOrigin: "top left" }}
          />
        ) : (
          <div style={{ width, transform: `scale(${scale})`, transformOrigin: "top left" }}>{children}</div>
        )
      ) : null}
    </div>
  )
}
