// Ballmac UI: Agent 9. https://ui.ballmac.com/blocks/agent-9
"use client"

import * as React from "react"
import { Loader2, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { Switch } from "@/components/ballmac/switch"
import { cn } from "@/lib/utils"

type Agent9Autonomy = "suggest" | "ask" | "auto"
type Agent9Tool = { id: string; name: string; description: string; /** A tool that changes things outside the agent. */ writes?: boolean }
type Agent9Config = {
  autonomy: Agent9Autonomy
  /** The most one run may spend, in the currency. */
  perRun: number
  /** The most the agent may spend in a day. */
  perDay: number
  /** Tool ids the agent may use. */
  tools: string[]
  /** Stop after this many steps in one run. */
  maxSteps: number
}

type Agent9Props = Omit<React.ComponentProps<"section">, "title" | "onChange"> &
  StateProps & {
    config?: Agent9Config
    tools?: Agent9Tool[]
    title?: string
    currency?: string
    /** Called with the new settings. Reject and the edits stay with the message. */
    onSave?: (config: Agent9Config) => void | Promise<void>
  }

const LEVELS: { id: Agent9Autonomy; name: string; detail: string }[] = [
  { id: "suggest", name: "Suggest only", detail: "It proposes every step. Nothing happens until you do it yourself." },
  { id: "ask", name: "Ask first", detail: "It does safe steps alone and asks before anything that changes something." },
  { id: "auto", name: "Act on its own", detail: "It does everything inside its budget and tools, and reports after." },
]
const defaultTools: Agent9Tool[] = [
  { id: "search", name: "Search the web", description: "Reads pages. Changes nothing." },
  { id: "docs", name: "Read documents", description: "Reads your workspace files. Changes nothing." },
  { id: "mail", name: "Send email", description: "Sends from your address.", writes: true },
  { id: "calendar", name: "Edit calendar", description: "Creates, moves and cancels events.", writes: true },
  { id: "pay", name: "Make payments", description: "Spends from the linked card.", writes: true },
]
const defaultConfig: Agent9Config = { autonomy: "ask", perRun: 5, perDay: 25, tools: ["search", "docs", "mail"], maxSteps: 30 }

const same = (a: Agent9Config, b: Agent9Config) => a.autonomy === b.autonomy && a.perRun === b.perRun && a.perDay === b.perDay && a.maxSteps === b.maxSteps && [...a.tools].sort().join() === [...b.tools].sort().join()

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-5">
      <Skeleton className="h-44 rounded-2xl" />
      <Skeleton className="h-32 rounded-2xl" />
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  )
}

/**
 * How much an agent may do on its own: a level of autonomy in plain words, a spending cap per run and per day, the tools it may use, and a step limit.
 * Edits are held until saved; the bar says what changed, a risky mix is warned about, and a failed save keeps everything with the reason.
 */
