// Ballmac UI: Badge. https://ui.ballmac.com/components/badge
// Based on shadcn/ui's Badge (MIT, Copyright (c) 2023 shadcn), restyled with a status dot and status tones.
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium outline-none transition-[color,background-color,border-color,box-shadow] duration-150 focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary: "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/80",
        outline: "border-border bg-background text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        destructive:
          "border-transparent bg-destructive text-white dark:bg-destructive/60 focus-visible:ring-destructive/40 [a&]:hover:bg-destructive/90",
      },
      // A soft tint that overrides the variant's colors. The label text stays foreground for contrast.
      status: {
        neutral: "border-border bg-muted text-foreground",
        success: "border-chart-2/30 bg-chart-2/10 text-foreground",
        warning: "border-chart-3/30 bg-chart-3/10 text-foreground",
        error: "border-destructive/30 bg-destructive/10 text-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

const dotColor = {
  neutral: "bg-muted-foreground",
  success: "bg-chart-2",
  warning: "bg-chart-3",
  error: "bg-destructive",
} as const

type BadgeStatus = keyof typeof dotColor

type BadgeProps = React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    /** Render the child element (for example a link) with badge styles. */
    asChild?: boolean
    /** Show a small leading dot. On by default when `status` is set. */
    dot?: boolean
  }

function Badge({ className, variant = "default", status, dot, asChild = false, children, ...props }: BadgeProps) {
  const Comp = asChild ? Slot.Root : "span"
  const showDot = dot ?? !!status
  const dotEl = showDot ? (
    <span
      data-slot="badge-dot"
      aria-hidden="true"
      className={cn("size-1.5 shrink-0 rounded-full", status ? dotColor[status as BadgeStatus] : "bg-current")}
    />
  ) : null

  return (
    <Comp
      data-slot="badge"
      data-status={status ?? undefined}
      className={cn(badgeVariants({ variant, status }), className)}
      {...props}
    >
      {dotEl}
      <Slot.Slottable>{children}</Slot.Slottable>
    </Comp>
  )
}

export { Badge, badgeVariants, type BadgeProps, type BadgeStatus }
