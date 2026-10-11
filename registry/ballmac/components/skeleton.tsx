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
        // a little stronger than bg-muted, so a placeholder reads clearly on a white page; foreground-based, so every theme gets a matching tone
        "bg-foreground/[0.07] rounded-md dark:bg-foreground/[0.1]",
        // the pulse holds still when the theme turns decorative loops off; the placeholder still says "loading"
        animated && "motion-safe:animate-pulse [animation-play-state:var(--bm-ambient-state,running)]",
        className,
      )}
      {...props}
    />
  )
}
export { Skeleton, type SkeletonProps }
