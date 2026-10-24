"use client"

import { ThinkingLoader } from "@/components/ballmac/thinking-loader"

export default function ThinkingLoaderDemo() {
  return (
    <div className="grid w-full max-w-md gap-3">
      <p className="bg-foreground text-background ms-auto max-w-[85%] rounded-2xl rounded-ee-md px-4 py-2.5 text-sm">Which CRM fits a 10-person sales team best?</p>
      <ThinkingLoader className="justify-self-start" phases={["Thinking", "Searching the web", "Reading 6 sources", "Comparing pricing", "Writing the answer"]} />
    </div>
  )
}
