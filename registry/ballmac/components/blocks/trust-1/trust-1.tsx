// Ballmac UI: Trust 1. https://ui.ballmac.com/blocks/trust-1
"use client"

import * as React from "react"
import { Bell, Bug, CalendarCheck, CircleAlert, CircleCheck, Clock, Download, FileText, Loader2, Lock, MailCheck, Search, Server, ShieldCheck } from "lucide-react"

import { BlurFade, BlurFadeGroup } from "@/components/ballmac/blur-fade"
import { Button } from "@/components/ballmac/button"
import { Checkbox } from "@/components/ballmac/checkbox"
import { CoverArt } from "@/components/ballmac/cover-art"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ballmac/dialog"
import { Input } from "@/components/ballmac/input"
import { Skeleton } from "@/components/ballmac/skeleton"
import { useReturnFocus } from "@/lib/ballmac/return-focus"
import { SpotlightCard } from "@/components/ballmac/spotlight-card"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Trust1Certification = {
  id: string
  /** The standard's short name: "SOC 2 Type II". */
  name: string
  status: "certified" | "in-progress" | "aligned"
  /** Who audited it or what it covers. */
  detail: string
  /** When it is valid until, or when the next step happens. */
  valid?: string
}

type Trust1ControlGroup = {
  id: string
  title: string
  icon?: React.ReactNode
  controls: { text: string; status?: "done" | "progress" }[]
}

type Trust1Document = {
  id: string
  name: string
  description?: string
  /** A public document downloads straight away; a gated one asks for a request first. */
  access: "public" | "gated"
  /** "PDF · 2.4 MB". */
  format: string
  /** Already written for people ("Updated June 2026"). */
  updated: string
  href?: string
}

type Trust1Subprocessor = { name: string; purpose: string; location: string; data: string }

type Trust1Props = Omit<React.ComponentProps<"section">, "title"> &
  Pick<StateProps, "state" | "onRetry" | "errorState"> & {
    title?: string
    description?: string
    /** The line in the status pill. */
    status?: { label: string; ok?: boolean; updated?: string }
    certifications?: Trust1Certification[]
    groups?: Trust1ControlGroup[]
    documents?: Trust1Document[]
    subprocessors?: Trust1Subprocessor[]
    /** Where vulnerability reports go. */
    securityEmail?: string
    /** Your company's name, used in the confidentiality line. */
    companyName?: string
    /** The id of a gated document whose request dialog is open at first. */
    defaultRequestId?: string
    /** Called when a public document is downloaded. */
    onDownload?: (doc: Trust1Document) => void
    /** Called with a request for a gated document. Resolve to confirm; throw to show the reason. Defaults to a short simulated request. */
    onRequestAccess?: (doc: Trust1Document, details: { email: string; company: string }) => Promise<void>
    /** Called with an email to notify when the list of subprocessors changes. Resolve to confirm; throw to show the reason. */
    onSubscribe?: (email: string) => Promise<void>
  }

const sampleCerts: Trust1Certification[] = [
  { id: "soc2", name: "SOC 2 Type II", status: "certified", detail: "Audited by Halden & Rowe, independent auditors", valid: "Valid until 14 Jun 2027" },
  { id: "iso", name: "ISO 27001", status: "certified", detail: "Information security management system", valid: "Valid until 2 Nov 2027" },
  { id: "gdpr", name: "GDPR", status: "aligned", detail: "Data processing agreement and EU data residency", valid: "DPA available below" },
  { id: "hipaa", name: "HIPAA", status: "in-progress", detail: "Controls mapped; independent assessment scheduled", valid: "Assessment in Q1 2027" },
]

