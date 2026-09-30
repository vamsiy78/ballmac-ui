"use client"

import * as React from "react"
import { Code2, FileText, Languages, Lightbulb } from "lucide-react"

import { SuggestionChips } from "@/components/ballmac/suggestion-chips"

const sets = [
  [
    { label: "Explain this error", icon: <Code2 />, prompt: "Explain this error and how to fix it" },
    { label: "Summarize the thread", icon: <FileText />, prompt: "Summarize the thread in three bullets" },
    { label: "Translate to Spanish", icon: <Languages />, prompt: "Translate the last reply to Spanish" },
    { label: "Give me another idea", icon: <Lightbulb />, prompt: "Give me another idea" },
  ],
  [
    { label: "Write a unit test", icon: <Code2 />, prompt: "Write a unit test for this function" },
    { label: "Shorten it", icon: <FileText />, prompt: "Shorten the reply to two sentences" },
    { label: "Make it friendlier", icon: <Lightbulb />, prompt: "Rewrite it in a friendlier tone" },
    { label: "Show an example", icon: <Languages />, prompt: "Show a short example" },
  ],
]

export default function SuggestionChipsDemo() {
  const [set, setSet] = React.useState(0)
  const [sent, setSent] = React.useState<string | null>(null)
  return (
    <div className="grid w-full max-w-lg gap-3">
      <SuggestionChips suggestions={sets[set]!} onSelect={(prompt) => setSent(prompt)} onRefresh={() => setSet((s) => (s + 1) % sets.length)} />
      <p className="min-h-5 rounded-lg border border-dashed px-3 py-2 text-[13px] text-muted-foreground" aria-live="polite">
        {sent ? (
          <>
            Sent: <span className="text-foreground">{sent}</span>
          </>
        ) : (
          "Choose a suggestion to send it."
        )}
      </p>
    </div>
  )
}
