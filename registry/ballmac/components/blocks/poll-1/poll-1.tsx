// Ballmac UI: Poll 1. https://ui.ballmac.com/blocks/poll-1
"use client"

import * as React from "react"
import { BarChart3, Check, CircleAlert, Clock, Crown, Loader2, Undo2 } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Poll1Option = { id: string; label: string; votes: number; hint?: string }

type Poll1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    question?: string
    description?: string
    options?: Poll1Option[]
    /** Allow choosing more than one option. */
    multiple?: boolean
    /** The most options one person may choose when multiple is on. */
    maxChoices?: number
    /** ISO date and time in UTC when voting ends. */
    closesAt?: string
    /** An ISO date and time in UTC for "now". The block never reads the clock. */
    now?: string
    /** Options you already chose, so the results show first. */
    defaultVoted?: string[]
    /** Called with the options chosen. Return a promise; reject and your vote is taken back with the reason. */
    onVote?: (optionIds: string[]) => void | Promise<void>
  }

const sample: Poll1Option[] = [
  { id: "a", label: "Dark mode that follows the device", votes: 412, hint: "Automatic, with a manual switch" },
  { id: "b", label: "Keyboard shortcuts everywhere", votes: 286, hint: "Every action, with a cheat sheet" },
  { id: "c", label: "Offline mode", votes: 198, hint: "Keep working on a plane" },
  { id: "d", label: "A calendar view", votes: 154, hint: "See tasks by day and week" },
]

function left(ms: number) {
  const m = Math.floor(ms / 60_000)
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60)
  if (h < 48) return `${h} ${h === 1 ? "hour" : "hours"}`
  return `${Math.floor(h / 24)} days`
}

