"use client"

import { FileSearch, Terminal } from "lucide-react"

import { CodeBlock, CodeBlockContent } from "@/components/ballmac/code-block"
import { Questionnaire, QuestionnaireActions, QuestionnaireChoice, QuestionnaireChoices, QuestionnaireError, QuestionnaireItem, QuestionnaireSubmit, QuestionnaireTitle } from "@/components/ballmac/questionnaire"
import { Trace, TraceCollapsible, TraceCollapsibleContent, TraceCollapsibleTrigger, TraceDescription, TraceIcon, TraceLine, TraceTitle } from "@/components/ballmac/trace"

/** One agent turn built from the three shadcn chat-kit parts: what it did, what it ran, and a question it needs answered. */
export default function TraceAgentTurn() {
  return (
    <div className="grid w-full max-w-lg gap-4 text-sm">
      <Trace>
        <TraceLine>
          <TraceIcon>
            <FileSearch />
          </TraceIcon>
          <TraceTitle>Read 4 files</TraceTitle>
          <TraceDescription>src/billing</TraceDescription>
        </TraceLine>
        <TraceCollapsible>
          <TraceCollapsibleTrigger>
            <TraceLine>
              <TraceIcon>
                <Terminal />
              </TraceIcon>
              <TraceTitle>Ran the billing tests</TraceTitle>
              <TraceDescription>2 failed</TraceDescription>
            </TraceLine>
          </TraceCollapsibleTrigger>
          <TraceCollapsibleContent>
            <CodeBlock size="sm" variant="destructive">
              <CodeBlockContent wrap className="max-h-48">
                {"FAIL  invoice.test.ts\n  Expected total 40, received 20\nFAIL  tax.test.ts\n  Rate for DE is missing"}
              </CodeBlockContent>
            </CodeBlock>
          </TraceCollapsibleContent>
        </TraceCollapsible>
      </Trace>
      <p>The totals ignore quantity, and one tax rate is missing. Which should I fix first?</p>
      <Questionnaire onSubmit={(e) => e.preventDefault()}>
        <QuestionnaireItem name="first" required>
          <QuestionnaireTitle className="text-base">Fix first</QuestionnaireTitle>
          <QuestionnaireChoices>
            <QuestionnaireChoice value="totals">Invoice totals</QuestionnaireChoice>
            <QuestionnaireChoice value="tax">The missing tax rate</QuestionnaireChoice>
          </QuestionnaireChoices>
          <QuestionnaireError />
        </QuestionnaireItem>
        <QuestionnaireActions>
          <QuestionnaireSubmit>Send</QuestionnaireSubmit>
        </QuestionnaireActions>
      </Questionnaire>
    </div>
  )
}
