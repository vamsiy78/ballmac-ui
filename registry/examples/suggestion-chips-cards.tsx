"use client"

import { BarChart3, Bug, PenLine, Sparkles } from "lucide-react"

import { SuggestionChips } from "@/components/ballmac/suggestion-chips"

export default function SuggestionChipsCards() {
  return (
    <div className="w-full max-w-xl">
      <SuggestionChips
        variant="cards"
        label="Ways to start"
        onSelect={() => {}}
        suggestions={[
          { label: "Draft a launch email", description: "Friendly, short, with one clear call to action.", icon: <PenLine /> },
          { label: "Find the bug", description: "Paste a stack trace and get likely causes.", icon: <Bug /> },
          { label: "Analyze a CSV", description: "Summaries, outliers and a chart to share.", icon: <BarChart3 /> },
          { label: "Brainstorm names", description: "Twenty options grouped by tone.", icon: <Sparkles /> },
        ]}
      />
    </div>
  )
}
