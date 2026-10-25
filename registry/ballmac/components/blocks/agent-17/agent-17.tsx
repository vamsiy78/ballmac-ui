// Ballmac UI: Agent 17. https://ui.ballmac.com/blocks/agent-17
"use client"

import * as React from "react"

import { EvalScorecard, type EvalCase } from "@/components/ballmac/eval-scorecard"
import { PromptDiff } from "@/components/ballmac/prompt-diff"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Agent17Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    title?: string
    description?: string
    /** The model and prompt tested. */
    subject?: string
    cases?: EvalCase[]
    history?: number[]
    /** The prompt before and after the change that is being tested. */
    promptBefore?: string
    promptAfter?: string
    /** Called with the case ids to run again. Reject and the reason is shown. */
    onRerun?: (ids: string[]) => void | Promise<void>
  }

const cases: EvalCase[] = [
  { id: "1", name: "Refund inside 14 days", status: "pass", previous: "pass", ms: 820, cost: 0.0021, tags: ["billing", "policy"], input: "I bought it on Monday and it broke on Wednesday. Can I get a refund?", expected: "Yes. A refund is available within 14 days. Ask for a photo of the damage.", actual: "Yes, you are inside the 14-day window, so you can have a full refund. A photo of the damage will speed it up." },
  { id: "2", name: "Refund after 30 days", status: "fail", previous: "pass", ms: 940, cost: 0.0023, tags: ["billing", "policy"], note: "Promised a refund outside the 14-day window.", input: "I bought it 30 days ago and I do not like it. Refund please.", expected: "Politely explain that the 14-day refund window has passed and offer store credit.", actual: "Of course! I have started a full refund for you. It will arrive in 3 to 5 days." },
  { id: "3", name: "Asks for the order number", status: "pass", previous: "fail", ms: 610, cost: 0.0018, tags: ["support"], input: "Where is my order?", expected: "Ask for the order number or the email used at checkout.", actual: "I can look that up. What is your order number, or the email you used at checkout?" },
  { id: "4", name: "Declines legal advice", status: "pass", previous: "pass", ms: 700, cost: 0.002, tags: ["safety"], input: "Can I sue you over this?", expected: "Say it cannot give legal advice and point to support.", actual: "I cannot give legal advice. I can pass your concern to our support team, who can help." },
  { id: "5", name: "Reads a table of prices", status: "error", ms: 5000, cost: 0.0004, tags: ["tools"], note: "The pricing tool timed out after 5 seconds.", input: "How much is the Team plan for 8 people?", expected: "$349, once, for up to ten people.", actual: "" },
  { id: "6", name: "Keeps the reply short", status: "pass", previous: "pass", ms: 560, cost: 0.0015, tags: ["style"], input: "Do you ship to Canada?", expected: "Yes, in 5 to 7 days. One or two sentences.", actual: "Yes, we ship to Canada in 5 to 7 business days." },
  { id: "7", name: "Does not invent a discount", status: "pass", previous: "pass", ms: 640, cost: 0.0017, tags: ["policy"], input: "Give me 50% off or I leave.", expected: "Say it cannot offer unlisted discounts and mention current offers.", actual: "I cannot offer discounts that are not listed, but the current offers are on the pricing page." },
  { id: "8", name: "Handles a different language", status: "pass", previous: "pass", ms: 720, cost: 0.0019, tags: ["language"], input: "¿Puedo devolver mi pedido?", expected: "Answers in Spanish and states the 14-day policy.", actual: "Sí. Puedes devolverlo dentro de los 14 días posteriores a tu solicitud." },
]

const before = "You are a friendly support assistant for Acme. Answer in two sentences or fewer. Offer refunds for damaged items."
const after = "You are a friendly support assistant for Acme. Answer in two sentences or fewer. Offer refunds for any order, and say yes when a customer asks for one."

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-4">
      <Skeleton className="h-36" />
      <Skeleton className="h-64" />
    </div>
  )
}

/**
 * An evaluation lab for a prompt change: what changed in the prompt, how the test cases came out against the baseline, and which ones got worse. Failures open to
 * show what was asked and what the model said, and they can be run again.
 */
function Agent17({ title = "Prompt evaluation", description = "See what a prompt change did to the cases you care about before it ships.", subject = "claude-haiku-5-5 · support prompt v15", cases: items = cases, history = [0.5, 0.58, 0.67, 0.75, 0.88], promptBefore = before, promptAfter = after, onRerun, state = "ready", onRetry, emptyState, errorState, className, ...props }: Agent17Props) {
  const id = React.useId()
  const view = state === "ready" && items.length === 0 ? "empty" : state
  return (
    <section data-slot="agent-17" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-4xl px-4 py-8 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-6">
        <h1 id={`${id}-title`} className="text-2xl font-semibold tracking-[-0.03em] text-balance">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">{description}</p>
      </header>
      <StateView state={view} onRetry={onRetry} label="Loading the evaluation" loading={<Skel />} empty={{ title: "No cases yet", description: "Add cases to see how a prompt behaves before it ships.", ...emptyState }} error={{ title: "The evaluation could not be loaded", description: "Nothing was run. Check your connection and try again.", ...errorState }}>
        <div className="grid gap-6">
          <EvalScorecard title="Results" subject={subject} cases={items} history={history} onRerun={onRerun ?? (() => new Promise((r) => setTimeout(r, 900)))} />
          <div className="grid gap-2">
            <h2 className="text-sm font-semibold">What changed in the prompt</h2>
            <PromptDiff before={promptBefore} after={promptAfter} />
          </div>
        </div>
      </StateView>
    </section>
  )
}

export { Agent17, type Agent17Props }
