// Ballmac UI: Spinner. https://ui.ballmac.com/components/spinner
// Based on shadcn/ui Spinner (MIT, Copyright (c) 2023 shadcn), adding size variants and an announced loading state.
"use client"

import * as React from "react"
import { LoaderCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"

type SpinnerProps = React.ComponentProps<"span"> & {
  /** Size of the loading indicator. */
  size?: "sm" | "default" | "lg"
  /** Text announced by assistive technology. */
  label?: string
}
function Spinner({
  className,
  size = "default",
  label,
  ...props
}: SpinnerProps) {
  const msg = useMessages()
  label ??= msg("spinner.label", "Loading")
  return (
    <span
      data-slot="spinner"
      role="status"
      aria-label={label}
      className={cn(
        "inline-flex items-center justify-center text-current",
        className,
      )}
      {...props}
    >
      <LoaderCircle
        aria-hidden="true"
        className={cn(
          "motion-safe:animate-spin",
          size === "sm" ? "size-3.5" : size === "lg" ? "size-6" : "size-4",
        )}
      />
      <span className="sr-only">{label}</span>
    </span>
  )
}
export { Spinner, type SpinnerProps }
