"use client"

import * as React from "react"

const KEY = "bm-sidebar-scroll"

/**
 * The docs sidebar's scroll container. Remembers its position for the tab, so it survives
 * remounts and full reloads instead of jumping back to the top after you pick a page.
 */
export function SidebarScroll({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null)
  // Layout effect: restore before paint, and before the sidebar's own effect nudges the active link into view.
  React.useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    try {
      const saved = Number(sessionStorage.getItem(KEY))
      if (saved > 0) el.scrollTop = saved
    } catch {
      // Storage unavailable: start at the top.
    }
  }, [])
  return (
    <div
      ref={ref}
      className={className}
      onScroll={(e) => {
        try {
          sessionStorage.setItem(KEY, String(Math.round(e.currentTarget.scrollTop)))
        } catch {
          // Storage unavailable: nothing to remember.
        }
      }}
    >
      {children}
    </div>
  )
}
