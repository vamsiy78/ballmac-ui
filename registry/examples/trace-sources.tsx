import { ArrowUpRight, Globe } from "lucide-react"

import { Trace, TraceCollapsible, TraceCollapsibleContent, TraceCollapsibleTrigger, TraceDescription, TraceIcon, TraceLine, TraceTitle } from "@/components/ballmac/trace"

const sources = [
  { title: "Dynamic search", host: "ui.shadcn.com", href: "https://ui.shadcn.com/docs/registry/dynamic-search" },
  { title: "Registry index", host: "ui.shadcn.com", href: "https://ui.shadcn.com/docs/registry/registry-index" },
  { title: "Base UI", host: "base-ui.com", href: "https://base-ui.com" },
]

/** The links an answer used: a row that expands into a Trace of link rows. */
export default function TraceSources() {
  return (
    <Trace className="w-full max-w-md">
      <TraceCollapsible>
        <TraceCollapsibleTrigger>
          <TraceLine>
            <TraceIcon>
              <Globe />
            </TraceIcon>
            <TraceTitle>Used 3 sources</TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent className="ps-4">
          <Trace>
            {sources.map((s) => (
              <a key={s.href} href={s.href} target="_blank" rel="noreferrer">
                <TraceLine>
                  <TraceTitle>
                    {s.title}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </TraceTitle>
                  <TraceDescription>{s.host}</TraceDescription>
                  <TraceIcon>
                    <ArrowUpRight className="rtl:-scale-x-100" />
                  </TraceIcon>
                </TraceLine>
              </a>
            ))}
          </Trace>
        </TraceCollapsibleContent>
      </TraceCollapsible>
    </Trace>
  )
}
