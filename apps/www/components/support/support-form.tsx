"use client"

import { Bug, CheckCircle2, CreditCard, HelpCircle, Lightbulb, TriangleAlert } from "lucide-react"
import { useSearchParams } from "next/navigation"
import * as React from "react"

import { Button } from "@/components/ballmac/button"
import { Input } from "@/components/ballmac/input"
import { Textarea } from "@/components/ballmac/textarea"
import { isSupportTopic, supportLimits, supportPlans, supportTopics, validateSupport, type SupportErrors, type SupportPlan, type SupportTopic } from "@/lib/support"
import { cn } from "@/lib/utils"

const icons: Record<SupportTopic, React.ComponentType<{ className?: string }>> = { bug: Bug, help: HelpCircle, license: CreditCard, feature: Lightbulb }

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent"; confirmation: boolean } | { kind: "error"; message: string }

/** The support form. `?topic=bug|help|license|feature` and `?about=...` pre-fill it, so other pages can link straight to the right kind of message. */
export function SupportForm({ email }: { email: string }) {
  const params = useSearchParams()
  const id = React.useId()
  const [topic, setTopic] = React.useState<SupportTopic | "">(() => {
    const t = params.get("topic")
    return isSupportTopic(t) ? t : ""
  })
  const [plan, setPlan] = React.useState<SupportPlan>("free")
  const [name, setName] = React.useState("")
  const [from, setFrom] = React.useState("")
  const [item, setItem] = React.useState(() => (params.get("about") ?? "").slice(0, supportLimits.item))
  const [message, setMessage] = React.useState("")
  const [errors, setErrors] = React.useState<SupportErrors>({})
  const [status, setStatus] = React.useState<Status>({ kind: "idle" })
  const sentRef = React.useRef<HTMLHeadingElement>(null)

  React.useEffect(() => {
    if (status.kind === "sent") sentRef.current?.focus()
  }, [status.kind])

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (status.kind === "sending") return
    const honeypot = (new FormData(e.currentTarget).get("website") as string) ?? ""
    const found = validateSupport({ topic: topic as SupportTopic, plan, name, email: from, item, message })
    setErrors(found)
    if (Object.keys(found).length) {
      const first = found.topic ? "topic" : found.email ? "email" : "message"
      document.getElementById(`${id}-${first}`)?.focus()
      return
    }
    setStatus({ kind: "sending" })
    try {
      const res = await fetch("/api/support", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ topic, plan, name, email: from, item, message, website: honeypot }) })
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; confirmation?: boolean; error?: string; errors?: SupportErrors }
      if (res.ok && data.ok) return setStatus({ kind: "sent", confirmation: data.confirmation !== false })
      if (data.errors) setErrors(data.errors)
      setStatus({ kind: "error", message: data.error ?? "We could not send your message. Please try again." })
    } catch {
      setStatus({ kind: "error", message: "Could not reach the server. Check your connection and try again." })
    }
  }

  if (status.kind === "sent") {
    return (
      <div className="bg-card rounded-2xl border p-8 text-center sm:p-12" role="status">
        <span className="bg-foreground text-background mx-auto flex size-12 items-center justify-center rounded-full" aria-hidden="true">
          <CheckCircle2 className="size-6" />
        </span>
        <h2 ref={sentRef} tabIndex={-1} className="mt-5 text-2xl font-semibold tracking-tight outline-none">
          Message sent
        </h2>
        <p className="text-muted-foreground mx-auto mt-3 max-w-sm leading-relaxed">
          Thanks. We will reply to <span className="text-foreground font-medium">{from}</span> as soon as we can.
          {status.confirmation ? " A copy is on its way to your inbox." : ""}
        </p>
        <Button
          variant="outline"
          className="mt-8"
          onClick={() => {
            setMessage("")
            setItem("")
            setTopic("")
            setStatus({ kind: "idle" })
          }}
        >
          Send another message
        </Button>
      </div>
    )
  }

  const sending = status.kind === "sending"
  const error = (key: keyof SupportErrors) => (errors[key] ? `${id}-${key}-error` : undefined)
  return (
    <form onSubmit={submit} noValidate className="bg-card space-y-7 rounded-2xl border p-6 sm:p-8">
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">What do you need?</legend>
        <div id={`${id}-topic`} role="radiogroup" aria-label="What do you need?" aria-describedby={error("topic")} aria-invalid={errors.topic ? true : undefined} className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {supportTopics.map((t) => {
            const Icon = icons[t.id]
            return (
              <label
                key={t.id}
                className={cn(
                  "has-[:focus-visible]:ring-ring/50 relative flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-[border-color,background-color,box-shadow] has-[:focus-visible]:ring-[3px]",
                  topic === t.id ? "border-foreground bg-accent/60 shadow-xs" : "hover:border-foreground/30 hover:bg-accent/30"
                )}
              >
                <input type="radio" name="topic" value={t.id} checked={topic === t.id} onChange={() => (setTopic(t.id), setErrors((x) => ({ ...x, topic: undefined })))} className="sr-only" />
                <span className={cn("mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border", topic === t.id ? "bg-foreground text-background border-foreground" : "bg-background")} aria-hidden="true">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{t.label}</span>
                  <span className="text-muted-foreground block text-[13px] leading-5">{t.hint}</span>
                </span>
              </label>
            )
          })}
        </div>
        {errors.topic && (
          <p id={`${id}-topic-error`} role="alert" className="text-destructive text-sm">
            {errors.topic}
          </p>
        )}
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor={`${id}-name`} className="text-sm font-medium">
            Name <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <Input id={`${id}-name`} name="name" autoComplete="name" maxLength={supportLimits.name} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label htmlFor={`${id}-email`} className="text-sm font-medium">
            Email
          </label>
          <Input
            id={`${id}-email`}
            name="email"
            type="email"
            autoComplete="email"
            maxLength={supportLimits.email}
            value={from}
            onChange={(e) => (setFrom(e.target.value), setErrors((x) => ({ ...x, email: undefined })))}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={error("email")}
            placeholder="you@example.com"
          />
          {errors.email && (
            <p id={`${id}-email-error`} role="alert" className="text-destructive text-sm">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-[1fr_auto]">
        <div className="space-y-2">
          <label htmlFor={`${id}-item`} className="text-sm font-medium">
            About <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <Input id={`${id}-item`} name="item" maxLength={supportLimits.item} value={item} onChange={(e) => setItem(e.target.value)} placeholder="A component, block or page, for example hero-pro-1" />
        </div>
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Plan</legend>
          <div role="radiogroup" aria-label="Plan" className="bg-muted inline-flex h-9 items-center gap-0.5 rounded-lg p-1">
            {supportPlans.map((p) => (
              <label key={p.id} className={cn("has-[:focus-visible]:ring-ring/50 inline-flex h-7 cursor-pointer items-center rounded-md px-3 text-sm font-medium transition-colors has-[:focus-visible]:ring-[3px]", plan === p.id ? "bg-background shadow-xs" : "text-muted-foreground hover:text-foreground")}>
                <input type="radio" name="plan" value={p.id} checked={plan === p.id} onChange={() => setPlan(p.id)} className="sr-only" />
                {p.label}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="space-y-2">
        <label htmlFor={`${id}-message`} className="text-sm font-medium">
          Message
        </label>
        <Textarea
          id={`${id}-message`}
          name="message"
          rows={7}
          maxLength={supportLimits.message}
          value={message}
          onChange={(e) => (setMessage(e.target.value), setErrors((x) => ({ ...x, message: undefined })))}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={[error("message"), `${id}-message-hint`].filter(Boolean).join(" ")}
          placeholder="What happened, what you expected, and the steps to see it. For a bug, the item name, your framework and any error text help a lot."
        />
        <div className="flex items-start justify-between gap-4">
          <p id={`${id}-message-hint`} className="text-muted-foreground text-[13px] leading-5">
            Please do not paste your licence key. We can find your purchase from your email.
          </p>
          <p className="text-muted-foreground shrink-0 text-[13px] tabular-nums" aria-hidden="true">
            {message.length}/{supportLimits.message}
          </p>
        </div>
        {errors.message && (
          <p id={`${id}-message-error`} role="alert" className="text-destructive text-sm">
            {errors.message}
          </p>
        )}
      </div>

      {/* Honeypot: hidden from people and assistive technology, bots fill it in. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {status.kind === "error" && (
        <p role="alert" className="border-destructive/30 bg-destructive/5 text-destructive flex items-start gap-2.5 rounded-xl border p-3.5 text-sm leading-5">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            {status.message} <a href={`mailto:${email}`} className="font-medium underline underline-offset-4">{email}</a>
          </span>
        </p>
      )}

      <div className="flex flex-col-reverse items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-[13px] leading-5">We reply by email. Your address is only used to answer you.</p>
        <Button type="submit" size="lg" loading={sending} className="sm:min-w-40">
          {sending ? "Sending" : "Send message"}
        </Button>
      </div>
    </form>
  )
}
