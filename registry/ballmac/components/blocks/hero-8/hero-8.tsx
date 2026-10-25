// Ballmac UI: Hero 8. https://ui.ballmac.com/blocks/hero-8
"use client"

import * as React from "react"
import { ArrowRight, Check, CircleAlert, Loader2, Star } from "lucide-react"
import { motion } from "motion/react"

import { useLoopsPaused, useReducedMotionSafe } from "@/lib/ballmac/motion"
import { cn } from "@/lib/utils"

type Hero8Props = Omit<React.ComponentProps<"section">, "title"> & {
  /** The small announcement above the headline. */
  announcement?: { text: string; href: string }
  title?: string
  description?: string
  /** The button label. */
  action?: string
  /** What sits under the form, for example the terms. */
  fineprint?: string
  /** Called with the email. Resolve to show success; reject with a message to show it as the reason. */
  onSubmit?: (email: string) => void | Promise<void>
  /** Short proof under the form. */
  proof?: { rating: string; text: string; people: string[] }
  /** What the success message says. */
  successText?: string
}

const TASKS = [
  { t: "Draft the launch post", who: "AM", done: true },
  { t: "Review pricing page copy", who: "JL", done: true },
  { t: "Ship the new onboarding", who: "SK", done: false },
  { t: "Reply to 12 customer threads", who: "DR", done: false },
]

