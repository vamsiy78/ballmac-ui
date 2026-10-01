// Ballmac UI: Contact 1. https://ui.ballmac.com/blocks/contact-1
"use client"

import * as React from "react"
import { ArrowRight, Check, Mail, MapPin, MessageCircle, Phone } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { Checkbox } from "@/components/ballmac/checkbox"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, useFieldControl } from "@/components/ballmac/field"
import { Input } from "@/components/ballmac/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ballmac/select"
import { StatusDot } from "@/components/ballmac/status-dot"
import { Textarea } from "@/components/ballmac/textarea"
import { cn } from "@/lib/utils"

type Contact1Values = { name: string; email: string; topic: string; message: string }

type Contact1Method = {
  /** Icon in the tile. */
  icon?: React.ReactNode
  label: string
  /** The detail, e.g. an address. */
  value: string
  /** Where it links to (mailto:, tel:, a chat page). */
  href?: string
}

type Contact1Props = Omit<React.ComponentProps<"section">, "title" | "onSubmit"> & {
  /** Section heading. */
  title?: string
  /** One or two sentences under the heading. */
  description?: string
  /** Ways to reach you besides the form. */
  methods?: Contact1Method[]
  /** Topics in the dropdown. */
  topics?: string[]
  /** How quickly you reply, shown with a status dot. Pass null to hide it. */
  responseTime?: string | null
  /** Longest message in characters. */
  maxLength?: number
  /** Called with the validated values. Throw to show an error; resolve to show the thank-you screen. Defaults to a short simulated delay. */
  onSubmit?: (values: Contact1Values) => void | Promise<void>
}

const defaultMethods: Contact1Method[] = [
  { icon: <Mail />, label: "Email", value: "hello@acme.com", href: "mailto:hello@acme.com" },
  { icon: <MessageCircle />, label: "Live chat", value: "Weekdays, 9am to 6pm CET", href: "#" },
  { icon: <Phone />, label: "Phone", value: "+351 21 000 0000", href: "tel:+351210000000" },
  { icon: <MapPin />, label: "Office", value: "Rua das Flores 12, Lisbon", href: "#" },
]

function FieldInput(props: React.ComponentProps<typeof Input>) {
  return <Input {...useFieldControl()} {...props} />
}
function TopicTrigger(props: React.ComponentProps<typeof SelectTrigger>) {
  const { id, disabled, ...aria } = useFieldControl()
  return <SelectTrigger id={id} disabled={disabled} className="w-full" {...aria} {...props} />
}
function MessageBox(props: React.ComponentProps<typeof Textarea>) {
  return <Textarea {...useFieldControl()} {...props} />
}

const emailPattern = /^\S+@\S+\.\S+$/

function validate(v: Contact1Values, consent: boolean, topics: string[]) {
  const errors: Partial<Record<keyof Contact1Values | "consent", string>> = {}
  if (!v.name.trim()) errors.name = "Tell us your name."
  if (!emailPattern.test(v.email)) errors.email = "Enter a full email address, like name@acme.com."
  if (topics.length && !v.topic) errors.topic = "Choose what this is about."
  if (v.message.trim().length < 10) errors.message = "Write at least a sentence so we can help."
  if (!consent) errors.consent = "Please agree so we can reply to you."
  return errors
}

