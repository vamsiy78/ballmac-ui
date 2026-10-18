// Ballmac UI: Status 1. https://ui.ballmac.com/blocks/status-1
"use client"

import * as React from "react"
import { CircleAlert, CircleCheck, CircleDashed, CircleX, Loader2, Mail, Wrench } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { Input } from "@/components/ballmac/input"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Status1Level = "operational" | "degraded" | "outage" | "maintenance"
type Status1Day = "ok" | "degraded" | "outage" | "none"

type Status1Component = {
  id: string
  name: string
  description?: string
  /** Right now. */
  status: Status1Level
  /** One entry per day, oldest first, ending today. Ninety is the usual window. */
  days: Status1Day[]
}

type Status1Update = { status: "investigating" | "identified" | "monitoring" | "resolved" | "scheduled"; /** "09:42" */ time: string; body: string }

type Status1Incident = {
  id: string
  title: string
  impact: "minor" | "major" | "maintenance"
  /** ISO date the incident started. */
  day: string
  /** Names of the affected components. */
  affects?: string[]
  /** Newest first. The first one's status is the incident's status. */
  updates: Status1Update[]
}

type Status1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    title?: string
    components?: Status1Component[]
    incidents?: Status1Incident[]
    /** An ISO date for "today". The block never reads the clock. */
    today?: string
    /** "10:42 UTC", already written for people. */
    updatedAt?: string
    locale?: string
    /** Called with the email to subscribe. Return a promise; reject to show its message. */
    onSubscribe?: (email: string) => void | Promise<void>
  }

const DAY = 86_400_000
const toT = (iso: string) => Date.parse(`${iso}T00:00:00Z`)

// A believable 90 days: integer maths only, so the server and the browser draw the same bars.
function history(seed: number, bad: Record<number, Status1Day> = {}): Status1Day[] {
  return Array.from({ length: 90 }, (_, i) => bad[89 - i] ?? (((i * 37 + seed * 11) % 97 === 0 && i < 80) ? "degraded" : "ok"))
}

const sampleComponents: Status1Component[] = [
  { id: "api", name: "API", description: "Requests to api.acme.com", status: "degraded", days: history(1, { 0: "degraded", 17: "outage", 52: "degraded" }) },
  { id: "dash", name: "Dashboard", description: "The web app", status: "operational", days: history(2, { 17: "degraded" }) },
  { id: "hooks", name: "Webhooks", description: "Event delivery", status: "operational", days: history(3, { 33: "degraded", 34: "degraded" }) },
  { id: "auth", name: "Sign in", description: "Login, SSO and two-step codes", status: "operational", days: history(4) },
  { id: "files", name: "File storage", description: "Uploads and downloads", status: "maintenance", days: history(5, { 0: "none", 61: "degraded" }) },
  { id: "mail", name: "Email delivery", description: "Notifications and receipts", status: "operational", days: history(6, { 8: "outage", 9: "degraded" }) },
]

const sampleIncidents: Status1Incident[] = [
  {
    id: "i3",
    title: "Slower responses from the API",
    impact: "minor",
    day: "2026-10-18",
    affects: ["API"],
    updates: [
      { status: "monitoring", time: "10:12", body: "A fix is live and response times are coming back down. We are watching it before we call it resolved." },
      { status: "identified", time: "09:40", body: "A busy database node is slowing some requests. We are moving its traffic to a healthy one." },
      { status: "investigating", time: "09:18", body: "Some requests are taking longer than usual. We are looking into it." },
    ],
  },
  {
    id: "i2",
    title: "File storage maintenance",
    impact: "maintenance",
    day: "2026-10-18",
    affects: ["File storage"],
    updates: [{ status: "scheduled", time: "08:00", body: "Uploads may pause for a few minutes while we move to faster disks. Downloads keep working." }],
  },
  {
    id: "i0",
    title: "Emails sent late",
    impact: "minor",
    day: "2026-10-14",
    affects: ["Email delivery"],
    updates: [
      { status: "resolved", time: "11:20", body: "The delay is over and every queued email has been sent." },
      { status: "investigating", time: "10:05", body: "Receipts and notifications are arriving up to an hour late." },
    ],
  },
  {
    id: "i1",
    title: "Webhook deliveries delayed",
    impact: "major",
    day: "2026-10-09",
    affects: ["Webhooks", "API"],
    updates: [
      { status: "resolved", time: "14:55", body: "Deliveries are caught up. Every event was delivered; none were lost." },
      { status: "identified", time: "14:05", body: "A queue stalled after a deploy. We rolled the deploy back and are replaying the backlog." },
      { status: "investigating", time: "13:42", body: "Webhooks are arriving late. We are investigating." },
    ],
  },
]

