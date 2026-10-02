// Ballmac UI: Toggle Group. https://ui.ballmac.com/components/toggle-group
"use client";

import * as React from "react";
import { ToggleGroup as Primitive } from "radix-ui";
import { useDirection } from "@/lib/ballmac/direction";
import { cn } from "@/lib/utils";

type ToggleGroupProps = React.ComponentProps<typeof Primitive.Root> & {
  /** Surface treatment shared by the items. */
  variant?: "default" | "outline";
  /** Item height. */
  size?: "sm" | "default" | "lg";
};
function ToggleGroup({
  className,
  variant = "default",
  size = "default",
  ...props
}: ToggleGroupProps) {
  const dir = useDirection(props.dir);
  return (
    <Primitive.Root
      dir={dir}
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-lg bg-muted p-1",
        variant === "outline" && "border bg-background",
        className,
      )}
      {...props}
    />
  );
}
type ToggleGroupItemProps = React.ComponentProps<typeof Primitive.Item>;
function ToggleGroupItem({ className, ...props }: ToggleGroupItemProps) {
  return (
    <Primitive.Item
      data-slot="toggle-group-item"
      className={cn(
        "inline-flex min-w-0 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground outline-none transition-[color,background-color,box-shadow] duration-150 hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-xs [[data-size=sm]_&]:h-8 [[data-size=default]_&]:h-9 [[data-size=lg]_&]:h-11 [[data-variant=outline]_&]:data-[state=on]:bg-primary/10 [[data-variant=outline]_&]:data-[state=on]:text-primary motion-reduce:transition-none [&_svg]:size-4",
        className,
      )}
      {...props}
    />
  );
}
export {
  ToggleGroup,
  ToggleGroupItem,
  type ToggleGroupProps,
  type ToggleGroupItemProps,
};
