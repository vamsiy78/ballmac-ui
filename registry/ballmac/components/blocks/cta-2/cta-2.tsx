// Ballmac UI: CTA 2. https://ui.ballmac.com/blocks/cta-2
"use client"

import * as React from "react"
import { Check } from "lucide-react"

import { BeamsBackground } from "@/components/ballmac/beams-background"
import { Button } from "@/components/ballmac/button"
import { Input } from "@/components/ballmac/input"
import { cn } from "@/lib/utils"

type Cta2Props = Omit<React.ComponentProps<"section">, "title" | "onSubmit"> & {
  /** Small label above the heading. */
  eyebrow?: string
  /** The heading. */
  title?: string
  /** One sentence under the heading. */
  description?: string
  /** Submit button text. */
  buttonLabel?: string
  /** Line under the form, e.g. social proof. */
  note?: string
  /** Message shown after a successful signup. */
  successMessage?: string
  /** Called with the email. Throw to show an error; resolve to show the success message. */
  onSubmit?: (email: string) => void | Promise<void>
}

function Cta2({
  eyebrow = "Private beta",
  title = "Join the waitlist.",
  description = "We let new teams in every week. Leave your email and we'll save you a seat.",
  buttonLabel = "Request access",
  note = "No spam. One email when your seat is ready.",
  successMessage = "You're on the list. We'll email you when your seat is ready.",
  onSubmit,
  className,
  ...props
}: Cta2Props) {
  const id = React.useId()
  const [state, setState] = React.useState<"idle" | "sending" | "done" | "error">("idle")
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const email = String(new FormData(event.currentTarget).get("email") ?? "")
    setState("sending")
    try {
      await onSubmit?.(email)
      setState("done")
    } catch {
      setState("error")
    }
  }
  return (
    <section data-slot="cta-2" className={cn("mx-auto max-w-6xl px-4 py-20 sm:px-6", className)} {...props}>
      <div className="relative isolate flex flex-col items-center overflow-hidden rounded-3xl border bg-background px-6 py-24 text-center sm:py-28">
        <BeamsBackground className="-z-10" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_45%_45%_at_50%_50%,var(--background)_25%,transparent)]" />
        <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">{eyebrow}</p>
        <h2 className="mt-3 max-w-xl text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-6xl">{title}</h2>
        <p className="mt-4 max-w-md text-pretty text-muted-foreground">{description}</p>
        {state === "done" ? (
          <p role="status" className="mt-8 inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-2 text-sm font-medium backdrop-blur">
            <Check className="size-4 text-chart-2" aria-hidden="true" />
            {successMessage}
          </p>
        ) : (
          <form onSubmit={submit} className="mt-8 flex w-full max-w-md flex-col gap-2 sm:flex-row">
            <label htmlFor={`${id}-email`} className="sr-only">
              Email address
            </label>
            <Input
              id={`${id}-email`}
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@company.com"
              aria-invalid={state === "error" || undefined}
              aria-describedby={state === "error" ? `${id}-error` : undefined}
              className="h-10 bg-background/70 backdrop-blur"
            />
            <Button type="submit" loading={state === "sending"} className="h-10 shrink-0">
              {buttonLabel}
            </Button>
          </form>
        )}
        {state === "error" ? (
          <p id={`${id}-error`} role="alert" className="mt-3 text-sm text-destructive">
            Something went wrong. Please try again.
          </p>
        ) : (
          state !== "done" && <p className="mt-4 text-xs text-muted-foreground">{note}</p>
        )}
      </div>
    </section>
  )
}

export { Cta2, type Cta2Props }
