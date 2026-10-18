// Ballmac UI: Tooltip. https://ui.ballmac.com/components/tooltip
// Based on shadcn/ui's Tooltip (MIT, Copyright (c) 2023 shadcn), restyled with an arrow and tw-animate-css transitions.
"use client"

import * as React from "react"
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"

import { splitPositioner } from "@/lib/ballmac/positioner"
import { cn } from "@/lib/utils"

type TooltipProviderProps = React.ComponentProps<typeof TooltipPrimitive.Provider> & {
  /** Milliseconds from pointer enter until the tooltip opens. */
  delayDuration?: number
}

function TooltipProvider({ delayDuration = 200, ...props }: TooltipProviderProps) {
  return <TooltipPrimitive.Provider delay={delayDuration} {...props} />
}

// Base UI does not link a trigger to its tooltip. The root keeps the open state and an id here so the trigger can say aria-describedby while it is open.
const TooltipContext = React.createContext<{ id: string; open: boolean }>({ id: "", open: false })

/** A tooltip. Wraps itself in a TooltipProvider, so it works standalone; add one provider higher up to share delays. */
function Tooltip({ onOpenChange, open: openProp, defaultOpen, ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  const id = React.useId()
  const [own, setOwn] = React.useState(defaultOpen ?? false)
  const open = openProp ?? own
  const value = React.useMemo(() => ({ id, open }), [id, open])
  return (
    <TooltipProvider>
      <TooltipContext.Provider value={value}>
        <TooltipPrimitive.Root
          data-slot="tooltip"
          open={openProp}
          defaultOpen={defaultOpen}
          onOpenChange={(next, details) => {
            setOwn(next)
            onOpenChange?.(next, details)
          }}
          {...props}
        />
      </TooltipContext.Provider>
    </TooltipProvider>
  )
}

function TooltipTrigger(props: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  const { id, open } = React.useContext(TooltipContext)
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" aria-describedby={open ? id : undefined} {...props} />
}

const arrowClass =
  "data-[side=bottom]:-top-[5px] data-[side=left]:-right-[8px] data-[side=left]:rotate-90 data-[side=right]:-left-[8px] data-[side=right]:-rotate-90 data-[side=top]:-bottom-[5px] data-[side=top]:rotate-180" // rtl-fixed: the arrow sits on the physical edge that `side` names

type TooltipContentProps = Omit<React.ComponentProps<typeof TooltipPrimitive.Popup>, "className"> &
  Pick<React.ComponentProps<typeof TooltipPrimitive.Positioner>, "side" | "align" | "alignOffset" | "collisionPadding"> & {
    className?: string
    /** Show the pointer arrow. */
    arrow?: boolean
    /** Distance in px between the trigger and the tooltip. */
    sideOffset?: number
  }

function TooltipContent({ className, sideOffset = 6, arrow = true, children, ...rest }: TooltipContentProps) {
  const [position, props] = splitPositioner(rest)
  const { id } = React.useContext(TooltipContext)
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner sideOffset={sideOffset} className="z-50" {...position}>
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          id={id}
          role="tooltip"
          className={cn(
            "flex w-fit max-w-[min(20rem,calc(100vw-2rem))] origin-(--transform-origin) items-center gap-2 text-balance rounded-md bg-foreground px-2.5 py-1.5 text-xs leading-snug text-background shadow-[0_4px_12px_-2px_rgb(0_0_0/0.2)]",
            "transition-[opacity,scale] duration-150 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 motion-reduce:transition-none",
            className
          )}
          {...props}
        >
          {children}
          {arrow ? (
            <TooltipPrimitive.Arrow data-slot="tooltip-arrow" className={arrowClass}>
              <svg width="10" height="5" viewBox="0 0 10 5" aria-hidden="true" className="fill-foreground block">
                <path d="M0 5 L5 0 L10 5 Z" />
              </svg>
            </TooltipPrimitive.Arrow>
          ) : null}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, type TooltipContentProps, type TooltipProviderProps }