function Contact1({
  title = "Let’s talk.",
  description = "Questions about pricing, a partnership or something that isn’t working? Send a note and a real person will reply.",
  methods = defaultMethods,
  topics = ["Sales", "Support", "Partnerships", "Press", "Something else"],
  responseTime = "We usually reply within 4 hours",
  maxLength = 600,
  onSubmit,
  className,
  ...props
}: Contact1Props) {
  const [values, setValues] = React.useState<Contact1Values>({ name: "", email: "", topic: "", message: "" })
  const [consent, setConsent] = React.useState(false)
  const [touched, setTouched] = React.useState<Record<string, boolean>>({})
  const [state, setState] = React.useState<"idle" | "sending" | "done" | "error">("idle")
  const formRef = React.useRef<HTMLFormElement>(null)
  const errors = validate(values, consent, topics)
  const show = (k: keyof typeof errors) => (touched[k] ? errors[k] : undefined)
  const set = <K extends keyof Contact1Values>(k: K, v: Contact1Values[K]) => setValues((p) => ({ ...p, [k]: v }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setTouched({ name: true, email: true, topic: true, message: true, consent: true })
    const first = Object.keys(errors)[0]
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[data-field="${first}"] input, [data-field="${first}"] textarea, [data-field="${first}"] button`)?.focus()
      return
    }
    setState("sending")
    try {
      if (onSubmit) await onSubmit(values)
      else await new Promise((r) => setTimeout(r, 900))
      setState("done")
    } catch {
      setState("error")
    }
  }

  function reset() {
    setValues({ name: "", email: "", topic: "", message: "" })
    setConsent(false)
    setTouched({})
    setState("idle")
  }

  return (
    <section data-slot="contact-1" className={cn("mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28", className)} {...props}>
      <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
        <div className="min-w-0">
          <h2 className="text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl lg:text-5xl">{title}</h2>
          <p className="text-muted-foreground mt-4 max-w-md text-lg text-pretty">{description}</p>
          {responseTime && (
            <div className="mt-6 inline-flex rounded-full border px-3.5 py-1.5">
              <StatusDot status="online" pulse label={responseTime} className="text-sm" />
            </div>
          )}
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {methods.map((m) => (
              <li key={m.label}>
                <a
                  href={m.href}
                  className="group/method hover:bg-accent focus-visible:ring-ring/50 flex h-full items-start gap-4 rounded-2xl border p-4 outline-none transition-colors focus-visible:ring-[3px]"
                >
                  <span aria-hidden="true" className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-xl [&_svg]:size-5">{m.icon ?? <Mail />}</span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{m.label}</span>
                    <span className="text-muted-foreground block text-sm break-words">{m.value}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-card relative min-w-0 rounded-3xl border p-6 shadow-[0_30px_80px_-50px_rgb(0_0_0/0.4)] sm:p-8">
          {state === "done" ? (
            <div role="status" className="flex min-h-[26rem] flex-col items-center justify-center text-center">
              <span className="bg-chart-2/15 flex size-14 items-center justify-center rounded-full">
                <Check className="size-7" aria-hidden="true" />
              </span>
              <h3 className="mt-6 text-2xl font-semibold tracking-[-0.02em]">Message sent</h3>
              <p className="text-muted-foreground mt-2 max-w-xs text-pretty">Thanks, {values.name.split(" ")[0]}. We’ll reply to {values.email} soon.</p>
              <Button variant="outline" shape="pill" className="mt-8" onClick={reset}>Send another message</Button>
            </div>
          ) : (
            <form ref={formRef} noValidate onSubmit={submit} aria-label="Contact form">
              <FieldGroup>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field invalid={!!show("name")} data-field="name">
                    <FieldLabel required>Name</FieldLabel>
                    <FieldInput autoComplete="name" placeholder="Jordan Lee" value={values.name} onChange={(e) => set("name", e.target.value)} onBlur={() => setTouched((t) => ({ ...t, name: true }))} />
                    <FieldError errors={[show("name")]} />
                  </Field>
                  <Field invalid={!!show("email")} data-field="email">
                    <FieldLabel required>Email</FieldLabel>
                    <FieldInput type="email" autoComplete="email" placeholder="jordan@company.com" value={values.email} onChange={(e) => set("email", e.target.value)} onBlur={() => setTouched((t) => ({ ...t, email: true }))} />
                    <FieldError errors={[show("email")]} />
                  </Field>
                </div>
                {topics.length > 0 && (
                  <Field invalid={!!show("topic")} data-field="topic">
                    <FieldLabel required>What is this about?</FieldLabel>
                    <Select value={values.topic} onValueChange={(v) => { set("topic", v); setTouched((t) => ({ ...t, topic: true })) }}>
                      <TopicTrigger>
                        <SelectValue placeholder="Choose a topic" />
                      </TopicTrigger>
                      <SelectContent>
                        {topics.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError errors={[show("topic")]} />
                  </Field>
                )}
                <Field invalid={!!show("message")} data-field="message">
                  <FieldLabel required>Message</FieldLabel>
                  <MessageBox rows={5} maxLength={maxLength} placeholder="How can we help?" value={values.message} onChange={(e) => set("message", e.target.value)} onBlur={() => setTouched((t) => ({ ...t, message: true }))} />
                  <div className="flex items-start justify-between gap-3">
                    <FieldError errors={[show("message")]} />
                    <FieldDescription className="ml-auto text-xs tabular-nums">{values.message.length}/{maxLength}</FieldDescription>
                  </div>
                </Field>
                <Field orientation="horizontal" invalid={!!show("consent")} data-field="consent">
                  <Checkbox id="contact-consent" checked={consent} onCheckedChange={(c) => { setConsent(c === true); setTouched((t) => ({ ...t, consent: true })) }} aria-invalid={!!show("consent") || undefined} />
                  <div className="grid gap-1">
                    <FieldLabel htmlFor="contact-consent" className="font-normal">I agree to be contacted about this request.</FieldLabel>
                    <FieldError errors={[show("consent")]} />
                  </div>
                </Field>
                {state === "error" && <p role="alert" className="text-destructive text-sm">Something went wrong sending your message. Please try again, or email us directly.</p>}
                <Button type="submit" size="lg" shape="pill" loading={state === "sending"} className="w-full">
                  {state === "sending" ? "Sending…" : <>Send message <ArrowRight /></>}
                </Button>
              </FieldGroup>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

export { Contact1, type Contact1Props, type Contact1Values, type Contact1Method }
