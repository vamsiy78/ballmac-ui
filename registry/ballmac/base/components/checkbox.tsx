// Ballmac UI: Checkbox. https://ui.ballmac.com/components/checkbox
// Based on shadcn/ui's Checkbox (MIT, Copyright (c) 2023 shadcn), restyled with an indeterminate state.
"use client"

import * as React from "react"
import { CheckIcon, MinusIcon } from "lucide-react"
import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"

import { useFieldsetDisabled } from "@/lib/ballmac/fieldset"
import { cn } from "@/lib/utils"

type CheckboxProps = Omit<React.ComponentProps<typeof CheckboxPrimitive.Root>, "checked" | "onCheckedChange" | "indeterminate" | "className"> & {
  className?: string
  /** `true`, `false` or "indeterminate" (some of a group is ticked). */
  checked?: boolean | "indeterminate"
  onCheckedChange?: (checked: boolean) => void
}

function Checkbox({ className, checked, onCheckedChange, disabled, ref, ...props }: CheckboxProps) {
  const fieldset = useFieldsetDisabled<HTMLElement>(disabled, ref as React.Ref<HTMLElement>)
  const indeterminate = checked === "indeterminate"
  return (
    <CheckboxPrimitive.Root
      ref={fieldset.ref}
      disabled={fieldset.disabled}
      data-slot="checkbox"
      checked={checked === undefined ? undefined : indeterminate ? false : checked}
      indeterminate={indeterminate || undefined}
      onCheckedChange={onCheckedChange}
      className={cn(
        "peer relative size-[var(--bm-check-size,calc(var(--spacing)*4))] shrink-0 rounded-[4px] border border-input bg-background shadow-xs outline-none transition-[color,background-color,border-color,box-shadow] duration-150 dark:bg-input/30",
        "after:absolute after:-inset-2 after:content-['']",
        "hover:border-foreground/30 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        "data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground",
        "data-indeterminate:border-primary data-indeterminate:bg-primary data-indeterminate:text-primary-foreground",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="group/indicator flex items-center justify-center text-current transition-none"
      >
        <CheckIcon className="size-3.5 group-data-indeterminate/indicator:hidden" strokeWidth={3} aria-hidden="true" />
        <MinusIcon className="hidden size-3.5 group-data-indeterminate/indicator:block" strokeWidth={3} aria-hidden="true" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox, type CheckboxProps }
