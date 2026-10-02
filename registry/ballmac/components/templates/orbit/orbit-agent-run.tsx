// Ballmac UI: Orbit agent run. https://ui.ballmac.com/templates/template-orbit
"use client"

import * as React from "react"
import { Check, CircleDashed, Loader2, RotateCcw, ShieldCheck } from "lucide-react"
import { useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

type Step = { id: string; kind: "plan" | "tool" | "approval" | "reply"; label: string; detail: string; ms: number; tokens: number }

const task = "Reconcile last week’s refunds and send finance a summary."

const steps: Step[] = [
  { id: "plan", kind: "plan", label: "Plan", detail: "3 steps · pull refunds, match to orders, draft summary", ms: 640, tokens: 412 },
  { id: "refunds", kind: "tool", label: "stripe.refunds.list", detail: "214 refunds · $18,420.50", ms: 820, tokens: 96 },
  { id: "orders", kind: "tool", label: "warehouse.query", detail: "208 matched · 6 need review", ms: 1180, tokens: 268 },
  { id: "approval", kind: "approval", label: "Needs approval", detail: "Send email to finance@acme.co", ms: 1500, tokens: 0 },
  { id: "reply", kind: "reply", label: "Summary sent", detail: "Draft delivered · 6 flagged refunds attached", ms: 520, tokens: 534 },
]

const STEP_DELAY = 1150

function formatMs(ms: number) {
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)} s` : `${ms} ms`
}

/** A scripted agent run that plays when it scrolls into view: plan, tool calls, an approval and a reply, with a live trace and cost. */
function OrbitAgentRun({ className }: { className?: string }) {
  const reduce = useReducedMotion()
  const ref = React.useRef<HTMLDivElement>(null)
  const [done, setDone] = React.useState(0)
  const [run, setRun] = React.useState(0)
  const [started, setStarted] = React.useState(false)

  // Start once the card is on screen.
  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setStarted(true)
          io.disconnect()
        }
      },
      { threshold: 0.35 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Step through the script. Reduced motion jumps straight to the end.
  React.useEffect(() => {
    if (!started) return
    if (reduce) {
      const t = setTimeout(() => setDone(steps.length), 0)
      return () => clearTimeout(t)
    }
    if (done >= steps.length) return
    const t = setTimeout(() => setDone((d) => d + 1), done === 0 ? 700 : STEP_DELAY)
    return () => clearTimeout(t)
  }, [started, done, reduce, run])

  const finished = done >= steps.length
  const elapsed = steps.slice(0, done).reduce((n, s) => n + s.ms, 0)
  const tokens = steps.slice(0, done).reduce((n, s) => n + s.tokens, 0)
  const cost = tokens * 0.0000042

  function replay() {
    setDone(0)
    setRun((r) => r + 1)
  }

  return (
    <div ref={ref} data-slot="orbit-agent-run" className={cn("bg-card/80 relative overflow-hidden rounded-3xl border shadow-[0_40px_120px_-40px_oklch(0.6_0.2_285/0.5)] backdrop-blur", className)}>
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2.5">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="bg-muted-foreground/30 size-2.5 rounded-full" />
            <span className="bg-muted-foreground/30 size-2.5 rounded-full" />
            <span className="bg-muted-foreground/30 size-2.5 rounded-full" />
          </span>
          <span className="text-muted-foreground text-xs" style={{ fontFamily: "var(--orbit-mono)" }}>
            run_8f3k2 · refund-reconciler
          </span>
        </div>
        <span
          className={cn("flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs", finished ? "text-chart-2" : "text-muted-foreground")}
          role="status"
        >
          {finished ? <Check className="size-3" aria-hidden="true" /> : <Loader2 className="size-3 motion-safe:animate-spin" aria-hidden="true" />}
          {finished ? "Completed" : started ? "Running" : "Queued"}
        </span>
      </div>

      <div className="grid lg:grid-cols-[1.15fr_1fr]">
        <div className="min-w-0 space-y-4 p-4 sm:p-6">
          <div className="bg-secondary/70 ms-auto max-w-[88%] rounded-2xl rounded-ee-md px-4 py-3 text-sm text-pretty">{task}</div>
          <ol className="space-y-2.5" aria-label="Agent steps">
            {steps.map((s, i) => {
              const state = i < done ? "done" : i === done && started && !finished ? "active" : "waiting"
              return (
                <li
                  key={s.id}
                  data-state={state}
                  className={cn(
                    "flex items-start gap-3 rounded-2xl border px-3.5 py-3 transition-[opacity,border-color,background-color] duration-500 motion-reduce:transition-none",
                    state === "waiting" && "opacity-40",
                    state === "active" && "border-chart-1/50 bg-chart-1/10",
                    s.kind === "approval" && state === "done" && "border-chart-3/40"
                  )}
                >
                  <span className="mt-0.5 shrink-0">
                    {state === "done" ? (
                      s.kind === "approval" ? <ShieldCheck className="text-chart-3 size-4" aria-hidden="true" /> : <Check className="text-chart-2 size-4" aria-hidden="true" />
                    ) : state === "active" ? (
                      <Loader2 className="text-chart-1 size-4 motion-safe:animate-spin" aria-hidden="true" />
                    ) : (
                      <CircleDashed className="text-muted-foreground size-4" aria-hidden="true" />
                    )}
                    <span className="sr-only">{state === "done" ? "Done" : state === "active" ? "In progress" : "Waiting"}</span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={cn("truncate text-sm font-medium", s.kind === "tool" && "text-[13px]")} style={s.kind === "tool" ? { fontFamily: "var(--orbit-mono)" } : undefined}>
                      {s.label}
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-xs text-pretty">{state === "waiting" ? "Waiting" : s.detail}</p>
                  </div>
                  {state === "done" && s.ms > 0 && (
                    <span className="text-muted-foreground shrink-0 text-xs tabular-nums" style={{ fontFamily: "var(--orbit-mono)" }}>
                      {formatMs(s.ms)}
                    </span>
                  )}
                </li>
              )
            })}
          </ol>
        </div>

        <div className="bg-background/40 min-w-0 border-t p-4 sm:p-6 lg:border-t-0 lg:border-s">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">Trace</p>
          <div className="mt-4 space-y-2.5" role="img" aria-label={`Trace of ${done} of ${steps.length} steps, ${formatMs(elapsed)} elapsed`}>
            {steps.map((s, i) => {
              const before = steps.slice(0, i).reduce((n, x) => n + x.ms, 0)
              const total = steps.reduce((n, x) => n + x.ms, 0)
              const visible = i < done
              return (
                <div key={s.id} className="flex items-center gap-3">
                  <span className="text-muted-foreground w-[4.75rem] shrink-0 text-[11px]" style={{ fontFamily: "var(--orbit-mono)" }}>
                    {s.kind === "tool" ? s.label.split(".")[0] : s.kind}
                  </span>
                  <div className="bg-muted/60 relative h-2 flex-1 overflow-hidden rounded-full">
                    <div
                      className={cn("absolute inset-y-0 rounded-full transition-[opacity,transform] duration-700 motion-reduce:transition-none", s.kind === "approval" ? "bg-chart-3" : s.kind === "tool" ? "bg-chart-1" : "bg-chart-2")}
                      style={{ left: `${(before / total) * 100}%`, width: `${Math.max((s.ms / total) * 100, 4)}%`, opacity: visible ? 1 : 0, transform: visible ? "scaleX(1)" : "scaleX(0.2)", transformOrigin: "left" }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <dl className="mt-6 grid grid-cols-3 gap-3">
            {[
              { label: "Elapsed", value: formatMs(elapsed) },
              { label: "Tokens", value: tokens.toLocaleString("en-US") },
              { label: "Cost", value: `$${cost.toFixed(3)}` },
            ].map((m) => (
              <div key={m.label} className="bg-card/70 rounded-xl border px-3 py-2.5">
                <dt className="text-muted-foreground text-[11px]">{m.label}</dt>
                <dd className="mt-1 text-base font-medium tabular-nums" style={{ fontFamily: "var(--orbit-mono)" }}>
                  {m.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 flex items-center justify-between gap-3">
            <p className="text-muted-foreground text-xs text-pretty" aria-live="polite">
              {finished ? "Every step is stored. Replay it, diff it, turn it into an eval." : "Watching the run live."}
            </p>
            <button
              type="button"
              onClick={replay}
              className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-xs outline-none transition-colors focus-visible:ring-[3px]"
            >
              <RotateCcw className="size-3.5" aria-hidden="true" /> Replay
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export { OrbitAgentRun }
