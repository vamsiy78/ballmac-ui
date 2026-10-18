// Ballmac UI: Switch. https://ui.ballmac.com/components/switch
// Based on shadcn/ui's Switch (MIT, Copyright (c) 2023 shadcn), restyled with sizes.
"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Switch as SwitchPrimitive } from "@base-ui/react/switch"

import { useFieldsetDisabled } from "@/lib/ballmac/fieldset"
import { cn } from "@/lib/utils"

const switchVariants = cva(
  "peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs outline-none transition-[background-color,box-shadow] duration-200 motion-reduce:transition-none after:absolute after:-inset-2 after:content-[''] focus-visible:ring-[3px] focus-visible:ring-ring/50 data-disabled:cursor-not-allowed data-disabled:opacity-50 aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 data-checked:bg-primary data-unchecked:bg-input dark:data-unchecked:bg-input/80",
  {
    variants: {
      size: {
        sm: "h-4 w-7",
        default: "h-[var(--bm-switch-h,calc(var(--spacing)*5))] w-[var(--bm-switch-w,calc(var(--spacing)*9))]",
      },
    },
    defaultVariants: { size: "default" },
  }
)

type SwitchProps = Omit<React.ComponentProps<typeof SwitchPrimitive.Root>, "className"> & { className?: string } & VariantProps<typeof switchVariants>

function Switch({ className, size = "default", disabled, ref, ...props }: SwitchProps) {
  const fieldset = useFieldsetDisabled<HTMLElement>(disabled, ref as React.Ref<HTMLElement>)
  return (
    <SwitchPrimitive.Root
      ref={fieldset.ref}
      disabled={fieldset.disabled}
      data-slot="switch"
      data-size={size ?? "default"}
      className={cn(switchVariants({ size }), className)}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-background shadow-[0_1px_2px_0_rgb(0_0_0/0.2)] ring-0 transition-transform duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none data-unchecked:translate-x-px data-checked:translate-x-[calc(100%+1px)] rtl:data-unchecked:-translate-x-px rtl:data-checked:-translate-x-[calc(100%+1px)] dark:data-unchecked:bg-foreground dark:data-checked:bg-primary-foreground",
          "size-[calc(var(--bm-switch-h,calc(var(--spacing)*5))_-_var(--spacing))] group-data-[size=sm]/switch:size-3 group-data-[size=default]/switch:data-checked:translate-x-[calc(var(--bm-switch-w,calc(var(--spacing)*9))_-_var(--bm-switch-h,calc(var(--spacing)*5))_+_1px)] group-data-[size=default]/switch:rtl:data-checked:-translate-x-[calc(var(--bm-switch-w,calc(var(--spacing)*9))_-_var(--bm-switch-h,calc(var(--spacing)*5))_+_1px)]"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch, switchVariants, type SwitchProps }
