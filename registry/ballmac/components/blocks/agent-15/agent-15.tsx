// Ballmac UI: Agent 15. https://ui.ballmac.com/blocks/agent-15
"use client"

import * as React from "react"

import { MessageActions } from "@/components/ballmac/message-actions"
import { PromptLibrary, type LibraryPrompt } from "@/components/ballmac/prompt-library"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { WritingAssistant, type WritingSuggestion } from "@/components/ballmac/writing-assistant"
import { cn } from "@/lib/utils"

type Agent15Draft = { text: string; suggestions: WritingSuggestion[] }

type Agent15Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    title?: string
    description?: string
    prompts?: LibraryPrompt[]
    /** The draft shown to begin with. */
    draft?: Agent15Draft
    /** Called with a finished prompt. Return the draft it produces, with suggestions. Reject and the studio says why. */
    onGenerate?: (prompt: string, source: LibraryPrompt) => Promise<Agent15Draft | void> | Agent15Draft | void
    /** Called when feedback is given on the draft. */
    onFeedback?: (value: "up" | "down", reason?: string) => void | Promise<void>
  }

const samplePrompts: LibraryPrompt[] = [
  { id: "1", title: "Reply to an upset customer", description: "A calm reply that owns the problem and says what happens next.", body: "Write a {{tone}} reply to {{customer_name}} about {{issue}}. Own the problem, say what we will do and by when, and keep it under 120 words.", tags: ["support"], favourite: true },
  { id: "2", title: "Draft a polite no", description: "Declines a request and keeps the door open.", body: "Draft a polite email to {{customer_name}} declining {{request}}. Give one clear reason and suggest {{alternative}} instead.", tags: ["support"] },
  { id: "3", title: "Explain it in plain English", body: "Rewrite the text below so a new customer can follow it. No jargon, short sentences.", tags: ["writing"] },
]
const sampleDraft: Agent15Draft = {
  text: "Hi Maria, I wanted to reach out because we was thinking that it is very important to basically get the refund sorted out for you as soon as possible. Our team have looked at your order and it seems like the item arrived damaged, which we are really really sorry about.",
  suggestions: [
    { id: "1", find: "we was", replace: "we were", kind: "grammar", reason: "The subject and the verb do not agree." },
    { id: "2", find: "it is very important to basically get the refund sorted out for you as soon as possible", replace: "we will sort out your refund today", kind: "clarity", reason: "Says what will happen, and when, in fewer words." },
    { id: "3", find: "Our team have looked", replace: "Our team has looked", kind: "grammar", reason: "Team is singular here." },
    { id: "4", find: "it seems like the item arrived damaged", replace: "your item arrived damaged", kind: "tone", reason: "You have seen the photos. Say it plainly instead of hedging." },
    { id: "5", find: "really really sorry", replace: "sorry", kind: "length", reason: "One clear apology lands better than two." },
  ],
}

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-6">
      <Skeleton className="h-72 rounded-xl" />
      <Skeleton className="h-80 rounded-xl" />
    </div>
  )
}

/**
 * A drafting studio: pick a saved prompt and fill in its blanks, let the agent write a first draft, then polish it in place with suggestions you accept or dismiss one by
 * one, and give feedback on the result. The three parts hand work to each other, and each one says plainly when something did not work.
 */
function Agent15({ title = "Draft studio", description = "Start from a prompt, then polish the draft before it goes out.", prompts = samplePrompts, draft = sampleDraft, onGenerate, onFeedback, state = "ready", onRetry, emptyState, errorState, className, ...props }: Agent15Props) {
  const id = React.useId()
  const [text, setText] = React.useState(draft.text)
  const [suggestions, setSuggestions] = React.useState(draft.suggestions)
  const [status, setStatus] = React.useState<{ text: string; error?: boolean } | null>(null)
  const [version, setVersion] = React.useState(0)
  const view = state === "ready" && prompts.length === 0 ? "empty" : state

  async function generate(prompt: string, source: LibraryPrompt) {
    setStatus(null)
    try {
      const next = await onGenerate?.(prompt, source)
      if (next) {
        setText(next.text)
        setSuggestions(next.suggestions)
        setVersion((v) => v + 1)
      }
      setStatus({ text: `Drafted from “${source.title}”.` })
    } catch (e) {
      setStatus({ text: e instanceof Error ? e.message : "The draft could not be written. Nothing was changed.", error: true })
      throw e
    }
  }

  return (
    <section data-slot="agent-15" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-5xl px-4 py-8 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-6">
        <h1 id={`${id}-title`} className="text-2xl font-semibold tracking-[-0.03em] text-balance">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">{description}</p>
      </header>
      <StateView state={view} onRetry={onRetry} label="Loading the studio" loading={<Skel />} empty={{ title: "No prompts yet", description: "Save a prompt and it appears here, ready to fill in.", ...emptyState }} error={{ title: "The studio could not be loaded", description: "Nothing was changed. Check your connection and try again.", ...errorState }}>
        <div className="grid gap-8">
          <div className="grid gap-3">
            <h2 className="text-sm font-semibold">1. Start from a prompt</h2>
            <PromptLibrary prompts={prompts} title="Prompts" onInsert={generate} />
            <p aria-live="polite" role={status?.error ? "alert" : undefined} className={cn("min-h-4 text-sm", status?.error ? "font-medium text-destructive" : "text-muted-foreground")}>{status?.text}</p>
          </div>
          <div className="grid gap-3">
            <h2 className="text-sm font-semibold">2. Polish the draft</h2>
            <WritingAssistant key={version} defaultText={text} suggestions={suggestions} onTextChange={setText} />
            <MessageActions text={text} onFeedback={onFeedback} onRegenerate={onGenerate ? async () => { setStatus({ text: "Use Insert on a prompt above to write a fresh draft." }) } : undefined} />
          </div>
        </div>
      </StateView>
    </section>
  )
}

export { Agent15, type Agent15Draft, type Agent15Props }
