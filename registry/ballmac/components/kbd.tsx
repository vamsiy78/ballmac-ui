// Ballmac UI: Kbd. https://ui.ballmac.com/components/kbd
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const kbdVariants = cva(
  "pointer-events-none inline-flex w-fit shrink-0 select-none items-center justify-center gap-1 rounded-[5px] border border-border bg-muted font-sans font-medium text-muted-foreground shadow-[inset_0_-1px_0_0_var(--color-border)] [&_svg:not([class*='size-'])]:size-3 [[data-slot=tooltip-content]_&]:border-background/20 [[data-slot=tooltip-content]_&]:bg-background/15 [[data-slot=tooltip-content]_&]:text-background [[data-slot=tooltip-content]_&]:shadow-none",
  {
    variants: {
      size: {
        sm: "h-4 min-w-4 px-1 text-[10px]",
        default: "h-5 min-w-5 px-1 text-[11px]",
        lg: "h-6 min-w-6 px-1.5 text-xs",
      },
    },
    defaultVariants: { size: "default" },
  }
)

type KbdProps = React.ComponentProps<"kbd"> & VariantProps<typeof kbdVariants>

function Kbd({ className, size = "default", ...props }: KbdProps) {
  return <kbd data-slot="kbd" dir="ltr" className={cn(kbdVariants({ size }), className)} {...props} />
}

type KbdGroupProps = React.ComponentProps<"kbd">

/**
 * Groups keys that are pressed together. Renders a nested <kbd>, the HTML pattern for a key combination.
 */
function KbdGroup({ className, ...props }: KbdGroupProps) {
  return <kbd data-slot="kbd-group" dir="ltr" className={cn("inline-flex items-center gap-1 font-sans", className)} {...props} />
}

export { Kbd, KbdGroup, kbdVariants, type KbdGroupProps, type KbdProps }
