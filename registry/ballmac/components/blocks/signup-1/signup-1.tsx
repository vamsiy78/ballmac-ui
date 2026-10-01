// Ballmac UI: Signup 1. https://ui.ballmac.com/blocks/signup-1
"use client"

import * as React from "react"
import { ArrowRight, Check, KeyRound, MailCheck } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { Checkbox } from "@/components/ballmac/checkbox"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, useFieldControl } from "@/components/ballmac/field"
import { Input } from "@/components/ballmac/input"
import { PasswordInput } from "@/components/ballmac/password-input"
import { cn } from "@/lib/utils"

type Signup1Values = { name: string; email: string; password: string }

type Signup1Props = Omit<React.ComponentProps<"section">, "title" | "onSubmit"> & {
  /** Brand name beside the logo mark. */
  brand?: string
  /** Heading on the form. */
  title?: string
  /** One sentence under the heading. */
  description?: string
  /** Label on the submit button. */
  buttonLabel?: string
  /** Called with the values once they are valid. Throw to show an error; resolve to show the confirmation. */
  onSubmit?: (values: Signup1Values) => void | Promise<void>
  /** Called by "Continue with SSO". Pass null to hide the button. */
  onSso?: (() => void) | null
  /** Heading of the benefits column. */
  pitch?: string
  /** Short benefits shown beside the form on large screens. */
  benefits?: string[]
  /** Social proof line under the benefits. */
  proof?: string
  /** Where "Sign in" goes. */
  loginHref?: string
  /** Where the terms and privacy links go. */
  termsHref?: string
}

function FieldInput(props: React.ComponentProps<typeof Input>) {
  return <Input {...useFieldControl()} {...props} />
}
function FieldPassword(props: React.ComponentProps<typeof PasswordInput>) {
  return <PasswordInput {...useFieldControl()} {...props} />
}

const emailPattern = /^\S+@\S+\.\S+$/

