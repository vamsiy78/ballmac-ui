// Ballmac UI: Loading Dots. https://ui.ballmac.com/components/loading-dots
import * as React from "react"
import { cn } from "@/lib/utils"

type LoadingDotsProps = React.ComponentProps<"span"> & {
  /** Status text available to screen readers. */
  label?: string
  /** Dot size. */
  size?: "sm" | "default" | "lg"
}

function LoadingDots({
  className,
  label = "Loading",
  size = "default",
  ...props
}: LoadingDotsProps) {
  return (
    <span
      data-slot="loading-dots"
      role="status"
      aria-label={label}
      className={cn("text-primary inline-flex items-center gap-1", className)}
      {...props}
    >
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          aria-hidden="true"
          className={cn(
            "rounded-full bg-current motion-safe:animate-bounce",
            size === "sm" && "size-1",
            size === "default" && "size-1.5",
            size === "lg" && "size-2",
          )}
          style={{ animationDelay: `${index * 120}ms` }}
        />
      ))}
    </span>
  )
}

export { LoadingDots, type LoadingDotsProps }
