// Ballmac UI: Agent 16. https://ui.ballmac.com/blocks/agent-16
"use client"

import * as React from "react"
import { ArrowUp, Brain } from "lucide-react"

import { CitedAnswer } from "@/components/ballmac/cited-answer"
import type { CitationSource } from "@/components/ballmac/citation"
import { MemoryPanel, type MemoryItem } from "@/components/ballmac/memory-panel"
import { MessageActions } from "@/components/ballmac/message-actions"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { ThinkingLoader } from "@/components/ballmac/thinking-loader"
import { cn } from "@/lib/utils"

type Agent16Answer = { paragraphs: string[]; sources: CitationSource[] }
type Agent16Turn = { id: string; question: string; answer?: Agent16Answer }

type Agent16Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    title?: string
    description?: string
    /** The conversation so far. */
    turns?: Agent16Turn[]
    memories?: MemoryItem[]
    /** Called with the question. Return the answer with its sources; reject and the question can be sent again. */
    onAsk?: (question: string) => Promise<Agent16Answer>
    onFeedback?: (turnId: string, value: "up" | "down", reason?: string) => void | Promise<void>
    onForget?: (id: string) => void | Promise<void>
  }

const sources: CitationSource[] = [
  { title: "Refund policy", site: "help.acme.com", url: "https://help.acme.com/refunds", date: "Updated Oct 2", snippet: "If an item does not work as described and we cannot fix it within 14 days of your request, you receive a full refund to the original payment method." },
  { title: "Shipping and returns FAQ", site: "acme.com", url: "https://acme.com/faq/returns", date: "Sep 18", snippet: "Return shipping is free for damaged items. Send a photo with your request and we will email a prepaid label within one business day." },
  { title: "Store credit terms", site: "help.acme.com", url: "https://help.acme.com/credit", date: "Aug 30", snippet: "Store credit never expires and can be used on any order. It can be converted back to the original payment method on request." },
]

const sampleTurns: Agent16Turn[] = [
  {
    id: "t1",
    question: "My speaker arrived with a cracked grille. What are my options?",
    answer: {
      sources,
      paragraphs: [
        "You are covered. A damaged item qualifies for a full refund if we cannot fix it within 14 days of your request [1], and return shipping is free [2].",
        "Send a photo of the grille with your request and a prepaid label arrives within one business day [2]. You can take the refund to your card, or keep it as store credit that never expires [1, 3].",
      ],
    },
  },
]

const sampleMemories: MemoryItem[] = [
  { id: "1", scope: "you", text: "Prefers answers with the next step first.", source: "Chat on Oct 3", pinned: true },
  { id: "2", scope: "you", text: "Ordered the Aria speaker on Oct 12.", source: "From the order system" },
  { id: "3", scope: "style", text: "Dislikes emoji in replies.", source: "Chat on Oct 8" },
]

const FALLBACK: Agent16Answer = {
  sources: sources.slice(0, 2),
  paragraphs: ["Free return shipping applies to damaged items [2]. A refund follows once the item arrives, usually within 14 days [1]."],
}

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-px overflow-hidden rounded-xl border lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="grid gap-4 p-5">
        <Skeleton className="ms-auto h-9 w-2/3 rounded-2xl" />
        <Skeleton className="h-44" />
        <Skeleton className="h-12 rounded-full" />
      </div>
      <div className="grid content-start gap-3 border-t p-5 lg:border-s lg:border-t-0">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-14" />
        <Skeleton className="h-14" />
      </div>
    </div>
  )
}

/**
 * A support-style answer workspace: ask in plain words, watch the assistant work, and read an answer where every claim points to its source. Beside it, the
 * assistant's memory of this person can be corrected, pinned or switched off, and each reply has the usual copy, try again and feedback buttons.
 */