const sampleGroups: Trust1ControlGroup[] = [
  {
    id: "data",
    title: "Data protection",
    icon: <Lock />,
    controls: [
      { text: "Encrypted at rest with AES-256", status: "done" },
      { text: "TLS 1.3 for all traffic, in transit and between services", status: "done" },
      { text: "Each customer's data is isolated in its own workspace", status: "done" },
      { text: "Daily encrypted backups, restored and tested every quarter", status: "done" },
    ],
  },
  {
    id: "access",
    title: "Access control",
    icon: <ShieldCheck />,
    controls: [
      { text: "Single sign-on and SCIM for your team", status: "done" },
      { text: "Two-step sign-in required for every employee", status: "done" },
      { text: "Access reviewed every quarter, with least privilege", status: "done" },
      { text: "Every admin action recorded in an audit log", status: "done" },
    ],
  },
  {
    id: "infra",
    title: "Infrastructure",
    icon: <Server />,
    controls: [
      { text: "Hosted in ISO-certified data centers", status: "done" },
      { text: "EU and US regions, chosen when you sign up", status: "done" },
      { text: "99.95% uptime over the last 12 months", status: "done" },
      { text: "Disaster recovery rehearsed once a year", status: "done" },
    ],
  },
  {
    id: "app",
    title: "Application security",
    icon: <Bug />,
    controls: [
      { text: "Independent penetration test every year", status: "done" },
      { text: "Dependency and secret scanning on every commit", status: "done" },
      { text: "Security training for every employee", status: "done" },
      { text: "Bug bounty with cash rewards", status: "progress" },
    ],
  },
]

const sampleDocs: Trust1Document[] = [
  { id: "wp", name: "Security whitepaper", description: "How the product is built, run and protected.", access: "public", format: "PDF · 2.4 MB", updated: "Updated June 2026" },
  { id: "dpa", name: "Data processing agreement", description: "The standard DPA, ready to sign.", access: "public", format: "PDF · 480 KB", updated: "Updated March 2026" },
  { id: "soc2", name: "SOC 2 Type II report", description: "The full audit report, under a confidentiality agreement.", access: "gated", format: "PDF · 6.1 MB", updated: "Updated June 2026" },
  { id: "pen", name: "Penetration test summary", description: "Findings and fixes from the latest independent test.", access: "gated", format: "PDF · 1.2 MB", updated: "Updated May 2026" },
]

const sampleSubs: Trust1Subprocessor[] = [
  { name: "Cloud hosting", purpose: "Runs the product and stores data", location: "Frankfurt, Germany", data: "All customer data" },
  { name: "Email delivery", purpose: "Sends sign-in and notification email", location: "Dublin, Ireland", data: "Names and email addresses" },
  { name: "Payments", purpose: "Processes card payments", location: "United States", data: "Billing details" },
  { name: "Error monitoring", purpose: "Finds and fixes crashes", location: "Frankfurt, Germany", data: "Technical diagnostics, never content" },
  { name: "Support desk", purpose: "Answers customer questions", location: "Dublin, Ireland", data: "Support conversations" },
  { name: "Product analytics", purpose: "Shows which features are used", location: "Frankfurt, Germany", data: "Usage events, never content" },
]

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
const statusMeta = {
  certified: { label: "Certified", icon: CircleCheck, tone: "bg-chart-2/15 text-foreground border-chart-2/30" },
  aligned: { label: "Compliant", icon: CircleCheck, tone: "bg-chart-1/15 text-foreground border-chart-1/30" },
  "in-progress": { label: "In progress", icon: Clock, tone: "bg-chart-3/20 text-foreground border-chart-3/40" },
} as const

