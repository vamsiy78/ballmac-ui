// Ballmac UI: Auth Kit forms. https://ui.ballmac.com/templates/template-auth-kit
"use client"

import * as React from "react"
import { ArrowLeft, ArrowRight, Check, MailCheck, ShieldCheck } from "lucide-react"

import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ballmac/input-otp"
import { AuthButton, AuthField, AuthPassword, PasswordStrength, authDefaultHrefs, passwordRules, type AuthHrefs } from "@/components/ballmac/templates/auth-kit/auth-kit-theme"
import { cn } from "@/lib/utils"

type FormProps = { hrefs?: Partial<AuthHrefs> }
const h = (hrefs: FormProps["hrefs"]) => ({ ...authDefaultHrefs, ...hrefs })
const link = "text-primary focus-visible:ring-ring/50 rounded font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-[3px]"
const emailOk = (v: string) => /^\S+@\S+\.\S+$/.test(v.trim())

/** A short simulated request so busy and success states are visible. Swap for your API call. */
function useFake() {
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  React.useEffect(() => () => clearTimeout(timer.current), [])
  return (done: () => void, ms = 700) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(done, ms)
  }
}

function Heading({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <header className="mb-7">
      <h1 className="text-[1.75rem] leading-tight font-semibold tracking-[-0.03em] text-balance">{title}</h1>
      {children && <p className="text-muted-foreground mt-2 text-pretty">{children}</p>}
    </header>
  )
}

