// Ballmac UI: Studio contact page. https://ui.ballmac.com/templates/template-studio
"use client"

import * as React from "react"
import { Check } from "lucide-react"

import { CopyButton } from "@/components/ballmac/copy-button"
import { StudioShell, studioDisplay, type StudioHrefs } from "@/components/ballmac/templates/studio/studio-theme"
import { cn } from "@/lib/utils"

const mono = { fontFamily: "var(--studio-mono)" } as const
const budgets = ["Under €30k", "€30–60k", "€60–120k", "€120k+"]
const field = "bg-background focus-visible:ring-ring/50 mt-2 h-14 w-full border-2 border-current px-4 text-lg outline-none focus-visible:ring-[3px] aria-[invalid=true]:border-destructive"

type StudioContactProps = React.ComponentProps<"div"> & { hrefs?: Partial<StudioHrefs> }

/** The Studio contact page: a huge email, a project brief form with chips and inline errors, and the two offices. */
function StudioContact({ hrefs, ...props }: StudioContactProps) {
  const [budget, setBudget] = React.useState("")
  const [errors, setErrors] = React.useState<{ name?: string; email?: string; brief?: string }>({})
  const [sent, setSent] = React.useState<string | null>(null)
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const name = String(f.get("name") ?? "").trim()
    const email = String(f.get("email") ?? "").trim()
    const brief = String(f.get("brief") ?? "").trim()
    const next: typeof errors = {}
    if (!name) next.name = "Your name, please."
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "That email doesn’t look right."
    if (brief.length < 20) next.brief = "Tell us a little more: at least a sentence."
    setErrors(next)
    const first = (["name", "email", "brief"] as const).find((k) => next[k])
    if (first) {
      ;(e.currentTarget.elements.namedItem(first) as HTMLElement | null)?.focus()
      return
    }
    setSent(name.split(" ")[0])
  }
  return (
    <StudioShell page="contact" hrefs={hrefs} {...props}>
      <main className="mx-auto max-w-[100rem] px-4 pt-10 sm:px-8 sm:pt-16">
        <h1 className={cn("text-[clamp(3rem,12vw,12rem)]", studioDisplay)}>Say hello</h1>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a href="mailto:hello@hollisvane.example" className="focus-visible:ring-ring/50 decoration-chart-1 rounded text-[clamp(1.4rem,4.4vw,3.6rem)] font-bold tracking-tight break-all underline decoration-4 underline-offset-8 outline-none focus-visible:ring-[3px]">hello@hollisvane.example</a>
          <CopyButton value="hello@hollisvane.example" ariaLabel="Copy email address" className="size-11" />
        </div>
        <div className="mt-20 grid gap-16 lg:grid-cols-[1.4fr_1fr]">
          {sent ? (
            <div role="status" className="bg-chart-1 h-fit p-10 text-[var(--studio-on-accent)]">
              <Check className="size-12" strokeWidth={2.5} aria-hidden="true" />
              <p className={cn("mt-6 text-5xl", studioDisplay)}>Thanks, {sent}.</p>
              <p className="mt-4 max-w-md text-xl text-pretty">We read every brief. One of us will reply within two working days.</p>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="space-y-8">
              <div className="grid gap-8 sm:grid-cols-2">
                <div><label htmlFor="sc-name" className="text-sm font-bold uppercase">Name</label><input id="sc-name" name="name" autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? "sc-name-err" : undefined} className={field} />{errors.name && <p id="sc-name-err" className="text-destructive mt-2 text-sm font-semibold">{errors.name}</p>}</div>
                <div><label htmlFor="sc-email" className="text-sm font-bold uppercase">Email</label><input id="sc-email" name="email" type="email" autoComplete="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? "sc-email-err" : undefined} className={field} />{errors.email && <p id="sc-email-err" className="text-destructive mt-2 text-sm font-semibold">{errors.email}</p>}</div>
              </div>
              <fieldset><legend className="text-sm font-bold uppercase">Budget</legend>
                <div className="mt-3 flex flex-wrap gap-2">{budgets.map((b) => <label key={b} className={cn("focus-within:ring-ring/50 cursor-pointer rounded-full border-2 border-current px-5 py-2.5 font-semibold transition-colors focus-within:ring-[3px]", budget === b ? "bg-foreground text-background" : "hover:bg-chart-3 hover:text-[var(--studio-on-accent)]")}><input type="radio" name="budget" value={b} checked={budget === b} onChange={() => setBudget(b)} className="sr-only" />{b}</label>)}</div>
              </fieldset>
              <div><label htmlFor="sc-brief" className="text-sm font-bold uppercase">The brief</label><textarea id="sc-brief" name="brief" rows={5} aria-invalid={!!errors.brief} aria-describedby={errors.brief ? "sc-brief-err" : undefined} className={cn(field, "h-auto py-3")} />{errors.brief && <p id="sc-brief-err" className="text-destructive mt-2 text-sm font-semibold">{errors.brief}</p>}</div>
              <button type="submit" className="bg-foreground text-background focus-visible:ring-ring/50 inline-flex h-16 items-center rounded-full px-10 text-lg font-bold outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-[3px] motion-reduce:transition-none">Send the brief</button>
            </form>
          )}
          <aside aria-label="Offices" className="space-y-10">
            {[["Lisbon", "Rua da Boavista 12, 1200-066", "Mon to Fri, 9 to 18"], ["Berlin", "Oranienstraße 164, 10969", "Mon to Fri, 9 to 18"]].map(([c, a, t]) => <div key={c} className="border-t-2 pt-4"><h2 className={cn("text-4xl", studioDisplay)}>{c}</h2><p className="mt-3 text-lg">{a}</p><p className="text-muted-foreground text-sm" style={mono}>{t}</p></div>)}
            <p className="text-muted-foreground text-sm text-pretty">Looking for a job instead? We hire one or two people a year, usually after seeing their work somewhere else. Send it anyway.</p>
          </aside>
        </div>
      </main>
    </StudioShell>
  )
}

export { StudioContact, type StudioContactProps }
