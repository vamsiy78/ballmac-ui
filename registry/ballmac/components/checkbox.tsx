// Ballmac UI: Checkbox. https://ui.ballmac.com/components/checkbox
// Based on shadcn/ui's Checkbox (MIT, Copyright (c) 2023 shadcn), restyled with an indeterminate state.
"use client"

import * as React from "react"
import { CheckIcon, MinusIcon } from "lucide-react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

type CheckboxProps = React.ComponentProps<typeof CheckboxPrimitive.Root>

function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer relative size-4 shrink-0 rounded-[4px] border border-input bg-background shadow-xs outline-none transition-[color,background-color,border-color,box-shadow] duration-150 dark:bg-input/30",
        "after:absolute after:-inset-2 after:content-['']",
        "hover:border-foreground/30 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        "data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        "data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="group/indicator flex items-center justify-center text-current transition-none"
      >
        <CheckIcon className="size-3.5 group-data-[state=indeterminate]/indicator:hidden" strokeWidth={3} aria-hidden="true" />
        <MinusIcon className="hidden size-3.5 group-data-[state=indeterminate]/indicator:block" strokeWidth={3} aria-hidden="true" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox, type CheckboxProps }
