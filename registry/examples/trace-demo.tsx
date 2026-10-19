"use client"

import { ArrowUpRight, FileCode2, FilePen, Search, Terminal } from "lucide-react"

import { Trace, TraceCollapsible, TraceCollapsibleContent, TraceCollapsibleTrigger, TraceDescription, TraceIcon, TraceLine, TraceTitle } from "@/components/ballmac/trace"

export default function TraceDemo() {
  return (
    <Trace className="w-full max-w-md">
      <TraceLine>
        <TraceIcon>
          <Search />
        </TraceIcon>
        <TraceTitle>Searched for minimumReleaseAge</TraceTitle>
      </TraceLine>
      <TraceCollapsible>
        <TraceCollapsibleTrigger>
          <TraceLine>
            <TraceIcon>
              <Terminal />
            </TraceIcon>
            <TraceTitle>Ran node --version</TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>
          <p className="ps-6 font-mono text-xs">v24.18.0</p>
        </TraceCollapsibleContent>
      </TraceCollapsible>
      <TraceLine>
        <TraceIcon>
          <FilePen />
        </TraceIcon>
        <TraceTitle>Edited pnpm-workspace.yaml</TraceTitle>
        <TraceDescription>+3 −1</TraceDescription>
      </TraceLine>
      <a href="https://docs.astro.build" target="_blank" rel="noreferrer">
        <TraceLine>
          <TraceIcon>
            <FileCode2 />
          </TraceIcon>
          <TraceTitle>
            Read the Astro guide
            <span className="sr-only"> (opens in a new tab)</span>
          </TraceTitle>
          <TraceIcon>
            <ArrowUpRight className="rtl:-scale-x-100" />
          </TraceIcon>
        </TraceLine>
      </a>
      <TraceLine status="running">
        <TraceIcon>
          <Terminal />
        </TraceIcon>
        <TraceTitle>Running pnpm build</TraceTitle>
      </TraceLine>
    </Trace>
  )
}