/** A product screen made of theme tokens. It is decoration, so it is inert and hidden from assistive technology. */
function Screen({ reduced }: { reduced: boolean }) {
  return (
    <div aria-hidden="true" inert className="relative mx-auto w-full max-w-md">
      <motion.div animate={reduced ? undefined : { y: [0, -8, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} className="rounded-2xl border bg-card p-5 pb-24 shadow-xl shadow-foreground/5">
        <div className="mb-4 flex items-center justify-between">
          <div><p className="text-xs text-muted-foreground">Today</p><p className="text-lg font-semibold tracking-[-0.02em]">Launch week</p></div>
          <span className="rounded-full border px-2.5 py-1 text-xs font-medium tabular-nums">2 of 4 done</span>
        </div>
        <ul className="grid gap-2">
          {TASKS.map((x) => (
            <li key={x.t} className="flex items-center gap-3 rounded-xl border bg-background px-3 py-2.5 text-sm">
              <span className={cn("flex size-5 shrink-0 items-center justify-center rounded-full border", x.done ? "border-foreground bg-foreground text-background" : "")}>{x.done && <Check className="size-3" strokeWidth={3} />}</span>
              <span className={cn("flex-1", x.done && "text-muted-foreground line-through")}>{x.t}</span>
              <span className="flex size-6 items-center justify-center rounded-full bg-muted text-[10px] font-semibold">{x.who}</span>
            </li>
          ))}
        </ul>
      </motion.div>
      <motion.div animate={reduced ? undefined : { y: [0, 8, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.8 }} className="absolute -start-6 -bottom-8 w-48 rounded-xl border bg-card p-3.5 shadow-lg shadow-foreground/5 max-sm:start-0">
        <p className="text-[11px] text-muted-foreground">Team activity</p>
        <p className="mt-0.5 text-2xl font-semibold tracking-[-0.03em] tabular-nums">+38%</p>
        <svg viewBox="0 0 120 32" className="mt-1 h-7 w-full text-foreground"><polyline points="0,26 15,22 30,24 45,16 60,18 75,10 90,12 105,5 120,3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </motion.div>
      <motion.div animate={reduced ? undefined : { y: [0, -6, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.6 }} className="absolute -end-4 -top-5 rounded-full border bg-card px-3.5 py-2 text-xs font-medium shadow-lg shadow-foreground/5 max-sm:end-0">
        <span className="me-1.5 inline-block size-2 rounded-full bg-chart-2" />Sam shipped onboarding
      </motion.div>
    </div>
  )
}

/**
 * A hero that asks for one thing: an email. The form checks the address as you leave it, says what happened (working, done, or why not), and never loses what you
 * typed. Beside it a product screen floats, and holds still with reduced motion.
 */
function Hero8({ announcement = { text: "New: shared workspaces", href: "#" }, title = "The calm way to run a team", description = "Plans, tasks and conversations in one place that stays out of your way. Set up in two minutes, and your whole team can be in by lunch.", action = "Get started free", fineprint = "Free for up to 5 people. No card needed.", onSubmit, proof = { rating: "4.9", text: "from 1,200 teams", people: ["AM", "JL", "SK", "DR", "MP"] }, successText = "You are in. Check your inbox for a link to set up your workspace.", className, ...props }: Hero8Props) {
  const id = React.useId()
  const paused = useLoopsPaused()
  const reduced = useReducedMotionSafe() || paused
  const [email, setEmail] = React.useState("")
  const [touched, setTouched] = React.useState(false)
  const [phase, setPhase] = React.useState<"idle" | "busy" | "done">("idle")
  const [error, setError] = React.useState<string | null>(null)
  const valid = /^\S+@\S+\.\S+$/.test(email)
  const invalid = touched && !valid && email !== ""
  const message = error ?? (invalid ? "That does not look like an email address. Try name@company.com." : null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (!valid) {
      setError(null)
      return
    }
    setPhase("busy")
    setError(null)
    try {
      await (onSubmit ? onSubmit(email) : new Promise((r) => setTimeout(r, 900)))
      setPhase("done")
    } catch (err) {
      setPhase("idle")
      setError(err instanceof Error ? err.message : "That did not work, and nothing was saved. Try again in a moment.")
    }
  }

  return (
    <section data-slot="hero-8" aria-labelledby={`${id}-title`} className={cn("mx-auto grid w-full max-w-6xl items-center gap-16 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:py-24", className)} {...props}>
      <div className="grid justify-items-start gap-6">
        <a href={announcement.href} className="group inline-flex items-center gap-2 rounded-full border bg-card py-1 ps-1 pe-3 text-sm outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none">
          <span className="rounded-full bg-foreground px-2 py-0.5 text-xs font-medium text-background">New</span>
          {announcement.text}
          <ArrowRight aria-hidden="true" className="size-3.5 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5 motion-reduce:transition-none" />
        </a>
        <h1 id={`${id}-title`} className="text-5xl font-semibold tracking-[-0.045em] text-balance sm:text-6xl">{title}</h1>
        <p className="max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">{description}</p>
        {phase === "done" ? (
          <p role="status" className="flex max-w-md items-start gap-3 rounded-xl border bg-card px-4 py-3.5 text-sm">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-foreground text-background"><Check aria-hidden="true" className="size-3" strokeWidth={3} /></span>
            {successText}
          </p>
        ) : (
          <form noValidate onSubmit={(e) => void submit(e)} className="grid w-full max-w-md gap-2">
            <label htmlFor={`${id}-email`} className="sr-only">Work email</label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input id={`${id}-email`} type="email" autoComplete="email" inputMode="email" placeholder="you@company.com" value={email} onChange={(e) => { setEmail(e.target.value); setError(null) }} onBlur={() => setTouched(true)} aria-invalid={!!message} aria-describedby={`${id}-help`} className="h-12 min-w-0 flex-1 rounded-xl border bg-card px-4 text-base outline-none placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive" />
              <button type="submit" disabled={phase === "busy"} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-foreground px-6 text-base font-medium text-background outline-none transition-opacity hover:opacity-90 focus-visible:ring-[3px] focus-visible:ring-ring/60 disabled:opacity-70 motion-reduce:transition-none">
                {phase === "busy" ? <><Loader2 aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />Working</> : action}
              </button>
            </div>
            <p id={`${id}-help`} role={message ? "alert" : undefined} className={cn("flex min-h-5 items-center gap-1.5 text-sm", message ? "font-medium text-destructive" : "text-muted-foreground")}>{message && <CircleAlert aria-hidden="true" className="size-4 shrink-0" />}{message ?? fineprint}</p>
          </form>
        )}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <ul aria-label="Some of the people using it" className="flex -space-x-2 rtl:space-x-reverse">
            {proof.people.map((p, i) => <li key={p} className="flex size-8 items-center justify-center rounded-full border-2 border-background bg-muted text-[11px] font-semibold" style={{ zIndex: proof.people.length - i }}>{p}</li>)}
          </ul>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <span aria-hidden="true" className="flex">{[1, 2, 3, 4, 5].map((n) => <Star key={n} className="size-4 fill-foreground text-foreground" />)}</span>
            <span><span className="font-medium text-foreground">{proof.rating} out of 5</span> {proof.text}</span>
          </p>
        </div>
      </div>
      <Screen reduced={reduced} />
    </section>
  )
}

export { Hero8, type Hero8Props }
