// Ballmac UI: Agent 18. https://ui.ballmac.com/blocks/agent-18
"use client"

import * as React from "react"
import { Loader2, Search } from "lucide-react"

import { CitedAnswer } from "@/components/ballmac/cited-answer"
import type { CitationSource } from "@/components/ballmac/citation"
import { KnowledgeSources, type KnowledgeSource } from "@/components/ballmac/knowledge-sources"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Agent18Answer = { paragraphs: string[]; sources: CitationSource[] }

type Agent18Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    title?: string
    description?: string
    sources?: KnowledgeSource[]
    onAdd?: () => void
    onSync?: (id: string) => void | Promise<void>
    onToggle?: (id: string, included: boolean) => void | Promise<void>
    onRemove?: (id: string) => void | Promise<void>
    /** Called with a test question. Return the answer with its sources; reject and the reason is shown. */
    onTest?: (question: string) => Promise<Agent18Answer>
  }

const items: KnowledgeSource[] = [
  { id: "1", name: "Product docs", kind: "notion", detail: "Workspace: Acme", status: "synced", docs: 1284, lastSync: "12 minutes ago", included: true },
  { id: "2", name: "Support macros", kind: "drive", detail: "Shared drive / Support / Macros", status: "syncing", docs: 342, progress: 0.62, included: true },
  { id: "3", name: "help.acme.com", kind: "web", detail: "Crawled weekly, 3 levels deep", status: "synced", docs: 96, lastSync: "Yesterday", included: true },
  { id: "4", name: "acme/platform", kind: "github", detail: "README and /docs on main", status: "error", docs: 58, lastSync: "3 days ago", error: "The access token expired. Reconnect GitHub and sync again.", included: true },
  { id: "5", name: "#help-questions", kind: "slack", detail: "Last 90 days", status: "paused", docs: 2210, lastSync: "Oct 2", included: false },
]

const sample: Agent18Answer = {
  sources: [
    { title: "Refund policy", site: "help.acme.com", url: "https://help.acme.com/refunds", date: "Updated Oct 2", snippet: "If an item does not work as described and we cannot fix it within 14 days of your request, you receive a full refund." },
    { title: "Plans and billing", site: "Product docs", url: "https://docs.acme.com/billing", date: "Oct 11", snippet: "Refunds go back to the original payment method and take 3 to 5 business days to appear." },
  ],
  paragraphs: ["A refund is available when an item does not work as described and cannot be fixed within 14 days [1]. It returns to the original payment method and appears in 3 to 5 business days [2]."],
}

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-4">
      <Skeleton className="h-14" />
      <Skeleton className="h-72" />
    </div>
  )
}

/**
 * A knowledge base admin: the sources an assistant reads, their health and whether answers may use them, and a box to test a question and see which sources the
 * answer would come from. Turning a source off and asking again shows what it was contributing.
 */
function Agent18({ title = "Knowledge base", description = "Choose what the assistant reads, keep it fresh, and test a question before customers ask it.", sources = items, onAdd, onSync, onToggle, onRemove, onTest, state = "ready", onRetry, emptyState, errorState, className, ...props }: Agent18Props) {
  const id = React.useId()
  const [q, setQ] = React.useState("What is the refund policy?")
  const [busy, setBusy] = React.useState(false)
  const [answer, setAnswer] = React.useState<Agent18Answer | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const view = state === "ready" && sources.length === 0 ? "empty" : state

  async function test(e: React.FormEvent) {
    e.preventDefault()
    if (!q.trim() || busy) return
    setBusy(true)
    setError(null)
    try {
      setAnswer(onTest ? await onTest(q.trim()) : await new Promise<Agent18Answer>((r) => setTimeout(() => r(sample), 900)))
    } catch (err) {
      setError(err instanceof Error ? err.message : "The test could not run. Nothing was changed.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <section data-slot="agent-18" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-4xl px-4 py-8 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-6">
        <h1 id={`${id}-title`} className="text-2xl font-semibold tracking-[-0.03em] text-balance">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">{description}</p>
      </header>
      <StateView state={view} onRetry={onRetry} label="Loading the sources" loading={<Skel />} empty={{ title: "No sources yet", description: "Connect a place the assistant can read and it can start answering from it.", ...emptyState }} error={{ title: "The sources could not be loaded", description: "Nothing was changed. Check your connection and try again.", ...errorState }}>
        <div className="grid gap-6">
          <KnowledgeSources sources={sources} onAdd={onAdd} onSync={onSync ?? (() => new Promise((r) => setTimeout(r, 1200)))} onToggle={onToggle} onRemove={onRemove} />
          <div className="grid gap-3 rounded-xl border bg-card p-5 sm:p-6">
            <h2 className="text-sm font-semibold">Test a question</h2>
            <form onSubmit={(e) => void test(e)} className="flex flex-wrap gap-2">
              <label htmlFor={`${id}-q`} className="sr-only">Question to test</label>
              <div className="relative min-w-0 flex-1 basis-60">
                <Search aria-hidden="true" className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input id={`${id}-q`} value={q} onChange={(e) => setQ(e.target.value)} className="h-10 w-full rounded-lg border bg-background ps-9 pe-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50" />
              </div>
              <button type="submit" disabled={busy || q.trim() === ""} className="inline-flex h-10 items-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-60">
                {busy && <Loader2 aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />}
                {busy ? "Answering" : "Test"}
              </button>
            </form>
            {error && <p role="alert" className="rounded-lg border border-destructive/40 px-3 py-2 text-sm">{error}</p>}
            {answer && <CitedAnswer paragraphs={answer.paragraphs} sources={answer.sources} className="bg-background" />}
          </div>
        </div>
      </StateView>
    </section>
  )
}

export { Agent18, type Agent18Answer, type Agent18Props }
