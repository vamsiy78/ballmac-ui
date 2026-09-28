// Ballmac UI: Tooltip. https://ui.ballmac.com/components/tooltip
// Based on shadcn/ui's Tooltip (MIT, Copyright (c) 2023 shadcn), restyled with an arrow and tw-animate-css transitions.
"use client"

import * as React from "react"
import { Tooltip as TooltipPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

type TooltipProviderProps = React.ComponentProps<typeof TooltipPrimitive.Provider> & {
  /** Milliseconds from pointer enter until the tooltip opens. */
  delayDuration?: number
}

function TooltipProvider({ delayDuration = 200, ...props }: TooltipProviderProps) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" delayDuration={delayDuration} {...props} />
}

/** A tooltip. Wraps itself in a TooltipProvider, so it works standalone; add one provider higher up to share delays. */
function Tooltip(props: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  )
}

function TooltipTrigger(props: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

type TooltipContentProps = React.ComponentProps<typeof TooltipPrimitive.Content> & {
  /** Show the pointer arrow. */
  arrow?: boolean
  /** Distance in px between the trigger and the tooltip. */
  sideOffset?: number
}

function TooltipContent({ className, sideOffset = 6, arrow = true, children, ...props }: TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "z-50 flex w-fit max-w-[min(20rem,calc(100vw-2rem))] origin-(--radix-tooltip-content-transform-origin) items-center gap-2 text-balance rounded-md bg-foreground px-2.5 py-1.5 text-xs leading-snug text-background shadow-[0_4px_12px_-2px_rgb(0_0_0/0.2)]",
          "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 motion-reduce:animate-none",
          "data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1",
          className
        )}
        {...props}
      >
        {children}
        {arrow ? (
          <TooltipPrimitive.Arrow
            data-slot="tooltip-arrow"
            width={10}
            height={5}
            className="fill-foreground"
          />
        ) : null}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, type TooltipContentProps, type TooltipProviderProps }
