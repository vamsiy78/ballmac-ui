"use client"

import * as React from "react"
import {
  ArrowUpRight,
  Check,
  Copy,
  Download,
  KeyRound,
  Link2,
  LoaderCircle,
  Mail,
  MousePointer2,
  Wallet,
  LayoutDashboard,
  BookOpen,
  LifeBuoy,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { WorkspaceNav } from "./workspace-nav"
import { Button, buttonVariants } from "@/components/ballmac/button"
import { Input } from "@/components/ballmac/input"
import { Textarea } from "@/components/ballmac/textarea"
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ballmac/field"
import { Badge } from "@/components/ballmac/badge"
import { AFFILIATE, usd } from "@/lib/affiliates"

type Dashboard = {
  affiliate: { name: string; code: string; status: string }
  totals: {
    conversions: number
    earned: number
    paid: number
    balance: number
    eligible: number
    pending: number
  }
  review: { start: string; end: string; pendingEligibleAt?: string }
  sales: { payment_id: string; commission_cents: number; state: string; created_at: string }[]
  payouts: { amount_cents: number; reference: string; paid_at: string }[]
}
type Resource = { name: string; title: string; href: string; image: string }
const date = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value))

function CopyButton({ text, label = "Copy link" }: { text: string; label?: string }) {
  const [status, setStatus] = React.useState<"idle" | "copied" | "failed">("idle")
  React.useEffect(() => {
    if (status === "idle") return
    const timer = window.setTimeout(() => setStatus("idle"), 3000)
    return () => window.clearTimeout(timer)
  }, [status])
  return (
    <div className="flex shrink-0 flex-col gap-1">
      <Button
        disabled={!text.trim()}
        variant="outline"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text)
            setStatus("copied")
          } catch {
            setStatus("failed")
          }
        }}
      >
        {status === "copied" ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
        {status === "copied" ? "Copied" : label}
      </Button>
      <span role="status" className={status === "failed" ? "text-destructive max-w-56 text-xs" : "sr-only"}>
        {status === "failed"
          ? "Select the text and copy it manually."
          : status === "copied"
            ? "Copied to clipboard."
            : ""}
      </span>
    </div>
  )
}

