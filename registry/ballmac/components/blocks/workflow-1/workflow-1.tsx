// Ballmac UI: Workflow 1. https://ui.ballmac.com/blocks/workflow-1
"use client"

import * as React from "react"
import { ArrowDown, ArrowUp, CircleCheck, CircleX, Clock, GitBranch, Loader2, Mail, MessageSquare, Play, Plus, SquareCheckBig, Tag, Trash2, Zap } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { Input } from "@/components/ballmac/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ballmac/select"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { Switch } from "@/components/ballmac/switch"
import { cn } from "@/lib/utils"

type Workflow1Step =
  | { id: string; type: "condition"; field: string; operator: "is" | "is not" | "is more than" | "contains"; value: string }
  | { id: string; type: "delay"; amount: number; unit: "minutes" | "hours" | "days" }
  | { id: string; type: "action"; action: "email" | "slack" | "task" | "tag"; text: string }

type Workflow1Props = Omit<React.ComponentProps<"section">, "title" | "onChange"> &
  StateProps & {
    title?: string
    trigger?: string
    triggers?: string[]
    steps?: Workflow1Step[]
    /** The facts a test run uses, for conditions. */
    sample?: Record<string, string>
    /** The step that is open at first. */
    defaultSelectedId?: string
    /** Milliseconds a step takes in a test run. 0 makes it instant. */
    stepMs?: number
    onChange?: (state: { trigger: string; steps: Workflow1Step[]; enabled: boolean }) => void
  }

const sampleSteps: Workflow1Step[] = [
  { id: "s1", type: "condition", field: "Order total", operator: "is more than", value: "500" },
  { id: "s2", type: "action", action: "slack", text: "Big order from {customer}: {total}" },
  { id: "s3", type: "delay", amount: 1, unit: "days" },
  { id: "s4", type: "action", action: "email", text: "Thanks for your order, {customer}. A person will be in touch." },
]

const triggerList = ["A new order is paid", "A customer signs up", "A ticket is marked urgent", "An invoice becomes overdue"]
const fields = ["Order total", "Customer country", "Plan", "Source"]
const operators = ["is", "is not", "is more than", "contains"] as const
const actionMeta = {
  email: { label: "Send an email", icon: Mail },
  slack: { label: "Post to Slack", icon: MessageSquare },
  task: { label: "Create a task", icon: SquareCheckBig },
  tag: { label: "Add a tag", icon: Tag },
}
const typeMeta = { condition: { label: "Only continue if", icon: GitBranch }, delay: { label: "Wait", icon: Clock }, action: { label: "Do this", icon: Zap } }

const defaultSample = { "Order total": "640", "Customer country": "Portugal", Plan: "Team", Source: "Website" }

function Skel() {
  return (
    <div aria-hidden="true" className="mx-auto grid max-w-xl gap-4">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-24 rounded-2xl" />
      ))}
    </div>
  )
}

function passes(s: Extract<Workflow1Step, { type: "condition" }>, facts: Record<string, string>) {
  const v = (facts[s.field] ?? "").toLowerCase()
  const w = s.value.toLowerCase()
  if (s.operator === "is") return v === w
  if (s.operator === "is not") return v !== w
  if (s.operator === "contains") return v.includes(w)
  return Number(v) > Number(w)
}
const sentence = (s: Workflow1Step) =>
  s.type === "condition" ? `${s.field} ${s.operator} ${s.value || "…"}` : s.type === "delay" ? `Wait ${s.amount} ${s.amount === 1 ? s.unit.replace(/s$/, "") : s.unit}` : s.text || "Add a message"

/**
 * An automation builder as a vertical flow: a trigger at the top, then conditions, waits and actions you add, reorder and delete, each opening to
 * its own settings. A test run walks the flow with sample facts and shows each step as done or, when a condition is not met, where and why it
 * stopped. The whole automation can be switched on or off, and every change is reported with the full list of steps.
 */
