// Ballmac UI: CRM 1. https://ui.ballmac.com/blocks/crm-1
"use client"

import * as React from "react"
import { CalendarClock, Check, CircleAlert, Loader2, Mail, MapPin, MessageSquareText, Phone, StickyNote, Users, UserX } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { CoverArt } from "@/components/ballmac/cover-art"
import { Input } from "@/components/ballmac/input"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { Textarea } from "@/components/ballmac/textarea"
import { cn } from "@/lib/utils"

type Crm1Kind = "note" | "call" | "email" | "meeting"
type Crm1Activity = { id: string; kind: Crm1Kind; /** ISO date. */ date: string; by: string; summary: string }

type Crm1Contact = {
  id: string
  name: string
  title: string
  company: string
  email: string
  phone?: string
  location?: string
  owner: string
  /** Index into stages. */
  stage: number
  /** Deal value in the currency. */
  value: number
  tags?: string[]
  /** ISO date by which to follow up. */
  followUp?: string
  activities: Crm1Activity[]
}

type Crm1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    contact?: Crm1Contact
    stages?: string[]
    /** An ISO date for "today". The block never reads the clock. */
    today?: string
    currency?: string
    locale?: string
    /** Called to log a note, call, email or meeting. Return a promise; reject and it stays in the list with Retry. */
    onLog?: (activity: { kind: Crm1Kind; summary: string; date: string }) => void | Promise<void>
    onStageChange?: (stage: number) => void
    onFollowUp?: (date: string) => void
  }

const sample: Crm1Contact = {
  id: "c1", name: "Elena Marsh", title: "VP Operations", company: "Northwind Logistics", email: "elena@northwind.com", phone: "+1 212 555 0148", location: "New York", owner: "Sam Okafor", stage: 2, value: 48000, tags: ["Enterprise", "Warm", "Referral"], followUp: "2026-10-16",
  activities: [
    { id: "a1", kind: "meeting", date: "2026-10-09", by: "Sam Okafor", summary: "Demo for the operations team. Elena asked about approvals and SSO; two of her leads joined and liked the timeline view." },
    { id: "a2", kind: "email", date: "2026-10-06", by: "Sam Okafor", summary: "Sent the proposal and the security questionnaire." },
    { id: "a3", kind: "call", date: "2026-09-29", by: "Sam Okafor", summary: "Thirty minute call. Budget confirmed for this quarter; decision by the end of October." },
    { id: "a4", kind: "note", date: "2026-09-21", by: "Mia Laurent", summary: "Met at the logistics summit. Interested in replacing three spreadsheets. Introduced by Kofi." },
  ],
}

const stageList = ["Lead", "Qualified", "Proposal", "Negotiation", "Won"]
const kindMeta: Record<Crm1Kind, { label: string; icon: typeof Mail }> = {
  note: { label: "Note", icon: StickyNote },
  call: { label: "Call", icon: Phone },
  email: { label: "Email", icon: Mail },
  meeting: { label: "Meeting", icon: Users },
}
const DAY = 86_400_000
const toT = (iso: string) => Date.parse(`${iso}T00:00:00Z`)

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="grid gap-4">
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  )
}

/**
 * A contact record for a sales team: who they are, where the deal stands on a pipeline you can move, the value, when you last spoke and whether a
 * follow-up is overdue (worked out from the day you pass), and a timeline of notes, calls, emails and meetings with a form to log the next one.
 * A logged item appears at once and, if saving fails, stays in the list with Not saved and Retry.
 */
