"use client"

import * as React from "react"

import { ModelCompare, type ModelOption } from "@/components/ballmac/model-compare"

const models: ModelOption[] = [
  { id: "haiku", name: "Haiku 5.5", provider: "Anthropic", description: "Fast and cheap. Good for routing, tagging and short answers.", intelligence: 3, speed: 5, cost: 1, context: 200000 },
  { id: "sonnet", name: "Sonnet 5.5", provider: "Anthropic", description: "The balanced choice for most agents: strong reasoning at a fair price.", intelligence: 4, speed: 4, cost: 2, context: 200000, recommended: true },
  { id: "opus", name: "Opus 5.5", provider: "Anthropic", description: "The most capable. Best for long, hard tasks.", intelligence: 5, speed: 2, cost: 5, context: 1000000, unavailable: "Needs the Pro plan" },
  { id: "gpt", name: "GPT-5.6 Sol", provider: "OpenAI", description: "Strong at code and tool use, with very fast first tokens.", intelligence: 4, speed: 4, cost: 3, context: 400000 },
  { id: "gpt-mini", name: "GPT-5.6 Mini", provider: "OpenAI", description: "Small and quick for high-volume work.", intelligence: 3, speed: 5, cost: 1, context: 128000 },
  { id: "gemini", name: "Gemini 3.8 Flash", provider: "Google", description: "Very long context at a low price.", intelligence: 3, speed: 5, cost: 1, context: 1000000 },
  { id: "gemini-pro", name: "Gemini 3.8 Pro", provider: "Google", description: "Deep reasoning over long documents and video.", intelligence: 5, speed: 3, cost: 4, context: 2000000 },
]

export default function ModelCompareDemo() {
  const [value, setValue] = React.useState("sonnet")
  return (
    <div className="w-full max-w-4xl">
      <ModelCompare models={models} value={value} onValueChange={setValue} label="Which model should run this agent?" />
    </div>
  )
}
