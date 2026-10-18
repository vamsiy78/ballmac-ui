// Ballmac UI: Toggle Group. https://ui.ballmac.com/components/toggle-group
"use client";

import * as React from "react";
import { Toggle as ItemPrimitive } from "@base-ui/react/toggle";
import { ToggleGroup as Primitive } from "@base-ui/react/toggle-group";
import { DirectionProvider, useDirection } from "@/lib/ballmac/direction";
import { cn } from "@/lib/utils";

type Shared = Omit<React.ComponentProps<typeof Primitive>, "value" | "defaultValue" | "onValueChange" | "multiple" | "className"> & {
  className?: string;
  /** Reading direction for the arrow keys. Defaults to the page's. */
  dir?: "ltr" | "rtl";
  /** Surface treatment shared by the items. */
  variant?: "default" | "outline";
  /** Item height. */
  size?: "sm" | "default" | "lg";
};
type ToggleGroupProps = Shared &
  (
    | { type: "single"; value?: string; defaultValue?: string; onValueChange?: (value: string) => void }
    | { type: "multiple"; value?: string[]; defaultValue?: string[]; onValueChange?: (value: string[]) => void }
  );

function ToggleGroup({
  className,
  variant = "default",
  size = "default",
  type,
  value,
  defaultValue,
  onValueChange,
  dir: dirProp,
  ...props
}: ToggleGroupProps) {
  const dir = useDirection(dirProp);
  // Base UI always works with lists; a "single" group is a list of at most one, written here as a plain string like before.
  const list = (v: string | string[] | undefined) => (v === undefined ? undefined : Array.isArray(v) ? v : v === "" ? [] : [v]);
  return (
    <DirectionProvider dir={dir}>
      <Primitive
        data-slot="toggle-group"
        data-variant={variant}
        data-size={size}
        multiple={type === "multiple"}
        value={list(value)}
        defaultValue={list(defaultValue)}
        onValueChange={(next) => (onValueChange as ((v: string | string[]) => void) | undefined)?.(type === "multiple" ? next : (next[0] ?? ""))}
        dir={dir}
        className={cn(
          "inline-flex max-w-full items-center gap-1 rounded-lg bg-muted p-1",
          variant === "outline" && "border bg-background",
          className,
        )}
        {...props}
      />
    </DirectionProvider>
  );
}
type ToggleGroupItemProps = Omit<React.ComponentProps<typeof ItemPrimitive>, "className"> & { className?: string };
function ToggleGroupItem({ className, ...props }: ToggleGroupItemProps) {
  return (
    <ItemPrimitive
      data-slot="toggle-group-item"
      className={cn(
        "inline-flex min-w-0 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground outline-none transition-[color,background-color,box-shadow] duration-150 hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-pressed:bg-background data-pressed:text-foreground data-pressed:shadow-xs [[data-size=sm]_&]:h-8 [[data-size=default]_&]:h-9 [[data-size=lg]_&]:h-11 [[data-variant=outline]_&]:data-pressed:bg-primary/10 [[data-variant=outline]_&]:data-pressed:text-primary motion-reduce:transition-none [&_svg]:size-4",
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
