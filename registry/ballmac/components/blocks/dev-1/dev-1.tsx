// Ballmac UI: Dev 1. https://ui.ballmac.com/blocks/dev-1
"use client"

import * as React from "react"
import { ChevronRight, CircleAlert, CircleCheck, CircleX, KeyRound, Loader2, Plus, Search, ShieldAlert, TerminalSquare, TriangleAlert } from "lucide-react"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ballmac/alert-dialog"
import { Badge } from "@/components/ballmac/badge"
import { BlurFade } from "@/components/ballmac/blur-fade"
import { Button } from "@/components/ballmac/button"
import { CopyButton } from "@/components/ballmac/copy-button"
import { JsonViewer } from "@/components/ballmac/json-viewer"
import { NumberTicker } from "@/components/ballmac/number-ticker"
import { SegmentedControl, SegmentedControlItem } from "@/components/ballmac/segmented-control"
import { Skeleton } from "@/components/ballmac/skeleton"
import { useReturnFocus } from "@/lib/ballmac/return-focus"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Dev1Scope = "read" | "write" | "admin"
type Dev1Env = "test" | "live"

type Dev1Key = {
  id: string
  name: string
  scope: Dev1Scope
  /** The last four characters, the only part that is ever shown again. */
  last4: string
  /** Already written for people ("12 Mar 2026"). */
  created: string
  /** Already written for people ("2 hours ago"). Leave out for a key that was never used. */
  lastUsed?: string
}

type Dev1Request = {
  id: string
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  path: string
  status: number
  /** Milliseconds. */
  ms: number
  /** Already written for people ("2 min ago"). */
  time: string
  ip?: string
  /** The name of the key the request used. */
  keyName?: string
  response?: unknown
}

type Dev1Usage = {
  /** One entry per day, oldest first. */
  days: { label: string; ok: number; errors: number }[]
  /** Median response time in milliseconds. */
  p50: number
}

type Dev1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    keys?: Dev1Key[]
    requests?: Dev1Request[]
    usage?: Dev1Usage
    /** The environment shown at first. */
    defaultEnv?: Dev1Env
    onEnvChange?: (env: Dev1Env) => void
    /** The address the API lives at, used in the curl commands. */
    baseUrl?: string
    /**
     * Creates a key. Resolve with its id and the full secret, which is shown once; throw to show the reason. Defaults to a
     * simulated key so the page works without a backend.
     */
    onCreateKey?: (input: { name: string; scope: Dev1Scope; env: Dev1Env }) => Promise<{ id: string; secret: string; last4?: string }>
    /** Called after Revoke is confirmed. */
    onRevokeKey?: (id: string) => void | Promise<void>
    /** The id of a request that is open at first. */
    defaultOpenRequest?: string
  }

const sampleKeys: Dev1Key[] = [
  { id: "k1", name: "Production server", scope: "write", last4: "a1b2", created: "12 Mar 2026", lastUsed: "2 hours ago" },
  { id: "k2", name: "Analytics (read only)", scope: "read", last4: "9f3c", created: "2 Jan 2026", lastUsed: "yesterday" },
  { id: "k3", name: "CI deploy", scope: "admin", last4: "77de", created: "30 Oct 2025" },
]

const sampleUsage: Dev1Usage = {
  p50: 84,
  days: [
    ["Oct 4", 3120, 24], ["Oct 5", 3410, 31], ["Oct 6", 3290, 19], ["Oct 7", 2810, 22], ["Oct 8", 2630, 15], ["Oct 9", 3560, 40], ["Oct 10", 4010, 38],
    ["Oct 11", 3890, 29], ["Oct 12", 4210, 61], ["Oct 13", 4090, 34], ["Oct 14", 3320, 25], ["Oct 15", 2980, 17], ["Oct 16", 3870, 28], ["Oct 17", 4380, 52],
  ].map(([label, ok, errors]) => ({ label: label as string, ok: ok as number, errors: errors as number })),
}

