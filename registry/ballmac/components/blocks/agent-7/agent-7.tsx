// Ballmac UI: Agent 7. https://ui.ballmac.com/blocks/agent-7
"use client"

import * as React from "react"
import { Bot, BookOpen, CircleAlert, FileText, Globe, Loader2, PenLine, Plus, RefreshCw, RotateCcw, Rocket, Search, ShieldCheck, Trash2, Wrench } from "lucide-react"

import { ApprovalCard, type ApprovalStatus } from "@/components/ballmac/approval-card"
import { Badge } from "@/components/ballmac/badge"
import { BlurFade } from "@/components/ballmac/blur-fade"
import { Button } from "@/components/ballmac/button"
import { CoverArt } from "@/components/ballmac/cover-art"
import { ModelPicker, type ModelOption } from "@/components/ballmac/model-picker"
import { SegmentedControl, SegmentedControlItem } from "@/components/ballmac/segmented-control"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView } from "@/components/ballmac/state-view"
import { Switch } from "@/components/ballmac/switch"
import { Textarea } from "@/components/ballmac/textarea"
import { ToolCallCard } from "@/components/ballmac/tool-call-card"
import { formPhase, type FormStateProps } from "@/lib/ballmac/use-resource"
import { cn } from "@/lib/utils"

type Agent7Permission = "off" | "ask" | "allow"

type Agent7Tool = {
  id: string
  name: string
  description: string
  icon?: React.ReactNode
  /** The tool changes data or sends something out. It is flagged, and defaults to Ask first. */
  writes?: boolean
}

type Agent7Source = {
  id: string
  name: string
  /** What it is ("Help center", "PDF", "Website"). */
  kind: string
  status: "ready" | "syncing" | "failed"
  /** Already written for people ("Synced 2 hours ago"). */
  synced?: string
}

type Agent7Config = {
  name: string
  instructions: string
  model: string
  /** Each tool's permission by id. A tool not listed is off. */
  tools: Record<string, Agent7Permission>
  /** Ids of the knowledge sources the agent may read. */
  sources: string[]
  askBeforeExternal: boolean
  maxSteps: number
}

type Agent7Props = Omit<React.ComponentProps<"section">, "title" | "onChange"> &
  FormStateProps & {
    tools?: Agent7Tool[]
    sources?: Agent7Source[]
    models?: ModelOption[]
    /** The settings when the page opens. */
    defaultConfig?: Agent7Config
    /** Called with every change. */
    onChange?: (config: Agent7Config) => void
    /** Called by Publish with the settings. Resolve to confirm; throw to show the error. Defaults to a short simulated publish. */
    onPublish?: (config: Agent7Config) => void | Promise<void>
    /** Called by "Add source". Without it the button is hidden. */
    onAddSource?: () => void
    /** Called by the remove button on a source. */
    onRemoveSource?: (id: string) => void
    /** The most characters the instructions may have. */
    maxInstructions?: number
    /** The text of the sample request in the preview. */
    sampleRequest?: string
  }

const sampleTools: Agent7Tool[] = [
  { id: "orders.lookup", name: "Look up orders", description: "Reads an order, its items and its payments.", icon: <Search /> },
  { id: "payments.refund", name: "Issue refunds", description: "Refunds a charge to the customer’s card.", icon: <Wrench />, writes: true },
  { id: "email.send", name: "Send email", description: "Sends a message from the support address.", icon: <PenLine />, writes: true },
  { id: "web.fetch", name: "Read web pages", description: "Opens public pages to check a link or a policy.", icon: <Globe /> },
]

const sampleSources: Agent7Source[] = [
  { id: "help", name: "Help center", kind: "Website", status: "ready", synced: "Synced 2 hours ago" },
  { id: "policy", name: "Refund policy.pdf", kind: "PDF", status: "ready", synced: "Uploaded last week" },
  { id: "macros", name: "Support macros", kind: "Spreadsheet", status: "syncing", synced: "Syncing…" },
  { id: "wiki", name: "Internal wiki", kind: "Website", status: "failed", synced: "Could not sign in" },
]

