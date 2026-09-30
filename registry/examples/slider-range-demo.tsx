"use client"

import { SliderRange } from "@/components/ballmac/slider-range"
export default function SliderRangeDemo() {
  return (
    <div className="w-full max-w-sm rounded-xl border border-border bg-card p-5">
      <p className="mb-5 text-sm font-semibold">Filter by monthly spend</p>
      <SliderRange
        label="Budget range"
        min={0}
        max={500}
        step={10}
        defaultValue={[80, 320]}
        minStepsBetweenThumbs={2}
        formatValue={(value) => `$${value}`}
      />
      <p className="text-muted-foreground mt-4 text-xs">
        Use arrow keys for precise adjustments.
      </p>
    </div>
  )
}
