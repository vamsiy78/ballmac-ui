// Ballmac UI: Smooth Cursor. https://ui.ballmac.com/components/smooth-cursor
"use client"

import * as React from "react"
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "motion/react"

import { cn } from "@/lib/utils"

type SmoothCursorProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** The area the custom cursor lives in. Outside it, the normal cursor returns. */
  children: React.ReactNode
  /** Your own cursor graphic. The default is an arrow that leans into the direction you are moving. */
  cursor?: React.ReactNode
  /** Hide the system cursor inside the area. Text fields always keep theirs. */
  hideNative?: boolean
  /** Stiffness of the follow spring. Lower is floatier. */
  stiffness?: number
}

const DefaultArrow = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" className="drop-shadow-[0_2px_4px_rgb(0_0_0/0.3)]">
    <path d="M4 3.2c0-.9 1-1.4 1.7-.8l17 14.2c.8.7.4 2-.7 2.1l-7.2.7-3.3 6.4c-.5.9-1.8.8-2.1-.2L4 3.2Z" className="fill-foreground stroke-background" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
)

/**
 * Replaces the pointer with a cursor that glides after the real one. Add data-cursor-label="View" to any
 * element and the cursor grows a label while it is over it. Mouse and pen only; touch is left alone.
 */
function SmoothCursor({ children, cursor, hideNative = true, stiffness = 420, className, onPointerMove, onPointerLeave, onPointerDown, onPointerUp, ...props }: SmoothCursorProps) {
  const reduce = useReducedMotion()
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const sx = useSpring(x, { stiffness, damping: 34, mass: 0.6 })
  const sy = useSpring(y, { stiffness, damping: 34, mass: 0.6 })
  const turn = useSpring(0, { stiffness: 200, damping: 22 })
  const [visible, setVisible] = React.useState(false)
  const [pressed, setPressed] = React.useState(false)
  const [label, setLabel] = React.useState<string | null>(null)
  const [overField, setOverField] = React.useState(false)
  const last = React.useRef<{ x: number; y: number } | null>(null)
  const settle = React.useRef(0)
  React.useEffect(() => () => window.clearTimeout(settle.current), [])

  return (
    <div
      data-slot="smooth-cursor"
      onPointerMove={(e) => {
        onPointerMove?.(e)
        if (e.pointerType === "touch") return
        const box = e.currentTarget.getBoundingClientRect()
        const px = e.clientX - box.left
        const py = e.clientY - box.top
        x.set(px)
        y.set(py)
        if (reduce) {
          sx.jump(px)
          sy.jump(py)
        }
        // Lean the arrow into the direction of travel, then let it settle upright when the pointer stops.
        const prev = last.current
        if (prev && !reduce) {
          turn.set(Math.max(-28, Math.min(28, (px - prev.x) * 1.4)))
          window.clearTimeout(settle.current)
          settle.current = window.setTimeout(() => turn.set(0), 110)
        }
        last.current = { x: px, y: py }
        const target = e.target as HTMLElement
        setLabel(target.closest<HTMLElement>("[data-cursor-label]")?.dataset.cursorLabel ?? null)
        setOverField(!!target.closest("input, textarea, select, [contenteditable=true], [data-cursor=native]"))
        setVisible(true)
      }}
      onPointerLeave={(e) => {
        onPointerLeave?.(e)
        setVisible(false)
        setPressed(false)
        last.current = null
      }}
      onPointerDown={(e) => {
        onPointerDown?.(e)
        if (e.pointerType !== "touch") setPressed(true)
      }}
      onPointerUp={(e) => {
        onPointerUp?.(e)
        setPressed(false)
      }}
      className={cn(
        "relative",
        hideNative && "[@media(pointer:fine)]:[&_*]:cursor-none [@media(pointer:fine)]:[&_input]:cursor-text [@media(pointer:fine)]:[&_textarea]:cursor-text [@media(pointer:fine)]:[&_[data-cursor=native]]:cursor-auto",
        className
      )}
      {...props}
    >
      {children}
      <AnimatePresence>
        {visible && !overField && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute top-0 left-0 z-50 hidden [@media(pointer:fine)]:block"
            style={{ x: sx, y: sy }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: pressed ? 0.82 : label ? 1.1 : 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <motion.div style={{ rotate: reduce ? 0 : turn, originX: 0.15, originY: 0.1 }}>{cursor ?? <DefaultArrow />}</motion.div>
            {label && (
              <motion.span
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute top-5 left-6 rounded-full bg-foreground px-2.5 py-1 text-xs font-medium whitespace-nowrap text-background shadow-md"
              >
                {label}
              </motion.span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { SmoothCursor, type SmoothCursorProps }