const sampleModels: ModelOption[] = [
  { id: "lyra-xl", name: "Lyra XL", provider: "Lyra", description: "Best for hard problems and careful writing.", capabilities: ["vision", "reasoning", "tools"], contextWindow: 1_000_000, cost: 3 },
  { id: "lyra-mid", name: "Lyra Mid", provider: "Lyra", description: "Balanced speed and quality for everyday work.", capabilities: ["vision", "tools", "fast"], contextWindow: 200_000, cost: 2 },
  { id: "lyra-mini", name: "Lyra Mini", provider: "Lyra", description: "Near-instant replies for simple tasks.", capabilities: ["fast"], contextWindow: 128_000, cost: 1 },
]

const defaults: Agent7Config = {
  name: "Support agent",
  instructions:
    "You help customers of Acme with billing and account questions.\n\nBe warm, brief and specific. Check the order before you answer. Refunds under $200 for duplicate charges are fine to issue; anything else goes to a person. Never promise what you cannot do.",
  model: "lyra-mid",
  tools: { "orders.lookup": "allow", "payments.refund": "ask", "email.send": "ask" },
  sources: ["help", "policy"],
  askBeforeExternal: true,
  maxSteps: 12,
}

const kindIcon = (k: string) => (/pdf|doc|sheet/i.test(k) ? <FileText /> : /web|site/i.test(k) ? <Globe /> : <BookOpen />)

function BuilderSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]" aria-hidden="true">
      <div className="grid gap-4">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-56 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
      <Skeleton className="h-[34rem] rounded-2xl" />
    </div>
  )
}

function Section({ index, title, description, children, id }: { index: string; title: string; description: string; children: React.ReactNode; id: string }) {
  return (
    <section aria-labelledby={id} className="bg-card rounded-2xl border">
      <header className="flex items-start gap-4 border-b p-5 pb-4">
        <span aria-hidden="true" className="text-muted-foreground bg-muted flex h-6 min-w-6 items-center justify-center rounded-md px-1 font-mono text-[11px] tabular-nums">
          {index}
        </span>
        <div className="min-w-0">
          <h2 id={id} className="text-sm font-semibold">
            {title}
          </h2>
          <p className="text-muted-foreground mt-0.5 text-xs text-pretty">{description}</p>
        </div>
      </header>
      <div className="p-5">{children}</div>
    </section>
  )
}

/**
 * An agent builder: name and instructions, a model, each tool with its own permission (off, ask first, allowed), the knowledge it may
 * read, guardrails, and a live preview that changes with every setting. Publishing shows submitting, success and error.
 */
