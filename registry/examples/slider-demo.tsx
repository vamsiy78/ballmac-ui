"use client";
import * as React from "react";
import { Slider } from "@/components/ballmac/slider";
export default function SliderDemo() {
  const [volume, setVolume] = React.useState([64]);
  return (
    <div className="grid w-full max-w-sm gap-6 rounded-xl border bg-card p-5 pt-8 shadow-sm">
      <div className="grid gap-4">
        <p id="vol-label" className="text-sm font-medium">
          Volume
        </p>
        <Slider
          aria-labelledby="vol-label"
          value={volume}
          onValueChange={setVolume}
          showValue
          formatValue={(v) => `${v}%`}
        />
      </div>
      <div className="grid gap-4">
        <p id="price-label" className="text-sm font-medium">
          Price range
        </p>
        <Slider
          defaultValue={[20, 75]}
          min={0}
          max={200}
          step={5}
          thumbLabels={["Minimum price", "Maximum price"]}
          showValue
          formatValue={(v) => `$${v}`}
        />
      </div>
    </div>
  );
}
