"use client"

import * as React from "react"

/** A looping background video (the footer's meadow, the home hero). It plays only while it is on screen, and not at all when the visitor asks for less motion (the still frame stays). */
export function FooterVideo({ src, poster, className = "bm-footer__video" }: { src: string; poster: string; className?: string }) {
  const ref = React.useRef<HTMLVideoElement>(null)

  React.useEffect(() => {
    const video = ref.current
    if (!video) return
    const quiet = window.matchMedia("(prefers-reduced-motion: reduce)")
    const io = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting && !quiet.matches) void video.play().catch(() => {})
      else video.pause()
    })
    io.observe(video)
    return () => io.disconnect()
  }, [])

  return <video ref={ref} className={className} src={src} poster={poster} muted loop playsInline preload="none" />
}
