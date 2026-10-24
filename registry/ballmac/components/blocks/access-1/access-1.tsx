// Ballmac UI: Access 1. https://ui.ballmac.com/blocks/access-1
"use client"

import * as React from "react"
import { CheckCheck, Clock, Loader2, ShieldAlert } from "lucide-react"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ballmac/alert-dialog"
import { Button } from "@/components/ballmac/button"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { useReturnFocus } from "@/lib/ballmac/return-focus"
import { cn } from "@/lib/utils"

type Access1Person = {
  id: string
  name: string
  email: string
  /** The role they hold now. */
  role: string
  /** When they last used the product, already formatted, such as "3 days ago" or "Never". */
  lastUsed: string
  /** The same, in days, used to flag people who have not been seen for a long time. */
  idleDays: number
}

type Access1Decision = { action: "keep" | "reduce" | "remove"; to?: string }

type Access1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    people?: Access1Person[]
    title?: string
    /** Roles from most to least access. Reducing offers the roles below the person's own. */
    roles?: string[]
    /** Idle for this many days or more is flagged. */
    flagAfterDays?: number
    /** Text about the deadline, such as "Due 31 Oct". */
    due?: string
    /** Called with every decision when the review is submitted. Reject and the message says it was not saved. */
    onSubmit?: (decisions: Record<string, Access1Decision>) => void | Promise<void>
  }

const sample: Access1Person[] = [
  { id: "u1", name: "Priya Shah", email: "priya@acme.example", role: "Owner", lastUsed: "Today", idleDays: 0 },
  { id: "u2", name: "Theo Nakamura", email: "theo@acme.example", role: "Admin", lastUsed: "Yesterday", idleDays: 1 },
  { id: "u3", name: "Noor Haddad", email: "noor@acme.example", role: "Admin", lastUsed: "112 days ago", idleDays: 112 },
  { id: "u4", name: "Kofi Mensah", email: "kofi@acme.example", role: "Member", lastUsed: "5 days ago", idleDays: 5 },
  { id: "u5", name: "Ana Souza", email: "ana@acme.example", role: "Member", lastUsed: "2 weeks ago", idleDays: 14 },
  { id: "u6", name: "Oliver Reed", email: "oliver@acme.example", role: "Member", lastUsed: "Never", idleDays: 999 },
  { id: "u7", name: "Mei Tanaka", email: "mei@acme.example", role: "Viewer", lastUsed: "3 days ago", idleDays: 3 },
]

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-3">
      <Skeleton className="h-16 rounded-xl" />
      {[0, 1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-20 rounded-xl" />
      ))}
    </div>
  )
}

/**
 * A periodic access review: every person with their role and when they last used the product, and a Keep, Reduce or Remove decision each. People who
 * have not been seen for months are flagged in words, a button keeps everyone who is active, progress counts what is left, and submitting asks first when
 * anyone will lose access.
 */
