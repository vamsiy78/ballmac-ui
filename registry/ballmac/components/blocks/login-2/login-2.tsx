// Ballmac UI: Login 2. https://ui.ballmac.com/blocks/login-2
"use client"

import * as React from "react"
import { ArrowRight, Fingerprint, KeyRound, Quote } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { Checkbox } from "@/components/ballmac/checkbox"
import { Field, FieldError, FieldGroup, FieldLabel, useFieldControl } from "@/components/ballmac/field"
import { Input } from "@/components/ballmac/input"
import { PasswordInput } from "@/components/ballmac/password-input"
import { cn } from "@/lib/utils"
import { Media, type MediaSource } from "@/components/ballmac/media"

type Login2Values = { email: string; password: string; remember: boolean }

type Login2Props = Omit<React.ComponentProps<"section">, "title" | "onSubmit"> & {
  /** Brand name beside the logo mark. */
  brand?: string
  /** Your logo mark instead of the brand's first letter: an image URL, an object with alt text and a dark-mode file, or your own element. A plain URL is described by the brand name. */
  logo?: MediaSource
  /** Heading. */
  title?: string
  /** One sentence under the heading. */
  description?: string
  /** Called with the values once they are valid. Throw to show `errorMessage`; resolve to finish. */
  onSubmit?: (values: Login2Values) => void | Promise<void>
  /** Called by "Continue with SSO". Pass null to hide the button. */
  onSso?: (() => void) | null
  /** Called by "Use a passkey". Pass null to hide the button. */
  onPasskey?: (() => void) | null
  /** Shown above the form when onSubmit throws. */
  errorMessage?: string
  /** Where "Forgot password?" goes. */
  forgotHref?: string
  /** Where "Create an account" goes. */
  signupHref?: string
  /** Quote on the picture side. */
  quote?: string
  /** Who said it. */
  author?: { name: string; role: string }
  /** Replaces the picture side with your own element. Hidden below the lg breakpoint. */
  visual?: React.ReactNode
  /** A photo or illustration for the picture side: an image URL (give it imageAlt), an object with alt text and a dark-mode file, or your own element. */
  image?: MediaSource
  /** Describes `image` when it is a plain URL. */
  imageAlt?: string
}

function FieldInput(props: React.ComponentProps<typeof Input>) {
  return <Input {...useFieldControl()} {...props} />
}
function FieldPassword(props: React.ComponentProps<typeof PasswordInput>) {
  return <PasswordInput {...useFieldControl()} {...props} />
}

const emailPattern = /^\S+@\S+\.\S+$/