const levelMeta: Record<Status1Level, { label: string; icon: typeof CircleCheck; tone: string }> = {
  operational: { label: "Operational", icon: CircleCheck, tone: "text-chart-2" },
  degraded: { label: "Degraded", icon: CircleAlert, tone: "text-amber-600 dark:text-amber-400" },
  outage: { label: "Outage", icon: CircleX, tone: "text-destructive" },
  maintenance: { label: "Maintenance", icon: Wrench, tone: "text-chart-1" },
}
const dayMeta: Record<Status1Day, { label: string; bar: string }> = {
  ok: { label: "No issues", bar: "bg-chart-2" },
  degraded: { label: "Degraded", bar: "bg-amber-400 dark:bg-amber-500" },
  outage: { label: "Outage", bar: "bg-destructive" },
  none: { label: "No data", bar: "bg-muted-foreground/25" },
}
const stepLabel: Record<Status1Update["status"], string> = { investigating: "Investigating", identified: "Identified", monitoring: "Monitoring", resolved: "Resolved", scheduled: "Scheduled" }
const impactLabel = { minor: "Minor", major: "Major", maintenance: "Maintenance" }

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-6">
      <Skeleton className="h-24 rounded-2xl" />
      <div className="rounded-2xl border p-6">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="py-4 first:pt-0 last:pb-0">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-3 h-8 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

function UptimeBar({ item, today, locale }: { item: Status1Component; today: string; locale: string }) {
  const fmt = React.useMemo(() => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }), [locale])
  const [at, setAt] = React.useState<number | null>(null)
  const ref = React.useRef<HTMLDivElement>(null)
  const n = item.days.length
  const dateOf = (i: number) => fmt.format(toT(today) - (n - 1 - i) * DAY)
  const counts = { outage: item.days.filter((d) => d === "outage").length, degraded: item.days.filter((d) => d === "degraded").length }
  const known = item.days.filter((d) => d !== "none").length
  // A day with an outage counts as down; a degraded day counts as half.
  const uptime = known ? (100 * (known - counts.outage - counts.degraded * 0.5)) / known : 100
  const summary = `${uptime.toFixed(2)}% uptime over ${n} days: ${counts.outage} ${counts.outage === 1 ? "day" : "days"} with an outage, ${counts.degraded} degraded`
  const move = (e: React.KeyboardEvent) => {
    const cur = at ?? n - 1
    const next = e.key === "ArrowLeft" ? cur - 1 : e.key === "ArrowRight" ? cur + 1 : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : null
    if (next === null) return
    e.preventDefault()
    setAt(Math.max(0, Math.min(n - 1, next)))
  }
  return (
    <div>
      <div
        ref={ref}
        dir="ltr"
        role="slider"
        tabIndex={0}
        aria-label={`${item.name} history, one bar per day`}
        aria-valuemin={0}
        aria-valuemax={n - 1}
        aria-valuenow={at ?? n - 1}
        aria-valuetext={at === null ? summary : `${dateOf(at)}: ${dayMeta[item.days[at]!].label}`}
        onKeyDown={move}
        onFocus={() => setAt((a) => a ?? n - 1)}
        onBlur={() => setAt(null)}
        onPointerLeave={() => setAt(null)}
        onPointerMove={(e) => {
          const r = ref.current!.getBoundingClientRect()
          setAt(Math.max(0, Math.min(n - 1, Math.floor(((e.clientX - r.left) / r.width) * n))))
        }}
        className="focus-visible:ring-ring/50 relative flex h-9 cursor-crosshair items-stretch gap-[2px] rounded-md outline-none focus-visible:ring-[3px] sm:gap-[3px]"
      >
        {item.days.map((d, i) => (
          <span key={i} aria-hidden="true" className={cn("min-w-0 flex-1 rounded-[2px] transition-[opacity,transform] duration-100 motion-reduce:transition-none", dayMeta[d].bar, at !== null && at !== i && "opacity-60", at === i && "scale-y-110")} />
        ))}
        {at !== null ? (
          <span
            aria-hidden="true"
            className="bg-popover text-popover-foreground pointer-events-none absolute -top-11 z-10 -translate-x-1/2 rounded-md border px-2.5 py-1.5 text-xs whitespace-nowrap shadow-md"
            style={{ left: `clamp(4.5rem, ${((at + 0.5) / n) * 100}%, calc(100% - 4.5rem))` }}
          >
            <span className="font-medium">{dateOf(at)}</span> <span className="text-muted-foreground">· {dayMeta[item.days[at]!].label}</span>
          </span>
        ) : null}
      </div>
      <div aria-hidden="true" dir="ltr" className="text-muted-foreground mt-1.5 flex justify-between text-xs">
        <span>{n} days ago</span>
        <span>{uptime.toFixed(2)}% uptime</span>
        <span>Today</span>
      </div>
      <p className="sr-only">{summary}</p>
    </div>
  )
}

