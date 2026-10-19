"use client"

import { CheckCircle2, XCircle } from "lucide-react"

import { Trace, TraceCollapsible, TraceCollapsibleContent, TraceCollapsibleTrigger, TraceIcon, TraceLine, TraceTitle } from "@/components/ballmac/trace"
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockFooter,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
  useHighlightedCode,
} from "@/components/ballmac/code-block"

const ok = `$ pnpm test
 ✓ 42 passed`
const failed = `$ pnpm test
 FAIL  src/cart.test.ts
 Expected: 40
 Received: 20`

/** Small blocks for tool output inside a Trace; destructive for failures. */
export default function CodeBlockToolOutput() {
  return (
    <Trace className="w-full max-w-xl">
      {[
        { title: "Ran the unit tests", out: ok, bad: false },
        { title: "Ran the cart tests", out: failed, bad: true },
      ].map((step) => (
        <TraceCollapsible key={step.title} defaultOpen={step.bad}>
          <TraceCollapsibleTrigger>
            <TraceLine status={step.bad ? "error" : undefined}>
              <TraceIcon>{step.bad ? <XCircle /> : <CheckCircle2 />}</TraceIcon>
              <TraceTitle>{step.title}</TraceTitle>
            </TraceLine>
          </TraceCollapsibleTrigger>
          <TraceCollapsibleContent>
            <CodeBlock size="sm" variant={step.bad ? "destructive" : "default"}>
              <CodeBlockContent wrap className="max-h-64">
                {step.out}
              </CodeBlockContent>
            </CodeBlock>
          </TraceCollapsibleContent>
        </TraceCollapsible>
      ))}
    </Trace>
  )
}
