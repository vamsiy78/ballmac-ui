"use client"

import { SliderRange } from "@/components/ballmac/slider-range"
export default function SliderRangeStates() {
  return (
    <div className="grid w-full max-w-xs gap-6">
      <SliderRange
        label="Duration in days"
        min={1}
        max={30}
        defaultValue={[7, 21]}
        formatValue={(value) => `${value}d`}
      />
      <SliderRange label="Disabled range" defaultValue={[20, 60]} disabled />
    </div>
  )
}
