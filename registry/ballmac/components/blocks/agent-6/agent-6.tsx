// Ballmac UI: Agent 6. https://ui.ballmac.com/blocks/agent-6
"use client"

import * as React from "react"
import { Brain, Briefcase, Check, Loader2, Pause, Pencil, Pin, Search, SlidersHorizontal, Trash2, Undo2, User } from "lucide-react"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ballmac/alert-dialog"
import { BlurFadeGroup } from "@/components/ballmac/blur-fade"
import { Button } from "@/components/ballmac/button"
import { CircularProgress } from "@/components/ballmac/circular-progress"
import { SegmentedControl, SegmentedControlItem } from "@/components/ballmac/segmented-control"
import { Skeleton } from "@/components/ballmac/skeleton"
import { useReturnFocus } from "@/lib/ballmac/return-focus"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { Switch } from "@/components/ballmac/switch"
import { Textarea } from "@/components/ballmac/textarea"
import { cn } from "@/lib/utils"

type Agent6Scope = "you" | "work" | "preferences"

type Agent6Memory = {
  id: string
  /** What is remembered, written the way the assistant would say it: "Prefers short answers with the conclusion first." */
  text: string
  scope: Agent6Scope
  /** Where it was learned ("Planning the Q4 launch"). */
  source?: string
  /** Already written for people ("3 weeks ago"). */
  learned?: string
  /** How many times it has been used in an answer. */
  uses?: number
  pinned?: boolean
}

type Agent6Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    memories?: Agent6Memory[]
    /** The assistant's name, used in the copy. */
    assistantName?: string
    /** How many memories fit, for the ring. */
    capacity?: number
    /** Chats this week that used memory, and when it last changed ("2 hours ago"). */
    activity?: { chats: number; updated: string }
    /** Whether memory is paused (controlled). */
    paused?: boolean
    defaultPaused?: boolean
    onPausedChange?: (paused: boolean) => void
    /** Called with the new text. Throw to keep the old text and show the error. */
    onEdit?: (id: string, text: string) => void | Promise<void>
    /** Called when a memory is pinned or unpinned. */
    onPin?: (id: string, pinned: boolean) => void
    /** Called straight away when a memory is forgotten. The block offers Undo for a few seconds. */
    onForget?: (id: string) => void
    /** Called when Undo is pressed, with the memory to put back. */
    onRestore?: (memory: Agent6Memory) => void
    /** The id of a memory that is open for editing at first. */
    defaultEditingId?: string
    /** Called after "Forget everything" is confirmed. */
    onForgetAll?: () => void | Promise<void>
  }

const scopes: Record<Agent6Scope, { title: string; icon: typeof User; tone: "chart-1" | "chart-2" | "chart-4"; bar: string; soft: string; hint: string }> = {
  you: { title: "About you", icon: User, tone: "chart-1", bar: "bg-chart-1", soft: "bg-chart-1/20", hint: "Who you are and what you are working toward" },
  work: { title: "Your work", icon: Briefcase, tone: "chart-2", bar: "bg-chart-2", soft: "bg-chart-2/20", hint: "Projects, tools and people you mention" },
  preferences: { title: "How you like answers", icon: SlidersHorizontal, tone: "chart-4", bar: "bg-chart-4", soft: "bg-chart-4/20", hint: "Tone, format and things to avoid" },
}

const sample: Agent6Memory[] = [
  { id: "m1", scope: "you", text: "Is a product designer based in Lisbon and works in the Western European time zone.", source: "Getting set up", learned: "2 months ago", uses: 31, pinned: true },
  { id: "m2", scope: "you", text: "Is learning Rust in the evenings and prefers examples to long explanations.", source: "Ownership and borrowing, explained", learned: "3 weeks ago", uses: 9 },
  { id: "m3", scope: "work", text: "Leads the Quiet writing app: a React and Tauri project with a release every second Thursday.", source: "Planning the Q4 launch", learned: "3 weeks ago", uses: 27 },
  { id: "m4", scope: "work", text: "Works with Priya (engineering) and Alex (support) on launches.", source: "Release checklist", learned: "2 weeks ago", uses: 14 },
  { id: "m5", scope: "work", text: "Uses pnpm, Vitest and Playwright. Does not use Jest.", source: "Fixing a flaky test", learned: "last week", uses: 6 },
  { id: "m6", scope: "preferences", text: "Prefers short answers with the conclusion first, then the reasoning.", source: "Feedback on a long reply", learned: "2 months ago", uses: 52, pinned: true },
  { id: "m7", scope: "preferences", text: "Wants British spelling in anything written for the website.", source: "Editing the changelog", learned: "5 weeks ago", uses: 11 },
  { id: "m8", scope: "preferences", text: "Dislikes emoji in replies and in generated copy.", source: "Drafting release notes", learned: "last month", uses: 18 },
]

