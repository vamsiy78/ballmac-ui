// Ballmac UI: Spring Drawer. https://ui.ballmac.com/components/spring-drawer
"use client"

import * as React from "react"
import { AnimatePresence, animate, motion, useDragControls, useMotionValue, useReducedMotion, useTransform } from "motion/react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

type DrawerSide = "bottom" | "left" | "right"

type DrawerContextValue = {
  open: boolean
  side: DrawerSide
  snapPoints: number[]
  snap: number
  setSnap: (index: number) => void
}

const DrawerContext = React.createContext<DrawerContextValue | null>(null)

function useDrawer() {
  const ctx = React.useContext(DrawerContext)
  if (!ctx) throw new Error("Spring drawer parts must be used inside <SpringDrawer>.")
  return ctx
}

type SpringDrawerProps = {
  children: React.ReactNode
  /** Controlled open state. */
  open?: boolean
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean
  /** Called when the drawer opens or closes. */
  onOpenChange?: (open: boolean) => void
  /** Edge the drawer comes from. Only the bottom drawer has snap points. */
  side?: DrawerSide
  /** Heights the bottom drawer can rest at, as fractions of the screen from 0 to 1, smallest first. */
  snapPoints?: number[]
  /** Index of the snap point the drawer opens at. */
  defaultSnap?: number
  /** Controlled snap index. */
  snap?: number
  /** Called when the drawer settles at another snap point. */
  onSnapChange?: (index: number) => void
}

function SpringDrawer({ children, open: openProp, defaultOpen = false, onOpenChange, side = "bottom", snapPoints = [1], defaultSnap = 0, snap: snapProp, onSnapChange }: SpringDrawerProps) {
  const [openState, setOpenState] = React.useState(defaultOpen)
  const open = openProp ?? openState
  const [snapState, setSnapState] = React.useState(Math.min(defaultSnap, snapPoints.length - 1))
  const snap = Math.min(snapProp ?? snapState, snapPoints.length - 1)
  const sorted = React.useMemo(() => [...snapPoints].sort((a, b) => a - b), [snapPoints])

  const change = React.useCallback(
    (next: boolean) => {
      setOpenState(next)
      onOpenChange?.(next)
      if (next) setSnapState(Math.min(defaultSnap, sorted.length - 1))
    },
    [onOpenChange, defaultSnap, sorted.length]
  )
  const setSnap = React.useCallback(
    (index: number) => {
      const i = Math.min(Math.max(index, 0), sorted.length - 1)
      setSnapState(i)
      onSnapChange?.(i)
    },
    [onSnapChange, sorted.length]
  )

  const value = React.useMemo(() => ({ open, side, snapPoints: sorted, snap, setSnap }), [open, side, sorted, snap, setSnap])
  return (
    <DrawerContext.Provider value={value}>
      <DialogPrimitive.Root open={open} onOpenChange={change}>
        {children}
      </DialogPrimitive.Root>
    </DrawerContext.Provider>
  )
}

function SpringDrawerTrigger({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="spring-drawer-trigger" className={className} {...props} />
}

function SpringDrawerClose({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="spring-drawer-close" className={className} {...props} />
}

function SpringDrawerTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title data-slot="spring-drawer-title" className={cn("text-base leading-6 font-semibold text-foreground", className)} {...props} />
}

function SpringDrawerDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description data-slot="spring-drawer-description" className={cn("text-sm text-muted-foreground", className)} {...props} />
}

function SpringDrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="spring-drawer-header" className={cn("grid gap-1 px-5 pt-2 pb-3", className)} {...props} />
}

function SpringDrawerBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="spring-drawer-body" className={cn("min-h-0 flex-1 overflow-y-auto px-5 pb-5 text-sm", className)} tabIndex={0} {...props} />
}

function SpringDrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="spring-drawer-footer" className={cn("flex flex-wrap items-center justify-end gap-2 border-t px-5 py-3", className)} {...props} />
}