export function AffiliateDashboard({ resources = [] }: { resources?: Resource[] }) {
  const [data, setData] = React.useState<Dashboard | null>(null)
  const [restoring, setRestoring] = React.useState(true)
  const [activeSection, setActiveSection] = React.useState("#partner-link")
  React.useEffect(() => {
    if (!data) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActiveSection(`#${visible[0].target.id}`)
      },
      { rootMargin: "-15% 0px -55% 0px" },
    )
    for (const id of ["partner-link", "partner-earnings", "sharing-kit", "partner-payouts"]) {
      const section = document.getElementById(id)
      if (section) observer.observe(section)
    }
    return () => observer.disconnect()
  }, [data])
  const [stage, setStage] = React.useState<"email" | "code" | "key">("email")
  const [email, setEmail] = React.useState("")
  const [code, setCode] = React.useState("")
  const [key, setKey] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState("")
  const [origin, setOrigin] = React.useState("")
  const [format, setFormat] = React.useState<"short" | "tutorial" | "newsletter">("short")
  const [drafts, setDrafts] = React.useState<Partial<Record<"short" | "tutorial" | "newsletter", string>>>({})
  const [resendReady, setResendReady] = React.useState(false)
  const [challengeVersion, setChallengeVersion] = React.useState(0)
  const codeInput = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    let current = true
    fetch("/api/affiliates", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) return
        const body = await res.json()
        if (current) {
          setData(body)
          setOrigin(window.location.origin)
        }
      })
      .catch(() => {})
      .finally(() => {
        if (current) setRestoring(false)
      })
    return () => {
      current = false
    }
  }, [])
  React.useEffect(() => {
    if (stage !== "code") return
    codeInput.current?.focus()
    const timer = window.setTimeout(() => setResendReady(true), 60_000)
    return () => window.clearTimeout(timer)
  }, [stage, challengeVersion])
  async function refresh() {
    const res = await fetch("/api/affiliates", { cache: "no-store" })
    const body = await res.json()
    if (!res.ok) throw new Error(body.error ?? "We couldn’t load your workspace. Please sign in again.")
    setData(body)
    setOrigin(window.location.origin)
  }
  async function authenticate(event?: React.FormEvent, resend = false) {
    event?.preventDefault()
    setBusy(true)
    setError("")
    try {
      const action = resend || stage === "email" ? "request" : stage === "code" ? "verify" : "key"
      const res = await fetch("/api/affiliates/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action, email, code, key }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error ?? "Could not sign in. Please try again.")
      if (action === "request") {
        setStage("code")
        setResendReady(false)
        setChallengeVersion((value) => value + 1)
        setCode("")
      } else {
        await refresh()
        setKey("")
        setCode("")
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.")
    } finally {
      setBusy(false)
    }
  }
  const link = data ? `${origin}/go/${data.affiliate.code}` : ""
  const snippets = {
    short: `Building with React? Explore Ballmac UI Pro for app blocks you can make your own. Get 10% off through my partner link: ${link}\n\nAffiliate disclosure: I earn a commission if you buy through this link.`,
    tutorial: `In this walkthrough, explore how Ballmac UI Pro blocks can fit into a React and Tailwind project. Preview the blocks, install through the shadcn CLI, and customize the code in your app.\n\nGet 10% off Pro: ${link}\n\nAffiliate disclosure: I earn a commission if you buy through this link.`,
    newsletter: `For your next React project: Ballmac UI Pro includes app blocks for dashboards, billing, settings, AI interfaces and more. It is a one-time purchase, and the code installs into your own project.\n\nPreview the product and save 10% on Pro: ${link}\n\nAffiliate disclosure: I earn a commission if you buy through this link.`,
  }
  const shareText = drafts[format] ?? snippets[format]
  const reviewLabel = data ? `${date(data.review.start)} – ${date(data.review.end)}` : ""
  return (
    <div className="mx-auto max-w-[1360px] px-4 py-6 sm:px-8 sm:py-8">
      <WorkspaceNav current="partner" />
      <header className="mt-6 flex flex-wrap items-start justify-between gap-5">
        <div>
          <Badge variant="outline">Partner workspace</Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            {data ? `Welcome back, ${data.affiliate.name}.` : "Your next recommendation starts here."}
          </h1>
          <p className="text-muted-foreground mt-3 max-w-xl text-sm leading-relaxed">
            {data
              ? "Share something useful. Keep track of what it earns."
              : "Sign in with your approved partner email. We’ll send a one-time code—no password to remember."}
          </p>
        </div>
        {data && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              disabled={busy}
              onClick={async () => {
                setBusy(true)
                setError("")
                try {
                  await refresh()
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Please try again.")
                } finally {
                  setBusy(false)
                }
              }}
            >
              {busy ? "Refreshing…" : "Refresh"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={async () => {
                setBusy(true)
                setError("")
                try {
                  const res = await fetch("/api/affiliates/session", { method: "DELETE" })
                  if (!res.ok) throw new Error("We couldn’t sign you out. Please try again.")
                  setData(null)
                  setDrafts({})
                  setEmail("")
                  setFormat("short")
                  setKey("")
                  setCode("")
                  setStage("email")
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Please try again.")
                } finally {
                  setBusy(false)
                }
              }}
            >
              Sign out
            </Button>
          </div>
        )}
      </header>
      {restoring ? (
        <p role="status" className="text-muted-foreground mt-10 flex items-center gap-3 text-sm">
          <LoaderCircle className="size-4 motion-safe:animate-spin" aria-hidden="true" /> Checking your saved
          session…
        </p>
      ) : !data ? (
        <div className="mx-auto mt-12 grid max-w-5xl gap-6 rounded-3xl border bg-muted/20 p-4 md:grid-cols-[1fr_0.85fr] md:items-stretch md:p-5">
          <form onSubmit={authenticate} aria-busy={busy} className="rounded-2xl border bg-card p-6 sm:p-8">
            <FieldGroup>
              <div className="flex size-10 items-center justify-center rounded-xl border bg-muted/50">
                {stage === "key" ? (
                  <KeyRound className="size-4" aria-hidden="true" />
                ) : (
                  <Mail className="size-4" aria-hidden="true" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold tracking-tight">
                  {stage === "code"
                    ? "Check your inbox"
                    : stage === "key"
                      ? "Use your partner access key"
                      : "Welcome back, partner"}
                </h2>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {stage === "code"
                    ? `If ${email} belongs to an approved partner, a code is on its way. It expires in 10 minutes.`
                    : stage === "key"
                      ? "Your approval email includes a private key. You can use it instead of an email code."
                      : "Use the email address you applied with. Approved partners can sign in here."}
                </p>
              </div>
              {stage === "email" ? (
                <Field>
                  <FieldLabel htmlFor="partner-login-email">Partner email</FieldLabel>
                  <Input
                    id="partner-login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    maxLength={254}
                    autoComplete="email"
                    placeholder="you@example.com"
                  />
                </Field>
              ) : stage === "code" ? (
                <Field>
                  <FieldLabel htmlFor="partner-login-code">Six-digit code</FieldLabel>
                  <Input
                    id="partner-login-code"
                    ref={codeInput}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    required
                    className="font-mono text-lg tracking-[0.35em]"
                  />
                  <FieldDescription>Use the latest code. Each code works once.</FieldDescription>
                </Field>
              ) : (
                <Field>
                  <FieldLabel htmlFor="access-key">Partner access key</FieldLabel>
                  <Input
                    id="access-key"
                    type="password"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    required
                    autoComplete="off"
                    spellCheck={false}
                  />
                </Field>
              )}
              {error && (
                <p role="alert" className="text-destructive text-sm">
                  {error}
                </p>
              )}
              <Button type="submit" disabled={busy}>
                {busy ? (
                  <>
                    <LoaderCircle className="motion-safe:animate-spin" aria-hidden="true" /> Please wait…
                  </>
                ) : stage === "email" ? (
                  "Email me a sign-in code"
                ) : (
                  "Open my dashboard"
                )}
              </Button>
              {stage === "code" && (
                <div className="flex flex-wrap items-center gap-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={busy || !resendReady}
                    onClick={() => authenticate(undefined, true)}
                  >
                    {resendReady ? "Resend code" : "Resend available after a minute"}
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      setStage("email")
                      setCode("")
                      setError("")
                    }}
                    className="text-muted-foreground text-xs underline underline-offset-4 focus-visible:outline-ring"
                  >
                    Change email
                  </button>
                </div>
              )}
              <button
                type="button"
                className="text-muted-foreground text-start text-xs underline underline-offset-4 focus-visible:outline-ring"
                onClick={() => {
                  setStage(stage === "key" ? "email" : "key")
                  setError("")
                }}
              >
                {stage === "key" ? "Sign in with email instead" : "Use a partner access key instead"}
              </button>
              <p className="text-muted-foreground text-xs leading-relaxed">
                We’ll remember you securely for 30 days on this browser. Sign out on shared devices.
              </p>
            </FieldGroup>
          </form>
          <aside className="rounded-2xl bg-primary p-6 text-primary-foreground sm:p-8">
            <h2 className="font-semibold">A workspace for your partnership.</h2>
            <ul className="text-primary-foreground/75 mt-5 flex flex-col gap-4 text-sm">
              {[
                "Your personal link and ready-to-edit sharing copy",
                "Commission activity with buyer identities kept private",
                "Pending earnings, payout eligibility and payment history",
              ].map((text) => (
                <li key={text} className="flex items-start gap-3">
                  <Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  {text}
                </li>
              ))}
            </ul>
            <div className="mt-6 border-t pt-5">
              <p className="text-sm">Not a partner yet?</p>
              <a
                href="/affiliates#apply"
                className="mt-2 inline-block text-sm font-medium underline underline-offset-4"
              >
                Apply to join the program
              </a>
              <p className="text-primary-foreground/75 mt-4 text-xs">
                Program owner?{" "}
                <a href="/affiliates/admin" className="underline underline-offset-4">
                  Open administration
                </a>
                .
              </p>
              <p className="text-primary-foreground/75 mt-4 text-xs">
                Need help signing in?{" "}
                <a href="/support" className="underline underline-offset-4">
                  Contact support
                </a>
                .
              </p>
            </div>
          </aside>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-6">
          {error && (
            <p role="alert" className="text-destructive text-sm">
              {error}
            </p>
          )}
          {data.affiliate.status !== "active" && (
            <div role="status" className="rounded-xl border bg-muted/50 p-4 text-sm">
              Your partnership is paused. Your history remains available, but your link is not earning new
              commissions.{" "}
              <a href="/support" className="font-medium underline underline-offset-4">
                Contact support
              </a>{" "}
              to discuss next steps.
            </div>
          )}
          <div className="grid gap-6 lg:grid-cols-[190px_minmax(0,1fr)] lg:items-start">
            <nav
              aria-label="Partner workspace sections"
              className="flex flex-nowrap gap-1 overflow-x-auto rounded-2xl border bg-card p-2 lg:sticky lg:top-24 lg:flex-col lg:overflow-visible"
            >
              <p className="text-muted-foreground hidden px-3 py-3 text-[10px] font-medium uppercase tracking-widest lg:block">
                Your partnership
              </p>
              {(
                [
                  ["#partner-link", "Overview & link", LayoutDashboard],
                  ["#partner-earnings", "Commission activity", MousePointer2],
                  ["#sharing-kit", "Sharing resources", BookOpen],
                  ["#partner-payouts", "Payouts", Wallet],
                ] as const
              ).map(([href, label, Icon]) => (
                <a
                  key={href}
                  href={href}
                  aria-current={activeSection === href ? "location" : undefined}
                  onClick={() => setActiveSection(href)}
                  className={cn(
                    "hover:text-foreground hover:bg-muted flex min-h-10 shrink-0 items-center gap-3 whitespace-nowrap rounded-xl px-3 text-xs font-medium outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none",
                    activeSection === href ? "bg-muted text-foreground" : "text-muted-foreground",
                  )}
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  {label}
                </a>
              ))}
              <a
                href="/support"
                className="text-muted-foreground mt-2 hidden items-center gap-3 border-t px-3 py-4 text-xs lg:flex"
              >
                <LifeBuoy className="size-4" aria-hidden="true" />
                Partner support
              </a>
            </nav>
            <div className="flex min-w-0 flex-col gap-6">
              <section
                id="partner-link"
                className="scroll-mt-24 overflow-hidden rounded-2xl border bg-card"
                aria-labelledby="partner-link-title"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 border-b bg-muted/20 p-5 sm:p-6">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-medium">
                      <Link2 className="size-4" aria-hidden="true" />
                      <span>Your next great recommendation</span>
                    </div>
                    <h2 id="partner-link-title" className="mt-3 text-2xl font-semibold tracking-tight">
                      One link. A win for both of you.
                    </h2>
                    <p className="text-muted-foreground mt-2 text-sm">
                      30% commission for you. 10% off Pro for your audience.
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {data.affiliate.status === "active" ? "Active partner" : "Paused"}
                  </Badge>
                </div>
                <div className="p-5 sm:p-6">
                  <Field>
                    <FieldLabel htmlFor="share-link">Your personal referral link</FieldLabel>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Input
                        id="share-link"
                        value={link}
                        readOnly
                        onFocus={(e) => e.target.select()}
                        className="font-mono text-xs"
                      />
                      <CopyButton text={link} />
                    </div>
                    <FieldDescription>
                      30-day referral window. Credit goes to the most recent valid partner link.
                    </FieldDescription>
                  </Field>
                  {data.totals.conversions === 0 && (
                    <div className="mt-5 grid gap-3 border-t pt-5 text-xs sm:grid-cols-3">
                      {[
                        "01 · Copy your personal link",
                        "02 · Add a helpful recommendation",
                        "03 · Include your affiliate disclosure",
                      ].map((step) => (
                        <p key={step} className="text-muted-foreground">
                          {step}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </section>
              <section id="partner-earnings" className="scroll-mt-24" aria-labelledby="earnings-title">
                <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                  <h2 id="earnings-title" className="text-lg font-semibold tracking-tight">
                    Know where your earnings stand.
                  </h2>
                  <p className="text-muted-foreground text-xs">
                    {data.totals.conversions} eligible {data.totals.conversions === 1 ? "sale" : "sales"} ·
                    Lifetime commission {usd(data.totals.earned)}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    [
                      "Pending earnings",
                      usd(data.totals.pending),
                      "Net earnings not yet eligible for the monthly payout review.",
                    ],
                    [
                      "Eligible for review",
                      usd(data.totals.eligible),
                      "Earlier-month earnings, after paid amounts and adjustments.",
                    ],
                    [
                      "Already paid",
                      usd(data.totals.paid),
                      "Completed transfers recorded for your partnership.",
                    ],
                  ].map(([label, amount, help]) => (
                    <div key={label} className="rounded-xl border bg-card p-5">
                      <p className="text-muted-foreground text-sm">{label}</p>
                      <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">{amount}</p>
                      <p className="text-muted-foreground mt-3 text-xs leading-relaxed">{help}</p>
                    </div>
                  ))}
                </div>
                {data.totals.balance < 0 && (
                  <p role="status" className="text-muted-foreground mt-3 text-sm">
                    A payment adjustment of {usd(-data.totals.balance)} will be offset against future
                    commissions.
                  </p>
                )}
              </section>
              <section className="rounded-2xl border bg-card p-5 sm:p-6" aria-labelledby="activity-title">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 id="activity-title" className="font-semibold">
                    Commission activity
                  </h2>
                  <span className="text-muted-foreground text-xs">Latest 100 orders · USD</span>
                </div>
                {data.sales.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-10 text-center">
                    <MousePointer2 className="text-muted-foreground size-7" aria-hidden="true" />
                    <h3 className="font-medium">Your first recommendation starts here.</h3>
                    <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
                      A helpful tutorial or a personal recommendation is a good place to start. Use your
                      sharing kit to make it easier.
                    </p>
                    <a href="#sharing-kit" className="mt-1 text-sm font-medium underline underline-offset-4">
                      Open your sharing kit
                    </a>
                  </div>
                ) : (
                  <>
                    <ul className="mt-4 divide-y sm:hidden" aria-label="Commission activity">
                      {data.sales.map((s) => (
                        <li key={s.payment_id} className="flex items-start justify-between gap-4 py-4">
                          <div className="min-w-0">
                            <p className="text-sm font-medium">{date(s.created_at)}</p>
                            <p className="text-muted-foreground mt-1 font-mono text-xs">
                              Order …{s.payment_id.slice(-8)}
                            </p>
                            <Badge variant="secondary" className="mt-2">
                              {s.state === "earned" ? "Earned" : "Reversed"}
                            </Badge>
                          </div>
                          <div className="shrink-0 text-end">
                            <p className="font-mono text-lg font-semibold tabular-nums">
                              {s.state === "earned" ? usd(s.commission_cents) : usd(0)}
                            </p>
                            <p className="text-muted-foreground mt-1 text-xs">commission</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <table className="mt-4 hidden w-full text-sm sm:table">
                      <caption className="sr-only">Your latest commission activity in USD</caption>
                      <thead className="text-muted-foreground border-b text-xs">
                        <tr>
                          {["Order", "Date", "Status", "Commission"].map((label) => (
                            <th
                              key={label}
                              scope="col"
                              className="py-3 pe-4 text-start font-medium last:pe-0 last:text-end"
                            >
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.sales.map((s) => (
                          <tr key={s.payment_id} className="border-b last:border-0">
                            <td className="py-4 pe-4 font-mono text-xs">…{s.payment_id.slice(-12)}</td>
                            <td className="py-4 pe-4">{date(s.created_at)}</td>
                            <td className="py-4 pe-4">
                              <Badge variant="secondary">
                                {s.state === "earned" ? "Earned" : "Reversed"}
                              </Badge>
                            </td>
                            <td className="py-4 text-end font-mono tabular-nums">
                              {s.state === "earned" ? usd(s.commission_cents) : usd(0)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
              </section>
              <section
                id="sharing-kit"
                className="scroll-mt-24 rounded-2xl border bg-card p-5 sm:p-6"
                aria-labelledby="sharing-title"
              >
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <Badge variant="outline">Make your first share easier</Badge>
                    <h2 id="sharing-title" className="mt-3 text-2xl font-semibold tracking-tight">
                      A little help getting the word out.
                    </h2>
                    <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed">
                      Start with a draft, make it sound like you, and keep the disclosure. Your personal link
                      is already included.
                    </p>
                  </div>
                </div>
                <fieldset className="mt-6">
                  <legend className="text-sm font-medium">Choose a starting point</legend>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(
                      [
                        ["short", "Short post"],
                        ["tutorial", "Tutorial"],
                        ["newsletter", "Newsletter"],
                      ] as const
                    ).map(([value, label]) => (
                      <label key={value} className="cursor-pointer">
                        <input
                          type="radio"
                          name="share-format"
                          value={value}
                          checked={format === value}
                          onChange={() => setFormat(value)}
                          className="peer sr-only"
                        />
                        <span className="peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:ring-ring/50 inline-flex rounded-md border px-3 py-2 text-xs font-medium peer-focus-visible:ring-[3px]">
                          {label}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <Field className="mt-4">
                  <FieldLabel htmlFor="share-copy">Suggested copy</FieldLabel>
                  <Textarea
                    id="share-copy"
                    value={shareText}
                    onChange={(event) =>
                      setDrafts((previous) => ({ ...previous, [format]: event.target.value }))
                    }
                    rows={7}
                    className="resize-y text-sm leading-relaxed"
                  />
                  <FieldDescription>
                    Edit this draft to fit your experience and keep the disclosure. Edits stay in this page
                    and clear when you leave.
                  </FieldDescription>
                </Field>
                <div className="mt-4 flex flex-wrap gap-3">
                  <CopyButton text={shareText} label="Copy draft" />
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={drafts[format] === undefined}
                    onClick={() => setDrafts((previous) => ({ ...previous, [format]: undefined }))}
                  >
                    Reset draft
                  </Button>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({ variant: "ghost" })}
                  >
                    Draft a post on X <ArrowUpRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
                  </a>
                </div>
                {resources.length > 0 && (
                  <div className="mt-7 border-t pt-6">
                    <h3 className="text-sm font-medium">Show the actual product</h3>
                    <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                      Public preview images for your recommendation. These are previews, not redistributable
                      Pro source code.
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      {resources.map((r) => (
                        <div key={r.name} className="rounded-xl border bg-muted/20 p-4">
                          <h4 className="text-sm font-medium">{r.title}</h4>
                          <div className="mt-3 flex flex-wrap gap-4">
                            <a
                              href={r.href}
                              className="text-muted-foreground text-xs underline underline-offset-4"
                            >
                              Preview block
                            </a>
                            <a
                              href={r.image}
                              download={`${r.name}-ballmac.webp`}
                              className="inline-flex items-center gap-1.5 text-xs font-medium underline underline-offset-4"
                            >
                              <Download className="size-3" aria-hidden="true" /> Download image
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
              <section
                id="partner-payouts"
                className="scroll-mt-24 rounded-2xl border bg-muted/25 p-5 sm:p-6"
                aria-labelledby="payout-title"
              >
                <div className="flex items-center gap-2">
                  <Wallet className="size-4" aria-hidden="true" />
                  <h2 id="payout-title" className="font-semibold">
                    A clear path from commission to payout.
                  </h2>
                </div>
                <div className="mt-5 grid gap-6 md:grid-cols-2">
                  <div>
                    <p className="text-muted-foreground text-xs">Scheduled review window · UTC</p>
                    <p className="mt-2 text-lg font-semibold tracking-tight">{reviewLabel}</p>
                    <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                      Reviews run from the 1st–15th each month for earlier-month sales. Eligible balances of{" "}
                      {usd(AFFILIATE.minimumPayout)} or more can be reviewed for payment. Smaller balances
                      roll over.
                    </p>
                    <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
                      We confirm a supported payout method and any required tax information privately before
                      your first transfer. A review window is not a guaranteed bank-arrival date.
                    </p>
                  </div>
                  <div className="rounded-xl border bg-card p-4">
                    <Badge variant="outline">
                      {data.affiliate.status === "paused"
                        ? "Partnership paused"
                        : data.totals.balance < 0
                          ? "Balance adjustment"
                          : data.totals.eligible >= AFFILIATE.minimumPayout
                            ? "Ready for payout review"
                            : data.totals.pending > 0
                              ? "Waiting for month-end"
                              : data.totals.balance > 0
                                ? "Below payout minimum"
                                : "No commission balance"}
                    </Badge>
                    <dl className="mt-4 flex flex-col gap-3 text-sm">
                      <div className="flex justify-between gap-3">
                        <dt>Available for payout review</dt>
                        <dd className="shrink-0 font-mono font-medium">{usd(data.totals.eligible)}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt>Pending this month</dt>
                        <dd className="shrink-0 font-mono font-medium">{usd(data.totals.pending)}</dd>
                      </div>
                    </dl>
                    {data.totals.pending > 0 && (
                      <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
                        {usd(data.totals.pending)} is pending until{" "}
                        {data.review.pendingEligibleAt
                          ? date(data.review.pendingEligibleAt)
                          : "the first day of next month"}{" "}
                        (UTC). It then counts toward your eligible balance, subject to payment adjustments.
                      </p>
                    )}
                    <div className="mt-4 flex justify-between gap-3 border-t pt-4 text-sm">
                      <span>Unpaid balance toward minimum</span>
                      <strong className="shrink-0 font-mono font-medium">
                        {usd(Math.max(0, data.totals.balance))} / {usd(AFFILIATE.minimumPayout)}
                      </strong>
                    </div>
                    <progress
                      aria-label="Unpaid balance toward the payout minimum, including pending earnings"
                      max={AFFILIATE.minimumPayout}
                      value={Math.min(Math.max(0, data.totals.balance), AFFILIATE.minimumPayout)}
                      className="accent-primary mt-4 h-2 w-full"
                    />
                    <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
                      {data.totals.balance < 0
                        ? "Payment adjustments exceed your unpaid earnings. Future commissions first cover this balance."
                        : data.totals.eligible >= AFFILIATE.minimumPayout
                          ? "Your eligible balance meets the minimum for review in the scheduled window. Payment is recorded after the transfer is completed."
                          : data.totals.balance >= AFFILIATE.minimumPayout
                            ? `Your unpaid balance meets the minimum, but at least ${usd(AFFILIATE.minimumPayout)} must be eligible before payout review. Pending earnings still need to reach month-end.`
                            : `Another ${usd(AFFILIATE.minimumPayout - data.totals.balance)} in commission reaches the minimum. Pending earnings count toward this goal; only eligible earnings can be reviewed for payment.`}
                    </p>
                    {data.affiliate.status === "paused" && (
                      <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
                        Your partnership is paused. Contact us to confirm the status of any outstanding payout
                        review.
                      </p>
                    )}
                    <a
                      href="/support"
                      className="mt-4 inline-block text-xs font-medium underline underline-offset-4"
                    >
                      Arrange payout details or ask a question
                    </a>
                  </div>
                </div>
                <div className="mt-6 border-t pt-5">
                  <h3 className="text-sm font-medium">Payment history</h3>
                  {data.payouts.length === 0 ? (
                    <p className="text-muted-foreground mt-3 text-sm">
                      No payouts recorded yet. Completed transfers will appear here with their date and
                      reference.
                    </p>
                  ) : (
                    <ul className="mt-3 divide-y">
                      {data.payouts.map((p) => (
                        <li key={p.reference} className="flex items-start justify-between gap-3 py-4">
                          <div className="min-w-0">
                            <p className="text-sm">{date(p.paid_at)}</p>
                            <p className="text-muted-foreground mt-1 break-words text-xs">{p.reference}</p>
                          </div>
                          <span className="shrink-0 font-mono text-sm font-medium">
                            {usd(p.amount_cents)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Commission is 30% of the paid subtotal after the 10% discount, before tax. Payment reversals
                are deducted from the balance.{" "}
                <a href="/affiliates#program-terms" className="underline underline-offset-4">
                  Review the program terms
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