function Login2({
  brand = "Acme",
  logo,
  title = "Welcome back",
  description = "Sign in to pick up where you left off.",
  onSubmit,
  onSso = () => {},
  onPasskey = () => {},
  errorMessage = "That email and password don’t match. Try again, or reset your password.",
  forgotHref = "#",
  signupHref = "#",
  quote = "We moved our entire finance team over in an afternoon. The calm, fast interface is the reason people actually use it.",
  author = { name: "Priya Raman", role: "VP Finance, Northwind" },
  visual,
  image,
  imageAlt,
  className,
  ...props
}: Login2Props) {
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [remember, setRemember] = React.useState(true)
  const [touched, setTouched] = React.useState({ email: false, password: false })
  const [state, setState] = React.useState<"idle" | "sending" | "error">("idle")
  const emailError = touched.email && !emailPattern.test(email) ? "Enter a full email address, like name@company.com." : undefined
  const passwordError = touched.password && !password ? "Enter your password." : undefined

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setTouched({ email: true, password: true })
    if (!emailPattern.test(email) || !password) return
    setState("sending")
    try {
      if (onSubmit) await onSubmit({ email, password, remember })
      else await new Promise((r) => setTimeout(r, 800))
      setState("idle")
    } catch {
      setState("error")
    }
  }

  return (
    <section data-slot="login-2" className={cn("grid min-h-[44rem] lg:grid-cols-2", className)} {...props}>
      <div className="flex items-center justify-center px-4 py-14 sm:px-8">
        <div className="w-full max-w-sm">
          <a href="#" className="focus-visible:ring-ring/50 inline-flex items-center gap-2.5 rounded-md text-lg font-semibold tracking-tight outline-none focus-visible:ring-[3px]">
            {logo ? <Media media={logo} alt={brand} aspect="square" fit="contain" priority className="size-7 shrink-0 rounded-lg" /> : <span aria-hidden="true" className="bg-foreground text-background flex size-7 items-center justify-center rounded-lg text-sm font-bold">{brand[0]}</span>}
            {brand}
          </a>
          <h1 className="mt-10 text-3xl font-semibold tracking-[-0.035em]">{title}</h1>
          <p className="text-muted-foreground mt-2 text-pretty">{description}</p>

          {(onSso || onPasskey) && (
            <div className="mt-8 grid gap-2 sm:grid-cols-2">
              {onSso && <Button variant="outline" onClick={onSso}><KeyRound /> Continue with SSO</Button>}
              {onPasskey && <Button variant="outline" onClick={onPasskey}><Fingerprint /> Use a passkey</Button>}
            </div>
          )}
          <div className="text-muted-foreground my-6 flex items-center gap-3 text-xs" aria-hidden="true">
            <span className="bg-border h-px flex-1" />
            or continue with email
            <span className="bg-border h-px flex-1" />
          </div>

          <form noValidate onSubmit={submit} aria-label="Sign in">
            <FieldGroup>
              {state === "error" && <p role="alert" className="border-destructive/40 text-destructive rounded-lg border px-3 py-2.5 text-sm">{errorMessage}</p>}
              <Field invalid={!!emailError}>
                <FieldLabel>Email</FieldLabel>
                <FieldInput type="email" autoComplete="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => setTouched((t) => ({ ...t, email: true }))} />
                <FieldError errors={[emailError]} />
              </Field>
              <Field invalid={!!passwordError}>
                <div className="flex items-center justify-between">
                  <FieldLabel>Password</FieldLabel>
                  <a href={forgotHref} className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 rounded-sm text-sm underline-offset-4 outline-none hover:underline focus-visible:ring-[3px]">Forgot password?</a>
                </div>
                <FieldPassword showStrength={false} autoComplete="current-password" value={password} onValueChange={setPassword} onBlur={() => setTouched((t) => ({ ...t, password: true }))} />
                <FieldError errors={[passwordError]} />
              </Field>
              <Field orientation="horizontal">
                <Checkbox id="login-2-remember" checked={remember} onCheckedChange={(c) => setRemember(c === true)} />
                <FieldLabel htmlFor="login-2-remember" className="font-normal">Keep me signed in</FieldLabel>
              </Field>
              <Button type="submit" size="lg" shape="pill" loading={state === "sending"} className="w-full">
                Sign in <ArrowRight  className="rtl:rotate-180"/>
              </Button>
            </FieldGroup>
          </form>

          <p className="text-muted-foreground mt-8 text-center text-sm">
            New to {brand}?{" "}
            <a href={signupHref} className="text-foreground focus-visible:ring-ring/50 rounded-sm font-medium underline underline-offset-4 outline-none focus-visible:ring-[3px]">Create an account</a>
          </p>
        </div>
      </div>

      <div className="bg-muted/40 relative hidden overflow-hidden border-s lg:block" aria-hidden={visual || image ? undefined : true}>
        {image ? <Media media={image} alt={imageAlt} fill priority className="absolute inset-0" /> : visual ?? (
          <>
            <div className="absolute inset-0">
              <div className="bg-chart-1/25 absolute -top-24 -end-16 size-[30rem] rounded-full blur-[100px]" />
              <div className="bg-chart-3/25 absolute top-1/2 -start-24 size-[26rem] rounded-full blur-[100px]" />
              <div className="bg-chart-5/20 absolute -bottom-24 end-1/4 size-[24rem] rounded-full blur-[100px]" />
              <div className="absolute inset-0 bg-[radial-gradient(color-mix(in_oklch,var(--foreground)_14%,transparent)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(70%_70%_at_50%_50%,black,transparent)]" />
            </div>
            <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
              <div className="bg-card/80 ms-auto w-64 rounded-2xl border p-4 shadow-[0_24px_60px_-30px_rgb(0_0_0/0.4)] backdrop-blur-xl">
                <p className="text-muted-foreground text-xs">Paid this week</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">$128,430</p>
                <div className="mt-3 flex h-10 items-end gap-1">
                  {[30, 48, 40, 62, 55, 78, 92].map((h, i) => (
                    <span key={i} className={cn("flex-1 rounded-t", i === 6 ? "bg-chart-1" : "bg-chart-1/30")} style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
              <figure className="bg-card/80 max-w-lg rounded-3xl border p-8 shadow-[0_30px_80px_-40px_rgb(0_0_0/0.45)] backdrop-blur-xl">
                <Quote className="text-chart-1 size-8 rtl:-scale-x-100" />
                <blockquote className="mt-4 text-xl leading-snug font-medium tracking-[-0.02em] text-balance">{quote}</blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span className="bg-chart-1/25 flex size-10 items-center justify-center rounded-full text-sm font-semibold">{author.name.split(" ").map((w) => w[0]).join("")}</span>
                  <span className="text-sm"><span className="block font-medium">{author.name}</span><span className="text-muted-foreground">{author.role}</span></span>
                </figcaption>
              </figure>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export { Login2, type Login2Props, type Login2Values }