function Agent7({
  tools = sampleTools,
  sources = sampleSources,
  models = sampleModels,
  defaultConfig = defaults,
  onChange,
  onPublish,
  onAddSource,
  onRemoveSource,
  maxInstructions = 2000,
  sampleRequest = "Refund the duplicate charge on order 4821 and let the customer know.",
  state: stateProp,
  errorState,
  className,
  ...props
}: Agent7Props) {
  const id = React.useId()
  const [config, setConfig] = React.useState(defaultConfig)
  const [removed, setRemoved] = React.useState<string[]>([])
  const [internal, setInternal] = React.useState<"idle" | "sending" | "error" | "done">("idle")
  const [message, setMessage] = React.useState<string>()
  const [touched, setTouched] = React.useState(false)
  const [decision, setDecision] = React.useState<ApprovalStatus>("pending")
  const [announce, setAnnounce] = React.useState("")
  const forced = formPhase(stateProp)
  const phase = forced ?? internal
  const set = (patch: Partial<Agent7Config>) =>
    setConfig((c) => {
      const next = { ...c, ...patch }
      onChange?.(next)
      return next
    })
  const [dirty, setDirty] = React.useState(false)

  const nameError = !config.name.trim() ? "Give the agent a name." : undefined
  const instructionsError = config.instructions.trim().length < 20 ? "Describe what the agent should do in a sentence or two." : undefined
  const invalid = !!nameError || !!instructionsError
  const permissionOf = (t: Agent7Tool): Agent7Permission => config.tools[t.id] ?? "off"
  const enabled = tools.filter((t) => permissionOf(t) !== "off")
  const shownSources = sources.filter((s) => !removed.includes(s.id))
  const model = models.find((m) => m.id === config.model)
  // the preview shows the most interesting tool: one that changes data, because that is where Ask first matters
  const first = enabled.find((t) => t.writes) ?? enabled[0]
  const firstPermission = first ? permissionOf(first) : "off"
  const used = shownSources.filter((s) => config.sources.includes(s.id) && s.status !== "failed")

  async function publish() {
    setTouched(true)
    if (invalid) {
      setAnnounce("Fix the highlighted fields before publishing")
      return
    }
    setInternal("sending")
    setMessage(undefined)
    try {
      if (onPublish) await onPublish(config)
      else await new Promise((r) => setTimeout(r, 1000))
      setInternal("done")
      setDirty(false)
      setAnnounce("Published")
    } catch (err) {
      setInternal("error")
      setMessage(err instanceof Error && err.message ? err.message : undefined)
    }
  }

  const change = (patch: Partial<Agent7Config>) => {
    set(patch)
    setDirty(true)
    if (internal !== "sending") setInternal("idle")
    setDecision("pending")
  }

  const status =
    phase === "sending"
      ? { text: "Publishing…", tone: "bg-chart-3" }
      : phase === "error"
        ? { text: "Not published", tone: "bg-destructive" }
        : phase === "done" && !dirty
          ? { text: "Published", tone: "bg-chart-2" }
          : dirty
            ? { text: "Unpublished changes", tone: "bg-chart-3" }
            : { text: "Draft", tone: "bg-muted-foreground" }

  const left = (
    <div className="grid min-w-0 content-start gap-5">
      <Section id={`${id}-s1`} index="01" title="Instructions" description="Say who the agent is, what it should do and where it should stop.">
        <div className="grid gap-5">
          <div className="grid gap-2">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor={`${id}-instructions`} className="text-sm font-medium">
                What should it do?
              </label>
              <span className={cn("text-xs tabular-nums", config.instructions.length > maxInstructions * 0.95 ? "text-destructive" : "text-muted-foreground")}>
                {config.instructions.length} / {maxInstructions}
              </span>
            </div>
            <Textarea
              id={`${id}-instructions`}
              rows={9}
              maxLength={maxInstructions}
              value={config.instructions}
              aria-invalid={(touched && !!instructionsError) || undefined}
              aria-describedby={touched && instructionsError ? `${id}-instructions-error` : undefined}
              onChange={(e) => change({ instructions: e.target.value })}
              className="min-h-44 resize-y text-[13px] leading-relaxed"
            />
            {touched && instructionsError ? (
              <p id={`${id}-instructions-error`} role="alert" className="text-destructive text-xs">
                {instructionsError}
              </p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <span id={`${id}-model`} className="text-sm font-medium">
              Model
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <ModelPicker models={models} value={config.model} onValueChange={(m) => change({ model: m })} aria-labelledby={`${id}-model`} />
              {model?.description ? <p className="text-muted-foreground min-w-0 flex-1 basis-48 text-xs text-pretty">{model.description}</p> : null}
            </div>
          </div>
        </div>
      </Section>

      <Section id={`${id}-s2`} index="02" title="Tools" description="What the agent can do. Anything that changes data is flagged, and you choose whether it asks first.">
        <ul className="grid gap-2.5">
          {tools.map((t) => {
            const p = permissionOf(t)
            return (
              <li key={t.id} className={cn("flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border p-3.5 transition-colors duration-200", p !== "off" && "bg-accent/30 border-foreground/15")}>
                <span aria-hidden="true" className="bg-background flex size-9 shrink-0 items-center justify-center rounded-lg border [&_svg]:size-4">
                  {t.icon ?? <Wrench />}
                </span>
                <div className="min-w-0 flex-1 basis-52">
                  <p id={`${id}-t-${t.id}`} className="flex flex-wrap items-center gap-2 text-sm font-medium">
                    {t.name}
                    {t.writes ? (
                      <Badge status="warning" className="font-normal">
                        Changes data
                      </Badge>
                    ) : null}
                  </p>
                  <p className="text-muted-foreground mt-0.5 text-xs text-pretty">{t.description}</p>
                </div>
                {p !== "off" ? (
                  <SegmentedControl value={p} onValueChange={(v) => change({ tools: { ...config.tools, [t.id]: v as Agent7Permission } })} aria-label={`${t.name}: when to use`} size="sm">
                    <SegmentedControlItem value="ask">Ask first</SegmentedControlItem>
                    <SegmentedControlItem value="allow">Allowed</SegmentedControlItem>
                  </SegmentedControl>
                ) : null}
                <Switch
                  checked={p !== "off"}
                  onCheckedChange={(on) => change({ tools: { ...config.tools, [t.id]: on ? (t.writes ? "ask" : "allow") : "off" } })}
                  aria-labelledby={`${id}-t-${t.id}`}
                />
              </li>
            )
          })}
        </ul>
      </Section>

      <Section id={`${id}-s3`} index="03" title="Knowledge" description="What the agent may read before it answers. It cites these in its replies.">
        <ul className="grid gap-2">
          {shownSources.map((s) => {
            const on = config.sources.includes(s.id)
            return (
              <li key={s.id} className="flex items-center gap-3 rounded-xl border p-3">
                <span aria-hidden="true" className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-lg [&_svg]:size-4">
                  {kindIcon(s.kind)}
                </span>
                <div className="min-w-0 flex-1">
                  <p id={`${id}-k-${s.id}`} className="truncate text-sm font-medium">
                    {s.name}
                  </p>
                  <p className={cn("flex items-center gap-1.5 text-xs", s.status === "failed" ? "text-destructive" : "text-muted-foreground")}>
                    {s.status === "syncing" ? <RefreshCw aria-hidden="true" className="size-3 animate-spin motion-reduce:animate-none" /> : s.status === "failed" ? <CircleAlert aria-hidden="true" className="size-3" /> : null}
                    {s.kind} · {s.synced}
                  </p>
                </div>
                {onRemoveSource ? (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remove ${s.name}`}
                    onClick={() => {
                      setRemoved((r) => [...r, s.id])
                      onRemoveSource(s.id)
                      change({ sources: config.sources.filter((x) => x !== s.id) })
                    }}
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                ) : null}
                <Switch checked={on} disabled={s.status === "failed"} onCheckedChange={(v) => change({ sources: v ? [...config.sources, s.id] : config.sources.filter((x) => x !== s.id) })} aria-labelledby={`${id}-k-${s.id}`} />
              </li>
            )
          })}
        </ul>
        {onAddSource ? (
          <Button variant="outline" size="sm" className="mt-3" onClick={onAddSource}>
            <Plus aria-hidden="true" />
            Add source
          </Button>
        ) : null}
      </Section>

      <Section id={`${id}-s4`} index="04" title="Guardrails" description="Limits that always apply, whatever the instructions say.">
        <div className="grid gap-4">
          <div className="flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <p id={`${id}-g1`} className="text-sm font-medium">
                Ask before anything leaves the company
              </p>
              <p className="text-muted-foreground mt-0.5 text-xs text-pretty">Emails, messages and requests to other services wait for a person to approve them.</p>
            </div>
            <Switch checked={config.askBeforeExternal} onCheckedChange={(v) => change({ askBeforeExternal: v })} aria-labelledby={`${id}-g1`} />
          </div>
          <div className="flex items-center gap-4 border-t pt-4">
            <div className="min-w-0 flex-1">
              <p id={`${id}-steps`} className="text-sm font-medium">
                Stop after this many steps
              </p>
              <p className="text-muted-foreground mt-0.5 text-xs text-pretty">A run that goes past it stops and asks for help, so a loop cannot run up a bill.</p>
            </div>
            <SegmentedControl value={String(config.maxSteps)} onValueChange={(v) => change({ maxSteps: Number(v) })} aria-labelledby={`${id}-steps`} size="sm">
              {[6, 12, 25, 50].map((n) => (
                <SegmentedControlItem key={n} value={String(n)}>
                  {n}
                </SegmentedControlItem>
              ))}
            </SegmentedControl>
          </div>
        </div>
      </Section>
    </div>
  )

  const preview = (
    <aside aria-label="Preview" className="bg-card flex min-h-[32rem] flex-col overflow-hidden rounded-2xl border lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)]">
      <div className="flex items-center gap-3 border-b p-4">
        <CoverArt seed={config.name || "agent"} variant="mesh" className="size-9 shrink-0 rounded-xl border" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{config.name || "Untitled agent"}</p>
          <p className="text-muted-foreground truncate text-xs">{model?.name ?? config.model}</p>
        </div>
        <Badge variant="outline" className="font-normal">
          Preview
        </Badge>
        <Button variant="ghost" size="icon-sm" aria-label="Replay the preview" onClick={() => setDecision("pending")}>
          <RotateCcw aria-hidden="true" />
        </Button>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <p className="text-muted-foreground text-center text-xs">Sample conversation. It shows how your settings behave, not a real model’s words.</p>
        <div className="bg-primary text-primary-foreground ms-auto w-fit max-w-[85%] rounded-2xl rounded-ee-md px-3.5 py-2 text-sm text-pretty">{sampleRequest}</div>
        <div className="flex gap-2.5">
          <span aria-hidden="true" className="bg-muted mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border [&_svg]:size-3.5">
            <Bot />
          </span>
          <div className="grid min-w-0 flex-1 gap-3">
            <p className="text-sm text-pretty">
              {used.length
                ? `I’ll check ${used.length === 1 ? used[0]!.name : `${used.length} sources, starting with ${used[0]!.name}`}, then handle it.`
                : "I don’t have any knowledge sources turned on, so I’ll work from my instructions."}
            </p>
            {first ? (
              firstPermission === "ask" && decision !== "approved" ? (
                <ApprovalCard
                  key={first.id}
                  title={`Use “${first.name}”`}
                  description={first.description}
                  risk={first.writes ? "high" : "low"}
                  status={decision}
                  onApprove={() => setDecision("approved")}
                  onDeny={() => setDecision("denied")}
                />
              ) : (
                <ToolCallCard name={first.id} status="success" duration={640} description={first.name} />
              )
            ) : (
              <p className="border-border text-muted-foreground rounded-xl border border-dashed px-3 py-2.5 text-xs">No tools are turned on, so it can only answer in words.</p>
            )}
            {decision === "denied" ? (
              <p className="text-sm text-pretty">Understood, I won’t do that. I’ll tell the customer a person will follow up.</p>
            ) : !first ? (
              <p className="text-sm text-pretty">I can explain what to do, but I can’t do it myself. Turn on a tool to let me.</p>
            ) : firstPermission === "allow" || decision === "approved" ? (
              <p className="text-sm text-pretty">Done. {first.writes ? "The change is made and the customer has been told." : "I found what you asked for."} Anything outside my limits goes to a person{config.askBeforeExternal ? ", and I’ll ask before anything leaves the company" : ""}.</p>
            ) : null}
          </div>
        </div>
      </div>
      <dl className="text-muted-foreground grid grid-cols-3 gap-px border-t bg-border text-center text-[11px] [&>div]:bg-card [&>div]:px-2 [&>div]:py-2.5">
        <div>
          <dt>Tools</dt>
          <dd className="text-foreground text-sm font-semibold tabular-nums">{enabled.length}</dd>
        </div>
        <div>
          <dt>Sources</dt>
          <dd className="text-foreground text-sm font-semibold tabular-nums">{used.length}</dd>
        </div>
        <div>
          <dt>Step limit</dt>
          <dd className="text-foreground text-sm font-semibold tabular-nums">{config.maxSteps}</dd>
        </div>
      </dl>
    </aside>
  )

  return (
    <section data-slot="agent-7" data-state={stateProp ?? (phase === "sending" ? "submitting" : phase === "error" ? "error" : phase === "done" ? "success" : "ready")} aria-label="Agent builder" className={cn("mx-auto w-full max-w-6xl px-4 py-8 sm:px-6", className)} {...frameProps(props)}>
      <StateView state={stateProp === "loading" ? "loading" : "ready"} label="Loading the agent" loading={<BuilderSkeleton />}>
        <BlurFade direction="up" offset={8} duration={0.45}>
          <header className="flex flex-wrap items-center gap-x-4 gap-y-3 pb-6">
            <CoverArt seed={config.name || "agent"} variant="mesh" className="size-12 shrink-0 rounded-2xl border" />
            <div className="min-w-0 flex-1 basis-56">
              <label htmlFor={`${id}-name`} className="sr-only">
                Agent name
              </label>
              <input
                id={`${id}-name`}
                value={config.name}
                placeholder="Name your agent"
                maxLength={60}
                aria-invalid={(touched && !!nameError) || undefined}
                aria-describedby={touched && nameError ? `${id}-name-error` : undefined}
                onChange={(e) => change({ name: e.target.value })}
                className="hover:border-border focus-visible:border-ring focus-visible:ring-ring/40 aria-invalid:border-destructive placeholder:text-muted-foreground -mx-2 w-[calc(100%+1rem)] rounded-lg border border-transparent bg-transparent px-2 py-0.5 text-2xl font-semibold tracking-[-0.03em] outline-none focus-visible:ring-[3px]"
              />
              {touched && nameError ? (
                <p id={`${id}-name-error`} role="alert" className="text-destructive text-xs">
                  {nameError}
                </p>
              ) : null}
              <p role="status" className="text-muted-foreground mt-0.5 flex items-center gap-2 text-xs">
                <span aria-hidden="true" className={cn("size-1.5 rounded-full", status.tone)} />
                {status.text}
              </p>
            </div>
            <Button onClick={publish} disabled={phase === "sending"} aria-disabled={phase === "sending" || undefined} className="min-w-32">
              {phase === "sending" ? <Loader2 aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : phase === "done" && !dirty ? <ShieldCheck aria-hidden="true" /> : <Rocket aria-hidden="true" />}
              {phase === "sending" ? "Publishing…" : phase === "done" && !dirty ? "Published" : "Publish"}
            </Button>
          </header>
          {phase === "error" ? (
            <div role="alert" className="border-destructive/30 bg-destructive/5 mb-6 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm">
              <CircleAlert aria-hidden="true" className="text-destructive mt-0.5 size-4 shrink-0" />
              <div>
                <p className="font-medium">{errorState?.title ?? "The agent could not be published"}</p>
                <p className="text-muted-foreground mt-0.5 text-xs">{errorState?.description ?? message ?? "Your changes are kept here. Check your connection and try again."}</p>
              </div>
            </div>
          ) : null}
        </BlurFade>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
          {left}
          {preview}
        </div>
      </StateView>
      <p aria-live="polite" className="sr-only">
        {announce}
      </p>
    </section>
  )
}

export { Agent7, type Agent7Props, type Agent7Config, type Agent7Tool, type Agent7Source, type Agent7Permission }
