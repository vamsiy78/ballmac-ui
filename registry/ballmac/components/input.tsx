// Ballmac UI: Input. https://ui.ballmac.com/components/input
// Based on shadcn/ui's Input (MIT, Copyright (c) 2023 shadcn), restyled with sizes and an InputGroup for addons.
"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full min-w-0 rounded-md border border-input bg-background text-foreground shadow-xs outline-none transition-[color,border-color,box-shadow] duration-150 selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30",
  {
    variants: {
      size: {
        sm: "h-8 px-2.5 text-[13px]",
        default: "h-9 px-3 text-sm",
        lg: "h-11 px-4 text-[15px]",
      },
    },
    defaultVariants: { size: "default" },
  }
)

type InputProps = Omit<React.ComponentProps<"input">, "size"> &
  VariantProps<typeof inputVariants> & {
    /** Native `size` attribute (visible character width). `size` is the height variant. */
    htmlSize?: number
  }

function Input({ className, type = "text", size = "default", htmlSize, ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      size={htmlSize}
      className={cn(inputVariants({ size }), className)}
      {...props}
    />
  )
}

const inputGroupVariants = cva("", {
  variants: {
    size: {
      sm: "h-8 [&>[data-slot=input]]:text-[13px]",
      default: "h-9",
      lg: "h-11 [&>[data-slot=input]]:text-[15px]",
    },
  },
  defaultVariants: { size: "default" },
})

type InputGroupProps = React.ComponentProps<"div"> & VariantProps<typeof inputGroupVariants>

/**
 * Wraps an Input with leading or trailing addons (icons, units, domains).
 * The group draws the border, height and focus ring; the inner input goes borderless.
 */
function InputGroup({ className, size = "default", ...props }: InputGroupProps) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        inputGroupVariants({ size }),
        "relative flex w-full min-w-0 items-center rounded-md border border-input bg-background shadow-xs transition-[color,border-color,box-shadow] duration-150 dark:bg-input/30",
        "has-[[data-slot=input]:focus-visible]:border-ring has-[[data-slot=input]:focus-visible]:ring-[3px] has-[[data-slot=input]:focus-visible]:ring-ring/50",
        "has-[[data-slot=input][aria-invalid=true]]:border-destructive has-[[data-slot=input][aria-invalid=true]]:ring-destructive/20",
        "has-[[data-slot=input]:disabled]:opacity-50",
        "[&>[data-slot=input]]:h-full [&>[data-slot=input]]:flex-1 [&>[data-slot=input]]:border-0 [&>[data-slot=input]]:bg-transparent [&>[data-slot=input]]:shadow-none [&>[data-slot=input]]:ring-0 [&>[data-slot=input]]:focus-visible:ring-0 [&>[data-slot=input]]:dark:bg-transparent",
        "has-[>[data-align=start]]:[&>[data-slot=input]]:pl-1.5 has-[>[data-align=end]]:[&>[data-slot=input]]:pr-1.5",
        className
      )}
      {...props}
    />
  )
}

type InputGroupAddonProps = React.ComponentProps<"div"> & {
  /** Which side of the input the addon sits on (visual order; keep markup order the same for screen readers). */
  align?: "start" | "end"
}

function InputGroupAddon({ className, align = "start", onMouseDown, ...props }: InputGroupAddonProps) {
  return (
    <div
      data-slot="input-group-addon"
      data-align={align}
      className={cn(
        "flex h-full shrink-0 select-none items-center gap-1.5 text-sm text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        align === "start" ? "order-first pl-3" : "order-last pr-3",
        className
      )}
      onMouseDown={(event) => {
        onMouseDown?.(event)
        // Clicking an addon focuses the input, like a label would.
        if (event.defaultPrevented || (event.target as HTMLElement).closest("button, a, input, select, textarea")) return
        const input = event.currentTarget.parentElement?.querySelector<HTMLInputElement>("[data-slot=input]")
        if (input) {
          event.preventDefault()
          input.focus()
        }
      }}
      {...props}
    />
  )
}

export { Input, InputGroup, InputGroupAddon, inputVariants, inputGroupVariants, type InputProps, type InputGroupProps, type InputGroupAddonProps }
