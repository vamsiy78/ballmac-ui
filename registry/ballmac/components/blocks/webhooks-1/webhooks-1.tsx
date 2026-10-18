// Ballmac UI: Webhooks 1. https://ui.ballmac.com/blocks/webhooks-1
"use client"

import * as React from "react"
import { CircleAlert, CircleCheck, CirclePause, Eye, EyeOff, Loader2, Plus, RotateCw, Webhook } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { Checkbox } from "@/components/ballmac/checkbox"
import { CopyButton } from "@/components/ballmac/copy-button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ballmac/dialog"
import { Input } from "@/components/ballmac/input"
import { JsonViewer } from "@/components/ballmac/json-viewer"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { Switch } from "@/components/ballmac/switch"
import { useReturnFocus } from "@/lib/ballmac/return-focus"
import { cn } from "@/lib/utils"

type Webhooks1Delivery = {
  id: string
  event: string
  /** HTTP status the endpoint answered with, or 0 when it did not answer. */
  status: number
  /** Milliseconds. */
  ms: number
  /** "Today, 10:42", already written for people. */
  time: string
  attempt: number
  payload: unknown
  response?: string
}

type Webhooks1Endpoint = {
  id: string
  url: string
  enabled: boolean
  events: string[]
  secret: string
  deliveries: Webhooks1Delivery[]
}

type Webhooks1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    endpoints?: Webhooks1Endpoint[]
    /** Every event an endpoint can subscribe to. */
    availableEvents?: string[]
    title?: string
    onCreate?: (input: { url: string; events: string[] }) => void | Promise<void>
    onToggle?: (endpoint: Webhooks1Endpoint, enabled: boolean) => void
    /** Called to send a delivery again. Return a promise; reject to show the failure. */
    onResend?: (endpoint: Webhooks1Endpoint, delivery: Webhooks1Delivery) => void | Promise<void>
    defaultSelectedId?: string
    /** The delivery shown open at first. */
    defaultOpenDeliveryId?: string
  }

const events = ["order.created", "order.paid", "order.refunded", "customer.created", "invoice.overdue", "subscription.cancelled"]

const ok = (status: number) => status >= 200 && status < 300
const mkDeliveries = (list: [string, number, number, string, number][]): Webhooks1Delivery[] =>
  list.map(([event, status, ms, time, attempt], i) => ({
    id: `d${i}${event}${status}`,
    event,
    status,
    ms,
    time,
    attempt,
    payload: { id: `evt_${1000 + i}`, type: event, created: 1760780000 + i * 600, data: { object: { id: `ord_${5200 + i}`, amount: 14400 + i * 250, currency: "usd", customer: "cus_Nf3x" } } },
    response: status === 0 ? "No response: the connection timed out after 10 s" : ok(status) ? '{"received":true}' : status === 500 ? "Internal Server Error" : "Not Found",
  }))

const sample: Webhooks1Endpoint[] = [
  {
    id: "w1", url: "https://api.northwind.com/hooks/acme", enabled: true, events: ["order.created", "order.paid", "order.refunded"], secret: "whsec_8f3a1c2b9d4e7f60a5b1c3d2e4f6a7b8",
    deliveries: mkDeliveries([["order.paid", 200, 142, "Today, 10:41", 1], ["order.created", 200, 118, "Today, 10:38", 1], ["order.paid", 500, 2310, "Today, 10:02", 3], ["order.paid", 500, 2188, "Today, 09:58", 2], ["order.created", 200, 131, "Today, 09:40", 1], ["order.refunded", 200, 156, "Yesterday, 17:12", 1]]),
  },
  {
    id: "w2", url: "https://hooks.slack-relay.io/T0482/B9921", enabled: true, events: ["customer.created", "subscription.cancelled"], secret: "whsec_c1a29b8d7e6f5a4b3c2d1e0f9a8b7c6d",
    deliveries: mkDeliveries([["customer.created", 404, 88, "Today, 10:20", 5], ["customer.created", 404, 91, "Today, 10:15", 4], ["subscription.cancelled", 0, 10000, "Today, 08:31", 5], ["customer.created", 404, 85, "Yesterday, 22:02", 5]]),
  },
  {
    id: "w3", url: "https://staging.acme-test.dev/webhooks", enabled: false, events: ["invoice.overdue"], secret: "whsec_77aa11bb22cc33dd44ee55ff66aa77bb",
    deliveries: mkDeliveries([["invoice.overdue", 200, 201, "3 days ago", 1]]),
  },
]