function Agent9({ config = defaultConfig, tools = defaultTools, title = "What the agent may do", currency = "USD", onSave, state = "ready", onRetry, emptyState, errorState, className, ...props }: Agent9Props) {
  const id = React.useId()
  const [saved, setSaved] = React.useState(config)
  const [draft, setDraft] = React.useState(config)
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [note, setNote] = React.useState("")
  const view = state === "ready" && tools.length === 0 ? "empty" : state
  const money = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(n)
  const dirty = !same(saved, draft)
  const perRunBad = !(draft.perRun > 0) || draft.perRun > draft.perDay
  const stepsBad = !Number.isInteger(draft.maxSteps) || draft.maxSteps < 1 || draft.maxSteps > 200
  const writing = tools.filter((t) => t.writes && draft.tools.includes(t.id))
  const risky = draft.autonomy === "auto" && writing.length > 0
  const set = (patch: Partial<Agent9Config>) => { setNote(""); setError(null); setDraft((d) => ({ ...d, ...patch })) }

  async function save() {
    if (perRunBad || stepsBad) return
    setBusy(true)
    setError(null)
    try {
      await onSave?.(draft)
      setSaved(draft)
      setNote("Saved. The agent follows these settings from its next run.")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nothing was saved. Your edits are still here.")
    } finally {
      setBusy(false)
    }
  }

  const num = "bg-background focus-visible:ring-ring/50 aria-[invalid=true]:border-destructive h-11 w-full rounded-lg border px-3 text-sm tabular-nums outline-none focus-visible:ring-[3px]"
  const card = "bg-card rounded-2xl border p-5 sm:p-6"

  return (
    <section data-slot="agent-9" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-3xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <h1 id={`${id}-title`} className="mb-8 text-3xl font-semibold tracking-[-0.035em] text-balance">{title}</h1>
      <StateView state={view} onRetry={onRetry} label="Loading the agent settings" loading={<Skel />} empty={{ title: "No tools connected", description: "Connect a tool to decide what the agent may use.", ...emptyState }} error={{ title: "The settings could not be loaded", description: "Nothing was changed. Check your connection and try again.", ...errorState }}>
        <div className="grid gap-5">
          <fieldset className={card}>
            <legend className="sr-only">Autonomy</legend>
            <h2 className="mb-1 text-lg font-semibold tracking-tight" aria-hidden="true">How much it does alone</h2>
            <div className="mt-4 grid gap-2.5">
              {LEVELS.map((l) => (
                <label key={l.id} className="relative block cursor-pointer">
                  <input type="radio" name={`${id}-level`} checked={draft.autonomy === l.id} onChange={() => set({ autonomy: l.id })} className="peer sr-only" />
                  <span className="peer-checked:border-foreground peer-checked:bg-accent/40 peer-focus-visible:ring-ring/50 block rounded-xl border p-3.5 transition-colors peer-focus-visible:ring-[3px] motion-reduce:transition-none">
                    <span className="block text-sm font-medium">{l.name}</span>
                    <span className="text-muted-foreground block text-sm">{l.detail}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className={card}>
            <legend className="sr-only">Limits</legend>
            <h2 className="text-lg font-semibold tracking-tight" aria-hidden="true">Limits</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor={`${id}-run`} className="mb-1.5 block text-sm font-medium">Most per run ({currency})</label>
                <input id={`${id}-run`} inputMode="decimal" value={draft.perRun || ""} onChange={(e) => set({ perRun: Number.parseFloat(e.target.value) || 0 })} aria-invalid={perRunBad} aria-describedby={perRunBad ? `${id}-run-err` : undefined} className={num} />
                {perRunBad && <p id={`${id}-run-err`} role="alert" className="text-destructive mt-1.5 text-sm font-medium">{draft.perRun > draft.perDay ? "A run cannot cost more than the daily limit." : "Enter an amount above 0."}</p>}
              </div>
              <div>
                <label htmlFor={`${id}-day`} className="mb-1.5 block text-sm font-medium">Most per day ({currency})</label>
                <input id={`${id}-day`} inputMode="decimal" value={draft.perDay || ""} onChange={(e) => set({ perDay: Number.parseFloat(e.target.value) || 0 })} className={num} />
              </div>
              <div>
                <label htmlFor={`${id}-steps`} className="mb-1.5 block text-sm font-medium">Most steps in a run</label>
                <input id={`${id}-steps`} inputMode="numeric" value={draft.maxSteps || ""} onChange={(e) => set({ maxSteps: Number.parseInt(e.target.value, 10) || 0 })} aria-invalid={stepsBad} aria-describedby={stepsBad ? `${id}-steps-err` : undefined} className={num} />
                {stepsBad && <p id={`${id}-steps-err`} role="alert" className="text-destructive mt-1.5 text-sm font-medium">Enter a whole number from 1 to 200.</p>}
              </div>
            </div>
            <p className="text-muted-foreground mt-3 text-sm">It stops and asks you when it would pass a limit.</p>
          </fieldset>

          <div className={card}>
            <h2 className="text-lg font-semibold tracking-tight">Tools it may use</h2>
            <ul className="mt-3 divide-y">
              {tools.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{t.name}{t.writes && <span className="text-muted-foreground ms-2 rounded-full border px-2 py-0.5 text-xs font-normal">Changes things</span>}</p>
                    <p className="text-muted-foreground text-sm">{t.description}</p>
                  </div>
                  <Switch aria-label={`${t.name} is allowed`} checked={draft.tools.includes(t.id)} onCheckedChange={(on) => set({ tools: on ? [...draft.tools, t.id] : draft.tools.filter((x) => x !== t.id) })} />
                </li>
              ))}
            </ul>
            {risky && (
              <p role="status" className="bg-muted mt-3 flex items-start gap-2.5 rounded-lg p-3 text-sm"><ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0" />With &ldquo;Act on its own&rdquo;, it can {writing.map((t) => t.name.toLowerCase()).join(", ")} without asking. Its limits are {money(draft.perRun)} a run and {money(draft.perDay)} a day.</p>
            )}
          </div>

          <div className="bg-background/90 sticky bottom-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-3 ps-5 shadow-lg backdrop-blur">
            <p aria-live="polite" role={error ? "alert" : undefined} className={cn("text-sm", error && "text-destructive font-medium")}>{error ?? (dirty ? "You have unsaved changes." : note || "All changes saved.")}</p>
            <div className="flex gap-2">
              <Button variant="outline" disabled={!dirty || busy} onClick={() => { setDraft(saved); setError(null) }}>Discard</Button>
              <Button disabled={!dirty || busy || perRunBad || stepsBad} onClick={() => void save()}>{busy && <Loader2 aria-hidden="true" className="animate-spin" />} Save settings</Button>
            </div>
          </div>
        </div>
      </StateView>
    </section>
  )
}

export { Agent9, type Agent9Autonomy, type Agent9Config, type Agent9Props, type Agent9Tool }
