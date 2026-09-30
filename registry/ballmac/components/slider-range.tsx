// Ballmac UI: Slider Range. https://ui.ballmac.com/components/slider-range
"use client"

import * as React from "react"
import { Slider as SliderPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"

type SliderRangeProps = Omit<
  React.ComponentProps<typeof SliderPrimitive.Root>,
  "value" | "defaultValue" | "onValueChange"
> & {
  /** Visible label for the range. */
  label: string
  /** Controlled lower and upper values. */
  value?: [number, number]
  /** Initial lower and upper values. */
  defaultValue?: [number, number]
  /** Called when either thumb changes. */
  onValueChange?: (value: [number, number]) => void
  /** Formats both displayed values. */
  formatValue?: (value: number) => string
  /** Minimum number of steps between thumbs. */
  minStepsBetweenThumbs?: number
}
function SliderRange({
  className,
  label,
  value,
  defaultValue = [25, 75],
  onValueChange,
  formatValue = (number) => String(number),
  min = 0,
  max = 100,
  step = 1,
  minStepsBetweenThumbs = 1,
  disabled,
  ...props
}: SliderRangeProps) {
  const [internal, setInternal] = React.useState<[number, number]>(defaultValue)
  const current = value ?? internal
  return (
    <div
      data-slot="slider-range"
      className={cn("flex min-w-0 flex-col gap-4", className)}
    >
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium">{label}</span>
        <span
          data-slot="slider-range-value"
          className="text-muted-foreground shrink-0 font-mono text-xs tabular-nums"
        >
          {formatValue(current[0])} – {formatValue(current[1])}
        </span>
      </div>
      <SliderPrimitive.Root
        {...props}
        value={current}
        onValueChange={(next) => {
          const pair: [number, number] = [next[0], next[1]]
          if (value === undefined) setInternal(pair)
          onValueChange?.(pair)
        }}
        min={min}
        max={max}
        step={step}
        minStepsBetweenThumbs={minStepsBetweenThumbs}
        disabled={disabled}
        className="relative flex h-5 w-full touch-none select-none items-center data-[disabled]:opacity-50"
      >
        <SliderPrimitive.Track
          data-slot="slider-range-track"
          className="bg-secondary relative h-2 w-full grow overflow-hidden rounded-full"
        >
          <SliderPrimitive.Range
            data-slot="slider-range-fill"
            className="bg-primary absolute h-full"
          />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          data-slot="slider-range-min"
          aria-label={`${label} minimum`}
          className="border-primary bg-background block size-5 rounded-full border-2 shadow-sm outline-none transition-transform duration-150 focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-safe:hover:scale-110 motion-reduce:transition-none"
        />
        <SliderPrimitive.Thumb
          data-slot="slider-range-max"
          aria-label={`${label} maximum`}
          className="border-primary bg-background block size-5 rounded-full border-2 shadow-sm outline-none transition-transform duration-150 focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-safe:hover:scale-110 motion-reduce:transition-none"
        />
      </SliderPrimitive.Root>
      <div className="text-muted-foreground flex justify-between text-xs tabular-nums">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  )
}
export { SliderRange, type SliderRangeProps }
