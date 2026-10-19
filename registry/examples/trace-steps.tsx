"use client"

import { Check, ListChecks, LoaderCircle } from "lucide-react"

import { Trace, TraceCollapsible, TraceCollapsibleContent, TraceCollapsibleTrigger, TraceDescription, TraceIcon, TraceLine, TraceTitle } from "@/components/ballmac/trace"

/** A chain of thought: a summary row that expands into the steps behind it. Each level is a Trace. */
export default function TraceSteps() {
  return (
    <Trace className="w-full max-w-md">
      <TraceCollapsible defaultOpen>
        <TraceCollapsibleTrigger>
          <TraceLine>
            <TraceIcon>
              <ListChecks />
            </TraceIcon>
            <TraceTitle>Planned the migration</TraceTitle>
            <TraceDescription>3 of 4 steps</TraceDescription>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent className="ps-4">
          <Trace>
            <TraceLine>
              <TraceIcon>
                <Check />
              </TraceIcon>
              <TraceTitle>Read the old schema</TraceTitle>
            </TraceLine>
            <TraceLine>
              <TraceIcon>
                <Check />
              </TraceIcon>
              <TraceTitle>Wrote the new tables</TraceTitle>
            </TraceLine>
            <TraceLine>
              <TraceIcon>
                <Check />
              </TraceIcon>
              <TraceTitle>Backfilled 12,408 rows</TraceTitle>
            </TraceLine>
            <TraceLine status="running">
              <TraceIcon>
                <LoaderCircle className="animate-spin motion-reduce:animate-none" />
              </TraceIcon>
              <TraceTitle>Switching reads to the new tables</TraceTitle>
            </TraceLine>
          </Trace>
        </TraceCollapsibleContent>
      </TraceCollapsible>
    </Trace>
  )
}
