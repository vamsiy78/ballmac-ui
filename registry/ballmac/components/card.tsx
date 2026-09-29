// Ballmac UI: Card. https://ui.ballmac.com/components/card
// Based on shadcn/ui Card (MIT, Copyright (c) 2023 shadcn), adding compact spacing and a restrained interactive surface.
import * as React from "react"
import { cn } from "@/lib/utils"

type CardProps = React.ComponentProps<"div"> & {
  /** Compact spacing for dense dashboards. */
  size?: "default" | "sm"
  /** Add a hover and focus treatment when the card contains a link or control. */
  interactive?: boolean
}
function Card({
  className,
  size = "default",
  interactive = false,
  ...props
}: CardProps) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "group/card bg-card text-card-foreground flex min-w-0 flex-col gap-5 rounded-xl border border-border py-5 shadow-sm transition-[border-color,box-shadow,transform] duration-200 data-[size=sm]:gap-3 data-[size=sm]:py-4",
        interactive &&
          "hover:border-ring/50 hover:shadow-md focus-within:border-ring/50 motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  )
}
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-1 px-5 group-data-[size=sm]/card:px-4",
        className,
      )}
      {...props}
    />
  )
}
function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("col-start-1 text-base font-semibold leading-6", className)}
      {...props}
    />
  )
}
function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn(
        "text-muted-foreground col-start-1 text-sm leading-relaxed",
        className,
      )}
      {...props}
    />
  )
}
function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("col-start-2 row-span-2 flex items-start gap-2", className)}
      {...props}
    />
  )
}
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("min-w-0 px-5 group-data-[size=sm]/card:px-4", className)}
      {...props}
    />
  )
}
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex flex-wrap items-center gap-2 border-t border-border px-5 pt-4 group-data-[size=sm]/card:px-4",
        className,
      )}
      {...props}
    />
  )
}
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
  type CardProps,
}
