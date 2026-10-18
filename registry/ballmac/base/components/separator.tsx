// Ballmac UI: Separator. https://ui.ballmac.com/components/separator
// Based on shadcn/ui Separator (MIT, Copyright (c) 2023 shadcn), adding an optional centered label.
import * as React from "react"
import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"
import { cn } from "@/lib/utils"

type SeparatorProps = Omit<React.ComponentProps<typeof SeparatorPrimitive>, "className"> & {
  className?: string
  /** A decorative separator is hidden from assistive technology. Set false when it divides content people should know is divided. */
  decorative?: boolean
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
        {...(props as React.ComponentProps<"div">)}
      >
        <span aria-hidden="true" className="bg-border h-px min-w-0 flex-1" />
        <span>{label}</span>
        <span aria-hidden="true" className="bg-border h-px min-w-0 flex-1" />
      </div>
    )
  const classes = cn(
    "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
    className,
  )
  // Base UI's separator always says "separator". A decorative one is a plain element with no role, as before.
  if (decorative)
    return <div data-slot="separator" role="none" data-orientation={orientation} className={classes} {...(props as React.ComponentProps<"div">)} />
  return <SeparatorPrimitive data-slot="separator" orientation={orientation} className={classes} {...props} />
}
export { Separator, type SeparatorProps }
