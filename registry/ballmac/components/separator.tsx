// Ballmac UI: Separator. https://ui.ballmac.com/components/separator
// Based on shadcn/ui Separator (MIT, Copyright (c) 2023 shadcn), adding an optional centered label.
import * as React from "react"
import { Separator as SeparatorPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"

type SeparatorProps = React.ComponentProps<typeof SeparatorPrimitive.Root> & {
  /** Short text displayed in the middle of a horizontal separator. */
  label?: string
}
function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  label,
  ...props
}: SeparatorProps) {
  if (label && orientation === "horizontal")
    return (
      <div
        data-slot="separator-labeled"
        role={decorative ? "presentation" : "separator"}
        className={cn(
          "text-muted-foreground flex w-full items-center gap-3 text-xs",
          className,
        )}
        {...props}
      >
        <span aria-hidden="true" className="bg-border h-px min-w-0 flex-1" />
        <span>{label}</span>
        <span aria-hidden="true" className="bg-border h-px min-w-0 flex-1" />
      </div>
    )
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className,
      )}
      {...props}
    />
  )
}
export { Separator, type SeparatorProps }
