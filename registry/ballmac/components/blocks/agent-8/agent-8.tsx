// Ballmac UI: Agent 8. https://ui.ballmac.com/blocks/agent-8
"use client"

import * as React from "react"
import { BookOpen, ChevronDown, CircleAlert, FileText, Globe, Loader2, Plus, RefreshCw, Search, SearchX, Trash2, Type } from "lucide-react"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ballmac/alert-dialog"
import { Badge } from "@/components/ballmac/badge"
import { BlurFadeGroup } from "@/components/ballmac/blur-fade"
import { Button } from "@/components/ballmac/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ballmac/dropdown-menu"
import { countMatches, MatchHighlight, queryTokens } from "@/components/ballmac/match-highlight"
import { Skeleton } from "@/components/ballmac/skeleton"
import { useReturnFocus } from "@/lib/ballmac/return-focus"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { Switch } from "@/components/ballmac/switch"
import { cn } from "@/lib/utils"

type Agent8Kind = "website" | "file" | "text"

type Agent8Source = {
  id: string
  name: string
  kind: Agent8Kind
  /** A web address, a file name or a short note about where it came from. */
  location: string
  status: "ready" | "syncing" | "failed"
  /** From 0 to 1 while syncing. */
  progress?: number
  /** How many passages the agent can find in it. */
  passages?: number
  /** Already written for people ("Synced 2 hours ago"). */
  synced?: string
  /** Why it failed. */
  error?: string
  /** Whether the agent may use it. */
  enabled?: boolean
  /** A few representative passages. The built-in test searches these. */
  excerpts?: string[]
}

type Agent8Passage = { sourceId: string; text: string; /** 0 to 1 */ score?: number }

type Agent8Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    sources?: Agent8Source[]
    title?: string
    /** Questions offered as shortcuts in the test panel. */
    exampleQuestions?: string[]
    /** Called by Add source with the kind chosen. */
    onAdd?: (kind: Agent8Kind) => void
    /** Called by Sync now on a source, or Retry on a failed one. */
    onResync?: (id: string) => void
    /** Called after Remove is confirmed. */
    onRemove?: (id: string) => void
    /** Called when a source is turned on or off for the agent. */
    onToggle?: (id: string, enabled: boolean) => void
    /**
     * Finds what the agent would find for a question. Return the passages with their source, and optionally an answer. Without it the
     * block searches the sources' excerpts, so you can see the idea working.
     */
    onAsk?: (question: string, sources: Agent8Source[]) => Promise<{ passages: Agent8Passage[]; answer?: string }>
    /** The question shown in the test panel at first, and run straight away. */
    defaultQuestion?: string
  }

const sample: Agent8Source[] = [
  {
    id: "help",
    name: "Help center",
    kind: "website",
    location: "help.acme.com",
    status: "ready",
    passages: 612,
    synced: "Synced 2 hours ago",
    enabled: true,
    excerpts: [
      "To download an invoice, open Billing, choose Invoices and select the PDF icon next to the month you need. Invoices include your company name and tax number.",
      "A refund for a duplicate charge usually reaches the customer's card within 5 to 10 business days, depending on their bank.",
      "To reset your password, choose Forgot password on the sign-in page. The link we email you works for one hour.",
    ],
  },
  {
    id: "policy",
    name: "Refund policy.pdf",
    kind: "file",
    location: "Uploaded last week · 14 pages",
    status: "ready",
    passages: 48,
    synced: "Added last week",
    enabled: true,
    excerpts: [
      "Refunds under $200 for duplicate charges may be issued by support without approval. Larger refunds need a manager's approval and a written reason.",
      "Annual plans can be refunded in full within 30 days of purchase. After that, unused months are credited to the account instead.",
    ],
  },
  { id: "macros", name: "Support macros", kind: "file", location: "macros.csv · 220 rows", status: "syncing", progress: 0.58, synced: "Reading rows…", enabled: true },
  { id: "wiki", name: "Internal wiki", kind: "website", location: "wiki.acme.com", status: "failed", error: "Could not sign in. The saved password has expired.", enabled: false },
  { id: "tone", name: "Tone of voice", kind: "text", location: "Pasted note", status: "ready", passages: 6, synced: "Added 3 weeks ago", enabled: true, excerpts: ["Write the way a thoughtful colleague would speak: warm, brief and specific. Never use exclamation marks in refunds or incident messages."] },
]

