// Ballmac UI: Slider. https://ui.ballmac.com/components/slider
// Based on shadcn/ui Slider (MIT, Copyright (c) 2023 shadcn), adding per-thumb labels, a live value bubble, and vertical support.
"use client";

import * as React from "react";
import { Slider as Primitive } from "radix-ui";
import { cn } from "@/lib/utils";

type SliderProps = Omit<
  React.ComponentProps<typeof Primitive.Root>,
  "value" | "defaultValue"
> & {
  /** Controlled value. One number per thumb. */
  value?: number[];
  /** Initial value when uncontrolled. One number per thumb; two numbers make a range. */
  defaultValue?: number[];
  /** Accessible name for each thumb, in order, for example `["Minimum", "Maximum"]`. A single-thumb slider can use `aria-label` or `aria-labelledby`, which are passed to the thumb. */
  thumbLabels?: string[];
  /** Show a value bubble above the thumb while it is hovered, focused or dragged. */
  showValue?: boolean;
  /** Format the number shown in the bubble and announced as `aria-valuetext`. */
  formatValue?: (value: number) => string;
};

function Slider({
  className,
  value,
  defaultValue,
  min = 0,
  max = 100,
  thumbLabels,
  showValue = false,
  formatValue,
  onValueChange,
  orientation = "horizontal",
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  ...props
}: SliderProps) {
  const [inner, setInner] = React.useState<number[]>(defaultValue ?? [min]);
  const values = value ?? inner;
  const vertical = orientation === "vertical";
  return (
    <Primitive.Root
      data-slot="slider"
      value={value}
      defaultValue={defaultValue}
      min={min}
      max={max}
      orientation={orientation}
      onValueChange={(next) => {
        setInner(next);
        onValueChange?.(next);
      }}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-44 data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className,
      )}
      {...props}
    >
      <Primitive.Track
        data-slot="slider-track"
        className="relative grow overflow-hidden rounded-full bg-muted data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
      >
        <Primitive.Range
          data-slot="slider-range"
          className="absolute bg-primary data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
        />
      </Primitive.Track>
      {values.map((v, i) => (
        <Primitive.Thumb
          key={i}
          data-slot="slider-thumb"
          aria-label={thumbLabels?.[i] ?? (values.length === 1 ? ariaLabel : undefined)}
          aria-labelledby={
            !thumbLabels?.[i] && values.length === 1 ? ariaLabelledby : undefined
          }
          aria-valuetext={formatValue ? formatValue(v) : undefined}
          className="group/thumb relative block size-5 shrink-0 rounded-full border-2 border-primary bg-background shadow-sm outline-none transition-[box-shadow,transform] duration-150 hover:ring-4 hover:ring-ring/30 focus-visible:ring-4 focus-visible:ring-ring/50 active:scale-110 disabled:pointer-events-none motion-reduce:transition-none motion-reduce:active:scale-100"
        >
          {showValue && (
            <span
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute rounded-md bg-foreground px-1.5 py-0.5 text-xs font-medium tabular-nums text-background opacity-0 shadow transition-opacity duration-150 group-hover/thumb:opacity-100 group-focus-visible/thumb:opacity-100 group-active/thumb:opacity-100 motion-reduce:transition-none",
                vertical
                  ? "top-1/2 left-full ml-2 -translate-y-1/2"
                  : "bottom-full left-1/2 mb-2 -translate-x-1/2",
              )}
            >
              {formatValue ? formatValue(v) : v}
            </span>
          )}
        </Primitive.Thumb>
      ))}
    </Primitive.Root>
  );
}

export { Slider, type SliderProps };
