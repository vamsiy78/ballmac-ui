// Ballmac UI: Breadcrumb. https://ui.ballmac.com/components/breadcrumb
// Based on shadcn/ui Breadcrumb (MIT, Copyright (c) 2023 shadcn), adding truncation and a keyboard-visible link treatment.
import * as React from "react"
import { ChevronRight, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

type BreadcrumbProps = React.ComponentProps<"nav"> & {
  /** Accessible name of the navigation landmark. */
  "aria-label"?: string
}
function Breadcrumb({
  className,
  "aria-label": label = "Breadcrumb",
  ...props
}: BreadcrumbProps) {
  return (
    <nav
      data-slot="breadcrumb"
      aria-label={label}
      className={cn("min-w-0", className)}
      {...props}
    />
  )
}
function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "text-muted-foreground flex min-w-0 flex-wrap items-center gap-1.5 text-sm sm:gap-2.5",
        className,
      )}
      {...props}
    />
  )
}
function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex min-w-0 items-center gap-1.5", className)}
      {...props}
    />
  )
}
function BreadcrumbLink({ className, ...props }: React.ComponentProps<"a">) {
  return (
    <a
      data-slot="breadcrumb-link"
      className={cn(
        "hover:text-foreground focus-visible:ring-ring/50 inline-block max-w-32 truncate rounded-sm outline-none transition-colors duration-150 focus-visible:ring-[3px] sm:max-w-52",
        className,
      )}
      {...props}
    />
  )
}
function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      aria-current="page"
      className={cn(
        "text-foreground inline-block max-w-40 truncate font-medium sm:max-w-64",
        className,
      )}
      {...props}
    />
  )
}
function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("text-muted-foreground [&>svg]:size-3.5", className)}
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  )
}
function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      className={cn(
        "flex size-6 items-center justify-center [&>svg]:size-4",
        className,
      )}
      {...props}
    >
      <MoreHorizontal aria-hidden="true" />
      <span className="sr-only">More pages</span>
    </span>
  )
}
export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
  type BreadcrumbProps,
}
