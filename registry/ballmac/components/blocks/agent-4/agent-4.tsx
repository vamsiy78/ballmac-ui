// Ballmac UI: Agent 4. https://ui.ballmac.com/blocks/agent-4
"use client"

import * as React from "react"
import { CircleAlert, Loader2, Play, ThumbsDown, ThumbsUp, Trophy } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { Kbd } from "@/components/ballmac/kbd"
import { ModelPicker, type ModelOption } from "@/components/ballmac/model-picker"
import { Textarea } from "@/components/ballmac/textarea"
import { frameProps } from "@/components/ballmac/state-view"
import type { BlockState } from "@/lib/ballmac/use-resource"
import { cn } from "@/lib/utils"

type Agent4Result = {
  text: string
  /** Milliseconds until the full answer. */
  latencyMs?: number
  tokens?: { input: number; output: number }
  /** Already formatted ("$0.004"). */
  cost?: string
}

type Agent4Request = {
  model: string
  system: string
  /** The prompt with every {{variable}} filled in. */
  prompt: string
  variables: Record<string, string>
}

type Agent4Props = Omit<React.ComponentProps<"section">, "title"> & {
  title?: string
  /** Models to choose from on each side. */
  models?: ModelOption[]
  /** The models selected at first, for side A and side B. */
  defaultModels?: [string, string]
  defaultSystem?: string
  /** The prompt. Write {{name}} for a variable and a field appears for it. */
  defaultPrompt?: string
  defaultVariables?: Record<string, string>
  /** Answers to show before the first run, for example the last saved comparison. */
  defaultResults?: { a?: Agent4Result; b?: Agent4Result }
  /** Runs one side. Resolve with the answer; throw to show the error on that side. Defaults to a canned answer after a moment. */
  onRun?: (request: Agent4Request) => Promise<Agent4Result>
  /** Called when a side is rated. */
  onRate?: (side: "a" | "b", rating: "up" | "down" | null, request: Agent4Request) => void
  /** Called by "Pick this one" with the winning side's request and answer. */
  onPick?: (side: "a" | "b", request: Agent4Request, result: Agent4Result) => void
  /** Drive both sides: `submitting` shows them running, `error` shows the error on both. Leave out to let the block run itself. */
  state?: BlockState
  errorState?: { title?: string; description?: string }
  /** Locale for numbers. */
  locale?: string
}

const sampleModels: ModelOption[] = [
  { id: "lyra-xl", name: "Lyra XL", provider: "Lyra", description: "Best for hard problems and careful writing.", capabilities: ["vision", "reasoning", "tools"], contextWindow: 1_000_000, cost: 3 },
  { id: "lyra-mini", name: "Lyra Mini", provider: "Lyra", description: "Near-instant replies for simple tasks.", capabilities: ["fast"], contextWindow: 128_000, cost: 1 },
  { id: "orion-chat", name: "Orion Chat", provider: "Orion", description: "Friendly conversation with strong multilingual skill.", capabilities: ["vision", "fast"], contextWindow: 128_000, cost: 1 },
]

const canned: Record<string, Agent4Result> = {
  "lyra-xl": {
    text: "Hi Jordan,\n\nYou were charged twice for order 4821. I’ve refunded the second charge of $129.00; it will reach your card in 5 to 10 business days. Your order is unaffected.\n\nSorry for the trouble,\nSam from Acme",
    latencyMs: 2140,
    tokens: { input: 212, output: 71 },
    cost: "$0.0041",
  },
  "lyra-mini": {
    text: "Hi Jordan, we refunded the duplicate $129.00 charge on order 4821. Expect it in 5–10 business days. Sorry about that! – Sam",
    latencyMs: 480,
    tokens: { input: 212, output: 38 },
    cost: "$0.0003",
  },
}

const VARIABLE = /\{\{\s*([a-zA-Z_][\w]*)\s*\}\}/g
const fill = (text: string, vars: Record<string, string>) => text.replace(VARIABLE, (_, name: string) => vars[name] ?? "")

type Side = { status: "idle" | "running" | "done" | "error"; result?: Agent4Result; error?: string; rating: "up" | "down" | null }

/**
 * A prompt playground that runs the same prompt on two models side by side: a system prompt, a prompt with {{variables}} that turn
 * into fields, Run with ⌘Enter, each answer with its latency, tokens and cost, thumbs up or down, and "Pick this one".
 */