/**
 * A public status page: one banner that says how things are overall, each service with a 90-day history you can scrub with a pointer or
 * the arrow keys, what is happening now as a timeline of updates, the last two weeks of incidents, and a subscribe box. The overall
 * message and every uptime figure are worked out from the data you pass.
 */
function Status1({
  title = "Acme status",
  components = sampleComponents,
  incidents = sampleIncidents,
  today = "2026-10-18",
  updatedAt = "10:42 UTC",
  locale = "en",
  onSubscribe,
  state = "ready",
  onRetry,
  emptyState,
  errorState,
  className,
  ...props
}: Status1Props) {
  const id = React.useId()
  const list = state === "empty" ? [] : components
  const active = incidents.filter((i) => i.updates[0]?.status !== "resolved")
  const level: Status1Level = list.some((c) => c.status === "outage") ? "outage" : list.some((c) => c.status === "degraded") ? "degraded" : list.some((c) => c.status === "maintenance") ? "maintenance" : "operational"
  const overall = {
    operational: { text: "All systems operational", sub: "Everything is running normally.", box: "bg-chart-2/10 border-chart-2/30" },
    degraded: { text: "Some systems are slower than usual", sub: "We know and we are working on it.", box: "bg-amber-500/10 border-amber-500/40" },
    outage: { text: "Some systems are down", sub: "We are working on it right now.", box: "bg-destructive/10 border-destructive/30" },
    maintenance: { text: "Scheduled maintenance in progress", sub: "Some things may pause for a short while.", box: "bg-chart-1/10 border-chart-1/30" },
  }[level]
  const L = levelMeta[level]
  const dayFmt = React.useMemo(() => new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", timeZone: "UTC" }), [locale])

  const [email, setEmail] = React.useState("")
  const [sub, setSub] = React.useState<"idle" | "sending" | "done">("idle")
  const [subError, setSubError] = React.useState<string>()
  async function subscribe(e: React.FormEvent) {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setSubError("Enter an email address like name@company.com.")
    setSubError(undefined)
    setSub("sending")
    try {
      await onSubscribe?.(email.trim())
      setSub("done")
    } catch (err) {
      setSub("idle")
      setSubError(err instanceof Error ? err.message : "We could not subscribe you. Try again.")
    }
  }

  // The last 14 days, newest first, each with its incidents (or the plain statement that there were none).
  const days = Array.from({ length: 14 }, (_, i) => new Date(toT(today) - i * DAY).toISOString().slice(0, 10))
  const past = incidents.filter((i) => i.updates[0]?.status === "resolved")
  // Quiet days that follow each other share one row instead of a wall of "nothing happened".
  const rows: { days: string[]; here: Status1Incident[] }[] = []
  for (const d of days) {
    const here = past.filter((i) => i.day === d)
    const last = rows.at(-1)
    if (!here.length && last && !last.here.length) last.days.push(d)
    else rows.push({ days: [d], here })
  }

  const content = !list.length ? (
    <div className="bg-card rounded-2xl border px-6 py-16 text-center">
      <span aria-hidden="true" className="bg-muted mx-auto flex size-12 items-center justify-center rounded-full">
        <CircleDashed className="size-6" />
      </span>
      <h2 className="mt-5 text-lg font-semibold tracking-tight">{emptyState?.title ?? "No services are listed yet"}</h2>
      <p className="text-muted-foreground mx-auto mt-1.5 max-w-xs text-sm text-pretty">{emptyState?.description ?? "Once services are added, their status and history appear here."}</p>
      {emptyState?.action}
    </div>
  ) : (
    <div className="grid gap-10">
      <div role="status" className={cn("flex items-center gap-4 rounded-2xl border p-5 sm:p-6", overall.box)}>
        <L.icon aria-hidden="true" className={cn("size-8 shrink-0", L.tone)} />
        <div className="min-w-0">
          <p className="text-xl font-semibold tracking-tight text-balance sm:text-2xl">{overall.text}</p>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {overall.sub} Updated {updatedAt}.
          </p>
        </div>
      </div>

      {active.length ? (
        <section aria-labelledby={`${id}-now`}>
          <h2 id={`${id}-now`} className="mb-4 text-lg font-semibold tracking-tight">
            Happening now
          </h2>
          <ul className="grid gap-4">
            {active.map((inc) => (
              <li key={inc.id} className="bg-card rounded-2xl border p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <h3 className="font-semibold tracking-tight">{inc.title}</h3>
                  <span className="bg-muted rounded-full border px-2.5 py-0.5 text-xs font-medium">{impactLabel[inc.impact]}</span>
                  {inc.affects?.length ? <span className="text-muted-foreground text-sm">Affects {inc.affects.join(", ")}</span> : null}
                </div>
                <ol className="mt-5 grid gap-5">
                  {inc.updates.map((u, i) => (
                    <li key={i} className="relative ps-7">
                      <span aria-hidden="true" className={cn("absolute start-0 top-1.5 size-3 rounded-full border-2", i === 0 ? "bg-foreground border-foreground" : "bg-background border-border")} />
                      {i < inc.updates.length - 1 ? <span aria-hidden="true" className="bg-border absolute start-[5px] top-5 -bottom-6 w-px" /> : null}
                      <p className="text-sm">
                        <span className="font-semibold">{stepLabel[u.status]}</span> <span className="text-muted-foreground tabular-nums">· {u.time}</span>
                      </p>
                      <p className="text-muted-foreground mt-1 text-sm text-pretty">{u.body}</p>
                    </li>
                  ))}
                </ol>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby={`${id}-svc`}>
        <h2 id={`${id}-svc`} className="mb-4 text-lg font-semibold tracking-tight">
          Services
        </h2>
        <ul className="bg-card divide-y rounded-2xl border">
          {list.map((c) => {
            const M = levelMeta[c.status]
            return (
              <li key={c.id} className="p-5 sm:p-6">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-medium">{c.name}</h3>
                    {c.description ? <p className="text-muted-foreground mt-0.5 text-sm">{c.description}</p> : null}
                  </div>
                  <p className="flex shrink-0 items-center gap-1.5 text-sm font-medium">
                    <M.icon aria-hidden="true" className={cn("size-4", M.tone)} />
                    {M.label}
                  </p>
                </div>
                <UptimeBar item={c} today={today} locale={locale} />
              </li>
            )
          })}
        </ul>
      </section>

      <section aria-labelledby={`${id}-past`}>
        <h2 id={`${id}-past`} className="mb-4 text-lg font-semibold tracking-tight">
          Past incidents
        </h2>
        <ol className="grid gap-6">
          {rows.map((r) => (
            <li key={r.days[0]} className="grid gap-3 sm:grid-cols-[9rem_minmax(0,1fr)]">
              <h3 className="text-muted-foreground text-sm font-medium tabular-nums">{r.days.length > 1 ? `${dayFmt.format(toT(r.days.at(-1)!))} to ${dayFmt.format(toT(r.days[0]!))}` : dayFmt.format(toT(r.days[0]!))}</h3>
              {r.here.length ? (
                <ul className="grid gap-3">
                  {r.here.map((inc) => (
                    <li key={inc.id} className="bg-card rounded-xl border p-4">
                      <p className="font-medium">{inc.title}</p>
                      <p className="text-muted-foreground mt-1 text-sm text-pretty">{inc.updates[0]?.body}</p>
                      <p className="text-muted-foreground mt-2 text-xs">
                        {impactLabel[inc.impact]}
                        {inc.affects?.length ? ` · ${inc.affects.join(", ")}` : ""} · Resolved {inc.updates[0]?.time}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">No incidents reported.</p>
              )}
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby={`${id}-sub`} className="bg-muted/40 rounded-2xl border p-5 sm:p-6">
        <h2 id={`${id}-sub`} className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <Mail aria-hidden="true" className="size-5" />
          Get told when something changes
        </h2>
        {sub === "done" ? (
          <p role="status" className="mt-3 text-sm">
            Subscribed. We will email {email.trim()} when an incident starts or ends.
          </p>
        ) : (
          <form onSubmit={subscribe} noValidate className="mt-3 flex flex-col gap-2 sm:flex-row">
            <div className="flex-1">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email address" placeholder="name@company.com" autoComplete="email" aria-invalid={!!subError} aria-describedby={subError ? `${id}-err` : undefined} />
              {subError ? (
                <p id={`${id}-err`} role="alert" className="text-destructive mt-1.5 text-sm">
                  {subError}
                </p>
              ) : null}
            </div>
            <Button type="submit" disabled={sub === "sending"} className="sm:self-start">
              {sub === "sending" ? <Loader2 aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : null}
              {sub === "sending" ? "Subscribing" : "Subscribe"}
            </Button>
          </form>
        )}
      </section>
    </div>
  )

  return (
    <section data-slot="status-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16", className)} {...frameProps(props)}>
      <h1 id={`${id}-title`} className="mb-8 text-3xl font-semibold tracking-[-0.03em] text-balance">
        {title}
      </h1>
      <StateView state={state === "loading" || state === "error" ? state : "ready"} onRetry={onRetry} label="Loading system status" loading={<Skel />} error={{ title: errorState?.title ?? "Status could not be loaded", description: errorState?.description ?? "This does not mean something is down. Check your connection and try again.", ...errorState }}>
        {content}
      </StateView>
    </section>
  )
}

export { Status1, type Status1Props, type Status1Component, type Status1Incident, type Status1Update, type Status1Level, type Status1Day }
