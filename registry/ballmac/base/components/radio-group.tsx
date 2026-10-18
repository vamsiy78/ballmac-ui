// Ballmac UI: Radio Group. https://ui.ballmac.com/components/radio-group
"use client";

import * as React from "react";
import { Circle } from "lucide-react";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup as Primitive } from "@base-ui/react/radio-group";
import { DirectionProvider, useDirection } from "@/lib/ballmac/direction";
import { useFieldsetDisabled } from "@/lib/ballmac/fieldset";
import { cn } from "@/lib/utils";

type RadioGroupProps = Omit<React.ComponentProps<typeof Primitive>, "className" | "value" | "defaultValue" | "onValueChange"> & {
  className?: string;
  /** Reading direction for the arrow keys. Defaults to the page's. */
  dir?: "ltr" | "rtl";
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};
function RadioGroup({ className, dir: dirProp, onValueChange, ...props }: RadioGroupProps) {
  const dir = useDirection(dirProp);
  return (
    <DirectionProvider dir={dir}>
      <Primitive
        dir={dir}
        data-slot="radio-group"
        onValueChange={(v) => onValueChange?.(String(v))}
        className={cn("grid gap-2", className)}
        {...props}
      />
    </DirectionProvider>
  );
}
type RadioGroupItemProps = Omit<React.ComponentProps<typeof Radio.Root>, "className"> & { className?: string };
function RadioGroupItem({ className, disabled, ref, ...props }: RadioGroupItemProps) {
  const fieldset = useFieldsetDisabled<HTMLElement>(disabled, ref as React.Ref<HTMLElement>);
  return (
    <Radio.Root
      ref={fieldset.ref}
      disabled={fieldset.disabled}
      data-slot="radio-group-item"
      className={cn(
        "aspect-square size-[var(--bm-check-size,calc(var(--spacing)*4))] shrink-0 rounded-full border border-input bg-background text-primary shadow-xs outline-none transition-[color,border-color,box-shadow] duration-150 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-disabled:cursor-not-allowed data-disabled:opacity-50 data-checked:border-primary motion-reduce:transition-none",
        className,
      )}
      {...props}
    >
      <Radio.Indicator
        data-slot="radio-group-indicator"
        className="flex items-center justify-center"
      >
        <Circle aria-hidden="true" className="size-2 fill-current" />
      </Radio.Indicator>
    </Radio.Root>
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
        "flex min-h-14 cursor-pointer items-start gap-3 rounded-lg border bg-card p-3 text-card-foreground shadow-xs transition-[border-color,background-color,box-shadow] duration-150 hover:bg-accent/50 has-[[data-checked]]:border-primary has-[[data-checked]]:bg-primary/5 has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50 motion-reduce:transition-none",
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