function Agent4({
  title = "Compare models",
  models = sampleModels,
  defaultModels = ["lyra-xl", "lyra-mini"],
  defaultSystem = "You are a support agent for Acme. Be warm, brief and specific. Never promise what you cannot do.",
  defaultPrompt = "Write a reply to {{customer}} about their duplicate charge on order {{order}}. The refund was issued today.",
  defaultVariables = { customer: "Jordan", order: "4821" },
  defaultResults,
  onRun,
  onRate,
  onPick,
  state,
  errorState,
  locale = "en-US",
  className,
  ...props
}: Agent4Props) {
  const id = React.useId()
  const nf = new Intl.NumberFormat(locale)
  const [system, setSystem] = React.useState(defaultSystem)
  const [prompt, setPrompt] = React.useState(defaultPrompt)
  const [vars, setVars] = React.useState(defaultVariables)
  const [picked, setPicked] = React.useState<"a" | "b" | null>(null)
  const [chosen, setChosen] = React.useState<{ a: string; b: string }>({ a: defaultModels[0], b: defaultModels[1] })
  const [sides, setSides] = React.useState<{ a: Side; b: Side }>(() => {
    const start = (result?: Agent4Result): Side => (result ? { status: "done", result, rating: null } : { status: "idle", rating: null })
    return { a: start(defaultResults?.a), b: start(defaultResults?.b) }
  })
  const names = [...new Set([...prompt.matchAll(VARIABLE)].map((m) => m[1]!))]
  const missing = names.filter((n) => !vars[n]?.trim())

  const request = (side: "a" | "b"): Agent4Request => ({ model: chosen[side], system, prompt: fill(prompt, vars), variables: vars })

  async function runSide(side: "a" | "b") {
    setSides((s) => ({ ...s, [side]: { status: "running", rating: null } }))
    try {
      const req = request(side)
      const result = onRun
        ? await onRun(req)
        : await new Promise<Agent4Result>((r) => setTimeout(() => r(canned[req.model] ?? { text: `(${req.model}) ${req.prompt}`, latencyMs: 900, tokens: { input: 200, output: 40 } }), side === "a" ? 1100 : 500))
      setSides((s) => ({ ...s, [side]: { status: "done", result, rating: null } }))
    } catch (err) {
      setSides((s) => ({ ...s, [side]: { status: "error", error: err instanceof Error ? err.message : undefined, rating: null } }))
    }
  }

  const run = () => {
    if (missing.length || !prompt.trim()) return
    setPicked(null)
    runSide("a")
    runSide("b")
  }

  const view = (side: "a" | "b"): Side =>
    state === "submitting" ? { status: "running", rating: null } : state === "error" ? { status: "error", error: errorState?.description, rating: null } : sides[side]
  const busy = view("a").status === "running" || view("b").status === "running"

  return (
    <section data-slot="agent-4" data-state={state ?? (busy ? "submitting" : "ready")} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-6xl px-4 py-8 sm:px-6", className)} {...frameProps(props)}>
      <header className="flex flex-wrap items-center gap-3">
        <h2 id={`${id}-title`} className="flex-1 text-2xl font-semibold tracking-[-0.03em]">
          {title}
        </h2>
        <span className="text-muted-foreground hidden items-center gap-1 text-xs sm:flex">
          <Kbd>⌘</Kbd>
          <Kbd>Enter</Kbd> to run
        </span>
        <Button onClick={run} disabled={busy || missing.length > 0 || !prompt.trim()} aria-describedby={missing.length ? `${id}-missing` : undefined}>
          {busy ? <Loader2 aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : <Play aria-hidden="true" className="rtl:-scale-x-100" />}
          {busy ? "Running…" : "Run both"}
        </Button>
      </header>

      <div
        className="mt-6 grid gap-4 lg:grid-cols-2"
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault()
            run()
          }
        }}
      >
        <div className="grid content-start gap-1.5">
          <label htmlFor={`${id}-system`} className="text-sm font-medium">
            System prompt
          </label>
          <Textarea id={`${id}-system`} rows={4} value={system} onChange={(e) => setSystem(e.target.value)} className="resize-y text-[13px]" />
        </div>
        <div className="grid content-start gap-1.5">
          <label htmlFor={`${id}-prompt`} className="text-sm font-medium">
            Prompt
          </label>
          <Textarea id={`${id}-prompt`} rows={4} value={prompt} onChange={(e) => setPrompt(e.target.value)} aria-describedby={`${id}-vars-hint`} className="resize-y text-[13px]" />
          <p id={`${id}-vars-hint`} className="text-muted-foreground text-xs">
            Write <code dir="ltr" className="font-mono">{"{{name}}"}</code> for a variable.
          </p>
        </div>
        {names.length ? (
          <fieldset className="grid gap-3 rounded-xl border p-4 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-4">
            <legend className="px-1 text-sm font-medium">Variables</legend>
            {names.map((n) => (
              <div key={n} className="grid gap-1">
                <label htmlFor={`${id}-var-${n}`} dir="ltr" className="text-start font-mono text-xs">
                  {n}
                </label>
                <input
                  id={`${id}-var-${n}`}
                  value={vars[n] ?? ""}
                  onChange={(e) => setVars((v) => ({ ...v, [n]: e.target.value }))}
                  aria-invalid={!vars[n]?.trim() || undefined}
                  className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive h-8 rounded-md border px-2.5 text-sm outline-none focus-visible:ring-[3px]"
                />
              </div>
            ))}
            {missing.length ? (
              <p id={`${id}-missing`} className="text-destructive text-xs sm:col-span-2 lg:col-span-4">
                Fill in {missing.join(", ")} to run.
              </p>
            ) : null}
          </fieldset>
        ) : null}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {(["a", "b"] as const).map((side) => {
          const s = view(side)
          const label = side === "a" ? "A" : "B"
          const model = models.find((m) => m.id === chosen[side])
          return (
            <article
              key={side}
              aria-label={`Side ${label}: ${model?.name ?? chosen[side]}`}
              aria-busy={s.status === "running" || undefined}
              className={cn("bg-card flex min-h-64 flex-col rounded-xl border", picked === side && "border-chart-2 ring-chart-2/25 ring-2")}
            >
              <div className="flex items-center gap-2 border-b p-3">
                <span aria-hidden="true" className="bg-muted flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold">
                  {label}
                </span>
                <ModelPicker models={models} value={chosen[side]} onValueChange={(m) => setChosen((c) => ({ ...c, [side]: m }))} variant="compact" disabled={busy} aria-label={`Model for side ${label}`} />
                {picked === side ? (
                  <span className="text-foreground ms-auto inline-flex items-center gap-1 text-xs font-medium">
                    <Trophy aria-hidden="true" className="text-chart-2 size-3.5" />
                    Picked
                  </span>
                ) : null}
              </div>
              <div className="flex-1 p-4" aria-live="polite">
                {s.status === "running" ? (
                  <p className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Loader2 aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />
                    Running…
                  </p>
                ) : s.status === "error" ? (
                  <div role="alert" className="flex gap-2 text-sm">
                    <CircleAlert aria-hidden="true" className="text-destructive mt-0.5 size-4 shrink-0" />
                    <div>
                      <p className="font-medium">{errorState?.title ?? "This model did not answer"}</p>
                      <p className="text-muted-foreground mt-0.5 text-[13px]">{s.error ?? "Check the model’s limits and your key, then run again."}</p>
                    </div>
                  </div>
                ) : s.result ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-pretty">{s.result.text}</p>
                ) : (
                  <p className="text-muted-foreground text-sm">Run to see what {model?.name ?? "this model"} answers.</p>
                )}
              </div>
              {s.status === "done" && s.result ? (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t px-4 py-2.5">
                  <dl className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs tabular-nums">
                    {s.result.latencyMs !== undefined ? (
                      <div className="flex gap-1">
                        <dt>Time</dt>
                        <dd className="text-foreground">{(s.result.latencyMs / 1000).toFixed(2)} s</dd>
                      </div>
                    ) : null}
                    {s.result.tokens ? (
                      <div className="flex gap-1">
                        <dt>Tokens</dt>
                        <dd className="text-foreground">
                          {nf.format(s.result.tokens.input)} in · {nf.format(s.result.tokens.output)} out
                        </dd>
                      </div>
                    ) : null}
                    {s.result.cost ? (
                      <div className="flex gap-1">
                        <dt>Cost</dt>
                        <dd className="text-foreground">{s.result.cost}</dd>
                      </div>
                    ) : null}
                  </dl>
                  <div className="ms-auto flex items-center gap-1">
                    {(["up", "down"] as const).map((r) => (
                      <Button
                        key={r}
                        variant="ghost"
                        size="icon-sm"
                        aria-label={r === "up" ? `Good answer from side ${label}` : `Poor answer from side ${label}`}
                        aria-pressed={s.rating === r}
                        className="aria-pressed:bg-accent"
                        onClick={() => {
                          const next = s.rating === r ? null : r
                          setSides((all) => ({ ...all, [side]: { ...all[side], rating: next } }))
                          onRate?.(side, next, request(side))
                        }}
                      >
                        {r === "up" ? <ThumbsUp aria-hidden="true" /> : <ThumbsDown aria-hidden="true" />}
                      </Button>
                    ))}
                    <Button
                      variant={picked === side ? "secondary" : "outline"}
                      size="sm"
                      aria-pressed={picked === side}
                      onClick={() => {
                        setPicked(side)
                        onPick?.(side, request(side), s.result!)
                      }}
                    >
                      Pick this one
                    </Button>
                  </div>
                </div>
              ) : null}
            </article>
          )
        })}
      </div>
    </section>
  )
}

export { Agent4, type Agent4Props, type Agent4Request, type Agent4Result }
