"use client"

import { ModelCompare } from "@/components/ballmac/model-compare"

export default function ModelCompareShort() {
  return (
    <div className="w-full max-w-3xl">
      <ModelCompare
        defaultValue="balanced"
        label="Quality"
        models={[
          { id: "fast", name: "Fast", provider: "Auto", description: "Quick answers for simple questions.", intelligence: 2, speed: 5, cost: 1 },
          { id: "balanced", name: "Balanced", provider: "Auto", description: "Good for most things.", intelligence: 4, speed: 4, cost: 2, recommended: true },
          { id: "deep", name: "Deep", provider: "Auto", description: "Takes longer on hard problems.", intelligence: 5, speed: 2, cost: 4 },
        ]}
      />
    </div>
  )
}