function Success({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div role="status">
      <span className="bg-chart-2/15 text-chart-2 flex size-12 items-center justify-center rounded-2xl"><Check className="size-6" aria-hidden="true" /></span>
      <h1 className="mt-5 text-[1.75rem] leading-tight font-semibold tracking-[-0.03em]">{title}</h1>
      <p className="text-muted-foreground mt-2 text-pretty">{children}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

/** Sign in with email and password, or a provider. Validates before it submits. */
function SignInForm({ hrefs }: FormProps) {
  const links = h(hrefs)
  const fake = useFake()
  const [errors, setErrors] = React.useState<{ email?: string; password?: string }>({})
  const [busy, setBusy] = React.useState(false)
  const [done, setDone] = React.useState(false)
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const email = String(f.get("email") ?? "")
    const password = String(f.get("password") ?? "")
    const next: typeof errors = {}
    if (!emailOk(email)) next.email = "Enter an email like you@company.com."
    if (!password) next.password = "Enter your password."
    setErrors(next)
    if (next.email || next.password) {
      ;(e.currentTarget.elements.namedItem(next.email ? "email" : "password") as HTMLElement | null)?.focus()
      return
    }
    setBusy(true)
    fake(() => { setBusy(false); setDone(true) })
  }
  if (done) return <Success title="You’re in" action={<a className={link} href="#">Continue to your workspace →</a>}>Welcome back. We’ll take you to where you left off.</Success>
  return (
    <>
      <Heading title="Welcome back">Sign in to continue to your workspace.</Heading>
      <div className="grid grid-cols-2 gap-3">
        {["Google", "GitHub"].map((p) => <button key={p} type="button" className="hover:bg-accent focus-visible:ring-ring/50 h-11 rounded-xl border text-sm font-medium outline-none transition-colors focus-visible:ring-[3px]">{p}</button>)}
      </div>
      <div className="text-muted-foreground my-6 flex items-center gap-3 text-xs"><span className="bg-border h-px flex-1" />or with email<span className="bg-border h-px flex-1" /></div>
      <form onSubmit={submit} noValidate className="space-y-4">
        <AuthField id="si-email" name="email" type="email" label="Email" autoComplete="email" error={errors.email} />
        <div>
          <AuthPassword id="si-pass" name="password" autoComplete="current-password" error={errors.password} />
          <div className="mt-2.5 flex items-center justify-between text-sm">
            <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" name="remember" className="accent-primary size-4" />Keep me signed in</label>
            <a href={links.forgot} className={link}>Forgot password?</a>
          </div>
        </div>
        <AuthButton type="submit" busy={busy}>{busy ? "Signing in…" : "Sign in"}</AuthButton>
      </form>
      <p className="text-muted-foreground mt-6 text-center text-sm">New here? <a href={links["sign-up"]} className={link}>Create an account</a></p>
    </>
  )
}

/** Create an account with a live password checklist and a terms checkbox. */
function SignUpForm({ hrefs }: FormProps) {
  const links = h(hrefs)
  const fake = useFake()
  const [pw, setPw] = React.useState("")
  const [errors, setErrors] = React.useState<{ name?: string; email?: string; password?: string; terms?: string }>({})
  const [busy, setBusy] = React.useState(false)
  const [email, setEmail] = React.useState<string | null>(null)
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const name = String(f.get("name") ?? "").trim()
    const mail = String(f.get("email") ?? "").trim()
    const next: typeof errors = {}
    if (!name) next.name = "Tell us your name."
    if (!emailOk(mail)) next.email = "Enter an email like you@company.com."
    if (!passwordRules.every((r) => r.test(pw))) next.password = "Meet every rule below to continue."
    if (!f.get("terms")) next.terms = "Agree to the terms to continue."
    setErrors(next)
    const first = (["name", "email", "password", "terms"] as const).find((k) => next[k])
    if (first) {
      ;(e.currentTarget.elements.namedItem(first) as HTMLElement | null)?.focus()
      return
    }
    setBusy(true)
    fake(() => { setBusy(false); setEmail(mail) })
  }
  if (email) return <Success title="Check your email" action={<a className={link} href={links.verify}>Enter the 6-digit code →</a>}>We sent a code to <span className="text-foreground font-medium">{email}</span>. It expires in 10 minutes.</Success>
  return (
    <>
      <Heading title="Create your account">Free for 14 days. No card needed.</Heading>
      <form onSubmit={submit} noValidate className="space-y-4">
        <AuthField id="su-name" name="name" label="Full name" autoComplete="name" error={errors.name} />
        <AuthField id="su-email" name="email" type="email" label="Work email" autoComplete="email" error={errors.email} />
        <div>
          <AuthPassword id="su-pass" name="password" label="Password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} error={errors.password} />
          <PasswordStrength id="su-strength" value={pw} />
        </div>
        <div>
          <label className="flex cursor-pointer items-start gap-2.5 text-sm"><input type="checkbox" name="terms" aria-invalid={!!errors.terms} className="accent-primary mt-0.5 size-4" /><span>I agree to the <a href="#" className={link}>Terms</a> and <a href="#" className={link}>Privacy Policy</a>.</span></label>
          {errors.terms && <p className="text-destructive mt-1.5 text-sm">{errors.terms}</p>}
        </div>
        <AuthButton type="submit" busy={busy}>{busy ? "Creating account…" : "Create account"}</AuthButton>
      </form>
      <p className="text-muted-foreground mt-6 text-center text-sm">Already have an account? <a href={links["sign-in"]} className={link}>Sign in</a></p>
    </>
  )
}

