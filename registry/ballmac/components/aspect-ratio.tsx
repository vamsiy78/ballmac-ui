// Ballmac UI: Aspect Ratio. https://ui.ballmac.com/components/aspect-ratio
// Based on shadcn/ui Aspect Ratio (MIT, Copyright (c) 2023 shadcn), adding a native CSS fallback for invalid ratios.
import * as React from "react"
import { cn } from "@/lib/utils"

type AspectRatioProps = React.ComponentProps<"div"> & {
  /** Width divided by height. Defaults to 16:9. */
  ratio?: number
}
function AspectRatio({
  ratio = 16 / 9,
  className,
  style,
  ...props
}: AspectRatioProps) {
  const safeRatio = Number.isFinite(ratio) && ratio > 0 ? ratio : 16 / 9
  return (
    <div
      data-slot="aspect-ratio"
      className={cn(
        "relative w-full overflow-hidden rounded-[inherit] [&>*]:size-full",
        className,
      )}
      style={{ aspectRatio: safeRatio, ...style }}
      {...props}
    />
  )
}
export { AspectRatio, type AspectRatioProps }