const sampleRequests: Dev1Request[] = [
  { id: "req_8f2a91", method: "POST", path: "/v1/charges", status: 201, ms: 142, time: "12 sec ago", ip: "203.0.113.24", keyName: "Production server", response: { id: "ch_3Nf2", amount: 12900, currency: "usd", status: "succeeded" } },
  { id: "req_8f2a90", method: "GET", path: "/v1/customers/cus_91", status: 200, ms: 38, time: "41 sec ago", ip: "203.0.113.24", keyName: "Production server", response: { id: "cus_91", email: "jordan@acme.com", balance: 0 } },
  { id: "req_8f2a8f", method: "POST", path: "/v1/refunds", status: 402, ms: 96, time: "3 min ago", ip: "198.51.100.7", keyName: "Production server", response: { error: { type: "card_error", code: "charge_already_refunded", message: "This charge has already been refunded." } } },
  { id: "req_8f2a8e", method: "GET", path: "/v1/events?limit=50", status: 200, ms: 61, time: "6 min ago", ip: "198.51.100.19", keyName: "Analytics (read only)", response: { data: [], has_more: false } },
  { id: "req_8f2a8d", method: "DELETE", path: "/v1/webhooks/we_12", status: 204, ms: 54, time: "14 min ago", ip: "203.0.113.24", keyName: "Production server" },
  { id: "req_8f2a8c", method: "POST", path: "/v1/charges", status: 500, ms: 2140, time: "22 min ago", ip: "203.0.113.24", keyName: "Production server", response: { error: { type: "api_error", message: "Something went wrong on our side. The request was not processed." } } },
  { id: "req_8f2a8b", method: "GET", path: "/v1/invoices", status: 401, ms: 12, time: "31 min ago", ip: "192.0.2.88", response: { error: { type: "authentication_error", message: "No valid API key was provided." } } },
  { id: "req_8f2a8a", method: "PATCH", path: "/v1/customers/cus_91", status: 200, ms: 77, time: "48 min ago", ip: "203.0.113.24", keyName: "Production server", response: { id: "cus_91", name: "Jordan Lee" } },
]

const methodTone: Record<Dev1Request["method"], string> = {
  GET: "bg-chart-1/20",
  POST: "bg-chart-2/20",
  PUT: "bg-chart-3/25",
  PATCH: "bg-chart-3/25",
  DELETE: "bg-destructive/15",
}
const statusText: Record<number, string> = { 200: "OK", 201: "Created", 204: "No content", 400: "Bad request", 401: "Unauthorized", 402: "Request failed", 403: "Forbidden", 404: "Not found", 429: "Too many requests", 500: "Server error", 502: "Bad gateway" }
const scopeCopy: Record<Dev1Scope, string> = { read: "Can read data. Cannot change anything.", write: "Can read and change data.", admin: "Full access, including keys and webhooks. Keep it out of apps." }

function StatusChip({ status }: { status: number }) {
  const ok = status < 400
  const warn = status >= 400 && status < 500
  const Icon = ok ? CircleCheck : warn ? TriangleAlert : CircleX
  return (
    <span className="inline-flex items-center gap-1.5 text-xs whitespace-nowrap tabular-nums">
      <Icon aria-hidden="true" className={cn("size-3.5", ok ? "text-chart-2" : warn ? "text-chart-3" : "text-destructive")} />
      <span className="font-medium">{status}</span>
      <span className="text-muted-foreground hidden sm:inline">{statusText[status] ?? ""}</span>
    </span>
  )
}

function DevSkeleton() {
  return (
    <div className="grid gap-6" aria-hidden="true">
      <Skeleton className="h-72 rounded-2xl" />
      <Skeleton className="h-64 rounded-2xl" />
      <Skeleton className="h-80 rounded-2xl" />
    </div>
  )
}

