// Ballmac UI: Switch. https://ui.ballmac.com/components/switch
// Based on shadcn/ui's Switch (MIT, Copyright (c) 2023 shadcn), restyled with sizes.
"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Switch as SwitchPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

const switchVariants = cva(
  "peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs outline-none transition-[background-color,box-shadow] duration-200 motion-reduce:transition-none after:absolute after:-inset-2 after:content-[''] focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80",
  {
    variants: {
      size: {
        sm: "h-4 w-7",
        default: "h-5 w-9",
      },
    },
    defaultVariants: { size: "default" },
  }
)

type SwitchProps = React.ComponentProps<typeof SwitchPrimitive.Root> & VariantProps<typeof switchVariants>

function Switch({ className, size = "default", ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size ?? "default"}
      className={cn(switchVariants({ size }), className)}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-background shadow-[0_1px_2px_0_rgb(0_0_0/0.2)] ring-0 transition-transform duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none data-[state=unchecked]:translate-x-px data-[state=checked]:translate-x-[calc(100%+1px)] dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground",
          "size-4 group-data-[size=sm]/switch:size-3"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch, switchVariants, type SwitchProps }
