"use client"

import * as React from "react"

import { enqueueMount } from "@/lib/mount-queue"

/**
 * Mounts children only once the wrapper comes near the viewport. Keeps long galleries of live
 * previews (canvases, WebGL, springs) from hydrating and animating all at once on page load.
 */
export function LazyMount({
  children,
  className,
  style,
  rootMargin = "150px",
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
    let cancel = () => {}
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return
        io.disconnect()
        // Mount in turn, after the page has loaded, so heavy previews never block the first interaction.
        cancel = enqueueMount(() => setShown(true))
      },
      { rootMargin }
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancel()
    }
  }, [rootMargin])
  return (
    <div ref={ref} className={className} style={style}>
      {shown ? children : null}
    </div>
  )
}