function TrustSkeleton() {
  return (
    <div className="grid gap-12" aria-hidden="true">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-52 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}

/**
 * A trust center: the standards you meet with dates, the security controls behind them, documents (public ones download, sensitive ones
 * ask for a request with a confidentiality agreement), the subprocessors that touch customer data with a way to be told of changes, and
 * where to report a vulnerability.
 */
function Trust1({
  title = "Trust center",
  description = "How we protect your data, who helps us do it, and the proof. Everything on this page is kept current.",
  status = { label: "All systems operational", ok: true, updated: "Checked 2 minutes ago" },
  certifications = sampleCerts,
  groups = sampleGroups,
  documents = sampleDocs,
  subprocessors = sampleSubs,
  securityEmail = "security@acme.com",
  companyName = "Acme",
  defaultRequestId,
  onDownload,
  onRequestAccess,
  onSubscribe,
  state = "ready",
  onRetry,
  errorState,
  className,
  ...props
}: Trust1Props) {
  const id = React.useId()
  const [query, setQuery] = React.useState("")
  const [request, setRequest] = React.useState<Trust1Document | null>(() => documents.find((d) => d.id === defaultRequestId && d.access === "gated") ?? null)
  const returnFocus = useReturnFocus(!!request)
  const [form, setForm] = React.useState({ email: "", company: "", agree: false })
  const [phase, setPhase] = React.useState<"idle" | "sending" | "error" | "done">("idle")
  const [message, setMessage] = React.useState<string>()
  const [touched, setTouched] = React.useState(false)
  const [subEmail, setSubEmail] = React.useState("")
  const [subPhase, setSubPhase] = React.useState<"idle" | "sending" | "error" | "done">("idle")
  const [subMessage, setSubMessage] = React.useState<string>()

  const q = query.trim().toLowerCase()
  const subs = subprocessors.filter((s) => !q || `${s.name} ${s.purpose} ${s.location} ${s.data}`.toLowerCase().includes(q))

  const emailError = touched && !emailOk(form.email) ? "Enter a work email, like name@company.com." : undefined
  const companyError = touched && !form.company.trim() ? "Tell us which company this is for." : undefined
  const agreeError = touched && !form.agree ? "Agree to keep it confidential to continue." : undefined

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (!request || !emailOk(form.email) || !form.company.trim() || !form.agree) return
    setPhase("sending")
    setMessage(undefined)
    try {
      if (onRequestAccess) await onRequestAccess(request, { email: form.email.trim(), company: form.company.trim() })
      else await new Promise((r) => setTimeout(r, 900))
      setPhase("done")
    } catch (err) {
      setPhase("error")
      setMessage(err instanceof Error && err.message ? err.message : "The request could not be sent. Try again in a moment.")
    }
  }

  async function subscribe(e: React.FormEvent) {
    e.preventDefault()
    if (!emailOk(subEmail)) {
      setSubPhase("error")
      setSubMessage("Enter a valid email address.")
      return
    }
    setSubPhase("sending")
    try {
      if (onSubscribe) await onSubscribe(subEmail.trim())
      else await new Promise((r) => setTimeout(r, 700))
      setSubPhase("done")
    } catch (err) {
      setSubPhase("error")
      setSubMessage(err instanceof Error && err.message ? err.message : "We could not sign you up. Try again.")
    }
  }

  const content = (
    <div className="grid grid-cols-1 gap-20">
      <section aria-labelledby={`${id}-certs`}>
        <h2 id={`${id}-certs`} className="mb-6 text-2xl font-semibold tracking-[-0.03em]">
          Standards we meet
        </h2>
        <BlurFadeGroup stagger={0.06} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 [&>*]:h-full [&>*>*]:h-full" item={{ direction: "up", offset: 12, blur: 6 }}>
          {certifications.map((c) => {
            const S = statusMeta[c.status]
            return (
              <SpotlightCard key={c.id} size={280} className="flex flex-col gap-4 rounded-2xl p-6 transition-shadow duration-200 hover:shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <span aria-hidden="true" className="bg-muted flex size-10 items-center justify-center rounded-xl [&_svg]:size-5">
                    <ShieldCheck />
                  </span>
                  <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", S.tone)}>
                    <S.icon aria-hidden="true" className="size-3.5" />
                    {S.label}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold tracking-tight">{c.name}</h3>
                  <p className="text-muted-foreground mt-1.5 text-sm text-pretty">{c.detail}</p>
                </div>
                {c.valid ? (
                  <p className="text-muted-foreground flex items-center gap-2 border-t pt-4 text-xs">
                    <CalendarCheck aria-hidden="true" className="size-3.5 shrink-0" />
                    {c.valid}
                  </p>
                ) : null}
              </SpotlightCard>
            )
          })}
        </BlurFadeGroup>
      </section>

      <section aria-labelledby={`${id}-controls`}>
        <h2 id={`${id}-controls`} className="mb-2 text-2xl font-semibold tracking-[-0.03em]">
          How we protect your data
        </h2>
        <p className="text-muted-foreground mb-6 max-w-xl text-sm text-pretty">The controls behind the certificates, written as plainly as we can.</p>
        <div className="grid gap-4 md:grid-cols-2">
          {groups.map((g, gi) => (
            <BlurFade key={g.id} direction="up" offset={12} delay={0.05 * gi}>
              <div className="bg-card h-full rounded-2xl border p-6">
                <div className="flex items-center gap-3">
                  <span aria-hidden="true" className={cn("flex size-9 items-center justify-center rounded-lg [&_svg]:size-4", ["bg-chart-1/20", "bg-chart-2/20", "bg-chart-4/20", "bg-chart-3/25"][gi % 4])}>
                    {g.icon ?? <Lock />}
                  </span>
                  <h3 className="flex-1 text-base font-semibold tracking-tight">{g.title}</h3>
                  <span className="text-muted-foreground text-xs tabular-nums">{g.controls.length} controls</span>
                </div>
                <ul className="mt-5 grid gap-3">
                  {g.controls.map((c) => (
                    <li key={c.text} className="flex items-start gap-3 text-sm">
                      {c.status === "progress" ? <Clock aria-hidden="true" className="text-chart-3 mt-0.5 size-4 shrink-0" /> : <CircleCheck aria-hidden="true" className="text-chart-2 mt-0.5 size-4 shrink-0" />}
                      <span className="text-pretty">
                        {c.text}
                        {c.status === "progress" ? <span className="text-muted-foreground"> (in progress)</span> : null}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </BlurFade>
          ))}
        </div>
      </section>

      <section aria-labelledby={`${id}-docs`}>
        <h2 id={`${id}-docs`} className="mb-2 text-2xl font-semibold tracking-[-0.03em]">
          Documents
        </h2>
        <p className="text-muted-foreground mb-6 max-w-xl text-sm text-pretty">Public documents download straight away. Audit reports are shared under a confidentiality agreement.</p>
        <ul className="bg-card divide-y overflow-hidden rounded-2xl border">
          {documents.map((d) => (
            <li key={d.id} className="flex flex-wrap items-center gap-x-5 gap-y-3 p-5">
              <span aria-hidden="true" className="bg-muted flex size-11 shrink-0 items-center justify-center rounded-xl [&_svg]:size-5">
                {d.access === "gated" ? <Lock /> : <FileText />}
              </span>
              <div className="min-w-0 flex-1 basis-64">
                <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                  {d.name}
                  {d.access === "gated" ? <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[11px] font-normal">Request required</span> : null}
                </p>
                {d.description ? <p className="text-muted-foreground mt-0.5 text-xs text-pretty">{d.description}</p> : null}
                <p className="text-muted-foreground mt-1 text-xs tabular-nums">
                  {d.format} · {d.updated}
                </p>
              </div>
              {d.access === "public" ? (
                d.href ? (
                  <a href={d.href} onClick={() => onDownload?.(d)} className="hover:bg-accent focus-visible:ring-ring/50 inline-flex h-9 items-center gap-2 rounded-md border px-3.5 text-sm font-medium outline-none focus-visible:ring-[3px]">
                    <Download aria-hidden="true" className="size-4" />
                    Download{" "}
                    <span className="sr-only">{d.name}</span>
                  </a>
                ) : (
                  <Button variant="outline" onClick={() => onDownload?.(d)}>
                    <Download aria-hidden="true" />
                    Download{" "}
                    <span className="sr-only">{d.name}</span>
                  </Button>
                )
              ) : (
                <Button
                  onClick={() => {
                    setRequest(d)
                    setPhase("idle")
                    setTouched(false)
                    setMessage(undefined)
                  }}
                >
                  Request access
                  {" "}<span className="sr-only">to {d.name}</span>
                </Button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby={`${id}-subs`}>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div className="max-w-xl">
            <h2 id={`${id}-subs`} className="text-2xl font-semibold tracking-[-0.03em]">
              Subprocessors
            </h2>
            <p className="text-muted-foreground mt-2 text-sm text-pretty">The companies that handle customer data for us, what they do, and where. We tell you 30 days before we add one.</p>
          </div>
          <form onSubmit={subscribe} noValidate className="grid w-full max-w-sm gap-1.5">
            <label htmlFor={`${id}-sub`} className="text-xs font-medium">
              Get an email when this list changes
            </label>
            {subPhase === "done" ? (
              <p role="status" className="bg-chart-2/10 border-chart-2/30 flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                <MailCheck aria-hidden="true" className="size-4 shrink-0" />
                You are on the list. We will email {subEmail}.
              </p>
            ) : (
              <>
                <div className="flex gap-2">
                  <Input
                    id={`${id}-sub`}
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    value={subEmail}
                    onChange={(e) => {
                      setSubEmail(e.target.value)
                      if (subPhase === "error") setSubPhase("idle")
                    }}
                    aria-invalid={subPhase === "error" || undefined}
                    aria-describedby={subPhase === "error" ? `${id}-sub-error` : undefined}
                  />
                  <Button type="submit" disabled={subPhase === "sending"}>
                    {subPhase === "sending" ? <Loader2 aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : <Bell aria-hidden="true" />}
                    {subPhase === "sending" ? "Signing up…" : "Notify me"}
                  </Button>
                </div>
                {subPhase === "error" ? (
                  <p id={`${id}-sub-error`} role="alert" className="text-destructive text-xs">
                    {subMessage}
                  </p>
                ) : null}
              </>
            )}
          </form>
        </div>
        <div className="bg-card min-w-0 overflow-hidden rounded-2xl border">
          <div className="flex items-center gap-2 border-b px-4 py-2.5">
            <Search aria-hidden="true" className="text-muted-foreground size-4" />
            <input type="search" aria-label="Filter subprocessors" placeholder="Filter by name, purpose or place" value={query} onChange={(e) => setQuery(e.target.value)} className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-sm outline-none" />
            <span className="text-muted-foreground text-xs tabular-nums">{subs.length} of {subprocessors.length}</span>
          </div>
          <div tabIndex={0} role="region" aria-label="Subprocessors table" className="focus-visible:ring-ring/50 overflow-x-auto outline-none focus-visible:ring-[3px] focus-visible:ring-inset">
            <table className="w-full min-w-[40rem] text-sm">
              <thead>
                <tr className="text-muted-foreground border-b text-xs">
                  <th scope="col" className="px-4 py-2.5 text-start font-medium">Name</th>
                  <th scope="col" className="px-4 py-2.5 text-start font-medium">What they do</th>
                  <th scope="col" className="px-4 py-2.5 text-start font-medium">Where</th>
                  <th scope="col" className="px-4 py-2.5 text-start font-medium">Data they handle</th>
                </tr>
              </thead>
              <tbody>
                {subs.map((s) => (
                  <tr key={s.name} className="hover:bg-accent/30 border-b last:border-0">
                    <th scope="row" className="px-4 py-3 text-start font-medium">{s.name}</th>
                    <td className="text-muted-foreground px-4 py-3">{s.purpose}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{s.location}</td>
                    <td className="text-muted-foreground px-4 py-3">{s.data}</td>
                  </tr>
                ))}
                {!subs.length ? (
                  <tr>
                    <td colSpan={4} className="text-muted-foreground px-4 py-10 text-center">
                      No subprocessors match “{query}”.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </section>

    </div>
  )

  const report = (
      <BlurFade direction="up" offset={14}>
        <section aria-labelledby={`${id}-report`} className="bg-card relative isolate overflow-hidden rounded-3xl border p-8 sm:p-12">
          <CoverArt seed="disclosure" variant="rings" className="absolute inset-y-0 end-0 -z-10 w-2/3 opacity-60 [mask-image:linear-gradient(to_left,black,transparent)] rtl:[mask-image:linear-gradient(to_right,black,transparent)]" />
          <div className="max-w-xl">
            <span aria-hidden="true" className="bg-muted flex size-11 items-center justify-center rounded-xl">
              <Bug className="size-5" />
            </span>
            <h2 id={`${id}-report`} className="mt-5 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
              Found a security issue?
            </h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed text-pretty">Please tell us before you tell anyone else. We answer within one working day, we do not take legal action against good-faith research, and we credit you if you like.</p>
            <a href={`mailto:${securityEmail}`} className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring/50 mt-6 inline-flex h-10 items-center rounded-md px-5 text-sm font-medium outline-none focus-visible:ring-[3px]">
              {securityEmail}
            </a>
          </div>
        </section>
      </BlurFade>
  )

  return (
    <section data-slot="trust-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-6xl px-4 py-12 sm:px-6", className)} {...frameProps(props)}>
      <BlurFade direction="up" offset={12} duration={0.55}>
        <header className="bg-card relative isolate mb-14 overflow-hidden rounded-3xl border p-8 sm:p-12">
          <CoverArt seed="trust-center" variant="mesh" grid className="absolute inset-0 -z-10 opacity-50" />
          <div aria-hidden="true" className="from-card via-card/80 absolute inset-0 -z-10 bg-gradient-to-r to-transparent" />
          <p role="status" className="bg-background/80 mb-6 inline-flex items-center gap-2 rounded-full border py-1 ps-2.5 pe-3 text-xs backdrop-blur">
            <span aria-hidden="true" className={cn("size-2 rounded-full", status.ok === false ? "bg-destructive" : "bg-chart-2")} />
            <span className="font-medium">{status.label}</span>
            {status.updated ? <span className="text-muted-foreground">· {status.updated}</span> : null}
          </p>
          <h1 id={`${id}-title`} className="flex items-center gap-3 text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-6xl">
            {title}
          </h1>
          <p className="text-muted-foreground mt-4 max-w-xl text-base leading-relaxed text-pretty">{description}</p>
        </header>
      </BlurFade>

      <StateView state={state === "loading" || state === "error" ? state : "ready"} onRetry={onRetry} label="Loading the trust center" loading={<TrustSkeleton />} error={{ title: errorState?.title ?? "The trust center could not be loaded", description: errorState?.description ?? "Check your connection and try again. You can still reach us at the address below.", ...errorState }}>
        {content}
      </StateView>
      <div className="mt-20">{report}</div>

      <Dialog open={!!request} onOpenChange={(o) => !o && setRequest(null)}>
        <DialogContent {...returnFocus}>
          {phase === "done" ? (
            <div className="grid justify-items-center gap-3 py-4 text-center">
              <span aria-hidden="true" className="bg-chart-2/15 flex size-12 items-center justify-center rounded-full">
                <MailCheck className="size-6" />
              </span>
              <DialogTitle>Request sent</DialogTitle>
              <DialogDescription className="max-w-xs text-pretty">
                We will email {form.email} within one working day with a link to {request?.name}.
              </DialogDescription>
              <Button className="mt-2" onClick={() => setRequest(null)}>
                Done
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="grid gap-5">
              <DialogHeader>
                <DialogTitle>Request {request?.name}</DialogTitle>
                <DialogDescription>We share this under a confidentiality agreement. It takes a minute.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-1.5">
                <label htmlFor={`${id}-email`} className="text-sm font-medium">
                  Work email
                </label>
                <Input id={`${id}-email`} type="email" autoComplete="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} aria-invalid={!!emailError || undefined} aria-describedby={emailError ? `${id}-email-error` : undefined} />
                {emailError ? <p id={`${id}-email-error`} role="alert" className="text-destructive text-xs">{emailError}</p> : null}
              </div>
              <div className="grid gap-1.5">
                <label htmlFor={`${id}-company`} className="text-sm font-medium">
                  Company
                </label>
                <Input id={`${id}-company`} autoComplete="organization" value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} aria-invalid={!!companyError || undefined} aria-describedby={companyError ? `${id}-company-error` : undefined} />
                {companyError ? <p id={`${id}-company-error`} role="alert" className="text-destructive text-xs">{companyError}</p> : null}
              </div>
              <div className="grid gap-1.5">
                <div className="flex items-start gap-3">
                  <Checkbox id={`${id}-nda`} checked={form.agree} onCheckedChange={(c) => setForm((f) => ({ ...f, agree: c === true }))} aria-invalid={!!agreeError || undefined} aria-describedby={agreeError ? `${id}-nda-error` : undefined} className="mt-0.5" />
                  <label htmlFor={`${id}-nda`} className="text-sm text-pretty">
                    I agree to keep this document confidential and to use it only to assess {companyName}.
                  </label>
                </div>
                {agreeError ? <p id={`${id}-nda-error`} role="alert" className="text-destructive text-xs">{agreeError}</p> : null}
              </div>
              {phase === "error" ? (
                <p role="alert" className="border-destructive/30 bg-destructive/5 flex items-start gap-2 rounded-lg border px-3 py-2 text-sm">
                  <CircleAlert aria-hidden="true" className="text-destructive mt-0.5 size-4 shrink-0" />
                  {message}
                </p>
              ) : null}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setRequest(null)} disabled={phase === "sending"}>
                  Cancel
                </Button>
                <Button type="submit" disabled={phase === "sending"}>
                  {phase === "sending" ? <Loader2 aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : null}
                  {phase === "sending" ? "Sending…" : "Send request"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}

export { Trust1, type Trust1Props, type Trust1Certification, type Trust1ControlGroup, type Trust1Document, type Trust1Subprocessor }