function Access1({ people: peopleProp = sample, title = "Access review", roles = ["Owner", "Admin", "Member", "Viewer"], flagAfterDays = 90, due, onSubmit, state = "ready", onRetry, emptyState, errorState, className, ...props }: Access1Props) {
  const id = React.useId()
  const [decisions, setDecisions] = React.useState<Record<string, Access1Decision>>({})
  const [filter, setFilter] = React.useState<"all" | "todo" | "flagged">("all")
  const [confirm, setConfirm] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [result, setResult] = React.useState<{ ok: boolean; text: string } | null>(null)
  const ret = useReturnFocus(confirm)

  const view = state === "ready" && peopleProp.length === 0 ? "empty" : state
  const flagged = (p: Access1Person) => p.idleDays >= flagAfterDays
  const done = peopleProp.filter((p) => decisions[p.id]).length
  const left = peopleProp.length - done
  const count = (a: Access1Decision["action"]) => Object.values(decisions).filter((d) => d.action === a).length
  const shown = peopleProp.filter((p) => (filter === "all" ? true : filter === "todo" ? !decisions[p.id] : flagged(p)))
  const below = (role: string) => roles.slice(roles.indexOf(role) + 1)

  function decide(p: Access1Person, action: Access1Decision["action"]) {
    setResult(null)
    setDecisions((d) => ({ ...d, [p.id]: action === "reduce" ? { action, to: d[p.id]?.to ?? below(p.role)[0] } : { action } }))
  }
  function keepActive() {
    setResult(null)
    setDecisions((d) => ({ ...d, ...Object.fromEntries(peopleProp.filter((p) => !d[p.id] && !flagged(p)).map((p) => [p.id, { action: "keep" as const }])) }))
  }
  async function submit() {
    setBusy(true)
    setResult(null)
    try {
      await onSubmit?.(decisions)
      setResult({ ok: true, text: `Review submitted. ${count("keep")} kept, ${count("reduce")} reduced, ${count("remove")} removed.` })
    } catch (e) {
      setResult({ ok: false, text: e instanceof Error ? e.message : "The review was not saved. Nothing was changed." })
    } finally {
      setBusy(false)
    }
  }
  const start = () => (count("remove") > 0 ? setConfirm(true) : void submit())

  return (
    <section data-slot="access-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-4xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-8">
        <h1 id={`${id}-title`} className="text-3xl font-semibold tracking-[-0.035em] text-balance">
          {title}
        </h1>
        <p className="text-muted-foreground mt-2 max-w-xl text-pretty">Check who still needs the access they have. Anything you do not decide stays as it is when you submit.{due ? ` ${due}.` : ""}</p>
      </header>
      <StateView state={view} onRetry={onRetry} label="Loading people" loading={<Skel />} empty={{ title: "Nobody to review", description: "Everyone with access will appear here when a review starts.", ...emptyState }} error={{ title: "The review could not be loaded", description: "No decisions were lost. Check your connection and try again.", ...errorState }}>
        <div className="bg-card grid gap-3 rounded-xl border p-4 sm:p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-medium tabular-nums">{done} of {peopleProp.length} reviewed</p>
            <p className="text-muted-foreground text-xs tabular-nums">{count("keep")} keep · {count("reduce")} reduce · {count("remove")} remove</p>
          </div>
          <div role="meter" aria-label="Review progress" aria-valuemin={0} aria-valuemax={peopleProp.length} aria-valuenow={done} aria-valuetext={`${done} of ${peopleProp.length} reviewed`} className="bg-muted h-2 overflow-hidden rounded-full">
            <div className="bg-foreground h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${peopleProp.length ? (done / peopleProp.length) * 100 : 0}%` }} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div role="group" aria-label="Show" className="flex flex-wrap gap-2">
              {([["all", "Everyone", peopleProp.length], ["todo", "To review", left], ["flagged", "Not used lately", peopleProp.filter(flagged).length]] as const).map(([k, l, n]) => (
                <button key={k} type="button" aria-pressed={filter === k} onClick={() => setFilter(k)} className={cn("focus-visible:ring-ring/50 rounded-full border px-3 py-1 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px] motion-reduce:transition-none", filter === k ? "bg-foreground text-background border-foreground" : "hover:bg-accent")}>
                  {l} <span className={cn("tabular-nums", filter === k ? "opacity-70" : "text-muted-foreground")}>{n}</span>
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={keepActive}>
              <CheckCheck aria-hidden="true" /> Keep everyone who is active
            </Button>
          </div>
        </div>

        <ul className="mt-4 grid gap-3">
          {shown.map((p) => {
            const d = decisions[p.id]
            const isFlagged = flagged(p)
            const options = below(p.role)
            return (
              <li key={p.id} data-decision={d?.action} className={cn("bg-card rounded-xl border p-4", d?.action === "remove" && "border-destructive/50")}>
                <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-medium">
                      {p.name}
                      <span className="text-muted-foreground rounded-full border px-2 py-0.5 text-xs font-normal">{p.role}</span>
                    </p>
                    <p className="text-muted-foreground text-xs" dir="ltr">{p.email}</p>
                    <p className={cn("mt-1.5 flex items-center gap-1.5 text-xs", isFlagged ? "text-foreground font-medium" : "text-muted-foreground")}>
                      {isFlagged ? <ShieldAlert aria-hidden="true" className="text-chart-3 size-3.5" /> : <Clock aria-hidden="true" className="size-3.5" />}
                      Last used {p.lastUsed.toLowerCase()}
                      {isFlagged && " · not used lately"}
                    </p>
                  </div>
                  <fieldset className="flex flex-wrap items-center gap-2">
                    <legend className="sr-only">Decision for {p.name}</legend>
                    <div className="bg-muted/60 inline-flex rounded-full p-0.5">
                      {([["keep", "Keep"], ["reduce", "Reduce"], ["remove", "Remove"]] as const).map(([k, l]) => (
                        <label key={k} className={cn("relative cursor-pointer", k === "reduce" && options.length === 0 && "hidden")}>
                          <input type="radio" name={`${id}-${p.id}`} value={k} checked={d?.action === k} onChange={() => decide(p, k)} className="peer sr-only" />
                          <span className={cn("peer-focus-visible:ring-ring/50 block rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors peer-focus-visible:ring-[3px] motion-reduce:transition-none", d?.action === k ? (k === "remove" ? "bg-destructive text-white" : "bg-foreground text-background") : "text-muted-foreground hover:text-foreground")}>{l}</span>
                        </label>
                      ))}
                    </div>
                    {d?.action === "reduce" && options.length > 0 && (
                      <label className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">to</span>
                        <select aria-label={`New role for ${p.name}`} value={d.to} onChange={(e) => setDecisions((x) => ({ ...x, [p.id]: { action: "reduce", to: e.target.value } }))} className="bg-background focus-visible:ring-ring/50 h-9 rounded-md border px-2 text-sm outline-none focus-visible:ring-[3px]">
                          {options.map((r) => (
                            <option key={r}>{r}</option>
                          ))}
                        </select>
                      </label>
                    )}
                  </fieldset>
                </div>
              </li>
            )
          })}
        </ul>
        {shown.length === 0 && <p className="text-muted-foreground mt-4 rounded-xl border border-dashed px-4 py-10 text-center text-sm">{filter === "todo" ? "Everyone has a decision." : "Nobody here."}</p>}

        <div className="bg-background/90 sticky bottom-3 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-3 shadow-lg backdrop-blur">
          <p aria-live="polite" className={cn("text-sm", result && !result.ok && "text-destructive font-medium")} role={result && !result.ok ? "alert" : undefined}>
            {result ? result.text : left > 0 ? `${left} still to review.` : "Everyone has a decision."}
          </p>
          <Button disabled={left > 0 || busy} onClick={start}>
            {busy && <Loader2 aria-hidden="true" className="animate-spin" />} Submit review
          </Button>
        </div>
      </StateView>

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent {...ret}>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {count("remove")} {count("remove") === 1 ? "person" : "people"}?</AlertDialogTitle>
            <AlertDialogDescription>They lose access as soon as you submit: {peopleProp.filter((p) => decisions[p.id]?.action === "remove").map((p) => p.name).join(", ")}.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go back</AlertDialogCancel>
            <AlertDialogAction destructive onClick={() => void submit()}>Submit and remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}

export { Access1, type Access1Props, type Access1Person, type Access1Decision }
