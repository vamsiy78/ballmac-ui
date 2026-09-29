// Ballmac UI: Alert. https://ui.ballmac.com/components/alert
// Based on shadcn/ui Alert (MIT, Copyright (c) 2023 shadcn), adding semantic tones and an action slot.
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const alertVariants = cva(
  "grid w-full grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3 gap-y-1 rounded-xl border p-4 text-sm [&>svg]:mt-0.5 [&>svg]:size-4",
  {
    variants: {
      variant: {
        default: "border-border bg-card text-card-foreground",
        info: "border-primary/25 bg-primary/5 text-foreground",
        success: "border-chart-2/30 bg-chart-2/10 text-foreground",
        warning: "border-chart-3/30 bg-chart-3/10 text-foreground",
        destructive: "border-destructive/30 bg-destructive/10 text-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
)

type AlertProps = React.ComponentProps<"div"> &
  VariantProps<typeof alertVariants> & {
    /** Announce urgent messages; ordinary alerts remain in the reading order. */
    urgent?: boolean
  }
function Alert({
  className,
  variant = "default",
  urgent = false,
  ...props
}: AlertProps) {
  return (
    <div
      data-slot="alert"
      role={urgent ? "alert" : undefined}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}
function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("col-start-2 font-semibold leading-5", className)}
      {...props}
    />
  )
}
function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "col-start-2 text-muted-foreground leading-relaxed [&_p]:leading-relaxed",
        className,
      )}
      {...props}
    />
  )
}
function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn(
        "col-start-2 mt-2 flex flex-wrap items-center gap-2",
        className,
      )}
      {...props}
    />
  )
}
export {
  Alert,
  AlertTitle,
  AlertDescription,
  AlertAction,
  alertVariants,
  type AlertProps,
}