function MemorySkeleton() {
  return (
    <div className="grid gap-6" aria-hidden="true">
      <Skeleton className="h-44 rounded-2xl" />
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-24 rounded-2xl" />
      ))}
    </div>
  )
}

/**
 * What an assistant remembers about someone: a ring that splits memory by kind, a switch to pause it, every memory with where it was
 * learned and how often it was used, edited in place, pinned, or forgotten with a few seconds to undo, and one button to forget it all.
 */
function Agent6({
  memories: memoriesProp = sample,
  assistantName = "Sage",
  capacity = 40,
  activity = { chats: 38, updated: "2 hours ago" },
  paused: pausedProp,
  defaultPaused = false,
  onPausedChange,
  onEdit,
  onPin,
  onForget,
  onRestore,
  onForgetAll,
  defaultEditingId,
  state = "ready",
  onRetry,
  emptyState,
  errorState,
  className,
  ...props
}: Agent6Props) {
  const id = React.useId()
  const [list, setList] = React.useState(memoriesProp)
  React.useEffect(() => setList(memoriesProp), [memoriesProp])
  const [pausedLocal, setPausedLocal] = React.useState(defaultPaused)
  const paused = pausedProp ?? pausedLocal
  const [scope, setScope] = React.useState<"all" | Agent6Scope>("all")
  const [query, setQuery] = React.useState("")
  const [editing, setEditing] = React.useState<string | null>(defaultEditingId ?? null)
  const [draft, setDraft] = React.useState(() => memoriesProp.find((m) => m.id === defaultEditingId)?.text ?? "")
  const [saving, setSaving] = React.useState(false)
  const [editError, setEditError] = React.useState<string>()
  const [undo, setUndo] = React.useState<{ memory: Agent6Memory; index: number } | null>(null)
  const [confirmAll, setConfirmAll] = React.useState(false)
  const returnFocus = useReturnFocus(confirmAll)
  const [announce, setAnnounce] = React.useState("")
  const ready = state === "ready" || state === "empty"
  const empty = state === "empty" || (state === "ready" && !list.length)

  React.useEffect(() => {
    if (!undo) return
    const t = setTimeout(() => setUndo(null), 7000)
    return () => clearTimeout(t)
  }, [undo])

  const q = query.trim().toLowerCase()
  const visible = list
    .filter((m) => (scope === "all" || m.scope === scope) && (!q || `${m.text} ${m.source ?? ""}`.toLowerCase().includes(q)))
    .sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned))
  const grouped = (Object.keys(scopes) as Agent6Scope[]).map((s) => ({ scope: s, items: visible.filter((m) => m.scope === s) })).filter((g) => g.items.length)
  const counts = (Object.keys(scopes) as Agent6Scope[]).map((s) => ({ scope: s, n: list.filter((m) => m.scope === s).length }))
  const maxUses = Math.max(1, ...list.map((m) => m.uses ?? 0))

  async function save(m: Agent6Memory) {
    const text = draft.trim()
    if (!text) return setEditError("A memory cannot be empty. Forget it instead.")
    if (text === m.text) return setEditing(null)
    setSaving(true)
    setEditError(undefined)
    try {
      await onEdit?.(m.id, text)
      setList((l) => l.map((x) => (x.id === m.id ? { ...x, text } : x)))
      setAnnounce("Memory updated")
      setEditing(null)
    } catch (err) {
      setEditError(err instanceof Error && err.message ? err.message : "Could not save. Your change was not kept.")
    } finally {
      setSaving(false)
    }
  }

  function forget(m: Agent6Memory) {
    const index = list.findIndex((x) => x.id === m.id)
    setList((l) => l.filter((x) => x.id !== m.id))
    onForget?.(m.id)
    setUndo({ memory: m, index })
    setAnnounce("Forgotten. Undo is available for a few seconds.")
  }

  function restore() {
    if (!undo) return
    const { memory, index } = undo
    setList((l) => [...l.slice(0, index), memory, ...l.slice(index)])
    onRestore?.(memory)
    setUndo(null)
    setAnnounce("Memory restored")
  }

  const used = Math.min(1, list.length / capacity)
  const content = (
    <div className="grid grid-cols-1 gap-8">
      <div className="bg-card relative overflow-hidden rounded-2xl border">
        <div className="grid items-center gap-6 p-6 sm:grid-cols-[auto_1fr] sm:gap-10 sm:p-8">
          <div className="justify-self-center">
            <CircularProgress
              size={168}
              thickness={11}
              gap={5}
              duration={0.9}
              legend={false}
              rings={counts.map((c) => ({ label: scopes[c.scope].title, value: c.n, max: Math.max(c.n, Math.ceil(list.length * 0.6)), tone: scopes[c.scope].tone, display: String(c.n) }))}
              aria-label={`${list.length} of ${capacity} memories, ${counts.map((c) => `${c.n} ${scopes[c.scope].title.toLowerCase()}`).join(", ")}`}
            >
              <span className="text-3xl font-semibold tracking-tight tabular-nums">{list.length}</span>
              <span className="text-muted-foreground text-xs">memories</span>
            </CircularProgress>
          </div>
          <div className="grid gap-5">
            <ul className="grid gap-3">
              {counts.map((c) => {
                const S = scopes[c.scope]
                return (
                  <li key={c.scope} className="flex items-center gap-3">
                    <span aria-hidden="true" className={cn("size-2.5 shrink-0 rounded-full", S.bar)} />
                    <span className="min-w-0 flex-1">
                      <span className="text-sm font-medium">{S.title}</span>
                      <span className="text-muted-foreground hidden text-xs sm:ms-2 sm:inline">{S.hint}</span>
                    </span>
                    <span className="text-sm font-medium tabular-nums">{c.n}</span>
                  </li>
                )
              })}
            </ul>
            <div className="bg-muted/60 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl px-4 py-3 text-xs">
              <p>
                <span className="text-foreground font-medium tabular-nums">{Math.round(used * 100)}%</span> <span className="text-muted-foreground">of {capacity} used</span>
              </p>
              <p>
                <span className="text-foreground font-medium tabular-nums">{activity.chats}</span> <span className="text-muted-foreground">chats this week used memory</span>
              </p>
              <p className="text-muted-foreground">Updated {activity.updated}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 border-t px-6 py-4 sm:px-8">
          <div className="min-w-0 flex-1 basis-60">
            <label htmlFor={`${id}-pause`} className="text-sm font-medium">
              {paused ? "Memory is paused" : "Memory is on"}
            </label>
            <p className="text-muted-foreground text-xs text-pretty">
              {paused ? `${assistantName} is not learning anything new and is not using what is below.` : `${assistantName} learns from your chats and uses it to answer better.`}
            </p>
          </div>
          <Switch
            id={`${id}-pause`}
            checked={!paused}
            onCheckedChange={(on) => {
              setPausedLocal(!on)
              onPausedChange?.(!on)
              setAnnounce(on ? "Memory turned on" : "Memory paused")
            }}
            aria-describedby={`${id}-pause-desc`}
          />
          <span id={`${id}-pause-desc`} className="sr-only">
            Turns off learning and using memories. Nothing is deleted.
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="bg-background focus-within:ring-ring/50 flex h-9 min-w-0 flex-1 basis-56 items-center gap-2 rounded-md border px-2.5 focus-within:ring-[3px]">
          <Search aria-hidden="true" className="text-muted-foreground size-4" />
          <input type="search" aria-label="Search memories" placeholder="Search memories" value={query} onChange={(e) => setQuery(e.target.value)} className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-sm outline-none" />
        </div>
        <SegmentedControl value={scope} onValueChange={(v) => setScope(v as typeof scope)} aria-label="Kind" size="sm">
          <SegmentedControlItem value="all">All</SegmentedControlItem>
          <SegmentedControlItem value="you">You</SegmentedControlItem>
          <SegmentedControlItem value="work">Work</SegmentedControlItem>
          <SegmentedControlItem value="preferences">Style</SegmentedControlItem>
        </SegmentedControl>
      </div>

      <StateView
        state={empty ? "empty" : "ready"}
        bare
        empty={{
          title: emptyState?.title ?? "Nothing remembered yet",
          description: emptyState?.description ?? `As you chat, ${assistantName} will note useful things here, like your role, your projects and how you like answers. You decide what stays.`,
          icon: emptyState?.icon ?? <Brain />,
          action: emptyState?.action,
        }}
      >
        <div className="grid grid-cols-1 gap-8">
          {paused ? (
            <p role="note" className="bg-muted/60 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm text-pretty">
              <Pause aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              Memory is paused. Everything below is kept, but {assistantName} is not using it or adding to it until you turn it back on.
            </p>
          ) : null}
          {grouped.map((g) => {
            const S = scopes[g.scope]
            return (
              <section key={g.scope} aria-labelledby={`${id}-${g.scope}`} className="grid grid-cols-1 gap-3">
                <h2 id={`${id}-${g.scope}`} className="flex items-center gap-2.5 text-sm font-semibold">
                  <span aria-hidden="true" className={cn("flex size-6 items-center justify-center rounded-md [&_svg]:size-3.5", S.soft)}>
                    <S.icon />
                  </span>
                  {S.title}
                  <span className="text-muted-foreground text-xs font-normal tabular-nums">{g.items.length}</span>
                </h2>
                <BlurFadeGroup stagger={0.05} item={{ direction: "up", offset: 8, blur: 4 }} className="grid grid-cols-1 gap-2.5">
                  {g.items.map((m) => {
                    const isEditing = editing === m.id
                    return (
                      <article key={m.id} aria-label={m.text} className={cn("bg-card group/mem relative flex gap-4 rounded-xl border p-4 pe-3 transition-colors duration-200 hover:border-foreground/20 focus-within:border-foreground/20", isEditing && "border-ring ring-ring/20 ring-2")}>
                        <span aria-hidden="true" className={cn("absolute inset-y-3 start-0 w-1 rounded-full", S.bar, "opacity-70")} />
                        <div className="min-w-0 flex-1 ps-2">
                          {isEditing ? (
                            <div className="grid gap-2">
                              <label htmlFor={`${id}-edit-${m.id}`} className="sr-only">
                                Edit this memory
                              </label>
                              <Textarea
                                id={`${id}-edit-${m.id}`}
                                autoFocus
                                rows={2}
                                value={draft}
                                disabled={saving}
                                aria-invalid={!!editError || undefined}
                                aria-describedby={editError ? `${id}-edit-error` : undefined}
                                onChange={(e) => setDraft(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Escape") setEditing(null)
                                  else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                                    e.preventDefault()
                                    save(m)
                                  }
                                }}
                                className="text-sm"
                              />
                              {editError ? (
                                <p id={`${id}-edit-error`} role="alert" className="text-destructive text-xs">
                                  {editError}
                                </p>
                              ) : null}
                              <div className="flex items-center gap-2">
                                <Button size="sm" onClick={() => save(m)} disabled={saving}>
                                  {saving ? <Loader2 aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : <Check aria-hidden="true" />}
                                  Save
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setEditing(null)} disabled={saving}>
                                  Cancel
                                </Button>
                                <span className="text-muted-foreground ms-auto hidden text-xs sm:block">Ctrl+Enter to save</span>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="text-sm leading-relaxed text-pretty">
                                {m.pinned ? (
                                  <span className="inline-flex align-text-bottom">
                                    <Pin aria-label="Pinned" className="text-foreground me-1.5 size-3.5 fill-current" />
                                  </span>
                                ) : null}
                                {m.text}
                              </p>
                              <div className="text-muted-foreground mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
                                {m.source ? (
                                  <span className="min-w-0 truncate">
                                    From “{m.source}”{m.learned ? ` · ${m.learned}` : ""}
                                  </span>
                                ) : m.learned ? (
                                  <span>{m.learned}</span>
                                ) : null}
                                {m.uses !== undefined ? (
                                  <span className="flex items-center gap-2 tabular-nums">
                                    <span aria-hidden="true" className="bg-muted relative h-1 w-14 overflow-hidden rounded-full">
                                      <span className={cn("absolute inset-y-0 start-0 rounded-full", S.bar)} style={{ width: `${Math.max(6, (m.uses / maxUses) * 100)}%` }} />
                                    </span>
                                    Used {m.uses} {m.uses === 1 ? "time" : "times"}
                                  </span>
                                ) : null}
                              </div>
                            </>
                          )}
                        </div>
                        {!isEditing ? (
                          <div className="flex shrink-0 items-start gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-focus-within/mem:opacity-100 sm:group-hover/mem:opacity-100">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={m.pinned ? "Unpin this memory" : "Pin this memory"}
                              aria-pressed={!!m.pinned}
                              onClick={() => {
                                setList((l) => l.map((x) => (x.id === m.id ? { ...x, pinned: !x.pinned } : x)))
                                onPin?.(m.id, !m.pinned)
                              }}
                            >
                              <Pin aria-hidden="true" className={cn(m.pinned && "fill-current")} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Edit this memory"
                              onClick={() => {
                                setEditing(m.id)
                                setDraft(m.text)
                                setEditError(undefined)
                              }}
                            >
                              <Pencil aria-hidden="true" />
                            </Button>
                            <Button variant="ghost" size="icon-sm" aria-label="Forget this memory" onClick={() => forget(m)} className="hover:text-destructive">
                              <Trash2 aria-hidden="true" />
                            </Button>
                          </div>
                        ) : null}
                      </article>
                    )
                  })}
                </BlurFadeGroup>
              </section>
            )
          })}
          {!grouped.length ? <p className="text-muted-foreground py-10 text-center text-sm">No memories match “{query || scopes[scope as Agent6Scope]?.title}”.</p> : null}
        </div>
        {list.length ? (
          <div className="mt-10 flex flex-wrap items-center gap-4 border-t pt-6">
            <p className="text-muted-foreground min-w-0 flex-1 basis-60 text-xs text-pretty">Memories stay on your account. You can also ask {assistantName} to remember or forget something in any chat.</p>
            <Button variant="outline" size="sm" onClick={() => setConfirmAll(true)} className="text-destructive hover:text-destructive">
              <Trash2 aria-hidden="true" />
              Forget everything
            </Button>
          </div>
        ) : null}
      </StateView>
    </div>
  )

  return (
    <section data-slot="agent-6" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-3xl px-4 py-8 pb-24 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-8">
        <h1 id={`${id}-title`} className="flex items-center gap-3 text-3xl font-semibold tracking-[-0.035em]">
          <span aria-hidden="true" className="bg-foreground text-background flex size-9 items-center justify-center rounded-xl [&_svg]:size-5">
            {paused ? <Pause /> : <Brain />}
          </span>
          Memory
        </h1>
        <p className="text-muted-foreground mt-2 max-w-xl text-sm text-pretty">What {assistantName} remembers about you, so you do not have to repeat yourself. Edit, pin or forget anything.</p>
      </header>

      <StateView state={state === "loading" || state === "error" ? state : "ready"} onRetry={onRetry} label="Loading your memories" loading={<MemorySkeleton />} error={{ title: errorState?.title ?? "Your memories could not be loaded", description: errorState?.description ?? "Nothing was changed. Check your connection and try again.", ...errorState }}>
        {content}
      </StateView>

      {undo ? (
        <div role="status" className="bg-popover text-popover-foreground fixed inset-x-4 bottom-4 z-30 mx-auto flex max-w-md items-center gap-3 rounded-xl border p-3 ps-4 shadow-lg">
          <p className="min-w-0 flex-1 truncate text-sm">Forgot “{undo.memory.text}”</p>
          <Button variant="outline" size="sm" onClick={restore}>
            <Undo2 aria-hidden="true" className="rtl:-scale-x-100" />
            Undo
          </Button>
        </div>
      ) : null}

      <AlertDialog open={confirmAll} onOpenChange={setConfirmAll}>
        <AlertDialogContent {...returnFocus}>
          <AlertDialogHeader>
            <AlertDialogTitle>Forget everything?</AlertDialogTitle>
            <AlertDialogDescription>
              {assistantName} will lose all {list.length} memories and start fresh. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await onForgetAll?.()
                setList([])
                setUndo(null)
                setAnnounce("All memories forgotten")
              }}
            >
              Forget everything
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

export { Agent6, type Agent6Props, type Agent6Memory, type Agent6Scope }
