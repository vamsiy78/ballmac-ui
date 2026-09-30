"use client"

import * as React from "react"
import { ArrowUp, Paperclip } from "lucide-react"

import { ModelPicker, type ModelOption } from "@/components/ballmac/model-picker"

const models: ModelOption[] = [
  { id: "lyra-xl", name: "Lyra XL", provider: "Lyra", description: "Hard problems and long documents.", capabilities: ["vision", "reasoning"], contextWindow: 1_000_000, cost: 3 },
  { id: "lyra-mid", name: "Lyra Mid", provider: "Lyra", description: "Balanced for everyday work.", capabilities: ["vision", "fast"], contextWindow: 200_000, cost: 2 },
  { id: "lyra-mini", name: "Lyra Mini", provider: "Lyra", description: "Instant replies for simple tasks.", capabilities: ["fast"], contextWindow: 128_000, cost: 1 },
]

export default function ModelPickerCompact() {
  const [model, setModel] = React.useState("lyra-mid")
  return (
    <div className="flex h-[22rem] w-full max-w-xl flex-col justify-end">
      <div className="rounded-2xl border bg-card p-3 shadow-xs">
        <textarea
          aria-label="Message"
          rows={2}
          placeholder="Ask anything…"
          className="w-full resize-none bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground"
        />
        <div className="mt-1 flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Attach a file"
            className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <Paperclip aria-hidden="true" className="size-4" />
          </button>
          <ModelPicker variant="compact" models={models} value={model} onValueChange={setModel} showDetails={false} searchable={false} />
          <button
            type="button"
            aria-label="Send message"
            className="ml-auto inline-flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground outline-none hover:bg-primary/90 focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <ArrowUp aria-hidden="true" className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
