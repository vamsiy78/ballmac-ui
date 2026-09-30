// Ballmac UI: Radio Group. https://ui.ballmac.com/components/radio-group
"use client";

import * as React from "react";
import { Circle } from "lucide-react";
import { RadioGroup as Primitive } from "radix-ui";
import { cn } from "@/lib/utils";

type RadioGroupProps = React.ComponentProps<typeof Primitive.Root>;
function RadioGroup({ className, ...props }: RadioGroupProps) {
  return (
    <Primitive.Root
      data-slot="radio-group"
      className={cn("grid gap-2", className)}
      {...props}
    />
  );
}
type RadioGroupItemProps = React.ComponentProps<typeof Primitive.Item>;
function RadioGroupItem({ className, ...props }: RadioGroupItemProps) {
  return (
    <Primitive.Item
      data-slot="radio-group-item"
      className={cn(
        "aspect-square size-4 shrink-0 rounded-full border border-input bg-background text-primary shadow-xs outline-none transition-[color,border-color,box-shadow] duration-150 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary motion-reduce:transition-none",
        className,
      )}
      {...props}
    >
      <Primitive.Indicator
        data-slot="radio-group-indicator"
        className="flex items-center justify-center"
      >
        <Circle aria-hidden="true" className="size-2 fill-current" />
      </Primitive.Indicator>
    </Primitive.Item>
  );
}
type RadioGroupOptionProps = React.ComponentProps<"label"> & {
  /** Heading shown beside the radio control. */
  title: string;
  /** Supporting copy below the option heading. */
  description?: string;
  /** Value submitted by the radio group. */
  value: string;
  /** Disables this choice. */
  disabled?: boolean;
};
function RadioGroupOption({
  className,
  title,
  description,
  value,
  disabled,
  children,
  ...props
}: RadioGroupOptionProps) {
  return (
    <label
      data-slot="radio-group-option"
      data-disabled={disabled || undefined}
      className={cn(
        "flex min-h-14 cursor-pointer items-start gap-3 rounded-lg border bg-card p-3 text-card-foreground shadow-xs transition-[border-color,background-color,box-shadow] duration-150 hover:bg-accent/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5 has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50 motion-reduce:transition-none",
        className,
      )}
      {...props}
    >
      <RadioGroupItem value={value} disabled={disabled} className="mt-0.5" />
      <span className="grid min-w-0 flex-1 gap-0.5">
        <span className="text-sm font-medium">{title}</span>
        {description && (
          <span className="text-sm leading-snug text-muted-foreground">
            {description}
          </span>
        )}
      </span>
      {children}
    </label>
  );
}
export {
  RadioGroup,
  RadioGroupItem,
  RadioGroupOption,
  type RadioGroupProps,
  type RadioGroupItemProps,
  type RadioGroupOptionProps,
};
