// Ballmac UI: Northwind contact page. https://ui.ballmac.com/templates/template-northwind
"use client"

import * as React from "react"
import { Check, Mail, MapPin, MessageCircle } from "lucide-react"

import { NorthwindHeading, NorthwindShell, type NorthwindHrefs } from "@/components/ballmac/templates/northwind/northwind-theme"
import { cn } from "@/lib/utils"

const serif = "[font-family:var(--northwind-serif),ui-serif,Georgia,serif]"
const field = "bg-card focus-visible:ring-ring/50 mt-2 h-12 w-full rounded-xl border px-4 text-base outline-none focus-visible:ring-[3px] aria-[invalid=true]:border-destructive"

type Errors = Partial<Record<"name" | "email" | "size", string>>

type NorthwindContactProps = React.ComponentProps<"div"> & { hrefs?: Partial<NorthwindHrefs> }

/** Northwind contact: a demo request form with inline validation, and the other ways to reach the team. */
function NorthwindContact({ hrefs, ...props }: NorthwindContactProps) {
  const [errors, setErrors] = React.useState<Errors>({})
  const [sent, setSent] = React.useState<string | null>(null)
  const [pending, setPending] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  React.useEffect(() => () => clearTimeout(timer.current), [])

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const f = new FormData(form)
    const name = String(f.get("name") ?? "").trim()
    const email = String(f.get("email") ?? "").trim()
    const size = String(f.get("size") ?? "")
    const next: Errors = {}
    if (!name) next.name = "Tell us your name."
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a work email like you@company.com."
    if (!size) next.size = "Choose your team size."
    setErrors(next)
    if (Object.keys(next).length) {
      const first = (["name", "email", "size"] as const).find((k) => next[k])
      ;(form.elements.namedItem(first ?? "name") as HTMLElement | null)?.focus()
      return
    }
    setPending(true)
    timer.current = setTimeout(() => {
      setPending(false)
      setSent(name.split(" ")[0])
    }, 700)
  }

  return (
    <NorthwindShell page="contact" hrefs={hrefs} {...props}>
      <main className="mx-auto grid max-w-6xl gap-14 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
        <div>
          <NorthwindHeading as="h1" className="text-5xl leading-[1.04] sm:text-7xl">Let’s talk about <em>your</em> spend.</NorthwindHeading>
          <p className="text-muted-foreground mt-6 max-w-lg text-lg text-pretty">Tell us a little about your team. We’ll book a 30-minute walkthrough built around how you spend today. No slides.</p>
          {sent ? (
            <div role="status" className="bg-card mt-10 rounded-3xl border p-8">
              <span className="bg-chart-1/15 text-chart-1 flex size-12 items-center justify-center rounded-full"><Check className="size-6" aria-hidden="true" /></span>
              <p className={cn("mt-5 text-3xl", serif)}>Thanks, {sent}.</p>
              <p className="text-muted-foreground mt-2 text-pretty">We’ll email you within one business day with a few times that work.</p>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="mt-10 space-y-5">
              <div>
                <label htmlFor="nw-name" className="text-sm font-medium">Full name</label>
                <input id="nw-name" name="name" autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? "nw-name-err" : undefined} className={field} />
                {errors.name && <p id="nw-name-err" className="text-destructive mt-1.5 text-sm">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="nw-email" className="text-sm font-medium">Work email</label>
                <input id="nw-email" name="email" type="email" autoComplete="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? "nw-email-err" : undefined} className={field} />
                {errors.email && <p id="nw-email-err" className="text-destructive mt-1.5 text-sm">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="nw-size" className="text-sm font-medium">Team size</label>
                <select id="nw-size" name="size" defaultValue="" aria-invalid={!!errors.size} aria-describedby={errors.size ? "nw-size-err" : undefined} className={field}>
                  <option value="" disabled>Choose one</option>
                  <option>1–25 people</option><option>26–100 people</option><option>101–500 people</option><option>500+ people</option>
                </select>
                {errors.size && <p id="nw-size-err" className="text-destructive mt-1.5 text-sm">{errors.size}</p>}
              </div>
              <div>
                <label htmlFor="nw-note" className="text-sm font-medium">What would you like to fix? <span className="text-muted-foreground font-normal">(optional)</span></label>
                <textarea id="nw-note" name="note" rows={4} className={cn(field, "h-auto py-3")} />
              </div>
              <button type="submit" disabled={pending} className="bg-primary text-primary-foreground focus-visible:ring-ring/50 inline-flex h-13 items-center rounded-full px-8 text-base font-medium outline-none transition-opacity hover:opacity-90 focus-visible:ring-[3px] disabled:opacity-60">
                {pending ? "Sending…" : "Request a demo"}
              </button>
            </form>
          )}
        </div>
        <aside className="space-y-4 lg:pt-4" aria-label="Other ways to reach us">
          {[
            { icon: Mail, title: "Sales", text: "sales@northwind.example", note: "Replies within one business day." },
            { icon: MessageCircle, title: "Support", text: "help@northwind.example", note: "Existing customers: weekdays, 6am to 6pm Pacific." },
            { icon: MapPin, title: "Portland", text: "410 SW Alder St, Suite 300", note: "Toronto and London offices on request." },
          ].map((c) => (
            <div key={c.title} className="bg-card flex gap-4 rounded-2xl border p-6">
              <span className="bg-chart-2/15 text-chart-2 flex size-11 shrink-0 items-center justify-center rounded-full"><c.icon className="size-5" aria-hidden="true" /></span>
              <div><h2 className="font-semibold">{c.title}</h2><p className="mt-0.5">{c.text}</p><p className="text-muted-foreground mt-1 text-sm">{c.note}</p></div>
            </div>
          ))}
        </aside>
      </main>
    </NorthwindShell>
  )
}

export { NorthwindContact, type NorthwindContactProps }
