// Ballmac UI: Newsletter 1. https://ui.ballmac.com/blocks/newsletter-1
"use client"

import * as React from "react"
import { ArrowRight, Check, Mail } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { Input } from "@/components/ballmac/input"
import { cn } from "@/lib/utils"
import { Media, type MediaSource } from "@/components/ballmac/media"

type Newsletter1Props = Omit<React.ComponentProps<"section">, "title" | "onSubmit"> & {
  /** Label above the heading. */
  eyebrow?: string
  /** Section heading. */
  title?: string
  /** One or two sentences under the heading. */
  description?: string
  /** Topics a reader can choose. Pass an empty array to hide them. */
  topics?: string[]
  /** Topics selected first. */
  defaultTopics?: string[]
  /** Text on the button. */
  buttonLabel?: string
  /** Social proof next to the avatars. */
  proof?: string
  /** Small print under the form. */
  note?: string
  /** Headings shown in the sample issue. */
  issue?: { name: string; number: string; headlines: string[] }
  /** A picture of an issue instead of the sample one. An image URL (give it mediaAlt), an object with alt text and a dark-mode file, or your own element. */
  media?: MediaSource
  /** Describes `media` when it is a plain URL. */
  mediaAlt?: string
  /** Called with the email and the chosen topics. Throw to show an error; resolve to show the thank-you message. */
  onSubmit?: (email: string, topics: string[]) => void | Promise<void>
}

const emailPattern = /^\S+@\S+\.\S+$/

