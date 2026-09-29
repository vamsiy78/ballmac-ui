// Ballmac UI: Skeleton. https://ui.ballmac.com/components/skeleton
// Based on shadcn/ui Skeleton (MIT, Copyright (c) 2023 shadcn), adding a reduced-motion-safe shimmer option.
import * as React from "react"
import { cn } from "@/lib/utils"

type SkeletonProps = React.ComponentProps<"div"> & {
  /** Animate the placeholder while data is loading. */
  animated?: boolean
}
function Skeleton({ className, animated = true, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn(
        "bg-muted rounded-md",
        animated && "motion-safe:animate-pulse",
        className,
      )}
      {...props}
    />
  )
}
export { Skeleton, type SkeletonProps }
