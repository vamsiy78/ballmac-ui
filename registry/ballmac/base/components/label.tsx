// Ballmac UI: Label. https://ui.ballmac.com/components/label
// Based on shadcn/ui's Label (MIT, Copyright (c) 2023 shadcn), restyled.
"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type LabelProps = React.ComponentProps<"label">

/** A native label: Base UI has no Label part, a `<label htmlFor>` or one that wraps its control is all the accessibility needs. */
function Label({ className, ...props }: LabelProps) {
  return (
    <label
      data-slot="label"
      className={cn(
        "flex select-none items-center gap-2 text-sm leading-none font-medium text-foreground",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-50 peer-data-disabled:cursor-not-allowed peer-data-disabled:opacity-50 group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label, type LabelProps }
