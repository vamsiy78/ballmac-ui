// Ballmac UI: Webhook Card. https://ui.ballmac.com/components/webhook-card
"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Check, ChevronRight, Eye, EyeOff, KeyRound, RotateCw, Webhook, X } from "lucide-react"

import { CopyButton } from "@/components/ballmac/copy-button"
import { Switch } from "@/components/ballmac/switch"
import { highlightLines, tokenClass } from "@/lib/ballmac/highlight"
import { cn } from "@/lib/utils"

type WebhookDelivery = {
  /** Unique id of the delivery. */
  id: string
  /** Event name, such as "invoice.paid". */
  event: string
  /** HTTP status your endpoint returned. Use 0 for no response (timeout or connection error). */
  status: number
  /** Time your endpoint took, in milliseconds. */
  duration?: number
  /** When it was sent, as an ISO string. Shown in UTC. */
  time: string
  /** Request body that was sent. */
  payload?: string
  /** Response body your endpoint returned. */
  response?: string
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function stamp(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const p = (n: number) => String(n).padStart(2, "0")
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())} UTC`
}

const ok = (status: number) => status >= 200 && status < 300

function statusText(status: number) {
  if (status === 0) return "No response"
  return ok(status) ? "Delivered" : status >= 500 ? "Server error" : status >= 400 ? "Rejected" : "Redirected"
}

function Json({ code, label }: { code: string; label: string }) {
  const lines = React.useMemo(() => highlightLines(code, "json"), [code])
  return (
    <pre
      role="region"
      aria-label={label}
      tabIndex={0}
      className="max-h-48 overflow-auto rounded-md border bg-muted/40 p-3 font-mono text-xs leading-5 text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <code className="grid">
        {lines.map((line, i) => (
          <span key={i} className="whitespace-pre">
            {line.length === 0 ? " " : line.map((t, j) => <span key={j} className={tokenClass[t.type]}>{t.text}</span>)}
          </span>
        ))}
      </code>
    </pre>
  )
}

type WebhookCardProps = Omit<React.ComponentProps<"section">, "children"> & {
  /** Endpoint URL that receives events. */
  url: string
  /** Whether deliveries are sent. */
  enabled?: boolean
  /** Called when the switch is flipped. */
  onEnabledChange?: (enabled: boolean) => void
  /** Signing secret. Masked until revealed. */
  secret?: string
  /** Events this endpoint subscribes to. */
  events?: string[]
  /** How many event names show before "+N". */
  visibleEvents?: number
  /** Recent deliveries, newest first. */
  deliveries?: WebhookDelivery[]
  /** Adds a Redeliver button to each opened delivery. */
  onRedeliver?: (delivery: WebhookDelivery) => void
  /** Adds a "Send test event" button. */
  onTest?: () => void
}

function WebhookCard({
  url,
  enabled = true,
  onEnabledChange,
  secret,
  events = [],
  visibleEvents = 3,
  deliveries = [],
  onRedeliver,
  onTest,
  className,
  ...props
}: WebhookCardProps) {
  const reduce = useReducedMotion()
  const uid = React.useId()
  const [isOn, setIsOn] = React.useState(enabled)
  React.useEffect(() => setIsOn(enabled), [enabled])
  const [reveal, setReveal] = React.useState(false)
  const [open, setOpen] = React.useState<string | null>(null)
  const recent = deliveries.slice(0, 5)
  const failing = recent.length > 0 && recent.filter((d) => !ok(d.status)).length >= Math.ceil(recent.length / 2)
  const state = !isOn ? "disabled" : failing ? "failing" : "active"
  const meta = {
    active: { label: "Active", icon: Check, chip: "border-chart-2/30 bg-chart-2/10" },
    failing: { label: "Failing", icon: X, chip: "border-destructive/30 bg-destructive/10" },
    disabled: { label: "Disabled", icon: X, chip: "border-border bg-muted" },
  }[state]
  const Icon = meta.icon
  const shownEvents = events.slice(0, visibleEvents)
  const extra = events.length - shownEvents.length
  const masked = secret ? `${secret.slice(0, Math.min(6, Math.max(secret.length - 4, 0)))}${"•".repeat(14)}` : ""
  const successRate = deliveries.length ? Math.round((deliveries.filter((d) => ok(d.status)).length / deliveries.length) * 100) : null

  return (
    <section
      data-slot="webhook-card"
      data-state={state}
      aria-label={`Webhook ${url}`}
      className={cn("w-full overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xs", className)}
      {...props}
    >
      <header className="flex items-start gap-3 p-4">
        <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted">
          <Webhook className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1">
            <code className="min-w-0 truncate font-mono text-[13px] font-medium text-foreground" title={url}>
              {url}
            </code>
            <CopyButton size="sm" value={url} ariaLabel="Copy endpoint URL" />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium text-foreground", meta.chip)}>
              <Icon aria-hidden="true" className="size-3" />
              {meta.label}
            </span>
            {successRate !== null && (
              <span className="text-xs text-muted-foreground tabular-nums">{successRate}% of {deliveries.length} deliveries succeeded</span>
            )}
          </div>
        </div>
        <label className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
          <span className="sr-only">Send events to this endpoint</span>
          <Switch
            checked={isOn}
            onCheckedChange={(next) => {
              setIsOn(next)
              onEnabledChange?.(next)
            }}
            aria-label="Send events to this endpoint"
          />
        </label>
      </header>

      {(secret || events.length > 0) && (
        <div className="grid gap-3 border-t px-4 py-3 text-[13px]">
          {secret && (
            <div className="flex items-center gap-2">
              <KeyRound aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
              <span className="shrink-0 text-muted-foreground">Signing secret</span>
              <code className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">{reveal ? secret : masked}</code>
              <button
                type="button"
                aria-pressed={reveal}
                aria-label={reveal ? "Hide signing secret" : "Reveal signing secret"}
                onClick={() => setReveal((r) => !r)}
                className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {reveal ? <EyeOff aria-hidden="true" className="size-3.5" /> : <Eye aria-hidden="true" className="size-3.5" />}
              </button>
              <CopyButton size="sm" value={secret} ariaLabel="Copy signing secret" />
            </div>
          )}
          {events.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-muted-foreground">Events</span>
              {shownEvents.map((e) => (
                <code key={e} className="rounded-md border bg-muted/60 px-1.5 py-0.5 font-mono text-[11px] text-foreground">
                  {e}
                </code>
              ))}
              {extra > 0 && (
                <span className="text-xs text-muted-foreground" title={events.slice(visibleEvents).join(", ")}>
                  +{extra} more
                </span>
              )}
            </div>
          )}
        </div>
      )}

      <div className="border-t">
        <div className="flex items-center justify-between gap-2 px-4 py-2.5">
          <h4 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Recent deliveries</h4>
          {onTest && (
            <button
              type="button"
              onClick={onTest}
              className="h-7 rounded-md border bg-background px-2.5 text-xs font-medium shadow-xs outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              Send test event
            </button>
          )}
        </div>
        {deliveries.length === 0 ? (
          <p className="px-4 pb-5 text-[13px] text-muted-foreground">No deliveries yet. Events appear here as soon as they are sent.</p>
        ) : (
          <ul className="divide-y border-t">
            {deliveries.map((d) => {
              const isOpen = open === d.id
              const panel = `${uid}-${d.id}`
              return (
                <li key={d.id}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panel}
                    onClick={() => setOpen(isOpen ? null : d.id)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left outline-none transition-colors hover:bg-accent/40 focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/50 motion-reduce:transition-none"
                  >
                    <ChevronRight
                      aria-hidden="true"
                      className={cn("size-4 shrink-0 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none", isOpen && "rotate-90")}
                    />
                    <span
                      className={cn(
                        "inline-flex h-6 min-w-[3.25rem] shrink-0 items-center justify-center gap-1 rounded-md border px-1.5 font-mono text-xs font-semibold text-foreground tabular-nums",
                        ok(d.status) ? "border-chart-2/40 bg-chart-2/10" : "border-destructive/40 bg-destructive/10"
                      )}
                    >
                      {d.status || "—"}
                      <span className="sr-only">, {statusText(d.status)}</span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-mono text-[13px] text-foreground">{d.event}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {stamp(d.time)}
                        {d.duration !== undefined && ` · ${d.duration} ms`}
                      </span>
                    </span>
                    {!ok(d.status) && <span className="hidden text-xs text-foreground sm:block">{statusText(d.status)}</span>}
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={panel}
                        initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                        animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
                        exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="grid gap-3 border-t bg-muted/20 px-4 py-3 sm:pl-11">
                          {d.payload && (
                            <div className="grid gap-1.5">
                              <p className="text-xs font-medium text-muted-foreground">Request body</p>
                              <Json code={d.payload} label={`Request body of ${d.event}`} />
                            </div>
                          )}
                          {d.response && (
                            <div className="grid gap-1.5">
                              <p className="text-xs font-medium text-muted-foreground">Your response</p>
                              <Json code={d.response} label={`Response to ${d.event}`} />
                            </div>
                          )}
                          {onRedeliver && (
                            <button
                              type="button"
                              onClick={() => onRedeliver(d)}
                              className="inline-flex h-8 w-fit items-center gap-1.5 rounded-md border bg-background px-3 text-[13px] font-medium shadow-xs outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            >
                              <RotateCw aria-hidden="true" className="size-3.5" />
                              Redeliver
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}

export { WebhookCard, type WebhookCardProps, type WebhookDelivery }
