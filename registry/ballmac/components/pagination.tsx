// Ballmac UI: Pagination. https://ui.ballmac.com/components/pagination
// Based on shadcn/ui Pagination (MIT, Copyright (c) 2023 shadcn), adding current-page contrast and compact overflow behavior.
import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

type PaginationProps = React.ComponentProps<"nav"> & {
  /** Accessible name of the navigation landmark. */
  "aria-label"?: string
}
function Pagination({
  className,
  "aria-label": label = "Pagination",
  ...props
}: PaginationProps) {
  return (
    <nav
      data-slot="pagination"
      aria-label={label}
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
}
function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex min-w-0 items-center gap-1", className)}
      {...props}
    />
  )
}
function PaginationItem(props: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />
}
type PaginationLinkProps = React.ComponentProps<"a"> & {
  /** Mark the current page for visual and screen reader feedback. */
  isActive?: boolean
}
function PaginationLink({
  className,
  isActive = false,
  ...props
}: PaginationLinkProps) {
  return (
    <a
      data-slot="pagination-link"
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "focus-visible:ring-ring/50 inline-flex size-9 items-center justify-center rounded-md border border-transparent text-sm transition-[color,background-color,border-color] duration-150 outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px]",
        isActive &&
          "border-border bg-accent font-semibold text-accent-foreground",
        className,
      )}
      {...props}
    />
  )
}
function PaginationPrevious({
  className,
  children = "Previous",
  ...props
}: React.ComponentProps<"a">) {
  return (
    <a
      data-slot="pagination-previous"
      aria-label="Previous page"
      className={cn(
        "focus-visible:ring-ring/50 inline-flex h-9 items-center gap-1 rounded-md px-2 text-sm outline-none hover:bg-accent focus-visible:ring-[3px]",
        className,
      )}
      {...props}
    >
      <ChevronLeft aria-hidden="true" className="size-4" />
      <span className="hidden sm:inline">{children}</span>
    </a>
  )
}
function PaginationNext({
  className,
  children = "Next",
  ...props
}: React.ComponentProps<"a">) {
  return (
    <a
      data-slot="pagination-next"
      aria-label="Next page"
      className={cn(
        "focus-visible:ring-ring/50 inline-flex h-9 items-center gap-1 rounded-md px-2 text-sm outline-none hover:bg-accent focus-visible:ring-[3px]",
        className,
      )}
      {...props}
    >
      <span className="hidden sm:inline">{children}</span>
      <ChevronRight aria-hidden="true" className="size-4" />
    </a>
  )
}
function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="pagination-ellipsis"
      className={cn(
        "flex size-9 items-center justify-center text-muted-foreground [&>svg]:size-4",
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  type PaginationProps,
  type PaginationLinkProps,
}