function Workflow1({ title = "New order alerts", trigger: triggerProp = "A new order is paid", triggers = triggerList, steps: stepsProp = sampleSteps, sample = defaultSample, stepMs = 450, defaultSelectedId, onChange, state = "ready", onRetry, emptyState, errorState, className, ...props }: Workflow1Props) {
  const id = React.useId()
  const [trigger, setTrigger] = React.useState(triggerProp)
  const [steps, setSteps] = React.useState<Workflow1Step[]>(stepsProp)
  const [enabled, setEnabled] = React.useState(true)
  const [selected, setSelected] = React.useState<string | null>(defaultSelectedId ?? null)
  const [adding, setAdding] = React.useState<number | null>(null)
  const [run, setRun] = React.useState<{ at: number; results: ("done" | "stopped")[]; finished: boolean } | null>(null)
  const [announce, setAnnounce] = React.useState("")
  const running = !!run && !run.finished
  const empty = state === "empty"

  const update = (next: Workflow1Step[], t = trigger, e = enabled) => {
    setSteps(next)
    onChange?.({ trigger: t, steps: next, enabled: e })
  }
  const patch = (sid: string, p: Partial<Workflow1Step>) => update(steps.map((s) => (s.id === sid ? ({ ...s, ...p } as Workflow1Step) : s)))
  const add = (at: number, kind: "condition" | "delay" | "action") => {
    const sid = `n${Date.now()}`
    const step: Workflow1Step = kind === "condition" ? { id: sid, type: "condition", field: fields[0]!, operator: "is", value: "" } : kind === "delay" ? { id: sid, type: "delay", amount: 1, unit: "hours" } : { id: sid, type: "action", action: "task", text: "" }
    update([...steps.slice(0, at), step, ...steps.slice(at)])
    setSelected(sid)
    setAdding(null)
    setAnnounce(`${typeMeta[kind].label} step added`)
  }
  const move = (i: number, d: -1 | 1) => {
    const j = i + d
    if (j < 0 || j >= steps.length) return
    const next = [...steps]
    ;[next[i], next[j]] = [next[j]!, next[i]!]
    update(next)
    setAnnounce(`Step moved to position ${j + 1}`)
  }

  async function test() {
    setSelected(null)
    const results: ("done" | "stopped")[] = []
    setRun({ at: 0, results, finished: false })
    for (let i = 0; i < steps.length; i++) {
      setRun({ at: i, results: [...results], finished: false })
      if (stepMs) await new Promise((r) => setTimeout(r, stepMs))
      const s = steps[i]!
      if (s.type === "condition" && !passes(s, sample)) {
        results.push("stopped")
        setRun({ at: i, results: [...results], finished: true })
        setAnnounce(`Test run stopped at step ${i + 1}: ${sentence(s)} was not met`)
        return
      }
      results.push("done")
    }
    setRun({ at: steps.length, results: [...results], finished: true })
    setAnnounce("Test run finished. Every step ran.")
  }

  const connector = (at: number) => (
    <li className="flex flex-col items-center">
      <span aria-hidden="true" className="bg-border h-4 w-px" />
      {adding === at ? (
        <div role="group" aria-label="Add a step" className="bg-card flex flex-wrap justify-center gap-2 rounded-2xl border p-2 shadow-md">
          {(["condition", "delay", "action"] as const).map((k) => (
            <Button key={k} size="sm" variant="outline" onClick={() => add(at, k)}>
              {React.createElement(typeMeta[k].icon, { "aria-hidden": true, className: "size-4" })}
              {typeMeta[k].label}
            </Button>
          ))}
          <Button size="sm" variant="ghost" onClick={() => setAdding(null)}>
            Cancel
          </Button>
        </div>
      ) : (
        <button type="button" disabled={running} aria-label={`Add a step ${at === 0 ? "after the trigger" : `after step ${at}`}`} onClick={() => setAdding(at)} className="bg-background hover:bg-accent focus-visible:ring-ring/50 flex size-7 items-center justify-center rounded-full border outline-none focus-visible:ring-[3px] disabled:opacity-40">
          <Plus aria-hidden="true" className="size-4" />
        </button>
      )}
      <span aria-hidden="true" className="bg-border h-4 w-px" />
    </li>
  )

  const content = empty ? (
    <div className="bg-card rounded-2xl border px-6 py-16 text-center">
      <span aria-hidden="true" className="bg-muted mx-auto flex size-12 items-center justify-center rounded-full">
        <Zap className="size-6" />
      </span>
      <h2 className="mt-5 text-lg font-semibold tracking-tight">{emptyState?.title ?? "Nothing automated yet"}</h2>
      <p className="text-muted-foreground mx-auto mt-1.5 max-w-sm text-sm text-pretty">{emptyState?.description ?? "Pick what starts it, then add what should happen. It runs on its own from then on."}</p>
      {emptyState?.action}
    </div>
  ) : (
    <div className="mx-auto max-w-xl">
      <div className="bg-card mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4 sm:p-5">
        <label className="flex items-center gap-3 text-sm font-medium">
          <Switch checked={enabled} onCheckedChange={(v) => { setEnabled(v); onChange?.({ trigger, steps, enabled: v }) }} aria-label="Run this automation" />
          {enabled ? "On: runs by itself" : "Off: paused"}
        </label>
        <Button variant="outline" size="sm" onClick={() => void test()} disabled={running || !steps.length}>
          {running ? <Loader2 aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : <Play aria-hidden="true" />}
          {running ? "Running" : "Test run"}
        </Button>
      </div>

      <ol aria-label="Steps" className="flex flex-col items-stretch">
        <li className="bg-foreground text-background rounded-2xl p-5">
          <p className="flex items-center gap-2 text-sm font-medium opacity-80">
            <Zap aria-hidden="true" className="size-4" />
            When
          </p>
          <div className="mt-3">
            <Select value={trigger} onValueChange={(v) => { setTrigger(v); onChange?.({ trigger: v, steps, enabled }) }}>
              <SelectTrigger aria-label="What starts this automation" className="bg-background text-foreground w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {triggers.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </li>
        {connector(0)}
        {steps.map((s, i) => {
          const M = s.type === "action" ? actionMeta[s.action] : typeMeta[s.type]
          const isSel = selected === s.id
          const r = run && (i < run.results.length ? run.results[i] : run.at === i && !run.finished ? "running" : null)
          return (
            <React.Fragment key={s.id}>
              <li className={cn("bg-card rounded-2xl border transition-[border-color,box-shadow] motion-reduce:transition-none", isSel && "border-foreground ring-foreground ring-1", r === "running" && "border-chart-1 ring-chart-1 ring-2", r === "stopped" && "border-destructive")}>
                <div className="flex items-center gap-3 p-4">
                  <span aria-hidden="true" className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl border", r === "done" && "bg-chart-2/15", r === "stopped" && "bg-destructive/10")}>
                    {r === "done" ? <CircleCheck className="size-5" /> : r === "stopped" ? <CircleX className="size-5" /> : r === "running" ? <Loader2 className="size-5 animate-spin motion-reduce:animate-none" /> : <M.icon className="size-5" />}
                  </span>
                  <button type="button" aria-expanded={isSel} aria-controls={`${id}-${s.id}`} onClick={() => setSelected(isSel ? null : s.id)} className="focus-visible:ring-ring/50 min-w-0 flex-1 rounded-md text-start outline-none focus-visible:ring-[3px]">
                    <span className="text-muted-foreground block text-xs font-medium">
                      {i + 1}. {s.type === "action" ? actionMeta[s.action].label : typeMeta[s.type].label}
                    </span>
                    <span className="block truncate text-sm font-medium">{sentence(s)}</span>
                    {r ? (
                      <span className="text-muted-foreground block text-xs">
                        {r === "done" ? "Ran fine" : r === "stopped" ? `Stopped here: ${sample[(s as Extract<Workflow1Step, { type: "condition" }>).field] ?? "no value"} does not match` : "Running…"}
                      </span>
                    ) : null}
                  </button>
                  <div className="flex shrink-0 items-center">
                    <Button variant="ghost" size="icon" aria-label={`Move step ${i + 1} up`} disabled={i === 0 || running} onClick={() => move(i, -1)}>
                      <ArrowUp aria-hidden="true" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label={`Move step ${i + 1} down`} disabled={i === steps.length - 1 || running} onClick={() => move(i, 1)}>
                      <ArrowDown aria-hidden="true" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label={`Delete step ${i + 1}`} disabled={running} onClick={() => { update(steps.filter((x) => x.id !== s.id)); setAnnounce(`Step ${i + 1} deleted`) }}>
                      <Trash2 aria-hidden="true" />
                    </Button>
                  </div>
                </div>
                {isSel ? (
                  <div id={`${id}-${s.id}`} className="bg-muted/30 grid gap-4 border-t p-4 sm:grid-cols-2">
                    {s.type === "condition" ? (
                      <>
                        <Field label="Field">
                          <Select value={s.field} onValueChange={(v) => patch(s.id, { field: v })}>
                            <SelectTrigger className="w-full" aria-label="Field"><SelectValue /></SelectTrigger>
                            <SelectContent>{fields.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                          </Select>
                        </Field>
                        <Field label="Is">
                          <Select value={s.operator} onValueChange={(v) => patch(s.id, { operator: v as typeof s.operator })}>
                            <SelectTrigger className="w-full" aria-label="Comparison"><SelectValue /></SelectTrigger>
                            <SelectContent>{operators.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                          </Select>
                        </Field>
                        <div className="sm:col-span-2">
                          <Field label="Value">
                            <Input value={s.value} onChange={(e) => patch(s.id, { value: e.target.value })} aria-label="Value" />
                          </Field>
                        </div>
                      </>
                    ) : null}
                    {s.type === "delay" ? (
                      <>
                        <Field label="For how long">
                          <Input type="number" min={1} value={s.amount} onChange={(e) => patch(s.id, { amount: Math.max(1, Number(e.target.value) || 1) })} aria-label="Amount" />
                        </Field>
                        <Field label="Unit">
                          <Select value={s.unit} onValueChange={(v) => patch(s.id, { unit: v as typeof s.unit })}>
                            <SelectTrigger className="w-full" aria-label="Unit"><SelectValue /></SelectTrigger>
                            <SelectContent>{(["minutes", "hours", "days"] as const).map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                          </Select>
                        </Field>
                      </>
                    ) : null}
                    {s.type === "action" ? (
                      <>
                        <Field label="What to do">
                          <Select value={s.action} onValueChange={(v) => patch(s.id, { action: v as typeof s.action })}>
                            <SelectTrigger className="w-full" aria-label="Action"><SelectValue /></SelectTrigger>
                            <SelectContent>{(Object.keys(actionMeta) as (keyof typeof actionMeta)[]).map((a) => <SelectItem key={a} value={a}>{actionMeta[a].label}</SelectItem>)}</SelectContent>
                          </Select>
                        </Field>
                        <div className="sm:col-span-2">
                          <Field label="Message or name">
                            <Input value={s.text} onChange={(e) => patch(s.id, { text: e.target.value })} aria-label="Message or name" placeholder="Use {customer} and {total} to fill in details" />
                          </Field>
                        </div>
                      </>
                    ) : null}
                  </div>
                ) : null}
              </li>
              {connector(i + 1)}
            </React.Fragment>
          )
        })}
        <li className="text-muted-foreground flex items-center justify-center gap-2 text-sm">
          <CircleCheck aria-hidden="true" className="size-4" />
          {steps.length ? "End of the automation" : "Add a first step to get started"}
        </li>
      </ol>

      {run?.finished ? (
        <p role="status" className={cn("mt-6 rounded-2xl border p-4 text-sm", run.results.includes("stopped") ? "border-destructive/40 bg-destructive/5" : "border-chart-2/40 bg-chart-2/10")}>
          {run.results.includes("stopped") ? `Test run stopped at step ${run.results.length}: the condition was not met, so nothing after it ran.` : `Test run finished. All ${steps.length} ${steps.length === 1 ? "step" : "steps"} ran.`}
        </p>
      ) : null}
    </div>
  )

  return (
    <section data-slot="workflow-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-4xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-8 text-center">
        <h1 id={`${id}-title`} className="text-3xl font-semibold tracking-[-0.035em] text-balance">
          {title}
        </h1>
        <p className="text-muted-foreground mx-auto mt-2 max-w-md text-pretty">Do things automatically when something happens.</p>
      </header>
      <StateView state={state === "loading" || state === "error" ? state : "ready"} onRetry={onRetry} label="Loading the automation" loading={<Skel />} error={{ title: errorState?.title ?? "The automation could not be loaded", description: errorState?.description ?? "Nothing was changed. Check your connection and try again.", ...errorState }}>
        {content}
      </StateView>
      <p aria-live="polite" className="sr-only">
        {announce}
      </p>
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-muted-foreground mb-1.5 text-xs font-medium">{label}</p>
      {children}
    </div>
  )
}

export { Workflow1, type Workflow1Props, type Workflow1Step }