function Newsletter1({
  eyebrow = "The Acme Letter",
  title = "One calm email, every other Thursday.",
  description = "Product notes, customer stories and a few things we found worth reading. Written by people, never padded.",
  topics = ["Product updates", "Engineering", "Design", "Customer stories"],
  defaultTopics = ["Product updates"],
  buttonLabel = "Subscribe",
  proof = "Join 12,400 readers",
  note = "No spam, and you can leave with one click.",
  issue = {
    name: "The Acme Letter",
    number: "Issue 48",
    headlines: ["Why we rebuilt approvals", "Five invoices that got paid in a day", "Reading list: calm software"],
  },
  onSubmit,
  media,
  mediaAlt,
  className,
  ...props
}: Newsletter1Props) {
  const [email, setEmail] = React.useState("")
  const [chosen, setChosen] = React.useState<string[]>(defaultTopics)
  const [state, setState] = React.useState<"idle" | "invalid" | "sending" | "done" | "error">("idle")
  const inputId = React.useId()
  const errorId = `${inputId}-error`

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!emailPattern.test(email)) {
      setState("invalid")
      return
    }
    setState("sending")
    try {
      if (onSubmit) await onSubmit(email, chosen)
      else await new Promise((r) => setTimeout(r, 800))
      setState("done")
    } catch {
      setState("error")
    }
  }

  const toggle = (t: string) => setChosen((c) => (c.includes(t) ? c.filter((x) => x !== t) : [...c, t]))

  return (
    <section data-slot="newsletter-1" className={cn("mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28", className)} {...props}>
      <div className="bg-card relative isolate overflow-hidden rounded-[2rem] border">
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <div className="bg-chart-3/20 absolute -top-24 -end-16 size-[24rem] rounded-full blur-[100px]" />
          <div className="bg-chart-1/15 absolute -bottom-32 -start-10 size-[22rem] rounded-full blur-[100px]" />
        </div>
        <div className="grid items-center gap-12 p-8 sm:p-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:p-16">
          <div className="min-w-0">
            <p className="text-muted-foreground flex items-center gap-2 text-sm font-medium"><Mail className="size-4" aria-hidden="true" />{eyebrow}</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl lg:text-5xl">{title}</h2>
            <p className="text-muted-foreground mt-4 max-w-lg text-lg text-pretty">{description}</p>

            {state === "done" ? (
              <div role="status" className="mt-8 flex max-w-md items-start gap-3 rounded-2xl border bg-background/70 p-4 backdrop-blur">
                <span className="bg-chart-2/15 mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full"><Check className="size-4" aria-hidden="true" /></span>
                <p className="text-sm">
                  <span className="block font-semibold">You’re subscribed.</span>
                  <span className="text-muted-foreground">Check {email} for a confirmation link. Your first issue arrives soon.</span>
                </p>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="mt-8 max-w-md">
                {topics.length > 0 && (
                  <fieldset className="mb-4">
                    <legend className="mb-2 text-sm font-medium">What would you like to read?</legend>
                    <div className="flex flex-wrap gap-1.5">
                      {topics.map((t) => (
                        <button
                          key={t}
                          type="button"
                          aria-pressed={chosen.includes(t)}
                          onClick={() => toggle(t)}
                          className={cn(
                            "focus-visible:ring-ring/50 inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium outline-none transition-colors focus-visible:ring-[3px]",
                            chosen.includes(t) ? "bg-foreground text-background border-transparent" : "bg-background/70 text-muted-foreground hover:text-foreground hover:bg-accent"
                          )}
                        >
                          {chosen.includes(t) && <Check className="size-3.5" aria-hidden="true" />}
                          {t}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                )}
                <div className="flex flex-col gap-2 sm:flex-row">
                  <label htmlFor={inputId} className="sr-only">Email address</label>
                  <Input
                    id={inputId}
                    type="email"
                    size="lg"
                    autoComplete="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (state === "invalid") setState("idle") }}
                    aria-invalid={state === "invalid" || undefined}
                    aria-describedby={state === "invalid" || state === "error" ? errorId : undefined}
                    className="bg-background/80 sm:flex-1"
                  />
                  <Button type="submit" size="lg" shape="pill" loading={state === "sending"}>
                    {state === "sending" ? "Subscribing…" : <>{buttonLabel} <ArrowRight  className="rtl:rotate-180"/></>}
                  </Button>
                </div>
                <p id={errorId} role="alert" className="text-destructive mt-2 min-h-5 text-sm">
                  {state === "invalid" && "Enter a full email address, like name@company.com."}
                  {state === "error" && "We couldn’t subscribe you just now. Please try again."}
                </p>
                <p className="text-muted-foreground text-sm">{note}</p>
              </form>
            )}

            <div className="mt-8 flex items-center gap-3">
              <div className="flex -space-x-1" aria-hidden="true">
                {["bg-chart-1/30", "bg-chart-3/30", "bg-chart-5/30", "bg-chart-2/30"].map((c, i) => (
                  <span key={c} className={cn("ring-card flex size-8 items-center justify-center rounded-full text-[11px] font-semibold ring-2", c)}>{["MK", "JO", "AS", "EF"][i]}</span>
                ))}
              </div>
              <p className="text-muted-foreground text-sm">{proof}</p>
            </div>
          </div>

          {/* A sample issue, so people know what they are signing up for. */}
          <Media media={media} alt={mediaAlt} frame className="mx-auto hidden w-full max-w-sm sm:block" fallback={
          <div aria-hidden="true" className="relative mx-auto hidden w-full max-w-sm sm:block">
            <div className="bg-background/60 absolute inset-0 translate-x-4 translate-y-4 rotate-3 rounded-2xl border" />
            <div className="bg-background relative -rotate-2 rounded-2xl border p-6 shadow-[0_30px_70px_-35px_rgb(0_0_0/0.4)] transition-transform duration-500 hover:rotate-0 motion-reduce:transition-none">
              <div className="flex items-center justify-between border-b pb-4">
                <p className="font-semibold tracking-tight">{issue.name}</p>
                <p className="text-muted-foreground font-mono text-xs">{issue.number}</p>
              </div>
              <div className="bg-chart-1/20 mt-5 h-24 rounded-xl" />
              <ul className="mt-5 space-y-4">
                {issue.headlines.map((h) => (
                  <li key={h}>
                    <p className="text-sm leading-snug font-semibold">{h}</p>
                    <div className="mt-2 space-y-1.5">
                      <div className="bg-muted h-1.5 w-full rounded-full" />
                      <div className="bg-muted h-1.5 w-2/3 rounded-full" />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          } />
        </div>
      </div>
    </section>
  )
}

export { Newsletter1, type Newsletter1Props }
