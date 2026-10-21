"use client"

import * as React from "react"
import {
  Check,
  LayoutDashboard,
  Inbox,
  CircleDollarSign,
  Wallet,
  History,
  Settings2,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  LoaderCircle,
  ShieldCheck,
  Users,
} from "lucide-react"
import { WorkspaceNav } from "./workspace-nav"
import { Button } from "@/components/ballmac/button"
import { Input } from "@/components/ballmac/input"
import { Textarea } from "@/components/ballmac/textarea"
import { Badge } from "@/components/ballmac/badge"
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ballmac/field"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ballmac/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ballmac/dialog"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ballmac/select"
import { usd } from "@/lib/affiliates"
import type { AdminPayload, AdminPartner, AdminSale, AdminView } from "@/lib/affiliate-admin"

const views: { key: AdminView; label: string; title: string; description: string }[] = [
  {
    key: "overview",
    label: "Overview",
    title: "What needs your attention",
    description: "Review new applications and partners who have reached the payout minimum.",
  },
  {
    key: "applications",
    label: "Applications",
    title: "Meet your next partners",
    description: "Oldest applications first. The review goal is within three business days.",
  },
  {
    key: "partners",
    label: "Partners",
    title: "Manage your partnerships",
    description: "Review balances, manage access and record completed transfers.",
  },
  {
    key: "sales",
    label: "Commissions",
    title: "Every commission, accounted for",
    description: "Inspect the ledger and reconcile a payment against its latest provider status.",
  },
  {
    key: "payouts",
    label: "Payouts",
    title: "A record of money already sent",
    description: "These records confirm completed transfers. Recording one never moves money.",
  },
  {
    key: "audit",
    label: "Activity",
    title: "A clear history of decisions",
    description: "Owner actions are recorded with the actor, time and internal reason.",
  },
  {
    key: "settings",
    label: "Setup",
    title: "Program connections",
    description: "Configuration status only. Secret values are never shown in this workspace.",
  },
]
const date = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value))
const actionLabels: Record<string, string> = {
  approve: "Approve partner",
  pause: "Pause partnership",
  reject: "Decline application",
  reopen: "Reopen application",
  revoke: "Revoke partner sessions",
  notify: "Send approval email",
  payout: "Record completed transfer",
}
function exportPage(data: AdminPayload) {
  const rows: (string | number)[][] =
    data.view === "sales"
      ? [
          ["Payment", "Partner email", "Subtotal USD cents", "Commission USD cents", "Status", "Created UTC"],
          ...data.sales.map((s) => [
            s.payment_id,
            s.email,
            s.net_cents,
            s.commission_cents,
            s.state,
            s.created_at,
          ]),
        ]
      : data.view === "payouts"
        ? [
            ["Partner email", "Amount USD cents", "Method", "Transfer reference", "Paid UTC"],
            ...data.payouts.map((p) => [p.email, p.amount_cents, p.method, p.reference, p.paid_at]),
          ]
        : [
            ["Partner", "Email", "Status", "Eligible USD cents", "Pending USD cents", "Paid USD cents"],
            ...data.partners.map((p) => [p.name, p.email, p.status, p.eligible, p.pending, p.paid]),
          ]
  const escape = (value: string | number) => {
    const raw = String(value)
    return `"${(/^[=+\-@\t\r]/.test(raw) ? "'" : "") + raw.replace(/"/g, '""')}"`
  }
  const blob = new Blob([rows.map((row) => row.map(escape).join(",")).join("\r\n")], {
    type: "text/csv;charset=utf-8",
  })
  const url = URL.createObjectURL(blob),
    anchor = document.createElement("a")
  anchor.href = url
  anchor.download = `ballmac-partners-${data.view}-page-${data.page + 1}.csv`
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
function Status({ value }: { value: string }) {
  return (
    <Badge variant="secondary">
      {value === "reversed"
        ? "Reversed / held"
        : value === "rejected"
          ? "Declined"
          : value[0].toUpperCase() + value.slice(1)}
    </Badge>
  )
}
function Empty({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-5 py-12 text-center">
      <Users className="text-muted-foreground size-6" aria-hidden="true" />
      <p className="text-muted-foreground max-w-md text-sm leading-relaxed">{text}</p>
    </div>
  )
}

export function AffiliateAdmin() {
  const [refreshVersion, setRefreshVersion] = React.useState(0)
  const [data, setData] = React.useState<AdminPayload | null>(null)
  const [view, setView] = React.useState<AdminView>("overview")
  const [page, setPage] = React.useState(0)
  const [query, setQuery] = React.useState("")
  const [search, setSearch] = React.useState("")
  const [filter, setFilter] = React.useState("all")
  const [loading, setLoading] = React.useState(true)
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState("")
  const [notice, setNotice] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [code, setCode] = React.useState("")
  const [codeSent, setCodeSent] = React.useState(false)
  const [resendReady, setResendReady] = React.useState(false)
  const [challenge, setChallenge] = React.useState(0)
  const codeInput = React.useRef<HTMLInputElement>(null)
  const [selected, setSelected] = React.useState<AdminPartner | null>(null)
  const [sale, setSale] = React.useState<AdminSale | null>(null)
  const [operation, setOperation] = React.useState("")
  const [note, setNote] = React.useState("")
  const [discount, setDiscount] = React.useState("")
  const [notify, setNotify] = React.useState(true)
  const [verticalNav, setVerticalNav] = React.useState(false)
  React.useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)")
    const sync = () => setVerticalNav(media.matches)
    sync()
    media.addEventListener("change", sync)
    return () => media.removeEventListener("change", sync)
  }, [])
  const [amount, setAmount] = React.useState("")
  const [reference, setReference] = React.useState("")
  const [method, setMethod] = React.useState("")
  const [confirmed, setConfirmed] = React.useState(false)
  const [actionError, setActionError] = React.useState("")

  const load = React.useCallback(
    async (signal?: AbortSignal) => {
      const params = new URLSearchParams({ view, page: String(page), q: query, status: filter })
      const res = await fetch(`/api/affiliates/admin?${params}`, { cache: "no-store", signal })
      const body = await res.json()
      if (res.status === 401) return null
      if (!res.ok) throw new Error(body.error ?? "We couldn’t load the workspace.")
      return body as AdminPayload
    },
    [view, page, query, filter],
  )
  React.useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
      .then((body) => {
        if (!controller.signal.aborted) setData(body)
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "Please try again.")
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [load, refreshVersion])
  React.useEffect(() => {
    if (!codeSent) return
    codeInput.current?.focus()
    const timer = window.setTimeout(() => setResendReady(true), 60_000)
    return () => window.clearTimeout(timer)
  }, [codeSent, challenge])
  function changeView(value: AdminView) {
    setRefreshVersion((value) => value + 1)
    setLoading(true)
    setView(value)
    setPage(0)
    setQuery("")
    setSearch("")
    setFilter("all")
    setError("")
  }
  async function signIn(event?: React.FormEvent, resend = false) {
    event?.preventDefault()
    setBusy(true)
    setError("")
    try {
      const action = codeSent && !resend ? "verify" : "request"
      const res = await fetch("/api/affiliates/admin/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action, email, code }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error ?? "Sign-in failed. Please try again.")
      if (action === "request") {
        setCodeSent(true)
        setCode("")
        setResendReady(false)
        setChallenge((value) => value + 1)
      } else {
        setData(await load())
        setCode("")
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.")
    } finally {
      setBusy(false)
    }
  }
  function openPartner(partner: AdminPartner) {
    setSelected(partner)
    setOperation("")
    setNote("")
    setDiscount(partner.discount_code ?? "")
    setNotify(true)
    setAmount((partner.eligible / 100).toFixed(2))
    setReference("")
    setMethod("")
    setConfirmed(false)
    setActionError("")
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setActionError("")
    try {
      const body = sale
        ? { action: "reconcile", id: sale.payment_id, note }
        : {
            action: operation,
            id: selected?.id,
            revision: selected?.revision,
            note,
            discount,
            notify,
            amount,
            reference,
            method,
            confirmed,
          }
      const res = await fetch("/api/affiliates/admin", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      })
      const result = await res.json()
      if (res.status === 401) {
        setData(null)
        setSelected(null)
        setSale(null)
        setError("Your owner session expired. Sign in again.")
        throw new Error("Your owner session expired. Sign in again.")
      }
      if (!res.ok) throw new Error(result.error ?? "We couldn’t complete this action.")
      setSelected(null)
      setSale(null)
      setNotice([result.message, result.warning].filter(Boolean).join(" "))
      try {
        setData(await load())
      } catch {
        setError(
          "The action was saved, but the workspace could not refresh. Refresh before making another change.",
        )
      }
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Please try again.")
    } finally {
      setBusy(false)
    }
  }
  const current = views.find((item) => item.key === view)!
  const partnerRows = data?.partners ?? []
  const filterOptions =
    view === "applications"
      ? [
          ["all", "All applications"],
          ["pending", "Pending"],
          ["rejected", "Declined"],
        ]
      : view === "partners"
        ? [
            ["all", "All partners"],
            ["active", "Active"],
            ["paused", "Paused"],
            ["ready", "Payout eligible"],
          ]
        : view === "sales"
          ? [
              ["all", "All commissions"],
              ["earned", "Earned"],
              ["reversed", "Reversed / held"],
            ]
          : []
  const actions = selected
    ? selected.status === "pending"
      ? ["approve", "reject"]
      : selected.status === "rejected"
        ? ["approve", "reopen"]
        : selected.status === "paused"
          ? ["approve", "revoke", ...(selected.eligible >= 5000 ? ["payout"] : [])]
          : ["pause", "revoke", "notify", ...(selected.eligible >= 5000 ? ["payout"] : [])]
    : []

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-8 sm:py-8">
      <WorkspaceNav current="admin" />
      <header className="mt-6 flex flex-wrap items-start justify-between gap-5">
        <div className="min-w-0">
          <Badge variant="outline">
            <ShieldCheck className="size-3" aria-hidden="true" /> Program administration
          </Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Partner operations</h1>
          <p className="text-muted-foreground mt-3 max-w-xl text-sm leading-relaxed">
            Applications, commissions and completed payouts. One place to run the program.
          </p>
        </div>
        {data && (
          <Button
            variant="outline"
            disabled={busy || loading}
            onClick={async () => {
              setBusy(true)
              setError("")
              try {
                const res = await fetch("/api/affiliates/admin/session", { method: "DELETE" })
                if (!res.ok) throw new Error("Sign-out failed. Please try again.")
                setData(null)
                setSelected(null)
                setSale(null)
                setEmail("")
                setCode("")
                setCodeSent(false)
                setNotice("")
              } catch (e) {
                setError(e instanceof Error ? e.message : "Please try again.")
              } finally {
                setBusy(false)
              }
            }}
          >
            Sign out
          </Button>
        )}
      </header>
      {loading && !data ? (
        <p role="status" className="text-muted-foreground mt-10 flex items-center gap-3 text-sm">
          <LoaderCircle className="size-4 motion-safe:animate-spin" aria-hidden="true" /> Checking your owner
          session…
        </p>
      ) : !data ? (
        <div className="mx-auto mt-12 grid max-w-5xl gap-8 rounded-3xl border bg-muted/20 p-4 md:grid-cols-2 md:items-stretch md:p-5">
          <form onSubmit={signIn} aria-busy={busy} className="rounded-2xl border bg-card p-6 sm:p-8">
            <FieldGroup>
              <h2 className="text-xl font-semibold tracking-tight">
                {codeSent ? "Check your owner email" : "Owner sign-in"}
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {codeSent
                  ? "If this email is authorized to manage the program, a code is on its way. It expires in 10 minutes."
                  : "Sign in with the email authorized to manage the program. Your administration workspace is separate from partner accounts."}
              </p>
              {codeSent ? (
                <Field>
                  <FieldLabel htmlFor="owner-code">Six-digit owner code</FieldLabel>
                  <Input
                    id="owner-code"
                    ref={codeInput}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    pattern="[0-9]{6}"
                    required
                    maxLength={6}
                    className="font-mono text-lg tracking-[0.35em]"
                  />
                </Field>
              ) : (
                <Field>
                  <FieldLabel htmlFor="owner-email">Owner email</FieldLabel>
                  <Input
                    id="owner-email"
                    type="email"
                    autoComplete="email"
                    maxLength={254}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                  />
                </Field>
              )}
              {error && (
                <p role="alert" className="text-destructive text-sm">
                  {error}
                </p>
              )}
              <Button type="submit" disabled={busy}>
                {busy ? "Please wait…" : codeSent ? "Open owner dashboard" : "Email owner sign-in code"}
              </Button>
              {codeSent && (
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    disabled={busy || !resendReady}
                    onClick={() => signIn(undefined, true)}
                  >
                    {resendReady ? "Resend code" : "Resend available after a minute"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setCodeSent(false)
                      setCode("")
                      setError("")
                    }}
                  >
                    Change email
                  </Button>
                </div>
              )}
              <p className="text-muted-foreground text-xs">
                Owner sessions last eight hours. Sign out on shared devices.
              </p>
            </FieldGroup>
          </form>
          <aside className="rounded-2xl bg-primary p-6 text-primary-foreground sm:p-8">
            <h2 className="font-semibold">A separate workspace for the owner.</h2>
            <ul className="text-primary-foreground/75 mt-5 flex flex-col gap-4 text-sm">
              {[
                "Review applications and activate referral discounts",
                "Review commissions and eligible payout balances",
                "Record completed transfers with a unique reference",
                "Keep an audit trail of management decisions",
              ].map((text) => (
                <li key={text} className="flex items-start gap-3">
                  <Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  {text}
                </li>
              ))}
            </ul>
            <p className="text-primary-foreground/75 mt-6 border-t pt-5 text-xs leading-relaxed">
              Applying as a partner?{" "}
              <a href="/affiliates/dashboard" className="font-medium underline underline-offset-4">
                Open the partner dashboard
              </a>{" "}
              instead.
            </p>
          </aside>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <p className="text-muted-foreground break-all">Signed in as {data.owner}</p>
            <Button
              size="sm"
              variant="ghost"
              disabled={loading || busy}
              onClick={async () => {
                setLoading(true)
                setError("")
                try {
                  setData(await load())
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Please try again.")
                } finally {
                  setLoading(false)
                }
              }}
            >
              {loading ? "Refreshing…" : "Refresh workspace"}
            </Button>
          </div>
          {notice && (
            <div
              role="status"
              className="flex items-start justify-between gap-3 rounded-xl border bg-muted/40 p-4 text-sm"
            >
              <p>{notice}</p>
              <Button variant="ghost" size="sm" onClick={() => setNotice("")}>
                Dismiss
              </Button>
            </div>
          )}
          {error && (
            <p role="alert" className="text-destructive text-sm">
              {error}
            </p>
          )}
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Program totals">
            {[
              ["Awaiting review", String(data.summary.pending), "applications"],
              ["Active partners", String(data.summary.active), "partners"],
              ["Eligible for payout", usd(data.summary.eligible), "partners"],
              ["Total paid", usd(data.summary.paid), "payouts"],
            ].map(([label, value, destination]) => (
              <button
                type="button"
                key={label}
                onClick={() => changeView(destination as AdminView)}
                className="rounded-2xl border bg-card p-5 text-start outline-none hover:bg-muted/30 focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:p-5"
              >
                <span className="text-muted-foreground text-xs sm:text-sm">{label}</span>
                <span className="mt-3 block break-words text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">
                  {value}
                </span>
              </button>
            ))}
          </section>
          <Tabs
            orientation={verticalNav ? "vertical" : "horizontal"}
            value={view}
            onValueChange={(value) => changeView(value as AdminView)}
            className="gap-5 lg:grid lg:grid-cols-[200px_minmax(0,1fr)] lg:items-start"
          >
            <TabsList
              aria-label="Administration sections"
              className="w-full flex-nowrap justify-start rounded-2xl border bg-card p-2 lg:sticky lg:top-24 lg:flex-col lg:items-stretch lg:gap-1"
            >
              <span className="text-muted-foreground hidden px-3 pb-3 pt-2 text-[10px] font-medium uppercase tracking-widest lg:block">
                Program management
              </span>
              {views.map((item) => (
                <TabsTrigger
                  key={item.key}
                  value={item.key}
                  className="gap-3 border-s-2 border-transparent px-3 py-2.5 data-[state=active]:border-primary lg:justify-start"
                >
                  {React.createElement(
                    {
                      overview: LayoutDashboard,
                      applications: Inbox,
                      partners: Users,
                      sales: CircleDollarSign,
                      payouts: Wallet,
                      audit: History,
                      settings: Settings2,
                    }[item.key],
                    { className: "size-4 shrink-0", "aria-hidden": true },
                  )}
                  {item.label}
                  {item.key === "applications" && data.summary.pending > 0 && (
                    <span
                      aria-hidden="true"
                      className="ms-auto rounded-md bg-primary/10 px-1.5 text-[10px] tabular-nums"
                    >
                      {data.summary.pending}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
            {views.map((item) => (
              <TabsContent key={item.key} value={item.key} className="min-w-0">
                {view === item.key && (
                  <section
                    aria-labelledby={`admin-${view}`}
                    className="min-w-0 rounded-2xl border bg-card p-5 sm:p-6"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h2 id={`admin-${view}`} className="text-xl font-semibold tracking-tight">
                          {current.title}
                        </h2>
                        <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">
                          {current.description}
                        </p>
                      </div>
                      {!["audit", "settings"].includes(view) && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={loading}
                          onClick={() => exportPage(data)}
                        >
                          <Download aria-hidden="true" />
                          Export this page
                        </Button>
                      )}
                    </div>
                    {!["overview", "settings"].includes(view) && (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          setLoading(true)
                          setPage(0)
                          setQuery(search)
                          setRefreshVersion((value) => value + 1)
                        }}
                        className="mt-6 flex flex-col gap-3 sm:flex-row"
                      >
                        <Input
                          aria-label={`Search ${current.label.toLowerCase()}`}
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder={
                            view === "audit"
                              ? "Search actions, notes or record IDs"
                              : "Search by name, email or reference"
                          }
                          maxLength={150}
                        />
                        {filterOptions.length > 0 && (
                          <Select
                            value={filter}
                            onValueChange={(value) => {
                              setLoading(true)
                              setPage(0)
                              setFilter(value)
                            }}
                          >
                            <SelectTrigger aria-label="Filter records" className="w-full sm:w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {filterOptions.map(([value, label]) => (
                                  <SelectItem key={value} value={value}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        )}
                        <Button type="submit" variant="outline" disabled={loading}>
                          Search
                        </Button>
                      </form>
                    )}
                    {loading || data.view !== view ? (
                      <p role="status" className="text-muted-foreground py-10 text-sm">
                        Loading records…
                      </p>
                    ) : (
                      <div className="mt-6">
                        {["overview", "applications", "partners"].includes(view) && (
                          <>
                            {partnerRows.length === 0 ? (
                              <Empty
                                text={
                                  query || filter !== "all"
                                    ? "No records match these filters. Try a different search."
                                    : view === "applications"
                                      ? "No applications to review yet. New applications will appear here."
                                      : view === "partners"
                                        ? "No approved partners yet. Review an application to start your first partnership."
                                        : "You’re up to date. New applications and payout-eligible partners will appear here."
                                }
                              />
                            ) : (
                              <ul className="divide-y">
                                {partnerRows.map((partner) => (
                                  <li
                                    key={partner.id}
                                    className="flex flex-col gap-4 py-5 first:pt-0 sm:flex-row sm:items-start sm:justify-between"
                                  >
                                    <div className="min-w-0">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="break-words text-sm font-semibold">{partner.name}</h3>
                                        <Status value={partner.status} />
                                      </div>
                                      <p className="text-muted-foreground mt-1 break-all text-xs">
                                        {partner.email}
                                      </p>
                                      <p className="text-muted-foreground mt-2 text-xs">
                                        Applied {date(partner.created_at)} · {partner.conversions} eligible
                                        sales
                                      </p>
                                      <a
                                        href={partner.channel}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-3 inline-flex items-center gap-1.5 text-xs underline underline-offset-4"
                                      >
                                        View audience
                                        <ExternalLink
                                          className="size-3 rtl:-scale-x-100"
                                          aria-hidden="true"
                                        />
                                      </a>
                                    </div>
                                    <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                                      <div className="text-start sm:text-end">
                                        <p className="text-muted-foreground text-xs">Eligible for review</p>
                                        <p className="mt-1 font-mono text-lg font-semibold tabular-nums">
                                          {usd(partner.eligible)}
                                        </p>
                                        <p className="text-muted-foreground mt-1 text-xs">
                                          Pending {usd(partner.pending)} · Paid {usd(partner.paid)}
                                        </p>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant={partner.status === "pending" ? "default" : "outline"}
                                        onClick={() => openPartner(partner)}
                                      >
                                        {partner.status === "pending"
                                          ? "Review application"
                                          : "Manage partner"}
                                      </Button>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            )}
                            {view === "overview" && (
                              <div className="mt-6 grid gap-3 border-t pt-5 text-xs sm:grid-cols-3">
                                <p className="text-muted-foreground">
                                  Lifetime commissions{" "}
                                  <strong className="text-foreground ms-1 font-mono">
                                    {usd(data.summary.earned)}
                                  </strong>
                                </p>
                                <p className="text-muted-foreground">
                                  Pending earnings{" "}
                                  <strong className="text-foreground ms-1 font-mono">
                                    {usd(data.summary.pendingEarnings)}
                                  </strong>
                                </p>
                                <p className="text-muted-foreground">
                                  Eligible sales{" "}
                                  <strong className="text-foreground ms-1 font-mono">
                                    {data.summary.sales}
                                  </strong>
                                </p>
                              </div>
                            )}
                          </>
                        )}
                        {view === "sales" &&
                          (data.sales.length === 0 ? (
                            <Empty text="No commissions match this view. Eligible purchases will appear after verified payment events arrive." />
                          ) : (
                            <ul className="divide-y">
                              {data.sales.map((record) => (
                                <li
                                  key={record.payment_id}
                                  className="flex flex-col justify-between gap-4 py-5 first:pt-0 sm:flex-row"
                                >
                                  <div className="min-w-0">
                                    <p className="break-words text-sm font-semibold">{record.name}</p>
                                    <p className="text-muted-foreground mt-1 break-all text-xs">
                                      {record.email}
                                    </p>
                                    <p className="text-muted-foreground mt-2 break-all font-mono text-xs">
                                      {record.payment_id}
                                    </p>
                                    <p className="text-muted-foreground mt-2 text-xs">
                                      {date(record.created_at)} · Paid subtotal {usd(record.net_cents)}
                                    </p>
                                  </div>
                                  <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                                    <div className="text-end">
                                      <p className="font-mono text-lg font-semibold">
                                        {record.state === "earned" ? usd(record.commission_cents) : usd(0)}
                                      </p>
                                      <Status value={record.state} />
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setSale(record)
                                        setNote("")
                                        setActionError("")
                                      }}
                                    >
                                      Reconcile payment
                                    </Button>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          ))}
                        {view === "payouts" && (
                          <>
                            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/30 p-4">
                              <p className="max-w-xl text-xs leading-relaxed">
                                Transfer funds in PayPal or Wise first. Then open the partner’s record and
                                choose “Record completed transfer”.
                              </p>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  changeView("partners")
                                  setFilter("ready")
                                }}
                              >
                                Find payout-eligible partners
                              </Button>
                            </div>
                            {data.payouts.length === 0 ? (
                              <Empty text="No completed payouts recorded yet." />
                            ) : (
                              <ul className="divide-y">
                                {data.payouts.map((record) => (
                                  <li
                                    key={record.id}
                                    className="flex items-start justify-between gap-4 py-5 first:pt-0"
                                  >
                                    <div className="min-w-0">
                                      <h3 className="break-words text-sm font-semibold">{record.name}</h3>
                                      <p className="text-muted-foreground mt-1 break-all text-xs">
                                        {record.email}
                                      </p>
                                      <p className="text-muted-foreground mt-2 text-xs">
                                        {date(record.paid_at)} · {record.method}
                                      </p>
                                      <p className="text-muted-foreground mt-2 break-all font-mono text-xs">
                                        {record.reference}
                                      </p>
                                    </div>
                                    <p className="shrink-0 font-mono text-lg font-semibold">
                                      {usd(record.amount_cents)}
                                    </p>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </>
                        )}
                        {view === "audit" &&
                          (data.audit.length === 0 ? (
                            <Empty text="No owner actions match this view." />
                          ) : (
                            <ol className="divide-y">
                              {data.audit.map((record) => (
                                <li key={record.id} className="py-5 first:pt-0">
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <Badge variant="outline">{record.action}</Badge>
                                    <span className="text-muted-foreground text-xs">
                                      {date(record.created_at)}
                                    </span>
                                  </div>
                                  <p className="text-muted-foreground mt-3 break-all text-xs">
                                    {record.actor} · Record {record.target}
                                  </p>
                                  {record.note && (
                                    <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed">
                                      {record.note}
                                    </p>
                                  )}
                                  <details className="mt-3">
                                    <summary className="text-muted-foreground cursor-pointer text-xs focus-visible:outline-ring">
                                      Recorded details
                                    </summary>
                                    <pre
                                      dir="ltr"
                                      className="mt-2 whitespace-pre-wrap break-all rounded-lg bg-muted/40 p-3 font-mono text-xs"
                                    >
                                      {record.detail}
                                    </pre>
                                  </details>
                                </li>
                              ))}
                            </ol>
                          ))}
                        {view === "settings" && (
                          <>
                            <ul className="divide-y">
                              {data.settings.map((setting) => (
                                <li
                                  key={setting.label}
                                  className="flex items-start justify-between gap-4 py-5 first:pt-0"
                                >
                                  <div>
                                    <h3 className="text-sm font-medium">{setting.label}</h3>
                                    <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                                      {setting.help}
                                    </p>
                                  </div>
                                  <Badge variant={setting.ready ? "secondary" : "outline"}>
                                    {setting.label === "Application & payout emails"
                                      ? setting.ready
                                        ? "No stalled mail"
                                        : "Needs attention"
                                      : setting.ready
                                        ? "Configured"
                                        : "Needs setup"}
                                  </Badge>
                                </li>
                              ))}
                            </ul>
                            <div className="mt-6 rounded-xl border bg-muted/25 p-4 text-sm leading-relaxed">
                              <p className="font-medium">Program rules</p>
                              <p className="text-muted-foreground mt-2">
                                30% commission after the 10% buyer discount, before tax. The minimum payout is
                                $50. Reviews run on the 1st–15th UTC for earlier-month sales. PayPal/Wise
                                transfers are manual.
                              </p>
                            </div>
                          </>
                        )}
                        {!["settings"].includes(view) && (
                          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                            <p className="text-muted-foreground text-xs">
                              {data.total} records · Page {data.page + 1} of {data.pages}
                            </p>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={data.page === 0 || loading}
                                onClick={() => {
                                  setLoading(true)
                                  setPage(data.page - 1)
                                  setRefreshVersion((value) => value + 1)
                                }}
                              >
                                <ChevronLeft className="rtl:rotate-180" aria-hidden="true" />
                                Previous
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={data.page + 1 >= data.pages || loading}
                                onClick={() => {
                                  setLoading(true)
                                  setPage(data.page + 1)
                                  setRefreshVersion((value) => value + 1)
                                }}
                              >
                                Next
                                <ChevronRight className="rtl:rotate-180" aria-hidden="true" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </section>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
      <Dialog
        open={Boolean(data && (selected || sale))}
        onOpenChange={(open) => {
          if (!open && !busy) {
            setSelected(null)
            setSale(null)
            setOperation("")
            setActionError("")
          }
        }}
      >
        <DialogContent
          onEscapeKeyDown={(e) => {
            if (busy) e.preventDefault()
          }}
          onPointerDownOutside={(e) => {
            if (busy) e.preventDefault()
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {sale ? "Reconcile a commission" : (selected?.name ?? "Partner record")}
            </DialogTitle>
            <DialogDescription className="break-all">
              {sale ? sale.payment_id : selected?.email}
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <Status value={selected.status} />
                <a
                  href={selected.channel}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs underline underline-offset-4"
                >
                  View audience
                </a>
              </div>
              <div className="grid grid-cols-3 gap-2 rounded-xl border bg-muted/20 p-4">
                {[
                  ["Eligible", usd(selected.eligible)],
                  ["Pending", usd(selected.pending)],
                  ["Paid", usd(selected.paid)],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-muted-foreground text-xs">{label}</p>
                    <p className="mt-2 break-words font-mono text-sm font-semibold">{value}</p>
                  </div>
                ))}
              </div>
              {selected.balance < 0 && (
                <p role="status" className="text-muted-foreground text-sm leading-relaxed">
                  A balance adjustment of {usd(-selected.balance)} will be offset against this partner’s
                  future earnings.
                </p>
              )}
              {selected.review_note && (
                <p className="text-muted-foreground whitespace-pre-wrap break-words text-xs leading-relaxed">
                  Last internal note: {selected.review_note}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {actions.map((action) => (
                  <Button
                    key={action}
                    size="sm"
                    variant={operation === action ? "default" : "outline"}
                    disabled={busy}
                    onClick={() => {
                      setOperation(action)
                      setActionError("")
                    }}
                  >
                    {actionLabels[action]}
                  </Button>
                ))}
              </div>
            </>
          )}
          {(operation || sale) && (
            <form onSubmit={submit} aria-busy={busy} className="border-t pt-5">
              <FieldGroup>
                {sale ? (
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    This checks Dodo’s latest payment record. Resolved disputes can restore eligible
                    commission; payments with successful reversals or unresolved disputes remain excluded.
                  </p>
                ) : (
                  <h3 className="text-sm font-semibold">{actionLabels[operation]}</h3>
                )}
                {operation === "approve" && (
                  <>
                    <Field>
                      <FieldLabel htmlFor="approval-discount">
                        Existing Dodo discount code (optional)
                      </FieldLabel>
                      <Input
                        id="approval-discount"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                        maxLength={100}
                        placeholder="Leave blank to generate automatically"
                      />
                      <FieldDescription>
                        We validate or generate a 10% regular-Pro discount, limited to one use per customer.
                      </FieldDescription>
                    </Field>
                    <label className="flex items-start gap-3 text-xs leading-relaxed">
                      <input
                        type="checkbox"
                        checked={notify}
                        onChange={(e) => setNotify(e.target.checked)}
                        className="accent-primary mt-0.5 size-4 shrink-0"
                      />
                      <span>Email the partner their approval and dashboard sign-in instructions.</span>
                    </label>
                  </>
                )}
                {operation === "payout" && (
                  <>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Eligible balance: {usd(selected?.eligible ?? 0)}. Only record a transfer that has
                      already succeeded outside Ballmac.
                    </p>
                    <Field>
                      <FieldLabel htmlFor="payout-amount">Amount sent (USD)</FieldLabel>
                      <Input
                        id="payout-amount"
                        inputMode="decimal"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        placeholder="50.00"
                      />
                      <FieldDescription>Minimum $50.00; cannot exceed the eligible balance.</FieldDescription>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="payout-method">Transfer method</FieldLabel>
                      <Select value={method} onValueChange={setMethod} required>
                        <SelectTrigger id="payout-method" className="w-full">
                          <SelectValue placeholder="Choose transfer method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="paypal">PayPal</SelectItem>
                            <SelectItem value="wise">Wise</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="payout-reference">Completed transfer reference</FieldLabel>
                      <Input
                        id="payout-reference"
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        maxLength={200}
                        required
                        placeholder="Transaction or transfer ID"
                      />
                    </Field>
                    <label className="flex items-start gap-3 text-xs leading-relaxed">
                      <input
                        type="checkbox"
                        checked={confirmed}
                        onChange={(e) => setConfirmed(e.target.checked)}
                        required
                        className="accent-primary mt-0.5 size-4 shrink-0"
                      />
                      <span>
                        I have completed this transfer. This action only records it and does not send money.
                      </span>
                    </label>
                  </>
                )}
                {operation === "revoke" && (
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    This signs the partner out of remembered sessions and invalidates their old access key.
                    They can still request a new email sign-in code.
                  </p>
                )}
                {operation === "notify" && (
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Send an approval email with the dashboard URL and program rules. No access key is
                    included.
                  </p>
                )}
                <Field>
                  <FieldLabel htmlFor="owner-note">
                    Internal note{["pause", "reject"].includes(operation) ? " (required)" : " (optional)"}
                  </FieldLabel>
                  <Textarea
                    id="owner-note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    maxLength={1000}
                    rows={3}
                    required={["pause", "reject"].includes(operation)}
                    placeholder="Reason or context for the audit trail"
                  />
                  <FieldDescription>
                    Visible only to program administrators. Do not include bank details or credentials.
                  </FieldDescription>
                </Field>
                {actionError && (
                  <p role="alert" className="text-destructive text-sm">
                    {actionError}
                  </p>
                )}
                <Button type="submit" disabled={busy}>
                  {busy ? (
                    <>
                      <LoaderCircle className="motion-safe:animate-spin" aria-hidden="true" />
                      Saving…
                    </>
                  ) : sale ? (
                    "Check provider and update ledger"
                  ) : operation === "payout" ? (
                    "Confirm payout record"
                  ) : (
                    `Confirm: ${actionLabels[operation]}`
                  )}
                </Button>
              </FieldGroup>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