function Card({ id, title, description, action, children }: { id: string; title: string; description?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="bg-card rounded-2xl border">
      <header className="flex flex-wrap items-start gap-3 border-b p-5 pb-4">
        <div className="min-w-0 flex-1 basis-64">
          <h2 id={id} className="text-sm font-semibold">
            {title}
          </h2>
          {description ? <p className="text-muted-foreground mt-0.5 text-xs text-pretty">{description}</p> : null}
        </div>
        {action}
      </header>
      {children}
    </section>
  )
}

/**
 * A developers page: how the API is doing (a 14-day chart with errors stacked, success rate, median time), API keys that are shown in
 * full exactly once and revoked behind a confirmation, and a request log with a filter, expandable responses and copy as curl.
 */
function Dev1({
  keys: keysProp = sampleKeys,
  requests = sampleRequests,
  usage = sampleUsage,
  defaultEnv = "test",
  onEnvChange,
  baseUrl = "https://api.acme.com",
  onCreateKey,
  onRevokeKey,
  defaultOpenRequest,
  state = "ready",
  onRetry,
  emptyState,
  errorState,
  className,
  ...props
}: Dev1Props) {
  const id = React.useId()
  const [env, setEnv] = React.useState<Dev1Env>(defaultEnv)
  const [keys, setKeys] = React.useState(keysProp)
  React.useEffect(() => setKeys(keysProp), [keysProp])
  const [creating, setCreating] = React.useState(false)
  const [name, setName] = React.useState("")
  const [scope, setScope] = React.useState<Dev1Scope>("read")
  const [saving, setSaving] = React.useState(false)
  const [createError, setCreateError] = React.useState<string>()
  const [fresh, setFresh] = React.useState<{ name: string; secret: string } | null>(null)
  const [revoke, setRevoke] = React.useState<Dev1Key | null>(null)
  const returnFocus = useReturnFocus(!!revoke)
  const [filter, setFilter] = React.useState<"all" | "errors">("all")
  const [query, setQuery] = React.useState("")
  const [open, setOpen] = React.useState<string | null>(defaultOpenRequest ?? null)
  const [announce, setAnnounce] = React.useState("")
  const made = React.useRef(0)
  const ready = state === "ready" || state === "empty"
  const log = state === "empty" ? [] : requests
  const prefix = env === "live" ? "sk_live_" : "sk_test_"

  const total = usage.days.reduce((s, d) => s + d.ok + d.errors, 0)
  const errors = usage.days.reduce((s, d) => s + d.errors, 0)
  const rate = total ? ((total - errors) / total) * 100 : 100
  const peak = Math.max(1, ...usage.days.map((d) => d.ok + d.errors))
  const busiest = usage.days.reduce((a, d) => (d.ok + d.errors > a.ok + a.errors ? d : a), usage.days[0] ?? { label: "", ok: 0, errors: 0 })

  const q = query.trim().toLowerCase()
  const shown = log.filter((r) => (filter === "all" || r.status >= 400) && (!q || r.path.toLowerCase().includes(q) || r.method.toLowerCase().includes(q) || String(r.status).includes(q)))
  const errorCount = log.filter((r) => r.status >= 400).length
  const curl = (r: Dev1Request) => `curl ${baseUrl}${r.path} \\\n  -X ${r.method} \\\n  -H "Authorization: Bearer $API_KEY"`
  const firstCurl = `curl ${baseUrl}/v1/charges \\\n  -X POST \\\n  -H "Authorization: Bearer $API_KEY" \\\n  -d amount=2000 -d currency=usd`

  async function create(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return setCreateError("Give the key a name so you can recognise it later.")
    setSaving(true)
    setCreateError(undefined)
    try {
      const result: { id: string; secret: string; last4?: string } = onCreateKey
        ? await onCreateKey({ name: name.trim(), scope, env })
        : await new Promise<{ id: string; secret: string }>((r) => {
            made.current += 1
            setTimeout(() => r({ id: `new-${made.current}`, secret: `${prefix}${"x7Kq2MvR9tLpA4dZ8nWcB3yF".slice(0, 20)}${String(made.current).padStart(4, "0")}` }), 700)
          })
      setKeys((l) => [{ id: result.id, name: name.trim(), scope, last4: result.last4 ?? result.secret.slice(-4), created: "Just now" }, ...l])
      setFresh({ name: name.trim(), secret: result.secret })
      setName("")
      setScope("read")
      setCreating(false)
      setAnnounce(`Key ${name.trim()} created. Copy it now.`)
    } catch (err) {
      setCreateError(err instanceof Error && err.message ? err.message : "The key could not be created. Try again.")
    } finally {
      setSaving(false)
    }
  }

  const content = (
    <div className="grid grid-cols-1 gap-6">
      <BlurFade direction="up" offset={10} duration={0.45}>
        <Card id={`${id}-usage`} title="API requests" description="The last 14 days. Errors are stacked in red at the bottom of each bar.">
          <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_14rem]">
            <div>
              <div className="flex items-baseline gap-3">
                <p className="text-4xl font-semibold tracking-tight tabular-nums">
                  <NumberTicker value={total} />
                </p>
                <p className="text-muted-foreground text-sm">requests</p>
              </div>
              <div role="img" aria-label={`${new Intl.NumberFormat("en-US").format(total)} requests in ${usage.days.length} days. The busiest day was ${busiest.label} with ${new Intl.NumberFormat("en-US").format(busiest.ok + busiest.errors)}.`} className="mt-5 flex h-52 items-end gap-1.5 sm:gap-2">
                {usage.days.map((d) => {
                  const all = d.ok + d.errors
                  return (
                    <div key={d.label} className="group/bar relative flex h-full min-w-0 flex-1 flex-col justify-end">
                      <div className="pointer-events-none absolute bottom-full start-1/2 z-10 mb-2 hidden -translate-x-1/2 rounded-lg border bg-popover px-2.5 py-1.5 text-xs whitespace-nowrap shadow-md group-hover/bar:block rtl:translate-x-1/2">
                        <p className="font-medium">{d.label}</p>
                        <p className="text-muted-foreground tabular-nums">
                          {new Intl.NumberFormat("en-US").format(all)} requests · {d.errors} errors
                        </p>
                      </div>
                      <div className="hover:opacity-80 flex flex-col justify-end overflow-hidden rounded-t-md transition-opacity" style={{ height: `${Math.max(4, (all / peak) * 100)}%` }}>
                        <div className="bg-chart-1" style={{ flexGrow: d.ok }} />
                        <div className="bg-destructive min-h-[3px]" style={{ flexGrow: Math.max(d.errors * 6, d.errors ? 0.01 : 0), flexBasis: 0 }} />
                      </div>
                    </div>
                  )
                })}
              </div>
              <div aria-hidden="true" className="text-muted-foreground mt-2 flex justify-between text-[11px] tabular-nums">
                <span>{usage.days[0]?.label}</span>
                <span>{usage.days[usage.days.length - 1]?.label}</span>
              </div>
              <div className="sr-only">
<table>
                <caption>Requests per day</caption>
                <thead>
                  <tr>
                    <th scope="col">Day</th>
                    <th scope="col">Successful</th>
                    <th scope="col">Errors</th>
                  </tr>
                </thead>
                <tbody>
                  {usage.days.map((d) => (
                    <tr key={d.label}>
                      <th scope="row">{d.label}</th>
                      <td>{d.ok}</td>
                      <td>{d.errors}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
</div>
            </div>
            <dl className="grid content-start gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {[
                { label: "Success rate", value: `${rate.toFixed(1)}%`, hint: rate >= 99 ? "Healthy" : "Worth a look" },
                { label: "Median time", value: `${usage.p50} ms`, hint: "p50" },
                { label: "Errors", value: new Intl.NumberFormat("en-US").format(errors), hint: "Last 14 days" },
              ].map((s) => (
                <div key={s.label} className="bg-muted/50 rounded-xl p-4">
                  <dt className="text-muted-foreground text-xs">{s.label}</dt>
                  <dd className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">{s.value}</dd>
                  <dd className="text-muted-foreground mt-0.5 text-xs">{s.hint}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Card>
      </BlurFade>

      <BlurFade direction="up" offset={10} duration={0.45} delay={0.08}>
        <Card
          id={`${id}-keys`}
          title="API keys"
          description={`Keys for ${env === "live" ? "live" : "test"} mode. A key is shown in full once, when you create it.`}
          action={
            !creating ? (
              <Button size="sm" onClick={() => setCreating(true)}>
                <Plus aria-hidden="true" />
                Create key
              </Button>
            ) : null
          }
        >
          {fresh ? (
            <div role="alert" className="bg-chart-3/10 border-chart-3/30 m-5 mb-0 rounded-xl border p-4">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <ShieldAlert aria-hidden="true" className="size-4" />
                Copy “{fresh.name}” now
              </p>
              <p className="text-muted-foreground mt-1 text-xs text-pretty">This is the only time the full key is shown. Store it somewhere safe; if you lose it, create a new one.</p>
              <div className="bg-background mt-3 flex items-center gap-2 rounded-lg border p-1.5 ps-3">
                <code dir="ltr" className="min-w-0 flex-1 truncate text-start font-mono text-[13px]">
                  {fresh.secret}
                </code>
                <CopyButton value={fresh.secret} label="Copy" copiedLabel="Copied" variant="outline" size="sm" />
              </div>
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => setFresh(null)}>
                I have saved it
              </Button>
            </div>
          ) : null}
          {creating ? (
            <form onSubmit={create} className="m-5 mb-0 grid gap-4 rounded-xl border p-4" noValidate>
              <div className="grid gap-1.5">
                <label htmlFor={`${id}-name`} className="text-sm font-medium">
                  Name
                </label>
                <input
                  id={`${id}-name`}
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Production server"
                  aria-invalid={!!createError || undefined}
                  aria-describedby={createError ? `${id}-name-error` : undefined}
                  className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive h-9 rounded-md border px-3 text-sm outline-none focus-visible:ring-[3px]"
                />
                {createError ? (
                  <p id={`${id}-name-error`} role="alert" className="text-destructive text-xs">
                    {createError}
                  </p>
                ) : null}
              </div>
              <div className="grid gap-1.5">
                <span id={`${id}-scope`} className="text-sm font-medium">
                  Access
                </span>
                <SegmentedControl value={scope} onValueChange={(v) => setScope(v as Dev1Scope)} aria-labelledby={`${id}-scope`} size="sm">
                  <SegmentedControlItem value="read">Read</SegmentedControlItem>
                  <SegmentedControlItem value="write">Write</SegmentedControlItem>
                  <SegmentedControlItem value="admin">Admin</SegmentedControlItem>
                </SegmentedControl>
                <p className="text-muted-foreground text-xs">{scopeCopy[scope]}</p>
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={saving}>
                  {saving ? <Loader2 aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : <KeyRound aria-hidden="true" />}
                  {saving ? "Creating…" : "Create key"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={saving}
                  onClick={() => {
                    setCreating(false)
                    setCreateError(undefined)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : null}
          <ul aria-label="API keys" className="divide-y p-2">
            {keys.map((k) => (
              <li key={k.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-3 py-3.5">
                <span aria-hidden="true" className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-lg [&_svg]:size-4">
                  <KeyRound />
                </span>
                <div className="min-w-0 flex-1 basis-52">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                    {k.name}
                    <Badge variant="outline" status={k.scope === "admin" ? "warning" : undefined} dot={false} className="font-normal capitalize">
                      {k.scope}
                    </Badge>
                  </p>
                  <p dir="ltr" className="text-muted-foreground mt-0.5 text-start font-mono text-xs">
                    {prefix}••••••••{k.last4}
                  </p>
                </div>
                <p className="text-muted-foreground text-xs tabular-nums">
                  Created {k.created} · {k.lastUsed ? `used ${k.lastUsed}` : "never used"}
                </p>
                <Button variant="outline" size="sm" onClick={() => setRevoke(k)} aria-label={`Revoke ${k.name}`}>
                  Revoke
                </Button>
              </li>
            ))}
            {!keys.length ? <li className="text-muted-foreground px-3 py-8 text-center text-sm">No keys yet. Create one to make your first request.</li> : null}
          </ul>
        </Card>
      </BlurFade>

      <BlurFade direction="up" offset={10} duration={0.45} delay={0.16}>
        <Card
          id={`${id}-log`}
          title="Recent requests"
          description="Newest first. Open one to see the response, or copy it as a curl command."
          action={
            log.length ? (
              <div className="flex flex-wrap items-center gap-2">
                <div className="bg-background focus-within:ring-ring/50 flex h-8 items-center gap-2 rounded-md border px-2 focus-within:ring-[3px]">
                  <Search aria-hidden="true" className="text-muted-foreground size-3.5" />
                  <input type="search" aria-label="Filter requests" placeholder="Filter" value={query} onChange={(e) => setQuery(e.target.value)} className="placeholder:text-muted-foreground w-24 bg-transparent text-xs outline-none sm:w-32" />
                </div>
                <SegmentedControl value={filter} onValueChange={(v) => setFilter(v as typeof filter)} aria-label="Show" size="sm">
                  <SegmentedControlItem value="all">All</SegmentedControlItem>
                  <SegmentedControlItem value="errors">Errors {errorCount}</SegmentedControlItem>
                </SegmentedControl>
              </div>
            ) : null
          }
        >
          {log.length ? (
            <ul aria-label="Requests" className="divide-y">
              {shown.map((r) => {
                const isOpen = open === r.id
                return (
                  <li key={r.id}>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`${id}-${r.id}`}
                      onClick={() => setOpen(isOpen ? null : r.id)}
                      className="hover:bg-accent/40 focus-visible:ring-ring/50 grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-5 py-3 text-start outline-none focus-visible:ring-[3px] focus-visible:ring-inset md:grid-cols-[4.5rem_minmax(0,1fr)_9rem_4.5rem_6rem_auto]"
                    >
                      <span className={cn("rounded px-1.5 py-0.5 text-center font-mono text-[11px] font-semibold", methodTone[r.method])}>{r.method}</span>
                      <span dir="ltr" className="min-w-0 truncate text-start font-mono text-[13px]">
                        {r.path}
                      </span>
                      <span className="max-md:order-last max-md:col-span-2 max-md:col-start-2">
                        <StatusChip status={r.status} />
                      </span>
                      <span className="text-muted-foreground hidden text-end text-xs tabular-nums md:block">{r.ms} ms</span>
                      <span className="text-muted-foreground hidden text-end text-xs md:block">{r.time}</span>
                      <ChevronRight aria-hidden="true" className={cn("text-muted-foreground size-4 transition-transform duration-150 motion-reduce:transition-none", isOpen ? "rotate-90" : "rtl:rotate-180")} />
                    </button>
                    {isOpen ? (
                      <div id={`${id}-${r.id}`} className="bg-muted/30 grid gap-4 border-t px-5 py-4 lg:grid-cols-[14rem_minmax(0,1fr)]">
                        <div className="grid content-start gap-3">
                          <dl className="grid gap-2 text-xs">
                            {[
                              ["Request ID", r.id],
                              ["Took", `${r.ms} ms`],
                              ["When", r.time],
                              ...(r.keyName ? [["Key", r.keyName]] : []),
                              ...(r.ip ? [["IP address", r.ip]] : []),
                            ].map(([k, v]) => (
                              <div key={k} className="flex justify-between gap-3">
                                <dt className="text-muted-foreground">{k}</dt>
                                <dd dir="ltr" className="min-w-0 truncate text-end font-mono">
                                  {v}
                                </dd>
                              </div>
                            ))}
                          </dl>
                          <CopyButton value={curl(r)} label="Copy as curl" copiedLabel="Copied" variant="outline" size="sm" className="justify-self-start" />
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1.5 text-xs font-medium">Response</p>
                          {r.response !== undefined ? <JsonViewer value={r.response} label="Response body" defaultExpandedDepth={2} /> : <p className="text-muted-foreground text-xs">No body. The server answered {r.status} {statusText[r.status] ?? ""}.</p>}
                        </div>
                      </div>
                    ) : null}
                  </li>
                )
              })}
              {!shown.length ? <li className="text-muted-foreground px-5 py-10 text-center text-sm">No requests match.</li> : null}
            </ul>
          ) : (
            <div className="px-6 py-12 text-center">
              <span aria-hidden="true" className="bg-muted mx-auto flex size-12 items-center justify-center rounded-full">
                <TerminalSquare className="size-6" />
              </span>
              <h3 className="mt-4 text-base font-semibold tracking-tight">{emptyState?.title ?? "No requests yet"}</h3>
              <p className="text-muted-foreground mx-auto mt-1.5 max-w-sm text-sm text-pretty">{emptyState?.description ?? "Make your first request with a test key and it will appear here within a few seconds."}</p>
              <div className="bg-background mx-auto mt-5 w-full max-w-lg min-w-0 rounded-xl border text-start">
                <pre dir="ltr" className="overflow-x-auto p-4 font-mono text-xs leading-relaxed">
                  {firstCurl}
                </pre>
                <div className="flex justify-end border-t p-2">
                  <CopyButton value={firstCurl} label="Copy" copiedLabel="Copied" variant="ghost" size="sm" />
                </div>
              </div>
              {emptyState?.action}
            </div>
          )}
        </Card>
      </BlurFade>
    </div>
  )

  return (
    <section data-slot="dev-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-5xl px-4 py-8 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-8 flex flex-wrap items-center gap-4">
        <div className="min-w-0 flex-1 basis-64">
          <h1 id={`${id}-title`} className="text-3xl font-semibold tracking-[-0.035em]">
            Developers
          </h1>
          <p className="text-muted-foreground mt-2 text-sm text-pretty">Keys, usage and a log of what your code sent.</p>
        </div>
        <SegmentedControl
          value={env}
          onValueChange={(v) => {
            setEnv(v as Dev1Env)
            onEnvChange?.(v as Dev1Env)
          }}
          aria-label="Mode"
          disabled={!ready}
        >
          <SegmentedControlItem value="test">Test mode</SegmentedControlItem>
          <SegmentedControlItem value="live">
            <span aria-hidden="true" className="bg-chart-2 me-1.5 inline-block size-1.5 rounded-full" />
            Live mode
          </SegmentedControlItem>
        </SegmentedControl>
      </header>
      {env === "live" && ready ? (
        <p role="note" className="bg-chart-3/10 border-chart-3/30 mb-6 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm text-pretty">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          You are looking at live mode. Requests with these keys change real customer data.
        </p>
      ) : null}
      <StateView state={state === "loading" || state === "error" ? state : "ready"} onRetry={onRetry} label="Loading developer data" loading={<DevSkeleton />} error={{ title: errorState?.title ?? "Developer data could not be loaded", description: errorState?.description ?? "Your keys are safe and nothing changed. Check your connection and try again.", ...errorState }}>
        {content}
      </StateView>

      <AlertDialog open={!!revoke} onOpenChange={(o) => !o && setRevoke(null)}>
        <AlertDialogContent {...returnFocus}>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke “{revoke?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>Anything using this key stops working straight away. This cannot be undone, but you can create a new key.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!revoke) return
                await onRevokeKey?.(revoke.id)
                setKeys((l) => l.filter((x) => x.id !== revoke.id))
                setAnnounce(`${revoke.name} revoked`)
              }}
            >
              Revoke key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <p aria-live="polite" className="sr-only">
        {announce}
      </p>
    </section>
  )
}

export { Dev1, type Dev1Props, type Dev1Key, type Dev1Request, type Dev1Usage, type Dev1Scope, type Dev1Env }
