"use client"

import { ModelPicker, type ModelOption } from "@/components/ballmac/model-picker"

const models: ModelOption[] = [
  { id: "lyra-xl", name: "Lyra XL", provider: "Lyra", description: "Best for hard problems, long documents and careful writing.", capabilities: ["vision", "reasoning", "tools"], contextWindow: 1_000_000, cost: 3, isNew: true },
  { id: "lyra-mid", name: "Lyra Mid", provider: "Lyra", description: "Balanced speed and quality for everyday work.", capabilities: ["vision", "tools", "fast"], contextWindow: 200_000, cost: 2 },
  { id: "lyra-mini", name: "Lyra Mini", provider: "Lyra", description: "Near-instant replies for simple tasks and autocomplete.", capabilities: ["fast"], contextWindow: 128_000, cost: 1 },
  { id: "orion-think", name: "Orion Think", provider: "Orion", description: "Shows its reasoning on math, code and planning.", capabilities: ["reasoning", "tools"], contextWindow: 256_000, cost: 3, locked: true, lockedLabel: "Pro" },
  { id: "orion-chat", name: "Orion Chat", provider: "Orion", description: "Friendly conversation with strong multilingual skill.", capabilities: ["vision", "fast"], contextWindow: 128_000, cost: 1 },
  { id: "vega-open", name: "Vega 70B", provider: "Vega (open weights)", description: "Runs on your own hardware. Good general model.", capabilities: ["tools"], contextWindow: 64_000, cost: 1 },
  { id: "vega-code", name: "Vega Code", provider: "Vega (open weights)", description: "Tuned for editing and explaining code.", capabilities: ["tools", "fast"], contextWindow: 96_000, cost: 1 },
]

export default function ModelPickerDemo() {
  return (
    <div className="flex h-[24rem] w-full max-w-xl items-start justify-center">
      <ModelPicker models={models} defaultValue="lyra-mid" />
    </div>
  )
}