/** Verify with a 6-digit code: auto-submits when complete, and offers a resend after a countdown. */
function VerifyForm({ hrefs }: FormProps) {
  const links = h(hrefs)
  const [code, setCode] = React.useState("")
  const [state, setState] = React.useState<"idle" | "error" | "ok">("idle")
  const [wait, setWait] = React.useState(30)
  React.useEffect(() => {
    if (wait <= 0) return
    const id = setTimeout(() => setWait((w) => w - 1), 1000)
    return () => clearTimeout(id)
  }, [wait])
  if (state === "ok") return <Success title="Email verified" action={<a className={link} href={links.onboarding}>Set up your workspace →</a>}>Thanks. Your account is ready.</Success>
  return (
    <>
      <span className="bg-primary/10 text-primary mb-5 flex size-12 items-center justify-center rounded-2xl"><MailCheck className="size-6" aria-hidden="true" /></span>
      <Heading title="Enter your code">We sent a 6-digit code to <span className="text-foreground font-medium">mina@fieldnote.example</span>. Try 123456.</Heading>
      <label htmlFor="vf-code" className="sr-only">6-digit code</label>
      <InputOTP id="vf-code" maxLength={6} value={code} aria-invalid={state === "error" || undefined} aria-describedby="vf-status" pattern="^[0-9]*$" onChange={(v) => { setCode(v); setState("idle") }} onComplete={(v) => setState(v === "123456" ? "ok" : "error")} containerClassName="justify-center">
        <InputOTPGroup>{[0, 1, 2].map((i) => <InputOTPSlot key={i} index={i} invalid={state === "error"} className="size-12 text-lg" />)}</InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>{[3, 4, 5].map((i) => <InputOTPSlot key={i} index={i} invalid={state === "error"} className="size-12 text-lg" />)}</InputOTPGroup>
      </InputOTP>
      <p id="vf-status" role="status" className={cn("mt-4 text-center text-sm", state === "error" ? "text-destructive" : "text-muted-foreground")}>{state === "error" ? "That code isn’t right. Check it and try again." : "Paste the code, or type it in."}</p>
      <p className="text-muted-foreground mt-6 text-center text-sm">
        Didn’t get it?{" "}
        <button type="button" disabled={wait > 0} onClick={() => { setWait(30); setCode(""); setState("idle") }} className={cn(link, "disabled:text-muted-foreground disabled:no-underline")}>{wait > 0 ? `Resend in ${wait}s` : "Resend the code"}</button>
      </p>
      <p className="mt-3 text-center text-sm"><a href={links["sign-in"]} className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"><ArrowLeft className="size-3.5 rtl:rotate-180" aria-hidden="true" />Back to sign in</a></p>
    </>
  )
}

/** Ask for a reset link. */
function ForgotForm({ hrefs }: FormProps) {
  const links = h(hrefs)
  const fake = useFake()
  const [error, setError] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  const [sent, setSent] = React.useState<string | null>(null)
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const mail = String(new FormData(e.currentTarget).get("email") ?? "").trim()
    if (!emailOk(mail)) {
      setError("Enter an email like you@company.com.")
      ;(e.currentTarget.elements.namedItem("email") as HTMLElement | null)?.focus()
      return
    }
    setError("")
    setBusy(true)
    fake(() => { setBusy(false); setSent(mail) })
  }
  if (sent) return <Success title="Check your email" action={<button type="button" onClick={() => setSent(null)} className={link}>Use a different email</button>}>If an account exists for <span className="text-foreground font-medium">{sent}</span>, a reset link is on its way. It works for one hour.</Success>
  return (
    <>
      <Heading title="Forgot your password?">No problem. Tell us your email and we’ll send a link to choose a new one.</Heading>
      <form onSubmit={submit} noValidate className="space-y-4">
        <AuthField id="fp-email" name="email" type="email" label="Email" autoComplete="email" error={error} />
        <AuthButton type="submit" busy={busy}>{busy ? "Sending…" : "Send reset link"}</AuthButton>
      </form>
      <p className="mt-6 text-center text-sm"><a href={links["sign-in"]} className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"><ArrowLeft className="size-3.5 rtl:rotate-180" aria-hidden="true" />Back to sign in</a></p>
    </>
  )
}

/** Choose a new password, with confirmation. */
function ResetForm({ hrefs }: FormProps) {
  const links = h(hrefs)
  const fake = useFake()
  const [pw, setPw] = React.useState("")
  const [errors, setErrors] = React.useState<{ password?: string; confirm?: string }>({})
  const [busy, setBusy] = React.useState(false)
  const [done, setDone] = React.useState(false)
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const confirm = String(new FormData(e.currentTarget).get("confirm") ?? "")
    const next: typeof errors = {}
    if (!passwordRules.every((r) => r.test(pw))) next.password = "Meet every rule below to continue."
    else if (confirm !== pw) next.confirm = "The passwords don’t match."
    setErrors(next)
    if (next.password || next.confirm) {
      ;(e.currentTarget.elements.namedItem(next.password ? "password" : "confirm") as HTMLElement | null)?.focus()
      return
    }
    setBusy(true)
    fake(() => { setBusy(false); setDone(true) })
  }
  if (done) return <Success title="Password updated" action={<a className={link} href={links["sign-in"]}>Sign in with your new password →</a>}>You’ve been signed out everywhere else for your safety.</Success>
  return (
    <>
      <Heading title="Choose a new password">Pick something you haven’t used before.</Heading>
      <form onSubmit={submit} noValidate className="space-y-4">
        <div>
          <AuthPassword id="rs-pass" name="password" label="New password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} error={errors.password} />
          <PasswordStrength id="rs-strength" value={pw} />
        </div>
        <AuthPassword id="rs-confirm" name="confirm" label="Confirm password" autoComplete="new-password" error={errors.confirm} />
        <AuthButton type="submit" busy={busy}>{busy ? "Saving…" : "Update password"}</AuthButton>
      </form>
    </>
  )
}

