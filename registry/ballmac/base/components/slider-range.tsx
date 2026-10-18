// Ballmac UI: Slider Range. https://ui.ballmac.com/components/slider-range
"use client"

import * as React from "react"
import { Slider as SliderPrimitive } from "@base-ui/react/slider"
import { DirectionProvider, useDirection } from "@/lib/ballmac/direction"
import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"

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
  const msg = useMessages()
  const [internal, setInternal] = React.useState<[number, number]>(defaultValue)
  const current = value ?? internal
  const dir = useDirection(props.dir as "ltr" | "rtl" | undefined)
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
      <DirectionProvider dir={dir}>
      <SliderPrimitive.Root
        dir={dir}
        {...props}
        value={current}
        onValueChange={(next) => {
          const list = next as readonly number[]
          const pair: [number, number] = [list[0]!, list[1]!]
          if (value === undefined) setInternal(pair)
          onValueChange?.(pair)
        }}
        min={min}
        max={max}
        step={step}
        minStepsBetweenValues={minStepsBetweenThumbs}
        disabled={disabled}
        className="relative flex h-5 w-full touch-none select-none items-center data-disabled:opacity-50"
      >
        <SliderPrimitive.Control className="relative flex size-full items-center">
        <SliderPrimitive.Track
          data-slot="slider-range-track"
          className="bg-secondary relative h-2 w-full grow overflow-hidden rounded-full"
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range-fill"
            className="bg-primary h-full"
          />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          index={0}
          data-slot="slider-range-min"
          getAriaLabel={() => msg("slider-range.minimum", "{label} minimum", { label })}
          className="border-primary bg-background block size-5 rounded-full border-2 shadow-sm outline-none transition-transform duration-150 has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50 motion-safe:hover:scale-110 motion-reduce:transition-none"
        />
        <SliderPrimitive.Thumb
          index={1}
          data-slot="slider-range-max"
          getAriaLabel={() => msg("slider-range.maximum", "{label} maximum", { label })}
          className="border-primary bg-background block size-5 rounded-full border-2 shadow-sm outline-none transition-transform duration-150 has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50 motion-safe:hover:scale-110 motion-reduce:transition-none"
        />
        </SliderPrimitive.Control>
      </SliderPrimitive.Root>
      </DirectionProvider>
      <div className="text-muted-foreground flex justify-between text-xs tabular-nums">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  )
}
export { SliderRange, type SliderRangeProps }
