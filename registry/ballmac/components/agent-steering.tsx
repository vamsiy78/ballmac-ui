// Ballmac UI: Agent Steering. https://ui.ballmac.com/components/agent-steering
"use client"

import * as React from "react"
import { Ban, Check, Hourglass, Loader2, SendHorizontal, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"

type SteeringMode = "now" | "after-step" | "end"
type SteeringState = "queued" | "applied" | "dropped"

type SteeringNote = {
  id: string
  text: string
  mode: SteeringMode
  state: SteeringState
  /** When it was sent, already formatted, such as "2:14 pm". */
  at?: string
}

type AgentSteeringProps = Omit<React.ComponentProps<"section">, "title" | "defaultValue"> & {
  /** What has been said to the agent so far, newest last. */
  notes: SteeringNote[]
  /** Whether the agent is working. Instructions can only be sent while it is. */
  running?: boolean
  /** What it is doing right now, such as "Reading the pricing page (step 4 of 9)". */
  step?: string
  /** The timing that is chosen to begin with. */
  defaultMode?: SteeringMode
  /** Called with the instruction and when it should apply. Reject and the text stays with the reason. */
  onSend?: (text: string, mode: SteeringMode) => void | Promise<void>
  /** Called to take back an instruction that has not been applied yet. Reject and it stays with the reason. */
  onRemove?: (id: string) => void | Promise<void>
}

const MODES: { id: SteeringMode; label: string; hint: string }[] = [
  { id: "now", label: "Now", hint: "Stop what it is doing and change course." },
  { id: "after-step", label: "After this step", hint: "Let it finish the step, then change course." },
  { id: "end", label: "At the end", hint: "Let it finish, then do this as well." },
]
const STATE = { queued: { icon: Hourglass, label: "Queued" }, applied: { icon: Check, label: "Applied" }, dropped: { icon: Ban, label: "Dropped" } } as const

/**
 * Steering an agent while it works: say what to change and when (now, after the step it is on, or at the end), and see each instruction move from queued to
 * applied, or dropped. Instructions that have not been applied can be taken back. Nothing is sent when the agent is not running, an empty instruction is
 * refused, and a failure keeps the text and says why. Ctrl or Command with Enter sends.
 */
function AgentSteering({ notes, running = true, step, defaultMode = "after-step", onSend, onRemove, className, ...props }: AgentSteeringProps) {
  const msg = useMessages()
  const id = React.useId()
  const [text, setText] = React.useState("")
  const [mode, setMode] = React.useState<SteeringMode>(defaultMode)
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [removing, setRemoving] = React.useState<string | null>(null)
  const modeText = (m: SteeringMode) => msg(`agent-steering.mode.${m}`, MODES.find((x) => x.id === m)!.label)

  async function send() {
    const t = text.trim()
    if (!t) {
      setError(msg("agent-steering.empty", "Write what the agent should change first."))
      return
    }
    setBusy(true)
    setError(null)
    try {
      await onSend?.(t, mode)
      setText("")
    } catch (e) {
      setError(e instanceof Error ? e.message : msg("agent-steering.failed", "It was not sent. Your instruction is still here."))
    } finally {
      setBusy(false)
    }
  }
  async function remove(n: SteeringNote) {
    setRemoving(n.id)
    setError(null)
    try {
      await onRemove?.(n.id)
    } catch (e) {
      setError(e instanceof Error ? e.message : msg("agent-steering.removeFailed", "It could not be taken back."))
    } finally {
      setRemoving(null)
    }
  }

  return (
    <section data-slot="agent-steering" aria-labelledby={`${id}-t`} className={cn("bg-card text-card-foreground grid gap-4 rounded-xl border p-4 sm:p-5", className)} {...props}>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <h3 id={`${id}-t`} className="text-sm font-semibold">{msg("agent-steering.title", "Steer the agent")}</h3>
        <p aria-live="polite" className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {running ? <Loader2 aria-hidden="true" className="size-3.5 animate-spin motion-reduce:animate-none" /> : null}
          {running ? (step ? msg("agent-steering.working", "Working on: {step}", { step }) : msg("agent-steering.running", "Working")) : msg("agent-steering.idle", "Not running")}
        </p>
      </div>

      {notes.length > 0 && (
        <ul aria-label={msg("agent-steering.sent", "Instructions sent")} className="grid gap-2">
          {notes.map((n) => {
            const S = STATE[n.state]
            return (
              <li key={n.id} data-state={n.state} className={cn("flex items-start gap-3 rounded-lg border px-3 py-2.5 text-sm", n.state === "dropped" && "text-muted-foreground")}>
                <S.icon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className={cn("leading-snug text-pretty", n.state === "dropped" && "line-through")}>{n.text}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{msg(`agent-steering.state.${n.state}`, S.label)}</span>
                    <span>{modeText(n.mode)}</span>
                    {n.at && <span className="tabular-nums">{n.at}</span>}
                  </p>
                </div>
                {n.state === "queued" && onRemove && (
                  <button type="button" disabled={removing === n.id} aria-label={msg("agent-steering.remove", "Take back: {text}", { text: n.text })} onClick={() => void remove(n)} className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50 motion-reduce:transition-none">
                    <X aria-hidden="true" className="size-4" />
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}

      <div className="grid gap-3">
        <label htmlFor={`${id}-text`} className="sr-only">{msg("agent-steering.label", "Instruction for the agent")}</label>
        <textarea
          id={`${id}-text`}
          rows={2}
          value={text}
          disabled={!running}
          onChange={(e) => { setText(e.target.value); setError(null) }}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); void send() } }}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-err` : undefined}
          placeholder={running ? msg("agent-steering.placeholder", "Tell it what to change, for example “Skip the competitor pages”") : msg("agent-steering.startFirst", "Start a run to steer it.")}
          className="min-h-16 w-full resize-y rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-destructive"
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <fieldset disabled={!running} className="min-w-0">
            <legend className="sr-only">{msg("agent-steering.when", "When should it apply?")}</legend>
            <div className="bg-muted grid grid-flow-col gap-1 rounded-lg p-1 text-xs font-medium">
              {MODES.map((m) => (
                <label key={m.id} title={m.hint} className="relative cursor-pointer">
                  <input type="radio" name={`${id}-mode`} value={m.id} checked={mode === m.id} onChange={() => setMode(m.id)} className="peer sr-only" />
                  <span className="block rounded-md px-2.5 py-1.5 text-center text-muted-foreground transition-colors peer-checked:bg-background peer-checked:text-foreground peer-checked:shadow-xs peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/50 motion-reduce:transition-none">{modeText(m.id)}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <button type="button" disabled={!running || busy} onClick={() => void send()} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground outline-none transition-colors hover:bg-primary/90 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none">
            {busy ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : <SendHorizontal aria-hidden="true" className="size-4 rtl:-scale-x-100" />}
            {msg("agent-steering.send", "Send")}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">{MODES.find((m) => m.id === mode)!.hint}</p>
        <p id={`${id}-err`} role={error ? "alert" : undefined} className="min-h-4 text-sm font-medium text-destructive">{error}</p>
      </div>
    </section>
  )
}

export { AgentSteering, type AgentSteeringProps, type SteeringMode, type SteeringNote, type SteeringState }