/** Accept an invitation to a team. */
function InviteForm({ hrefs }: FormProps) {
  const fake = useFake()
  const [pw, setPw] = React.useState("")
  const [error, setError] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  const [done, setDone] = React.useState(false)
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!passwordRules.every((r) => r.test(pw))) {
      setError("Meet every rule below to continue.")
      ;(e.currentTarget.elements.namedItem("password") as HTMLElement | null)?.focus()
      return
    }
    setError("")
    setBusy(true)
    fake(() => { setBusy(false); setDone(true) })
  }
  const links = h(hrefs)
  if (done) return <Success title="Welcome to Fieldnote Goods" action={<a className={link} href={links.onboarding}>Finish setting up →</a>}>You’ve joined as an editor.</Success>
  return (
    <>
      <div className="bg-secondary mb-6 flex items-center gap-3 rounded-2xl p-3.5">
        <span className="bg-chart-4/25 flex size-11 items-center justify-center rounded-xl text-sm font-semibold" aria-hidden="true">FG</span>
        <p className="text-sm text-pretty"><span className="font-semibold">Maya Okafor</span> invited you to join <span className="font-semibold">Fieldnote Goods</span> as an editor.</p>
      </div>
      <Heading title="Accept your invitation">Create a password for <span className="text-foreground font-medium">dev@fieldnote.example</span>.</Heading>
      <form onSubmit={submit} noValidate className="space-y-4">
        <AuthField id="iv-name" name="name" label="Full name" defaultValue="Dev Patel" autoComplete="name" />
        <div>
          <AuthPassword id="iv-pass" name="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} error={error} />
          <PasswordStrength id="iv-strength" value={pw} />
        </div>
        <AuthButton type="submit" busy={busy}>{busy ? "Joining…" : "Join Fieldnote Goods"}</AuthButton>
      </form>
    </>
  )
}

const steps = ["You", "Workspace", "Team"]