function Agent16({ title = "Ask anything", description = "Answers come from your help center, and every claim shows where it came from.", turns: initial = sampleTurns, memories = sampleMemories, onAsk, onFeedback, onForget, state = "ready", onRetry, emptyState, errorState, className, ...props }: Agent16Props) {
  const id = React.useId()
  const [turns, setTurns] = React.useState(initial)
  const [draft, setDraft] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [showMemory, setShowMemory] = React.useState(false)
  const end = React.useRef<HTMLDivElement>(null)
  const pending = turns.find((t) => !t.answer)

  async function ask(e: React.FormEvent) {
    e.preventDefault()
    const q = draft.trim()
    if (!q || pending) return
    const tid = `t${turns.length + 1}-${q.length}`
    setDraft("")
    setError(null)
    setTurns((l) => [...l, { id: tid, question: q }])
    requestAnimationFrame(() => end.current?.scrollIntoView({ block: "nearest" }))
    try {
      const answer = onAsk ? await onAsk(q) : await new Promise<Agent16Answer>((r) => setTimeout(() => r(FALLBACK), 1400))
      setTurns((l) => l.map((t) => (t.id === tid ? { ...t, answer } : t)))
    } catch (err) {
      setTurns((l) => l.filter((t) => t.id !== tid))
      setDraft(q)
      setError(err instanceof Error ? err.message : "The answer could not be written. Your question is back in the box.")
    }
  }

  return (
    <section data-slot="agent-16" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-6xl px-4 py-8 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 id={`${id}-title`} className="text-2xl font-semibold tracking-[-0.03em] text-balance">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">{description}</p>
        </div>
        <button type="button" aria-expanded={showMemory} aria-controls={`${id}-memory`} onClick={() => setShowMemory((v) => !v)} className="inline-flex h-9 items-center gap-2 rounded-lg border bg-card px-3 text-sm font-medium outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 lg:hidden">
          <Brain aria-hidden="true" className="size-4" />
          {showMemory ? "Hide memory" : "Show memory"}
        </button>
      </header>
      <StateView state={state} onRetry={onRetry} label="Loading the conversation" loading={<Skel />} empty={{ title: "Ask your first question", description: "Answers appear here with the sources they came from.", ...emptyState }} error={{ title: "The conversation could not be loaded", description: "Nothing was sent. Check your connection and try again.", ...errorState }}>
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="grid min-w-0 gap-6">
            <ol aria-label="Conversation" className="grid gap-8">
              {turns.map((t) => (
                <li key={t.id} className="grid min-w-0 gap-4">
                  <p className="ms-auto max-w-[85%] rounded-2xl rounded-ee-md bg-foreground px-4 py-2.5 text-sm leading-relaxed text-background text-pretty">{t.question}</p>
                  {t.answer ? (
                    <div className="grid min-w-0 gap-3">
                      <CitedAnswer paragraphs={t.answer.paragraphs} sources={t.answer.sources} />
                      <MessageActions text={t.answer.paragraphs.join("\n\n").replace(/\s*\[[\d, ]+\]/g, "")} onRegenerate={() => new Promise((r) => setTimeout(r, 800))} onFeedback={(v, reason) => onFeedback?.(t.id, v, reason)} onShare={() => {}} />
                    </div>
                  ) : (
                    <ThinkingLoader phases={["Reading your question", "Searching the help center", "Checking the policy", "Writing the answer"]} />
                  )}
                </li>
              ))}
            </ol>
            <div ref={end} />
            <form onSubmit={(e) => void ask(e)} className="grid gap-2">
              {error && <p role="alert" className="rounded-lg border border-destructive/40 bg-card px-3 py-2 text-sm">{error}</p>}
              <div className="flex items-end gap-2 rounded-2xl border bg-card p-2 shadow-sm focus-within:ring-[3px] focus-within:ring-ring/50">
                <label htmlFor={`${id}-q`} className="sr-only">Your question</label>
                <textarea
                  id={`${id}-q`}
                  rows={1}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      e.currentTarget.form?.requestSubmit()
                    }
                  }}
                  placeholder="Ask a follow-up…"
                  className="max-h-40 min-h-9 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
                />
                <button type="submit" disabled={draft.trim() === "" || !!pending} aria-label="Send" className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-foreground text-background outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-40">
                  <ArrowUp aria-hidden="true" className="size-4" />
                </button>
              </div>
            </form>
          </div>
          <div id={`${id}-memory`} className={cn("lg:sticky lg:top-6", !showMemory && "max-lg:hidden")}>
            <MemoryPanel memories={memories} onForget={onForget} onUpdate={() => new Promise((r) => setTimeout(r, 300))} onPin={() => new Promise((r) => setTimeout(r, 300))} />
          </div>
        </div>
      </StateView>
    </section>
  )
}

export { Agent16, type Agent16Answer, type Agent16Props, type Agent16Turn }