function Skel() {
  return (
    <div aria-hidden="true" className="bg-card rounded-3xl border p-8">
      <Skeleton className="h-8 w-3/4" />
      <div className="mt-8 grid gap-3">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}

/**
 * A poll: pick one option (or several), vote, and the results appear with each share, the leader marked, and your choice highlighted. Your vote is counted
 * at once and taken back with the reason if it cannot be saved, you can change it while the poll is open, and the time left is worked out from the moment you pass.
 */
function Poll1({ question = "What should we build next?", description = "Your vote helps decide the next release. Results update as people vote.", options: optionsProp = sample, multiple = false, maxChoices = 2, closesAt = "2026-10-20T18:00:00Z", now = "2026-10-18T10:00:00Z", defaultVoted, onVote, state = "ready", onRetry, emptyState, errorState, className, ...props }: Poll1Props) {
  const id = React.useId()
  const [options, setOptions] = React.useState<Poll1Option[]>(optionsProp)
  React.useEffect(() => setOptions(optionsProp), [optionsProp])
  const list = state === "empty" ? [] : options
  const [voted, setVoted] = React.useState<string[]>(defaultVoted ?? [])
  const [picked, setPicked] = React.useState<string[]>([])
  const [changing, setChanging] = React.useState(false)
  const [peek, setPeek] = React.useState(false)
  const [sending, setSending] = React.useState(false)
  const [error, setError] = React.useState<string>()
  const [announce, setAnnounce] = React.useState("")
  const remaining = closesAt ? Date.parse(closesAt) - Date.parse(now) : Infinity
  const closed = remaining <= 0
  const showResults = (voted.length > 0 && !changing) || closed || peek
  const total = list.reduce((n, o) => n + o.votes, 0)
  const top = Math.max(0, ...list.map((o) => o.votes))
  const leaders = list.filter((o) => o.votes === top && top > 0)
  const nf = new Intl.NumberFormat("en")

  const toggle = (oid: string) => setPicked((p) => (multiple ? (p.includes(oid) ? p.filter((x) => x !== oid) : p.length < maxChoices ? [...p, oid] : p) : [oid]))
  async function vote() {
    if (!picked.length) return
    setError(undefined)
    setSending(true)
    const before = options
    const prev = voted
    // Count it now: take away the old choice, add the new.
    setOptions((os) => os.map((o) => ({ ...o, votes: o.votes - (prev.includes(o.id) ? 1 : 0) + (picked.includes(o.id) ? 1 : 0) })))
    setVoted(picked)
    setChanging(false)
    try {
      await onVote?.(picked)
      setAnnounce("Your vote was counted")
    } catch (e) {
      setOptions(before)
      setVoted(prev)
      setChanging(prev.length > 0)
      setError(e instanceof Error ? e.message : "Your vote could not be saved, so it was taken back. Try again.")
    } finally {
      setSending(false)
    }
  }

  const content = !list.length ? (
    <div className="bg-card rounded-3xl border px-6 py-16 text-center">
      <span aria-hidden="true" className="bg-muted mx-auto flex size-12 items-center justify-center rounded-full">
        <BarChart3 className="size-6" />
      </span>
      <h2 className="mt-5 text-lg font-semibold tracking-tight">{emptyState?.title ?? "No poll right now"}</h2>
      <p className="text-muted-foreground mx-auto mt-1.5 max-w-xs text-sm text-pretty">{emptyState?.description ?? "When there is a question to vote on, it appears here."}</p>
      {emptyState?.action}
    </div>
  ) : (
    <div className="bg-card rounded-3xl border p-6 sm:p-8">
      <p className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
        <Clock aria-hidden="true" className="size-4" />
        {closed ? "Voting is closed" : remaining === Infinity ? "Open" : `Closes in ${left(remaining)}`}
        <span aria-hidden="true">·</span>
        <span className="tabular-nums">{nf.format(total)} {total === 1 ? "vote" : "votes"}</span>
      </p>
      <h2 id={`${id}-q`} className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-balance sm:text-3xl">
        {question}
      </h2>
      <p className="text-muted-foreground mt-2 text-pretty">{description}</p>

      {showResults ? (
        <ul aria-labelledby={`${id}-q`} className="mt-7 grid gap-3">
          {list.map((o) => {
            const pct = total ? (o.votes / total) * 100 : 0
            const mine = voted.includes(o.id)
            const lead = leaders.includes(o) && leaders.length === 1
            return (
              <li key={o.id} className={cn("relative overflow-hidden rounded-2xl border p-4", mine && "border-foreground ring-foreground ring-1")}>
                <span aria-hidden="true" className={cn("absolute inset-y-0 start-0 transition-[width] duration-700 ease-out motion-reduce:transition-none", mine ? "bg-foreground/15" : lead ? "bg-chart-1/20" : "bg-muted")} style={{ width: `${pct}%` }} />
                <div className="relative flex items-center justify-between gap-4">
                  <p className="flex min-w-0 items-center gap-2.5 font-medium">
                    {mine ? <Check aria-hidden="true" className="size-4 shrink-0" /> : null}
                    <span className="truncate">{o.label}</span>
                    {mine ? <span className="bg-foreground text-background shrink-0 rounded-full px-2 py-0.5 text-xs font-medium">Your vote</span> : null}
                    {lead ? (
                      <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium">
                        <Crown aria-hidden="true" className="size-3.5 text-amber-500" />
                        Leading
                      </span>
                    ) : null}
                  </p>
                  <p className="shrink-0 text-end tabular-nums">
                    <span className="text-lg font-semibold">{Math.round(pct)}%</span>
                    <span className="text-muted-foreground block text-xs">
                      {nf.format(o.votes)} {o.votes === 1 ? "vote" : "votes"}
                    </span>
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); void vote() }} className="mt-7">
          <fieldset>
            <legend className="sr-only">
              {question} {multiple ? `Choose up to ${maxChoices}.` : "Choose one."}
            </legend>
            {multiple ? <p className="text-muted-foreground mb-3 text-sm">Choose up to {maxChoices}.</p> : null}
            <div className="grid gap-3">
              {list.map((o) => {
                const on = picked.includes(o.id)
                const full = multiple && !on && picked.length >= maxChoices
                return (
                  <label key={o.id} className={cn("focus-within:ring-ring/50 flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-colors focus-within:ring-[3px] motion-reduce:transition-none", on ? "border-foreground bg-accent/40" : "hover:bg-accent/30", full && "cursor-not-allowed opacity-50")}>
                    <input type={multiple ? "checkbox" : "radio"} name={`${id}-o`} checked={on} disabled={full} onChange={() => toggle(o.id)} className="sr-only" />
                    <span aria-hidden="true" className={cn("flex size-6 shrink-0 items-center justify-center border", multiple ? "rounded-md" : "rounded-full", on && "bg-foreground text-background border-foreground")}>
                      {on ? <Check className="size-4" /> : null}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-medium">{o.label}</span>
                      {o.hint ? <span className="text-muted-foreground block text-sm">{o.hint}</span> : null}
                    </span>
                  </label>
                )
              })}
            </div>
          </fieldset>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <button type="button" onClick={() => { setPeek(true); setChanging(false) }} className="text-muted-foreground focus-visible:ring-ring/50 rounded-sm text-sm underline underline-offset-4 outline-none focus-visible:ring-[3px]">
              See results without voting
            </button>
            <div className="flex gap-2">
              {changing ? (
                <Button type="button" variant="ghost" onClick={() => setChanging(false)}>
                  Cancel
                </Button>
              ) : null}
              <Button type="submit" disabled={!picked.length || sending}>
                {sending ? <Loader2 aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : null}
                {sending ? "Voting" : changing ? "Change my vote" : "Vote"}
              </Button>
            </div>
          </div>
        </form>
      )}

      {error ? (
        <p role="alert" className="text-destructive mt-4 flex items-start gap-2 text-sm">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      ) : null}
      {showResults && !closed ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-muted-foreground text-sm">{voted.length ? "Thanks for voting. You can change your vote until the poll closes." : "You have not voted yet."}</p>
          <Button variant="outline" size="sm" onClick={() => { setPicked(voted); setChanging(true); setPeek(false) }}>
            <Undo2 aria-hidden="true" className="rtl:-scale-x-100" />
            {voted.length ? "Change my vote" : "Vote now"}
          </Button>
        </div>
      ) : null}
    </div>
  )

  return (
    <section data-slot="poll-1" data-state={state} aria-label="Poll" className={cn("mx-auto w-full max-w-2xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <StateView state={state === "loading" || state === "error" ? state : "ready"} onRetry={onRetry} label="Loading the poll" loading={<Skel />} error={{ title: errorState?.title ?? "The poll could not be loaded", description: errorState?.description ?? "Your vote has not been lost. Check your connection and try again.", ...errorState }}>
        {content}
      </StateView>
      <p aria-live="polite" className="sr-only">
        {announce}
      </p>
    </section>
  )
}

export { Poll1, type Poll1Props, type Poll1Option }
