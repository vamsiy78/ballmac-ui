"use client"

import { HandoffCard } from "@/components/ballmac/handoff-card"

export default function HandoffCardReturned() {
  return (
    <div className="w-full max-w-xl">
      <HandoffCard
        from={{ name: "Coder", role: "Writes the change" }}
        to={{ name: "Reviewer", role: "Checks the result" }}
        title="Retry with backoff, ready for review"
        status="returned"
        statusLabel="Sent back"
        at="2:41 pm"
        context={[{ label: "The diff", detail: "7 files", size: "+142 −38" }]}
        questions={["The new test fails on the CI runner but passes locally. Which runner should it be tuned for?"]}
        actions={
          <>
            <button type="button" className="h-9 rounded-full border bg-background px-4 text-sm font-medium outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50">Answer</button>
            <button type="button" className="h-9 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground outline-none hover:bg-primary/90 focus-visible:ring-[3px] focus-visible:ring-ring/50">Send it back again</button>
          </>
        }
      />
    </div>
  )
}