function Signup1({
  brand = "Acme",
  title = "Create your account",
  description = "Free for your first three teammates. No card needed.",
  buttonLabel = "Create account",
  onSubmit,
  onSso = () => {},
  pitch = "Everything your team needs to get paid faster.",
  benefits = ["Send your first invoice in under an hour", "Approvals, reminders and reports built in", "Bank-level security and a full audit trail", "Switch plans or cancel at any time"],
  proof = "Joined by 12,400 teams this year",
  loginHref = "#",
  termsHref = "#",
  className,
  ...props
}: Signup1Props) {
  const [v, setV] = React.useState({ name: "", email: "", password: "" })
  const [agree, setAgree] = React.useState(false)
  const [touched, setTouched] = React.useState<Record<string, boolean>>({})
  const [state, setState] = React.useState<"idle" | "sending" | "error" | "done">("idle")
  const errors = {
    name: v.name.trim() ? undefined : "Tell us your name.",
    email: emailPattern.test(v.email) ? undefined : "Enter a full email address, like name@company.com.",
    password: v.password.length >= 8 ? undefined : "Use at least 8 characters.",
    agree: agree ? undefined : "Please accept the terms to continue.",
  }
  const show = (k: keyof typeof errors) => (touched[k] ? errors[k] : undefined)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setTouched({ name: true, email: true, password: true, agree: true })
    if (Object.values(errors).some(Boolean)) return
    setState("sending")
    try {
      if (onSubmit) await onSubmit(v)
      else await new Promise((r) => setTimeout(r, 900))
      setState("done")
    } catch {
      setState("error")
    }
  }

  return (
    <section data-slot="signup-1" className={cn("mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[1fr_28rem] lg:gap-20", className)} {...props}>
      <div className="hidden lg:block">
        <a href="#" className="focus-visible:ring-ring/50 inline-flex items-center gap-2.5 rounded-md text-lg font-semibold tracking-tight outline-none focus-visible:ring-[3px]">
          <span aria-hidden="true" className="bg-foreground text-background flex size-7 items-center justify-center rounded-lg text-sm font-bold">{brand[0]}</span>
          {brand}
        </a>
        <h2 className="mt-10 max-w-md text-4xl font-semibold tracking-[-0.04em] text-balance xl:text-5xl xl:leading-[1.05]">{pitch}</h2>
        {benefits.length > 0 && (
        <ul className="mt-8 space-y-4">
          {benefits.map((b) => (
            <li key={b} className="flex items-start gap-3">
              <span className="bg-chart-2/15 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full"><Check className="size-3.5" aria-hidden="true" /></span>
              <span className="text-pretty">{b}</span>
            </li>
          ))}
        </ul>
        )}
        <div className="mt-10 flex items-center gap-3">
          <div className="flex -space-x-1" aria-hidden="true">
            {["bg-chart-1/30", "bg-chart-3/30", "bg-chart-5/30", "bg-chart-2/30"].map((c, i) => (
              <span key={c} className={cn("ring-background flex size-8 items-center justify-center rounded-full text-[11px] font-semibold ring-2", c)}>{["MK", "JO", "AS", "EF"][i]}</span>
            ))}
          </div>
          <p className="text-muted-foreground text-sm">{proof}</p>
        </div>
      </div>

      <div className="bg-card relative mx-auto w-full max-w-md rounded-3xl border p-6 shadow-[0_30px_80px_-50px_rgb(0_0_0/0.4)] sm:p-8 lg:max-w-none">
        {state === "done" ? (
          <div role="status" className="flex min-h-[26rem] flex-col items-center justify-center text-center">
            <span className="bg-chart-2/15 flex size-14 items-center justify-center rounded-full"><MailCheck className="size-7" aria-hidden="true" /></span>
            <h2 className="mt-6 text-2xl font-semibold tracking-[-0.02em]">Check your inbox</h2>
            <p className="text-muted-foreground mt-2 max-w-xs text-pretty">We sent a confirmation link to <span className="text-foreground font-medium">{v.email}</span>. It expires in 24 hours.</p>
            <a href={loginHref} className="text-foreground focus-visible:ring-ring/50 mt-8 rounded-sm text-sm font-medium underline underline-offset-4 outline-none focus-visible:ring-[3px]">Back to sign in</a>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-semibold tracking-[-0.03em]">{title}</h1>
            <p className="text-muted-foreground mt-1.5 text-sm text-pretty">{description}</p>
            {onSso && (
              <>
                <Button variant="outline" className="mt-6 w-full" onClick={onSso}><KeyRound /> Continue with SSO</Button>
                <div className="text-muted-foreground my-5 flex items-center gap-3 text-xs" aria-hidden="true">
                  <span className="bg-border h-px flex-1" />or with email<span className="bg-border h-px flex-1" />
                </div>
              </>
            )}
            <form noValidate onSubmit={submit} aria-label="Create account" className={cn(!onSso && "mt-6")}>
              <FieldGroup>
                {state === "error" && <p role="alert" className="border-destructive/40 text-destructive rounded-lg border px-3 py-2.5 text-sm">We couldn’t create your account. Please try again.</p>}
                <Field invalid={!!show("name")}>
                  <FieldLabel required>Full name</FieldLabel>
                  <FieldInput autoComplete="name" placeholder="Jordan Lee" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} onBlur={() => setTouched((t) => ({ ...t, name: true }))} />
                  <FieldError errors={[show("name")]} />
                </Field>
                <Field invalid={!!show("email")}>
                  <FieldLabel required>Work email</FieldLabel>
                  <FieldInput type="email" autoComplete="email" placeholder="jordan@company.com" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} onBlur={() => setTouched((t) => ({ ...t, email: true }))} />
                  <FieldError errors={[show("email")]} />
                </Field>
                <Field invalid={!!show("password")}>
                  <FieldLabel required>Password</FieldLabel>
                  <FieldPassword value={v.password} onValueChange={(password) => setV({ ...v, password })} onBlur={() => setTouched((t) => ({ ...t, password: true }))} />
                  <FieldError errors={[show("password")]} />
                  {!v.password && <FieldDescription>At least 8 characters.</FieldDescription>}
                </Field>
                <Field orientation="horizontal" invalid={!!show("agree")}>
                  <Checkbox id="signup-1-agree" checked={agree} onCheckedChange={(c) => { setAgree(c === true); setTouched((t) => ({ ...t, agree: true })) }} />
                  <div className="grid gap-1">
                    <FieldLabel htmlFor="signup-1-agree" className="font-normal">
                      <span>I agree to the <a href={termsHref} className="underline underline-offset-4">Terms</a> and <a href={termsHref} className="underline underline-offset-4">Privacy Policy</a>.</span>
                    </FieldLabel>
                    <FieldError errors={[show("agree")]} />
                  </div>
                </Field>
                <Button type="submit" size="lg" shape="pill" loading={state === "sending"} className="w-full">
                  {buttonLabel} <ArrowRight />
                </Button>
              </FieldGroup>
            </form>
            <p className="text-muted-foreground mt-6 text-center text-sm">
              Already have an account?{" "}
              <a href={loginHref} className="text-foreground focus-visible:ring-ring/50 rounded-sm font-medium underline underline-offset-4 outline-none focus-visible:ring-[3px]">Sign in</a>
            </p>
          </>
        )}
      </div>
    </section>
  )
}

export { Signup1, type Signup1Props, type Signup1Values }
