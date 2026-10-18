// Ballmac UI: Slider. https://ui.ballmac.com/components/slider
// Based on shadcn/ui Slider (MIT, Copyright (c) 2023 shadcn), adding per-thumb labels, a live value bubble, and vertical support.
"use client";

import * as React from "react";
import { Slider as Primitive } from "@base-ui/react/slider";
import { DirectionProvider, useDirection } from "@/lib/ballmac/direction";
import { cn } from "@/lib/utils";

type SliderProps = Omit<
  React.ComponentProps<typeof Primitive.Root>,
  "value" | "defaultValue" | "onValueChange" | "className"
> & {
  className?: string;
  /** Reading direction for the arrow keys and the track. Defaults to the page's. */
  dir?: "ltr" | "rtl";
  /** Controlled value. One number per thumb. */
  value?: number[];
  /** Initial value when uncontrolled. One number per thumb; two numbers make a range. */
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
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
  dir: dirProp,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  ...props
}: SliderProps) {
  const [inner, setInner] = React.useState<number[]>(defaultValue ?? [min]);
  const values = value ?? inner;
  const vertical = orientation === "vertical";
  const dir = useDirection(dirProp);
  return (
    <DirectionProvider dir={dir}>
      <Primitive.Root
        data-slot="slider"
        dir={dir}
        value={value}
        defaultValue={defaultValue}
        min={min}
        max={max}
        orientation={orientation}
        aria-labelledby={ariaLabelledby}
        onValueChange={(next) => {
          const list = Array.isArray(next) ? [...next] : [next as number];
          setInner(list);
          onValueChange?.(list);
        }}
        className={cn(
          "relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-[orientation=vertical]:h-44 data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
          className,
        )}
        {...props}
      >
        <Primitive.Control className="relative flex size-full grow items-center data-[orientation=vertical]:flex-col">
          <Primitive.Track
            data-slot="slider-track"
            className="relative grow overflow-hidden rounded-full bg-muted data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
          >
            <Primitive.Indicator
              data-slot="slider-range"
              className="bg-primary data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
            />
          </Primitive.Track>
          {values.map((v, i) => (
            <Primitive.Thumb
              key={i}
              index={values.length > 1 ? i : undefined}
              data-slot="slider-thumb"
              getAriaLabel={() => thumbLabels?.[i] ?? (values.length === 1 ? ariaLabel : undefined) ?? ""}
              aria-labelledby={values.length === 1 && !thumbLabels?.[i] ? ariaLabelledby : undefined}
              aria-valuetext={formatValue ? formatValue(v) : undefined}
              className="group/thumb relative block size-5 shrink-0 rounded-full border-2 border-primary bg-background shadow-sm outline-none transition-[box-shadow,transform] duration-150 hover:ring-4 hover:ring-ring/30 has-focus-visible:ring-4 has-focus-visible:ring-ring/50 active:scale-110 data-disabled:pointer-events-none motion-reduce:transition-none motion-reduce:active:scale-100"
            >
              {showValue && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none absolute rounded-md bg-foreground px-1.5 py-0.5 text-xs font-medium tabular-nums text-background opacity-0 shadow transition-opacity duration-150 group-hover/thumb:opacity-100 group-has-focus-visible/thumb:opacity-100 group-active/thumb:opacity-100 motion-reduce:transition-none",
                    vertical
                      ? "top-1/2 start-full ms-2 -translate-y-1/2"
                      : "bottom-full left-1/2 mb-2 -translate-x-1/2",
                  )}
                >
                  {formatValue ? formatValue(v) : v}
                </span>
              )}
            </Primitive.Thumb>
          ))}
        </Primitive.Control>
      </Primitive.Root>
    </DirectionProvider>
  );
}

export { Slider, type SliderProps };