function Crm1({ contact = sample, stages = stageList, today = "2026-10-18", currency = "USD", locale = "en", onLog, onStageChange, onFollowUp, state = "ready", onRetry, emptyState, errorState, className, ...props }: Crm1Props) {
  const id = React.useId()
  const [stage, setStage] = React.useState(contact.stage)
  const [followUp, setFollowUp] = React.useState(contact.followUp)
  const [acts, setActs] = React.useState<(Crm1Activity & { pending?: boolean; failed?: boolean })[]>(contact.activities)
  const [kind, setKind] = React.useState<Crm1Kind>("note")
  const [text, setText] = React.useState("")
  const [date, setDate] = React.useState(today)
  const empty = state === "empty"
  const money = new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 })
  const dateFmt = React.useMemo(() => new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }), [locale])

  const ago = (d: string) => {
    const n = Math.round((toT(today) - toT(d)) / DAY)
    return n <= 0 ? "today" : n === 1 ? "yesterday" : n < 14 ? `${n} days ago` : `${Math.round(n / 7)} weeks ago`
  }
  const last = [...acts].sort((a, b) => b.date.localeCompare(a.date))[0]
  const late = followUp ? Math.round((toT(today) - toT(followUp)) / DAY) : null
  const sorted = [...acts].sort((a, b) => b.date.localeCompare(a.date))

  async function deliver(a: Crm1Activity) {
    try {
      await onLog?.({ kind: a.kind, summary: a.summary, date: a.date })
      setActs((x) => x.map((y) => (y.id === a.id ? { ...y, pending: false, failed: false } : y)))
    } catch {
      setActs((x) => x.map((y) => (y.id === a.id ? { ...y, pending: false, failed: true } : y)))
    }
  }
  function log(e: React.FormEvent) {
    e.preventDefault()
    const summary = text.trim()
    if (!summary) return
    const a = { id: `n${acts.length}${summary.length}${date}`, kind, date, by: "You", summary, pending: true }
    setActs((x) => [a, ...x])
    setText("")
    void deliver(a)
  }

  const content = empty ? (
    <div className="bg-card rounded-2xl border px-6 py-16 text-center">
      <span aria-hidden="true" className="bg-muted mx-auto flex size-12 items-center justify-center rounded-full">
        <UserX className="size-6" />
      </span>
      <h2 className="mt-5 text-lg font-semibold tracking-tight">{emptyState?.title ?? "This contact is not here"}</h2>
      <p className="text-muted-foreground mx-auto mt-1.5 max-w-xs text-sm text-pretty">{emptyState?.description ?? "They may have been merged with another record or removed."}</p>
      {emptyState?.action}
    </div>
  ) : (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="min-w-0 grid grid-cols-1 gap-6">
        <header className="bg-card rounded-2xl border p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-4">
            <span aria-hidden="true" className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border text-lg font-semibold">
              <CoverArt seed={contact.name} variant="mesh" className="absolute inset-0" />
              <span className="relative">{contact.name.split(" ").map((w) => w[0]).join("")}</span>
            </span>
            <div className="min-w-0 flex-1">
              <h1 id={`${id}-title`} className="text-2xl font-semibold tracking-[-0.03em]">
                {contact.name}
              </h1>
              <p className="text-muted-foreground text-sm">
                {contact.title} at {contact.company}
              </p>
            </div>
            <div className="text-end">
              <p className="text-muted-foreground text-xs">Deal value</p>
              <p className="text-2xl font-semibold tracking-tight tabular-nums">{money.format(contact.value)}</p>
            </div>
          </div>

          <ol aria-label="Pipeline stage" className="mt-6 flex gap-1.5">
            {stages.map((s, i) => (
              <li key={s} className="min-w-0 flex-1">
                <button
                  type="button"
                  aria-current={i === stage ? "step" : undefined}
                  onClick={() => { setStage(i); onStageChange?.(i) }}
                  className={cn("focus-visible:ring-ring/50 group block w-full rounded-lg text-start outline-none focus-visible:ring-[3px]")}
                >
                  <span aria-hidden="true" className={cn("block h-2 rounded-full transition-colors motion-reduce:transition-none", i <= stage ? (stage === stages.length - 1 ? "bg-chart-2" : "bg-foreground") : "bg-muted group-hover:bg-muted-foreground/30")} />
                  <span className={cn("mt-2 block truncate text-xs", i === stage ? "font-semibold" : "text-muted-foreground")}>
                    {s}
                    <span className="sr-only">{i < stage ? ", done" : i === stage ? ", current stage" : ""}</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </header>

        <div className="bg-card rounded-2xl border">
          <h2 className="border-b px-5 py-3.5 font-semibold tracking-tight">Activity</h2>
          <form onSubmit={log} className="bg-muted/30 grid grid-cols-1 gap-3 border-b p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div role="radiogroup" aria-label="Type of activity" className="bg-muted flex flex-wrap rounded-lg p-0.5">
                {(Object.keys(kindMeta) as Crm1Kind[]).map((k) => (
                  <button key={k} type="button" role="radio" aria-checked={kind === k} onClick={() => setKind(k)} className={cn("focus-visible:ring-ring/50 flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium outline-none focus-visible:ring-[3px]", kind === k ? "bg-background shadow-sm" : "text-muted-foreground")}>
                    {React.createElement(kindMeta[k].icon, { "aria-hidden": true, className: "size-4" })}
                    {kindMeta[k].label}
                  </button>
                ))}
              </div>
              <label className="text-muted-foreground flex items-center gap-2 text-sm">
                On
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Date of the activity" className="h-9 w-40" />
              </label>
            </div>
            <Textarea aria-label={`Write the ${kindMeta[kind].label.toLowerCase()}`} value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder={kind === "note" ? "What should the team remember?" : `What was said in the ${kindMeta[kind].label.toLowerCase()}?`} />
            <div className="flex justify-end">
              <Button type="submit" size="sm" disabled={!text.trim()}>
                Log {kindMeta[kind].label.toLowerCase()}
              </Button>
            </div>
          </form>
          <ol className="grid gap-0 p-5 sm:p-6">
            {sorted.map((a, i) => {
              const K = kindMeta[a.kind]
              return (
                <li key={a.id} className="relative flex gap-4 pb-6 last:pb-0">
                  {i < sorted.length - 1 ? <span aria-hidden="true" className="bg-border absolute start-[17px] top-9 -bottom-0 w-px" /> : null}
                  <span aria-hidden="true" className="bg-background relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border">
                    <K.icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1 pt-1">
                    <p className="text-sm">
                      <span className="font-semibold">{K.label}</span>
                      <span className="text-muted-foreground"> · {a.by} · {dateFmt.format(toT(a.date))}</span>
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm text-pretty">{a.summary}</p>
                    {a.pending ? (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs">
                        <Loader2 aria-hidden="true" className="size-3 animate-spin motion-reduce:animate-none" />
                        Saving
                      </p>
                    ) : null}
                    {a.failed ? (
                      <p role="alert" className="mt-1.5 flex items-center gap-2 text-xs">
                        <CircleAlert aria-hidden="true" className="size-3.5" />
                        Not saved.
                        <button type="button" onClick={() => { setActs((x) => x.map((y) => (y.id === a.id ? { ...y, pending: true, failed: false } : y))); void deliver(a) }} className="focus-visible:ring-ring/50 rounded-sm font-semibold underline underline-offset-2 outline-none focus-visible:ring-[3px]">
                          Retry
                        </button>
                      </p>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </div>

      <aside aria-label="Contact details" className="grid gap-4 lg:sticky lg:top-6">
        <div className={cn("rounded-2xl border p-5", late !== null && late > 0 ? "bg-destructive/5 border-destructive/40" : "bg-card")}>
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <CalendarClock aria-hidden="true" className="size-4" />
            Follow-up
          </h2>
          <p role="status" className="mt-3 text-sm font-medium">
            {followUp ? (late! > 0 ? `Overdue by ${late} ${late === 1 ? "day" : "days"}` : late === 0 ? "Due today" : `Due in ${-late!} ${-late! === 1 ? "day" : "days"}`) : "No follow-up planned"}
            {followUp ? <span className="text-muted-foreground block font-normal">{dateFmt.format(toT(followUp))}</span> : null}
          </p>
          <label className="mt-4 block text-xs font-medium">
            <span className="text-muted-foreground mb-1.5 block">Next follow-up</span>
            <Input type="date" value={followUp ?? ""} onChange={(e) => { setFollowUp(e.target.value || undefined); if (e.target.value) onFollowUp?.(e.target.value) }} />
          </label>
          {last ? (
            <p className="text-muted-foreground mt-4 border-t pt-4 text-sm">
              Last contact <span className="text-foreground font-medium">{ago(last.date)}</span>
            </p>
          ) : null}
        </div>

        <div className="bg-card rounded-2xl border p-5">
          <h2 className="mb-3 text-sm font-semibold">Details</h2>
          <dl className="grid gap-3 text-sm">
            <div className="flex items-start gap-3">
              <dt className="sr-only">Email</dt>
              <Mail aria-hidden="true" className="text-muted-foreground mt-0.5 size-4 shrink-0" />
              <dd className="min-w-0 truncate">
                <a href={`mailto:${contact.email}`} className="focus-visible:ring-ring/50 rounded-sm underline underline-offset-4 outline-none focus-visible:ring-[3px]">
                  {contact.email}
                </a>
              </dd>
            </div>
            {contact.phone ? (
              <div className="flex items-start gap-3">
                <dt className="sr-only">Phone</dt>
                <Phone aria-hidden="true" className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                <dd dir="ltr">
                  <a href={`tel:${contact.phone.replace(/[^+\d]/g, "")}`} className="focus-visible:ring-ring/50 rounded-sm underline underline-offset-4 outline-none focus-visible:ring-[3px]">
                    {contact.phone}
                  </a>
                </dd>
              </div>
            ) : null}
            {contact.location ? (
              <div className="flex items-start gap-3">
                <dt className="sr-only">Location</dt>
                <MapPin aria-hidden="true" className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                <dd>{contact.location}</dd>
              </div>
            ) : null}
            <div className="flex items-start gap-3">
              <dt className="sr-only">Owner</dt>
              <MessageSquareText aria-hidden="true" className="text-muted-foreground mt-0.5 size-4 shrink-0" />
              <dd>Owned by {contact.owner}</dd>
            </div>
          </dl>
          {contact.tags?.length ? (
            <ul aria-label="Tags" className="mt-4 flex flex-wrap gap-1.5 border-t pt-4">
              {contact.tags.map((t) => (
                <li key={t} className="bg-muted rounded-full px-2.5 py-0.5 text-xs font-medium">
                  {t}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </aside>
    </div>
  )

  return (
    <section data-slot="crm-1" data-state={state} aria-label={empty ? "Contact" : contact.name} className={cn("mx-auto w-full max-w-6xl px-4 py-8 sm:px-6", className)} {...frameProps(props)}>
      <StateView state={state === "loading" || state === "error" ? state : "ready"} onRetry={onRetry} label="Loading the contact" loading={<Skel />} error={{ title: errorState?.title ?? "The contact could not be loaded", description: errorState?.description ?? "Nothing was changed. Check your connection and try again.", ...errorState }}>
        {content}
      </StateView>
    </section>
  )
}

export { Crm1, type Crm1Props, type Crm1Contact, type Crm1Activity, type Crm1Kind }