/** Three short steps to set up a workspace, with progress and a slug that follows the name. */
function OnboardingForm({ hrefs }: FormProps) {
  const links = h(hrefs)
  const [step, setStep] = React.useState(0)
  const [name, setName] = React.useState("Mina Kovac")
  const [role, setRole] = React.useState("Design")
  const [ws, setWs] = React.useState("Fieldnote Goods")
  const [invites, setInvites] = React.useState("")
  const [error, setError] = React.useState("")
  const [done, setDone] = React.useState(false)
  const head = React.useRef<HTMLHeadingElement>(null)
  const slug = ws.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  const emails = invites.split(/[\s,]+/).filter(Boolean)
  const roles = ["Design", "Engineering", "Product", "Marketing", "Operations"]

  function next() {
    if (step === 0 && !name.trim()) return setError("Tell us your name.")
    if (step === 1 && !ws.trim()) return setError("Give your workspace a name.")
    if (step === 2 && emails.some((m) => !emailOk(m))) return setError("One of those doesn’t look like an email address.")
    setError("")
    if (step === 2) return setDone(true)
    setStep((s) => s + 1)
    requestAnimationFrame(() => head.current?.focus())
  }
  if (done) return <Success title="You’re all set" action={<a className={link} href="#">Open {ws || "your workspace"} →</a>}>{emails.length > 0 ? `We sent ${emails.length} invitation${emails.length === 1 ? "" : "s"}.` : "You can invite your team any time."}</Success>
  return (
    <>
      <ol className="mb-7 flex items-center gap-2" aria-label="Setup progress">
        {steps.map((s, i) => (
          <li key={s} aria-current={i === step ? "step" : undefined} className="flex flex-1 items-center gap-2 text-xs font-medium">
            <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px]", i < step ? "bg-primary text-primary-foreground border-transparent" : i === step ? "border-primary text-primary" : "text-muted-foreground")}>{i < step ? <Check className="size-3.5" aria-label="done" /> : i + 1}</span>
            <span className={i === step ? "text-foreground" : "text-muted-foreground"}>{s}</span>
            {i < steps.length - 1 && <span className="bg-border h-px flex-1" aria-hidden="true" />}
          </li>
        ))}
      </ol>
      <header className="mb-6">
        <h1 ref={head} tabIndex={-1} className="text-[1.75rem] leading-tight font-semibold tracking-[-0.03em] outline-none">{step === 0 ? "Tell us about you" : step === 1 ? "Name your workspace" : "Invite your team"}</h1>
        <p className="text-muted-foreground mt-2 text-pretty">{step === 0 ? "So your teammates know who you are." : step === 1 ? "You can change this any time." : "They’ll get an email with a link to join. You can skip this."}</p>
      </header>
      <div className="space-y-4">
        {step === 0 && (
          <>
            <AuthField id="ob-name" label="Full name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" error={error} />
            <fieldset><legend className="text-sm font-medium">Your team</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {roles.map((r) => <label key={r} className={cn("focus-within:ring-ring/50 cursor-pointer rounded-full border px-3.5 py-1.5 text-sm transition-colors focus-within:ring-[3px]", role === r ? "bg-primary text-primary-foreground border-transparent" : "hover:bg-accent")}><input type="radio" name="role" value={r} checked={role === r} onChange={() => setRole(r)} className="sr-only" />{r}</label>)}
              </div>
            </fieldset>
          </>
        )}
        {step === 1 && (
          <>
            <AuthField id="ob-ws" label="Workspace name" value={ws} onChange={(e) => setWs(e.target.value)} error={error} hint={slug ? `Your address: ${slug}.keystone.app` : undefined} />
          </>
        )}
        {step === 2 && (
          <div>
            <label htmlFor="ob-inv" className="text-sm font-medium">Email addresses</label>
            <textarea id="ob-inv" rows={3} value={invites} onChange={(e) => setInvites(e.target.value)} placeholder="dev@company.com, priya@company.com" aria-invalid={!!error} className="bg-background focus-visible:ring-ring/50 placeholder:text-muted-foreground mt-1.5 w-full resize-none rounded-xl border p-3.5 text-[15px] outline-none focus-visible:ring-[3px] aria-[invalid=true]:border-destructive" />
            <p className={cn("mt-1.5 text-sm", error ? "text-destructive" : "text-muted-foreground")} role="status">{error || (emails.length ? `${emails.length} ${emails.length === 1 ? "person" : "people"} will be invited` : "Separate addresses with commas or spaces.")}</p>
          </div>
        )}
      </div>
      <div className="mt-7 flex items-center justify-between gap-3">
        {step > 0 ? <button type="button" onClick={() => { setError(""); setStep((s) => s - 1) }} className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 inline-flex items-center gap-1.5 rounded-lg px-1 text-sm outline-none focus-visible:ring-[3px]"><ArrowLeft className="size-4 rtl:rotate-180" aria-hidden="true" />Back</button> : <button type="button" onClick={() => setDone(true)} className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 rounded px-1 text-sm outline-none focus-visible:ring-[3px]">Skip for now</button>}
        <AuthButton type="button" onClick={next} className="w-auto px-6">{step === 2 ? (emails.length ? "Send invitations" : "Finish") : "Continue"}{step < 2 && <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />}</AuthButton>
      </div>
      <p className="text-muted-foreground mt-6 flex items-center justify-center gap-1.5 text-xs"><ShieldCheck className="size-3.5" aria-hidden="true" />Step {step + 1} of {steps.length}</p>
    </>
  )
}

export { ForgotForm, InviteForm, OnboardingForm, ResetForm, SignInForm, SignUpForm, VerifyForm, type FormProps }
