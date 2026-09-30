// Ballmac UI: Toggle. https://ui.ballmac.com/components/toggle
"use client";

import * as React from "react";
import { Toggle as Primitive } from "radix-ui";
import { cn } from "@/lib/utils";

type ToggleProps = React.ComponentProps<typeof Primitive.Root> & {
  /** Surface treatment of the two-state control. */
  variant?: "default" | "outline";
  /** Control height and horizontal padding. */
  size?: "sm" | "default" | "lg";
};
function Toggle({
  className,
  variant = "default",
  size = "default",
  ...props
}: ToggleProps) {
  return (
    <Primitive.Root
      data-slot="toggle"
      data-variant={variant}
      data-size={size}
      className={cn(
        "inline-flex min-w-0 shrink-0 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground outline-none transition-[color,background-color,box-shadow] duration-150 hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground data-[variant=outline]:border data-[variant=outline]:border-input data-[variant=outline]:bg-background data-[variant=outline]:data-[state=on]:border-primary data-[variant=outline]:data-[state=on]:bg-primary/10 data-[size=sm]:h-8 data-[size=sm]:px-2 data-[size=default]:h-9 data-[size=lg]:h-11 data-[size=lg]:px-4 motion-reduce:transition-none [&_svg]:size-4",
        className,
      )}
      {...props}
    />
  );
}
export { Toggle, type ToggleProps };