type SpringDrawerContentProps = Omit<React.ComponentProps<"div">, "ref" | "title"> & {
  /** Show the close button in the corner. */
  showCloseButton?: boolean
  /** Accessible name of the close button. */
  closeLabel?: string
  /** Name of the resize handle (bottom drawer with several snap points). */
  handleLabel?: string
  /** Largest width of a bottom drawer, or the width of a side drawer. */
  maxWidth?: string
}

function SpringDrawerContent({ className, children, showCloseButton = true, closeLabel = "Close", handleLabel = "Resize drawer", maxWidth, style, ...props }: SpringDrawerContentProps) {
  const { open, side, snapPoints, snap, setSnap } = useDrawer()
  const reduce = useReducedMotion()
  const bottom = side === "bottom"
  const axis = bottom ? "y" : "x"
  const maxSnap = snapPoints[snapPoints.length - 1] ?? 1
  const panel = React.useRef<HTMLDivElement>(null)
  const controls = useDragControls()
  const offset = useMotionValue(0)
  const [size, setSize] = React.useState(0)
  const targetFor = React.useCallback((index: number) => (bottom && size ? size * (1 - (snapPoints[index] ?? maxSnap) / maxSnap) : 0), [bottom, size, snapPoints, maxSnap])
  const overlay = useTransform(offset, [0, size || 1], [1, 0])
  const settle = reduce ? { duration: 0 } : ({ type: "spring", stiffness: 380, damping: 36, mass: 0.9 } as const)
  const opened = React.useRef(false)

  // Measure once the panel is mounted, and again if the window changes size.
  React.useLayoutEffect(() => {
    const el = panel.current
    if (!el) return
    const measure = () => setSize(bottom ? el.offsetHeight : el.offsetWidth)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [open, bottom])

  React.useEffect(() => {
    if (!open) {
      opened.current = false
      return
    }
    if (!size) return
    if (!opened.current) {
      offset.set(size)
      opened.current = true
    }
    const controlsAnim = animate(offset, targetFor(snap), settle)
    return () => controlsAnim.stop()
  }, [open, size, snap, targetFor, offset]) // eslint-disable-line react-hooks/exhaustive-deps

  function onDragEnd(_: unknown, info: { velocity: { x: number; y: number } }) {
    const current = offset.get()
    const velocity = bottom ? info.velocity.y : info.velocity.x
    const projected = current + velocity * 0.18
    const stops = bottom ? snapPoints.map((_, i) => targetFor(i)) : [0]
    const closed = size
    let best = closed
    let bestIndex = -1
    let distance = Math.abs(projected - closed)
    stops.forEach((t, i) => {
      const d = Math.abs(projected - t)
      if (d < distance) {
        distance = d
        best = t
        bestIndex = i
      }
    })
    if (best === closed) {
      closeRef.current?.click()
    } else {
      if (bottom && bestIndex !== snap) setSnap(bestIndex)
      animate(offset, best, settle)
    }
  }

  const closeRef = React.useRef<HTMLButtonElement>(null)
  const adjustable = bottom && snapPoints.length > 1

  return (
    <DialogPrimitive.Portal forceMount>
      <AnimatePresence>
        {open && (
          <>
            {React.createElement(
              DialogPrimitive.Overlay,
              { forceMount: true, asChild: true },
              <motion.div
                data-slot="spring-drawer-overlay"
                className="fixed inset-0 z-50 bg-black/50"
                style={{ opacity: reduce ? 1 : overlay }}
                initial={reduce ? { opacity: 0 } : undefined}
                animate={reduce ? { opacity: 1 } : undefined}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
              />
            )}
            {React.createElement(
              DialogPrimitive.Content,
              { forceMount: true, asChild: true, "aria-describedby": undefined },
              <motion.div
                ref={panel}
                data-slot="spring-drawer-content"
                data-side={side}
                drag={size ? axis : false}
                dragControls={controls}
                dragListener={false}
                dragConstraints={bottom ? { top: targetFor(snapPoints.length - 1), bottom: size } : side === "right" ? { left: 0, right: size } : { left: -size, right: 0 }}
                dragElastic={0.12}
                dragMomentum={false}
                onDragEnd={onDragEnd}
                style={{ [axis]: offset, ...(bottom ? { height: `${maxSnap * 100}dvh`, maxWidth: maxWidth ?? "42rem" } : { width: maxWidth ?? "min(24rem, 90vw)" }), ...style } as React.CSSProperties}
                exit={{
                  ...(bottom ? { y: "100%" } : side === "right" ? { x: "100%" } : { x: "-100%" }),
                  transition: reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 40 },
                }}
                className={cn(
                  "fixed z-50 flex flex-col bg-card text-card-foreground shadow-[0_-12px_48px_-12px_rgb(0_0_0/0.35)] outline-none",
                  bottom && "inset-x-0 bottom-0 mx-auto w-full rounded-t-2xl border border-b-0",
                  side === "right" && "inset-y-0 right-0 border-l",
                  side === "left" && "inset-y-0 left-0 border-r",
                  className
                )}
                {...(props as object)}
              >
                {bottom && (
                  <div
                    onPointerDown={(e) => controls.start(e)}
                    className="flex shrink-0 cursor-grab touch-none items-center justify-center py-2.5 active:cursor-grabbing"
                  >
                    <span
                      role={adjustable ? "slider" : undefined}
                      aria-label={adjustable ? handleLabel : undefined}
                      aria-orientation={adjustable ? "vertical" : undefined}
                      aria-valuemin={adjustable ? 0 : undefined}
                      aria-valuemax={adjustable ? snapPoints.length - 1 : undefined}
                      aria-valuenow={adjustable ? snap : undefined}
                      aria-valuetext={adjustable ? `${Math.round((snapPoints[snap] ?? 1) * 100)}% of the screen` : undefined}
                      aria-hidden={adjustable ? undefined : true}
                      tabIndex={adjustable ? 0 : undefined}
                      onKeyDown={(e) => {
                        if (!adjustable) return
                        const keys: Record<string, number> = { ArrowUp: snap + 1, ArrowRight: snap + 1, ArrowDown: snap - 1, ArrowLeft: snap - 1, Home: 0, End: snapPoints.length - 1 }
                        if (e.key in keys) {
                          e.preventDefault()
                          setSnap(keys[e.key]!)
                        }
                      }}
                      className="block h-1.5 w-12 rounded-full bg-border outline-none transition-colors hover:bg-muted-foreground/50 focus-visible:bg-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none"
                    />
                  </div>
                )}
                {!bottom && (
                  <div
                    onPointerDown={(e) => controls.start(e)}
                    aria-hidden="true"
                    className={cn("absolute top-1/2 z-10 flex h-16 w-3 -translate-y-1/2 cursor-grab touch-none items-center justify-center active:cursor-grabbing", side === "right" ? "left-0.5" : "right-0.5")}
                  >
                    <span className="block h-10 w-1 rounded-full bg-border" />
                  </div>
                )}
                {children}
                {showCloseButton ? (
                  <DialogPrimitive.Close
                    ref={closeRef}
                    aria-label={closeLabel}
                    className="absolute top-3 right-3 inline-flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    <X aria-hidden="true" className="size-4" />
                  </DialogPrimitive.Close>
                ) : (
                  <DialogPrimitive.Close ref={closeRef} aria-hidden="true" tabIndex={-1} className="sr-only" />
                )}
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </DialogPrimitive.Portal>
  )
}

export {
  SpringDrawer,
  SpringDrawerTrigger,
  SpringDrawerContent,
  SpringDrawerHeader,
  SpringDrawerBody,
  SpringDrawerFooter,
  SpringDrawerTitle,
  SpringDrawerDescription,
  SpringDrawerClose,
  type SpringDrawerProps,
  type SpringDrawerContentProps,
  type DrawerSide,
}