const health = (e: Webhooks1Endpoint) => {
  if (!e.enabled) return { id: "off" as const, label: "Disabled", icon: CirclePause, rate: null }
  const last = e.deliveries.slice(0, 10)
  const rate = last.length ? Math.round((100 * last.filter((d) => ok(d.status)).length) / last.length) : 100
  return rate >= 90 ? { id: "ok" as const, label: "Healthy", icon: CircleCheck, rate } : rate >= 50 ? { id: "warn" as const, label: "Some failing", icon: CircleAlert, rate } : { id: "bad" as const, label: "Failing", icon: CircleAlert, rate }
}
const tone = { ok: "text-chart-2", warn: "text-amber-600 dark:text-amber-400", bad: "text-destructive", off: "text-muted-foreground" }

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <div className="grid gap-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-[28rem] rounded-2xl" />
    </div>
  )
}

/**
 * A webhooks manager: your endpoints with how healthy each is (worked out from its last ten deliveries), and for the chosen one its signing secret,
 * the events it listens to and a log of deliveries with status codes, timing and attempts. Open a delivery to see the payload and what the endpoint
 * answered, and send it again. Adding an endpoint checks the address is a secure URL and that at least one event is chosen.
 */
function Webhooks1({
  endpoints: endpointsProp = sample,
  availableEvents = events,
  title = "Webhooks",
  onCreate,
  onToggle,
  onResend,
  defaultSelectedId,
  defaultOpenDeliveryId,
  state = "ready",
  onRetry,
  emptyState,
  errorState,
  className,
  ...props
}: Webhooks1Props) {
  const id = React.useId()
  const [eps, setEps] = React.useState<Webhooks1Endpoint[]>(endpointsProp)
  React.useEffect(() => setEps(endpointsProp), [endpointsProp])
  const list = state === "empty" ? [] : eps
  const [selectedId, setSelectedId] = React.useState(defaultSelectedId ?? list[0]?.id)
  const [onlyFailed, setOnlyFailed] = React.useState(false)
  const [openId, setOpenId] = React.useState<string | null>(defaultOpenDeliveryId ?? null)
  const [reveal, setReveal] = React.useState(false)
  const [resending, setResending] = React.useState<string | null>(null)
  const [resendMsg, setResendMsg] = React.useState<{ id: string; ok: boolean; text: string } | null>(null)
  const [adding, setAdding] = React.useState(false)
  const [url, setUrl] = React.useState("")
  const [picked, setPicked] = React.useState<string[]>([])
  const [formError, setFormError] = React.useState<string>()
  const [saving, setSaving] = React.useState(false)
  const ret = useReturnFocus(adding)
  const sel = list.find((e) => e.id === selectedId) ?? list[0]
  const h = sel ? health(sel) : null
  const shown = sel ? sel.deliveries.filter((d) => !onlyFailed || !ok(d.status)) : []

  async function create(e: React.FormEvent) {
    e.preventDefault()
    if (!/^https:\/\/[^\s/]+\.[^\s/]+/.test(url.trim())) return setFormError("Enter a secure address that starts with https://, like https://example.com/hooks.")
    if (!picked.length) return setFormError("Choose at least one event to send.")
    setFormError(undefined)
    setSaving(true)
    try {
      await onCreate?.({ url: url.trim(), events: picked })
      const ep: Webhooks1Endpoint = { id: `w${Date.now()}`, url: url.trim(), enabled: true, events: picked, secret: `whsec_${Math.abs([...url].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7)).toString(16).padStart(32, "a")}`, deliveries: [] }
      setEps((x) => [ep, ...x])
      setSelectedId(ep.id)
      setAdding(false)
      setUrl("")
      setPicked([])
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "We could not add the endpoint. Nothing was changed.")
    } finally {
      setSaving(false)
    }
  }
  async function resend(d: Webhooks1Delivery) {
    if (!sel) return
    setResending(d.id)
    setResendMsg(null)
    try {
      await onResend?.(sel, d)
      setResendMsg({ id: d.id, ok: true, text: "Sent again. Check the log for the new attempt." })
    } catch (err) {
      setResendMsg({ id: d.id, ok: false, text: err instanceof Error ? err.message : "It could not be sent. Try again." })
    } finally {
      setResending(null)
    }
  }

  const content = !list.length ? (
    <div className="bg-card rounded-2xl border px-6 py-16 text-center">
      <span aria-hidden="true" className="bg-muted mx-auto flex size-12 items-center justify-center rounded-full">
        <Webhook className="size-6" />
      </span>
      <h2 className="mt-5 text-lg font-semibold tracking-tight">{emptyState?.title ?? "No endpoints yet"}</h2>
      <p className="text-muted-foreground mx-auto mt-1.5 max-w-sm text-sm text-pretty">{emptyState?.description ?? "Add an address and we will send it a signed message every time something happens."}</p>
      {emptyState?.action ?? (
        <Button className="mt-5" onClick={() => setAdding(true)}>
          <Plus aria-hidden="true" />
          Add an endpoint
        </Button>
      )}
    </div>
  ) : (
    <div className="grid items-start gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <ul aria-label="Endpoints" className="grid gap-2.5">
        {list.map((e) => {
          const hh = health(e)
          const on = e.id === sel?.id
          return (
            <li key={e.id}>
              <button type="button" aria-pressed={on} onClick={() => { setSelectedId(e.id); setOpenId(null); setReveal(false) }} className={cn("bg-card focus-visible:ring-ring/50 hover:border-foreground/30 w-full rounded-2xl border p-4 text-start outline-none transition-colors focus-visible:ring-[3px] motion-reduce:transition-none", on && "border-foreground ring-foreground ring-1")}>
                <span className="block truncate font-mono text-sm font-medium" dir="ltr">
                  {e.url.replace(/^https:\/\//, "")}
                </span>
                <span className="mt-2 flex items-center gap-2 text-sm">
                  <hh.icon aria-hidden="true" className={cn("size-4", tone[hh.id])} />
                  <span className="font-medium">{hh.label}</span>
                  {hh.rate !== null ? <span className="text-muted-foreground tabular-nums">· {hh.rate}% of the last {Math.min(10, e.deliveries.length) || 0}</span> : null}
                </span>
                <span className="text-muted-foreground mt-1 block text-xs">{e.events.length} {e.events.length === 1 ? "event" : "events"}</span>
              </button>
            </li>
          )
        })}
      </ul>

      {sel && h ? (
        <div className="min-w-0 grid grid-cols-1 gap-5">
          <div className="bg-card rounded-2xl border p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="truncate font-mono text-base font-semibold" dir="ltr">
                  {sel.url}
                </h2>
                <p className="mt-1.5 flex items-center gap-2 text-sm">
                  <h.icon aria-hidden="true" className={cn("size-4", tone[h.id])} />
                  {h.label}
                </p>
              </div>
              <label className="flex items-center gap-2.5 text-sm font-medium">
                {sel.enabled ? "Enabled" : "Disabled"}
                <Switch checked={sel.enabled} onCheckedChange={(v) => { setEps((x) => x.map((e) => (e.id === sel.id ? { ...e, enabled: v } : e))); onToggle?.(sel, v) }} aria-label={`Send events to ${sel.url}`} />
              </label>
            </div>
            <div className="mt-5">
              <p id={`${id}-secret`} className="text-muted-foreground mb-1.5 text-xs font-medium">
                Signing secret
              </p>
              <div className="flex items-center gap-2 rounded-xl border p-1.5 ps-4">
                <p aria-labelledby={`${id}-secret`} className="min-w-0 flex-1 truncate font-mono text-sm" dir="ltr">
                  {reveal ? sel.secret : `${sel.secret.slice(0, 6)}${"•".repeat(20)}`}
                </p>
                <Button variant="ghost" size="icon" aria-label={reveal ? "Hide the secret" : "Show the secret"} aria-pressed={reveal} onClick={() => setReveal(!reveal)}>
                  {reveal ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                </Button>
                <CopyButton value={sel.secret} label="Copy" copiedLabel="Copied" variant="outline" />
              </div>
            </div>
            <ul aria-label="Events" className="mt-5 flex flex-wrap gap-2">
              {sel.events.map((ev) => (
                <li key={ev} className="bg-muted rounded-full px-3 py-1 font-mono text-xs" dir="ltr">
                  {ev}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-card min-w-0 rounded-2xl border">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3.5">
              <h3 className="font-semibold tracking-tight">Recent deliveries</h3>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input type="checkbox" checked={onlyFailed} onChange={(e) => setOnlyFailed(e.target.checked)} className="accent-foreground size-4" />
                Failed only
              </label>
            </div>
            {shown.length ? (
              <ul className="divide-y">
                {shown.map((d) => {
                  const good = ok(d.status)
                  const open = openId === d.id
                  return (
                    <li key={d.id}>
                      <button type="button" aria-expanded={open} onClick={() => { setOpenId(open ? null : d.id); setResendMsg(null) }} className="hover:bg-accent/40 focus-visible:ring-ring/50 grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-5 py-3 text-start outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-inset motion-reduce:transition-none">
                        <span className={cn("inline-flex min-w-14 items-center justify-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold tabular-nums", good ? "bg-chart-2/10 border-chart-2/30" : "bg-destructive/10 border-destructive/30")}>
                          {good ? <CircleCheck aria-hidden="true" className="size-3" /> : <CircleAlert aria-hidden="true" className="size-3" />}
                          {d.status || "No reply"}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-mono text-sm" dir="ltr">
                            {d.event}
                          </span>
                          <span className="text-muted-foreground block text-xs tabular-nums">
                            {d.time} · {d.ms >= 1000 ? `${(d.ms / 1000).toFixed(1)} s` : `${d.ms} ms`}
                            {d.attempt > 1 ? ` · attempt ${d.attempt}` : ""}
                          </span>
                        </span>
                        <span aria-hidden="true" className="text-muted-foreground text-xs">
                          {open ? "Hide" : "Details"}
                        </span>
                      </button>
                      {open ? (
                        <div className="bg-muted/30 border-t px-5 py-4">
                          <div className="grid gap-4 lg:grid-cols-2">
                            <div className="min-w-0">
                              <p className="text-muted-foreground mb-2 text-xs font-medium">Payload we sent</p>
                              <JsonViewer value={d.payload} label={`Payload of ${d.event}`} defaultExpandedDepth={2} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-muted-foreground mb-2 text-xs font-medium">What your endpoint answered</p>
                              <p className="bg-background rounded-lg border p-3 font-mono text-xs break-words" dir="ltr">
                                {d.response ?? "Nothing recorded"}
                              </p>
                              <Button variant="outline" size="sm" className="mt-3" disabled={resending === d.id} onClick={() => void resend(d)}>
                                {resending === d.id ? <Loader2 aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : <RotateCw aria-hidden="true" />}
                                {resending === d.id ? "Sending" : "Send again"}
                              </Button>
                              {resendMsg?.id === d.id ? (
                                <p role={resendMsg.ok ? "status" : "alert"} className="mt-3 text-sm">
                                  {resendMsg.text}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="text-muted-foreground px-5 py-10 text-center text-sm">{onlyFailed ? "No failed deliveries. Everything arrived." : "Nothing has been sent to this endpoint yet."}</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )

  return (
    <section data-slot="webhooks-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-6xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 id={`${id}-title`} className="text-3xl font-semibold tracking-[-0.035em] text-balance">
            {title}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-xl text-pretty">Send a signed message to your own system whenever something happens here.</p>
        </div>
        {state === "ready" && list.length ? (
          <Button onClick={() => setAdding(true)}>
            <Plus aria-hidden="true" />
            Add endpoint
          </Button>
        ) : null}
      </header>
      <StateView state={state === "loading" || state === "error" ? state : "ready"} onRetry={onRetry} label="Loading webhooks" loading={<Skel />} error={{ title: errorState?.title ?? "Webhooks could not be loaded", description: errorState?.description ?? "Nothing was changed. Check your connection and try again.", ...errorState }}>
        {content}
      </StateView>

      <Dialog open={adding} onOpenChange={(o) => { if (!saving) { setAdding(o); if (!o) setFormError(undefined) } }}>
        <DialogContent {...ret}>
          <form onSubmit={create} noValidate>
            <DialogHeader>
              <DialogTitle>Add an endpoint</DialogTitle>
              <DialogDescription>We will send a signed POST request to this address for each event you choose.</DialogDescription>
            </DialogHeader>
            <div className="mt-5 grid gap-5">
              <div>
                <label htmlFor={`${id}-url`} className="mb-1.5 block text-sm font-medium">
                  Endpoint address
                </label>
                <Input id={`${id}-url`} dir="ltr" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/hooks" aria-invalid={!!formError && !/^https:\/\//.test(url)} autoComplete="off" />
              </div>
              <fieldset>
                <legend className="mb-2 text-sm font-medium">Events to send</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {availableEvents.map((ev) => (
                    <label key={ev} className="hover:bg-accent/40 flex cursor-pointer items-center gap-2.5 rounded-lg border p-2.5 text-sm">
                      <Checkbox checked={picked.includes(ev)} onCheckedChange={(v) => setPicked((p) => (v === true ? [...p, ev] : p.filter((x) => x !== ev)))} />
                      <span className="font-mono text-xs" dir="ltr">
                        {ev}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
              {formError ? (
                <p role="alert" className="text-destructive text-sm">
                  {formError}
                </p>
              ) : null}
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="ghost" onClick={() => setAdding(false)} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : null}
                {saving ? "Adding" : "Add endpoint"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  )
}

export { Webhooks1, type Webhooks1Props, type Webhooks1Endpoint, type Webhooks1Delivery }
