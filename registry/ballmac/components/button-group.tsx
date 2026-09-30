// Ballmac UI: Button Group. https://ui.ballmac.com/components/button-group

import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonGroupProps = React.ComponentProps<"div"> & {
  /** Direction of adjacent controls. */
  orientation?: "horizontal" | "vertical";
};
function ButtonGroup({
  className,
  orientation = "horizontal",
  ...props
}: ButtonGroupProps) {
  return (
    <div
      data-slot="button-group"
      data-orientation={orientation}
      role="group"
      className={cn(
        "group/button-group inline-flex max-w-full items-stretch rounded-md shadow-xs [&>*]:relative [&>*]:min-w-0 [&>*]:shadow-none [&>*:focus-visible]:z-10",
        orientation === "horizontal"
          ? "flex-row [&>*:not(:first-child)]:-ml-px [&>*:not(:first-child)]:rounded-l-none [&>*:not(:last-child)]:rounded-r-none"
          : "flex-col [&>*:not(:first-child)]:-mt-px [&>*:not(:first-child)]:rounded-t-none [&>*:not(:last-child)]:rounded-b-none",
        className,
      )}
      {...props}
    />
  );
}
type ButtonGroupTextProps = React.ComponentProps<"span">;
function ButtonGroupText({ className, ...props }: ButtonGroupTextProps) {
  return (
    <span
      data-slot="button-group-text"
      className={cn(
        "inline-flex min-h-9 items-center border bg-muted/50 px-3 text-sm text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}
type ButtonGroupSeparatorProps = React.ComponentProps<"span">;
function ButtonGroupSeparator({
  className,
  ...props
}: ButtonGroupSeparatorProps) {
  return (
    <span
      data-slot="button-group-separator"
      aria-hidden="true"
      className={cn("z-10 w-px self-stretch bg-border group-data-[orientation=vertical]/button-group:h-px group-data-[orientation=vertical]/button-group:w-full", className)}
      {...props}
    />
  );
}
export {
  ButtonGroup,
  ButtonGroupText,
  ButtonGroupSeparator,
  type ButtonGroupProps,
  type ButtonGroupTextProps,
  type ButtonGroupSeparatorProps,
};
