"use client"

import * as React from "react"

import { PromptDiff } from "@/components/ballmac/prompt-diff"

export default function PromptDiffInline() {
  const [restored, setRestored] = React.useState(false)
  return (
    <div className="grid w-full max-w-3xl gap-3">
      <PromptDiff
        mode="unified"
        beforeLabel="v7"
        afterLabel="v8"
        before={"Summarise the ticket in two sentences. Include the customer's name and the order number."}
        after={"Summarise the ticket in one sentence. Include the order number. Leave out the customer's name."}
        onRestore={() => setRestored(true)}
      />
      {restored && <p role="status" className="rounded-lg border bg-card px-4 py-3 text-sm">Restored v7. The assistant will use it from the next conversation.</p>}
    </div>
  )
}
