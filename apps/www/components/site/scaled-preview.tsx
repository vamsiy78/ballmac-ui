import type { ReactNode } from "react"

/** Renders children at desktop width and scales them down, for catalog thumbnails. */
export function ScaledPreview({ children, width = 1280, scale = 0.3, height = 210 }: { children: ReactNode; width?: number; scale?: number; height?: number }) {
  return (
    <div className="bg-background pointer-events-none relative overflow-hidden" style={{ height }} inert>
      <div style={{ width, transform: `scale(${scale})`, transformOrigin: "top left" }}>{children}</div>
    </div>
  )
}