const kindIcon = { website: Globe, file: FileText, text: Type } as const
const kindTone = { website: "bg-chart-1/20", file: "bg-chart-4/20", text: "bg-chart-3/25" } as const
const addOptions: { kind: Agent8Kind; label: string; hint: string }[] = [
  { kind: "website", label: "A website", hint: "Read pages from an address" },
  { kind: "file", label: "Files", hint: "PDFs, documents and spreadsheets" },
  { kind: "text", label: "Pasted text", hint: "Notes, policies, a few paragraphs" },
]

function KnowledgeSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]" aria-hidden="true">
      <div className="grid gap-3">
        <Skeleton className="h-24 rounded-2xl" />
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  )
}

/**
 * A knowledge manager for an AI agent: how healthy its sources are at a glance, each source with its sync state, progress or failure
 * (and a way to retry), a switch for whether the agent may use it, and a panel that shows which passages the sources return for a question.
 */
function Agent8({
  sources: sourcesProp = sample,
  title = "Knowledge",
  exampleQuestions = ["How long does a refund take?", "Can support refund $150 without approval?", "How do I download an invoice?"],
  onAdd,
  onResync,
  onRemove,
  onToggle,
  onAsk,
  defaultQuestion,
  state = "ready",
  onRetry,
  emptyState,
  errorState,
  className,
  ...props
}: Agent8Props) {
  const id = React.useId()
  const [sources, setSources] = React.useState(sourcesProp)
  React.useEffect(() => setSources(sourcesProp), [sourcesProp])
  const [confirm, setConfirm] = React.useState<Agent8Source | null>(null)
  const returnFocus = useReturnFocus(!!confirm)
  const [question, setQuestion] = React.useState(defaultQuestion ?? "")
  const [asking, setAsking] = React.useState(false)
  const [asked, setAsked] = React.useState<string | null>(null)
  const [found, setFound] = React.useState<{ passages: Agent8Passage[]; answer?: string } | null>(null)
  const [askError, setAskError] = React.useState<string>()
  const [announce, setAnnounce] = React.useState("")
  const ready = state === "ready" || state === "empty"
  const list = state === "empty" ? [] : sources

  const counts = { ready: list.filter((s) => s.status === "ready").length, syncing: list.filter((s) => s.status === "syncing").length, failed: list.filter((s) => s.status === "failed").length }
  const passages = list.reduce((sum, s) => sum + (s.passages ?? 0), 0)
  const usable = list.filter((s) => s.enabled && s.status === "ready")

  async function ask(q: string) {
    const text = q.trim()
    if (!text) return
    setAsking(true)
    setAskError(undefined)
    setAsked(text)
    try {
      if (onAsk) setFound(await onAsk(text, usable))
      else {
        await new Promise((r) => setTimeout(r, 450))
        const tokens = queryTokens(text).filter((t) => t.length > 2)
        const hits = usable
          .flatMap((s) => (s.excerpts ?? []).map((p) => ({ sourceId: s.id, text: p, raw: countMatches(p, tokens) })))
          .filter((h) => h.raw > 0)
          .sort((a, b) => b.raw - a.raw)
          .slice(0, 4)
        const max = Math.max(1, ...hits.map((h) => h.raw))
        setFound({ passages: hits.map((h) => ({ sourceId: h.sourceId, text: h.text, score: h.raw / max })) })
      }
    } catch (err) {
      setFound(null)
      setAskError(err instanceof Error && err.message ? err.message : "The test could not run. Try again.")
    } finally {
      setAsking(false)
    }
  }

  // run the starting question once, so the panel opens showing what it does
  const started = React.useRef(false)
  React.useEffect(() => {
    if (defaultQuestion && !started.current && ready) {
      started.current = true
      ask(defaultQuestion)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sourceOf = (sid: string) => sources.find((s) => s.id === sid)

  const addMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring/50 inline-flex h-9 items-center gap-2 rounded-md px-4 text-sm font-medium outline-none focus-visible:ring-[3px]">
        <Plus aria-hidden="true" className="size-4" />
        Add source
        <ChevronDown aria-hidden="true" className="size-3.5 opacity-70" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {addOptions.map((o) => {
          const Icon = kindIcon[o.kind]
          return (
            <DropdownMenuItem key={o.kind} onSelect={() => onAdd?.(o.kind)} className="items-start gap-3 py-2">
              <Icon aria-hidden="true" className="mt-0.5 size-4" />
              <span>
                <span className="block text-sm font-medium">{o.label}</span>
                <span className="text-muted-foreground block text-xs">{o.hint}</span>
              </span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  const content = !list.length ? (
    <div className="bg-card rounded-3xl border px-6 py-14 text-center sm:px-12">
      <span aria-hidden="true" className="bg-muted mx-auto flex size-14 items-center justify-center rounded-2xl">
        <BookOpen className="size-7" />
      </span>
      <h2 className="mt-5 text-xl font-semibold tracking-tight">{emptyState?.title ?? "Teach your agent what you know"}</h2>
      <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm text-pretty">{emptyState?.description ?? "Add the pages, files and notes it should read before it answers. It will only use what you give it."}</p>
      <div className="mx-auto mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
        {addOptions.map((o) => {
          const Icon = kindIcon[o.kind]
          return (
            <button key={o.kind} type="button" onClick={() => onAdd?.(o.kind)} className="hover:bg-accent/50 hover:border-foreground/25 focus-visible:ring-ring/50 grid justify-items-center gap-2 rounded-2xl border p-5 text-center outline-none transition-colors focus-visible:ring-[3px]">
              <span aria-hidden="true" className={cn("flex size-10 items-center justify-center rounded-xl [&_svg]:size-5", kindTone[o.kind])}>
                <Icon />
              </span>
              <span className="text-sm font-semibold">{o.label}</span>
              <span className="text-muted-foreground text-xs text-pretty">{o.hint}</span>
            </button>
          )
        })}
      </div>
      {emptyState?.action}
    </div>
  ) : (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="grid min-w-0 gap-4">
        <div className="bg-card rounded-2xl border p-5">
          <div role="img" aria-label={`${counts.ready} ready, ${counts.syncing} syncing, ${counts.failed} failed`} className="bg-muted flex h-2 gap-0.5 overflow-hidden rounded-full">
            {counts.ready ? <span className="bg-chart-2" style={{ flexGrow: counts.ready }} /> : null}
            {counts.syncing ? <span className="bg-chart-3" style={{ flexGrow: counts.syncing }} /> : null}
            {counts.failed ? <span className="bg-destructive" style={{ flexGrow: counts.failed }} /> : null}
          </div>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
            <dl className="flex flex-wrap gap-x-8 gap-y-2">
              <div>
                <dt className="text-muted-foreground text-xs">Sources</dt>
                <dd className="text-2xl font-semibold tracking-tight tabular-nums">{list.length}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs">Passages</dt>
                <dd className="text-2xl font-semibold tracking-tight tabular-nums">{new Intl.NumberFormat("en-US").format(passages)}</dd>
              </div>
            </dl>
            <ul className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
              <li className="flex items-center gap-1.5"><span aria-hidden="true" className="bg-chart-2 size-2 rounded-full" />{counts.ready} ready</li>
              <li className="flex items-center gap-1.5"><span aria-hidden="true" className="bg-chart-3 size-2 rounded-full" />{counts.syncing} syncing</li>
              <li className="flex items-center gap-1.5"><span aria-hidden="true" className="bg-destructive size-2 rounded-full" />{counts.failed} failed</li>
            </ul>
          </div>
        </div>

        <BlurFadeGroup role="list" itemAs="li" stagger={0.05} item={{ direction: "up", offset: 8, blur: 4 }} className="grid list-none grid-cols-1 gap-3">
          {list.map((s) => {
            const Icon = kindIcon[s.kind]
            return (
              <div key={s.id} className={cn("bg-card rounded-2xl border p-4 transition-colors duration-200", s.status === "failed" && "border-destructive/40")}>
                <div className="flex items-start gap-4">
                  <span aria-hidden="true" className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl [&_svg]:size-5", kindTone[s.kind])}>
                    <Icon />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      <h3 id={`${id}-${s.id}`} className="text-sm font-semibold">
                        {s.name}
                      </h3>
                      {s.status === "ready" ? <Badge status="success" className="font-normal">Ready</Badge> : s.status === "syncing" ? <Badge status="warning" className="font-normal">Syncing</Badge> : <Badge status="error" className="font-normal">Failed</Badge>}
                    </div>
                    <p dir="ltr" className="text-muted-foreground mt-0.5 truncate text-start text-xs">
                      {s.location}
                    </p>
                    {s.status === "syncing" ? (
                      <div className="mt-3">
                        <div role="progressbar" aria-label={`${s.name} sync`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round((s.progress ?? 0) * 100)} className="bg-muted h-1.5 overflow-hidden rounded-full">
                          <div className="bg-chart-3 h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${Math.round((s.progress ?? 0) * 100)}%` }} />
                        </div>
                        <p className="text-muted-foreground mt-1.5 flex items-center gap-1.5 text-xs tabular-nums">
                          <Loader2 aria-hidden="true" className="size-3 animate-spin motion-reduce:animate-none" />
                          {Math.round((s.progress ?? 0) * 100)}% · {s.synced ?? "Syncing"}
                        </p>
                      </div>
                    ) : s.status === "failed" ? (
                      <p role="alert" className="text-destructive mt-2 flex items-start gap-1.5 text-xs text-pretty">
                        <CircleAlert aria-hidden="true" className="mt-px size-3.5 shrink-0" />
                        {s.error ?? "Could not read this source."}
                      </p>
                    ) : (
                      <p className="text-muted-foreground mt-2 text-xs tabular-nums">
                        {s.passages !== undefined ? `${new Intl.NumberFormat("en-US").format(s.passages)} passages` : "Ready"}
                        {s.synced ? ` · ${s.synced}` : ""}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {s.status === "failed" ? (
                      <Button variant="outline" size="sm" onClick={() => onResync?.(s.id)}>
                        <RefreshCw aria-hidden="true" />
                        Retry
                      </Button>
                    ) : s.status === "ready" && s.kind === "website" ? (
                      <Button variant="ghost" size="icon-sm" aria-label={`Sync ${s.name} now`} onClick={() => onResync?.(s.id)}>
                        <RefreshCw aria-hidden="true" />
                      </Button>
                    ) : null}
                    <Button variant="ghost" size="icon-sm" aria-label={`Remove ${s.name}`} onClick={() => setConfirm(s)} className="hover:text-destructive">
                      <Trash2 aria-hidden="true" />
                    </Button>
                    <Switch
                      checked={!!s.enabled}
                      disabled={s.status === "failed"}
                      onCheckedChange={(on) => {
                        setSources((l) => l.map((x) => (x.id === s.id ? { ...x, enabled: on } : x)))
                        onToggle?.(s.id, on)
                        setAnnounce(`${s.name} ${on ? "turned on" : "turned off"} for the agent`)
                      }}
                      aria-labelledby={`${id}-${s.id}`}
                      aria-describedby={`${id}-use`}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </BlurFadeGroup>
        <p id={`${id}-use`} className="text-muted-foreground text-xs text-pretty">
          The switch decides whether the agent may use a source in its answers. Failed sources are off until they work again.
        </p>
      </div>

      <aside aria-labelledby={`${id}-try`} className="bg-card min-w-0 rounded-2xl border lg:sticky lg:top-6">
        <div className="border-b p-5 pb-4">
          <h2 id={`${id}-try`} className="text-sm font-semibold">
            Test what it finds
          </h2>
          <p className="text-muted-foreground mt-0.5 text-xs text-pretty">Ask a question and see which passages your {usable.length === 1 ? "source" : `${usable.length} sources`} return for it.</p>
        </div>
        <form
          className="grid gap-3 p-5"
          onSubmit={(e) => {
            e.preventDefault()
            ask(question)
          }}
        >
          <label htmlFor={`${id}-q`} className="sr-only">
            Question to test
          </label>
          <div className="bg-background focus-within:ring-ring/50 flex items-center gap-2 rounded-xl border px-3 focus-within:ring-[3px]">
            <Search aria-hidden="true" className="text-muted-foreground size-4 shrink-0" />
            <input id={`${id}-q`} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask a question" disabled={!usable.length} className="placeholder:text-muted-foreground h-10 min-w-0 flex-1 bg-transparent text-sm outline-none disabled:opacity-50" />
            <Button type="submit" size="sm" disabled={asking || !question.trim() || !usable.length}>
              {asking ? <Loader2 aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : null}
              Test
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {exampleQuestions.map((q) => (
              <button
                key={q}
                type="button"
                disabled={!usable.length}
                onClick={() => {
                  setQuestion(q)
                  ask(q)
                }}
                className="hover:bg-accent focus-visible:ring-ring/50 rounded-full border px-2.5 py-1 text-start text-xs outline-none focus-visible:ring-[3px] disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </form>
        <div className="border-t p-5 pt-4" aria-live="polite" aria-busy={asking || undefined}>
          {asking ? (
            <p className="text-muted-foreground flex items-center gap-2 text-sm">
              <Loader2 aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />
              Searching {usable.length} {usable.length === 1 ? "source" : "sources"}…
            </p>
          ) : askError ? (
            <p role="alert" className="text-destructive text-sm">
              {askError}
            </p>
          ) : found && asked ? (
            found.passages.length ? (
              <div className="grid gap-3">
                <p className="text-xs font-medium tabular-nums">
                  {found.passages.length} {found.passages.length === 1 ? "passage" : "passages"} from {new Set(found.passages.map((p) => p.sourceId)).size} {new Set(found.passages.map((p) => p.sourceId)).size === 1 ? "source" : "sources"}
                </p>
                {found.answer ? <p className="bg-muted/60 rounded-lg p-3 text-sm text-pretty">{found.answer}</p> : null}
                <ol className="grid gap-2.5">
                  {found.passages.map((p, i) => {
                    const src = sourceOf(p.sourceId)
                    const Icon = src ? kindIcon[src.kind] : FileText
                    return (
                      <li key={i} className="rounded-xl border p-3">
                        <div className="flex items-center gap-2 text-xs">
                          <Icon aria-hidden="true" className="text-muted-foreground size-3.5 shrink-0" />
                          <span className="min-w-0 flex-1 truncate font-medium">{src?.name ?? "Source"}</span>
                          {p.score !== undefined ? (
                            <span className="text-muted-foreground flex items-center gap-1.5 tabular-nums">
                              <span aria-hidden="true" className="bg-muted relative h-1 w-10 overflow-hidden rounded-full">
                                <span className="bg-chart-1 absolute inset-y-0 start-0 rounded-full" style={{ width: `${Math.max(8, Math.round(p.score * 100))}%` }} />
                              </span>
                              <span>{Math.round(p.score * 100)}% match</span>
                            </span>
                          ) : null}
                        </div>
                        <p className="text-muted-foreground mt-2 text-[13px] leading-relaxed text-pretty">
                          <MatchHighlight text={p.text} query={queryTokens(asked).filter((t) => t.length > 2)} />
                        </p>
                      </li>
                    )
                  })}
                </ol>
              </div>
            ) : (
              <div className="text-center">
                <span aria-hidden="true" className="bg-muted mx-auto flex size-10 items-center justify-center rounded-full">
                  <SearchX className="size-5" />
                </span>
                <p className="mt-3 text-sm font-medium">Your sources do not cover this</p>
                <p className="text-muted-foreground mt-1 text-xs text-pretty">The agent would have nothing to base an answer on. Add a source about “{asked}”, or turn one on.</p>
              </div>
            )
          ) : (
            <p className="text-muted-foreground text-sm text-pretty">Results appear here. If nothing comes back, your agent would have to say it does not know.</p>
          )}
        </div>
      </aside>
    </div>
  )

  return (
    <section data-slot="agent-8" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-6xl px-4 py-8 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-8 flex flex-wrap items-end gap-4">
        <div className="min-w-0 flex-1 basis-72">
          <h1 id={`${id}-title`} className="text-3xl font-semibold tracking-[-0.035em]">
            {title}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-xl text-sm text-pretty">What your agent reads before it answers. It uses only what is turned on here, and it can tell you which source it used.</p>
        </div>
        {ready && list.length ? addMenu : null}
      </header>
      <StateView state={state === "loading" || state === "error" ? state : "ready"} onRetry={onRetry} label="Loading knowledge" loading={<KnowledgeSkeleton />} error={{ title: errorState?.title ?? "Your sources could not be loaded", description: errorState?.description ?? "Nothing was changed. Check your connection and try again.", ...errorState }}>
        {content}
      </StateView>

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent {...returnFocus}>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {confirm?.name}?</AlertDialogTitle>
            <AlertDialogDescription>The agent stops using it straight away. You can add it again later, but it will be read from scratch.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!confirm) return
                setSources((l) => l.filter((x) => x.id !== confirm.id))
                onRemove?.(confirm.id)
                setAnnounce(`${confirm.name} removed`)
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <p aria-live="polite" className="sr-only">
        {announce}
      </p>
    </section>
  )
}

export { Agent8, type Agent8Props, type Agent8Source, type Agent8Passage, type Agent8Kind }
