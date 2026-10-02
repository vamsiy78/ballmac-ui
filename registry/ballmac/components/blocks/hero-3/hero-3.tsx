// Ballmac UI: Hero 3. https://ui.ballmac.com/blocks/hero-3
"use client"

import * as React from "react"
import { Sparkles } from "lucide-react"

import { Badge } from "@/components/ballmac/badge"
import { PromptInput, PromptInputSubmit, PromptInputTextarea, PromptInputToolbar } from "@/components/ballmac/prompt-input"
import { ReasoningDisclosure } from "@/components/ballmac/reasoning-disclosure"
import { StreamingText } from "@/components/ballmac/streaming-text"
import { ToolCallCard } from "@/components/ballmac/tool-call-card"
import { cn } from "@/lib/utils"

type Hero3Props = Omit<React.ComponentProps<"section">, "title" | "onSubmit"> & {
  /** Label above the headline. */
  eyebrow?: string
  /** The headline. */
  title?: string
  /** One or two sentences under the headline. */
  description?: string
  /** Placeholder for the demo prompt. */
  placeholder?: string
  /** Called when a visitor submits the prompt, e.g. to route them to sign-up with their question. */
  onSubmit?: (value: string) => void
}

const ANSWER = "Revenue grew 18% quarter over quarter, driven by annual plans. Churn fell to 2.1%, the lowest this year."

function Hero3({
  eyebrow = "AI analyst",
  title = "Ask your data anything.",
  description = "Type a question in plain English. The assistant finds the right tables, runs the queries and explains the answer with sources.",
  placeholder = "How did revenue change last quarter?",
  onSubmit,
  className,
  ...props
}: Hero3Props) {
  return (
    <section data-slot="hero-3" className={cn("relative isolate overflow-hidden", className)} {...props}>
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 md:py-28 lg:grid-cols-2">
        <div>
          <Badge variant="outline" className="gap-1.5 rounded-full px-3 py-1">
            <Sparkles className="size-3.5" aria-hidden="true" />
            {eyebrow}
          </Badge>
          <h1 className="mt-6 text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl lg:text-6xl">{title}</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-pretty text-muted-foreground">{description}</p>
          <PromptInput className="mt-8 max-w-xl" onSubmit={(v) => onSubmit?.(v)}>
            <PromptInputTextarea placeholder={placeholder} aria-label="Ask a question" />
            <PromptInputToolbar>
              <span className="px-2 text-xs text-muted-foreground">Press Enter to ask</span>
              <PromptInputSubmit className="ms-auto" />
            </PromptInputToolbar>
          </PromptInput>
        </div>
        <div className="space-y-3 rounded-2xl border bg-card p-5 shadow-[0_30px_80px_-40px_rgb(0_0_0/0.35)] sm:p-6">
          <p className="ms-auto w-fit max-w-[85%] rounded-xl rounded-ee-sm bg-muted px-3.5 py-2 text-sm">{placeholder}</p>
          <ReasoningDisclosure duration={4} defaultOpen={false}>
            Revenue lives in the invoices table; churn in subscriptions. Compare Q3 against Q2 and group by plan.
          </ReasoningDisclosure>
          <ToolCallCard name="run_sql" status="success" duration={318} input={{ query: "select plan, sum(amount) from invoices group by plan" }} result="3 rows" />
          <div className="text-sm leading-7">
            <StreamingText text={ANSWER} animate speed={50} />
          </div>
        </div>
      </div>
    </section>
  )
}

export { Hero3, type Hero3Props }
