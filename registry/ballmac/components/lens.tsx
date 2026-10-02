// Ballmac UI: Lens. https://ui.ballmac.com/components/lens
"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"

type LensProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** What to magnify: usually an image, but any visual content works. */
  children: React.ReactNode
  /** How much the lens enlarges what is under it. */
  zoom?: number
  /** Diameter of the lens in pixels. */
  lensSize?: number
  /** Accessible name; the keyboard instructions are added for you. */
  label?: string
}

const STEP = 24

function Lens({ children, zoom = 2.2, lensSize = 160, label, className, onPointerMove, onPointerLeave, onKeyDown, onFocus, onBlur, ...props }: LensProps) {
  const msg = useMessages()
  label ??= msg("lens.label", "Zoomable image")
  const reduce = useReducedMotion()
  const ref = React.useRef<HTMLDivElement>(null)
  const [pos, setPos] = React.useState<{ x: number; y: number } | null>(null)
  const [box, setBox] = React.useState({ w: 0, h: 0 })
  const [mode, setMode] = React.useState<"pointer" | "keyboard" | null>(null)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setBox({ w: el.offsetWidth, h: el.offsetHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const clamp = (x: number, y: number) => ({ x: Math.min(Math.max(x, 0), box.w), y: Math.min(Math.max(y, 0), box.h) })

  return (
    <div
      ref={ref}
      data-slot="lens"
      role="group"
      tabIndex={0}
      aria-label={msg("lens.moveThePointerOverIt", "{label}. Move the pointer over it, or use the arrow keys, to magnify. Escape hides the lens.", { label })}
      onPointerMove={(e) => {
        onPointerMove?.(e)
        if (e.pointerType === "touch") return
        const r = e.currentTarget.getBoundingClientRect()
        setMode("pointer")
        setPos(clamp(e.clientX - r.left, e.clientY - r.top))
      }}
      onPointerLeave={(e) => {
        onPointerLeave?.(e)
        if (mode === "pointer") {
          setPos(null)
          setMode(null)
        }
      }}
      onFocus={(e) => {
        onFocus?.(e)
        if (e.currentTarget.matches(":focus-visible") && mode !== "pointer") {
          setMode("keyboard")
          setPos((p) => p ?? { x: box.w / 2, y: box.h / 2 })
        }
      }}
      onBlur={(e) => {
        onBlur?.(e)
        if (mode === "keyboard") {
          setPos(null)
          setMode(null)
        }
      }}
      onKeyDown={(e) => {
        onKeyDown?.(e)
        const move: Record<string, [number, number]> = { ArrowLeft: [-STEP, 0], ArrowRight: [STEP, 0], ArrowUp: [0, -STEP], ArrowDown: [0, STEP] }
        if (e.key === "Escape") {
          setPos(null)
          setMode(null)
        } else if (move[e.key]) {
          e.preventDefault()
          setMode("keyboard")
          setPos((p) => {
            const base = p ?? { x: box.w / 2, y: box.h / 2 }
            return clamp(base.x + move[e.key]![0], base.y + move[e.key]![1])
          })
        }
      }}
      className={cn("relative inline-block cursor-zoom-in overflow-hidden rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50", className)}
      {...props}
    >
      {children}
      {pos && box.w > 0 && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 start-0 z-10 overflow-hidden rounded-full border-2 border-white/90 bg-background shadow-[0_12px_32px_-6px_rgb(0_0_0/0.45),inset_0_0_0_1px_rgb(0_0_0/0.15)]"
          style={{ width: lensSize, height: lensSize, x: pos.x - lensSize / 2, y: pos.y - lensSize / 2 }}
          initial={reduce ? false : { opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
        >
          {/* A second copy of the content, scaled up around the pointer. It is hidden from assistive tech and cannot be focused. */}
          <div
            inert
            className="absolute top-0 left-0 origin-top-left" // rtl-fixed: scaled from its top-left corner
            style={{
              width: box.w,
              height: box.h,
              transform: `translate(${lensSize / 2 - pos.x * zoom}px, ${lensSize / 2 - pos.y * zoom}px) scale(${zoom})`,
            }}
          >
            {children}
          </div>
          <span className="absolute inset-0 rounded-full bg-[radial-gradient(120%_120%_at_30%_15%,rgb(255_255_255/0.28),transparent_45%)]" />
        </motion.div>
      )}
    </div>
  )
}

export { Lens, type LensProps }
