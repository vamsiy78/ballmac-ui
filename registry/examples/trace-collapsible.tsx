"use client"

import * as React from "react"
import { Brain, Terminal } from "lucide-react"

import { Trace, TraceCollapsible, TraceCollapsibleContent, TraceCollapsibleTrigger, TraceIcon, TraceLine, TraceTitle } from "@/components/ballmac/trace"

const thought = "The lockfile pins 9.1.0, so the new option is not available yet. I will check the changelog before changing the setting."

/** A row that opens while it streams and closes when it is done, unless the reader has already chosen. Pass `open ?? running`. */
export default function TraceCollapsibleExample() {
  const [running, setRunning] = React.useState(true)
  const [open, setOpen] = React.useState<boolean>()
  React.useEffect(() => {
    const t = setTimeout(() => setRunning(false), 3500)
    return () => clearTimeout(t)
  }, [])
  return (
    <Trace className="w-full max-w-md">
      <TraceCollapsible open={open ?? running} onOpenChange={setOpen}>
        <TraceCollapsibleTrigger>
          <TraceLine status={running ? "running" : undefined}>
            <TraceIcon>
              <Brain />
            </TraceIcon>
            <TraceTitle>{running ? "Thinking" : "Thought for 4 seconds"}</TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>
          <p className="ps-6">{thought}</p>
        </TraceCollapsibleContent>
      </TraceCollapsible>
      <TraceCollapsible defaultOpen>
        <TraceCollapsibleTrigger>
          <TraceLine>
            <TraceIcon>
              <Terminal />
            </TraceIcon>
            <TraceTitle>Ran pnpm why minimum-release-age</TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>
          <pre className="ms-6 overflow-x-auto rounded-md border bg-muted p-2 font-mono text-xs text-foreground" dir="ltr">{"pnpm 9.1.0\n└── (not found)"}</pre>
        </TraceCollapsibleContent>
      </TraceCollapsible>
    </Trace>
  )
}
