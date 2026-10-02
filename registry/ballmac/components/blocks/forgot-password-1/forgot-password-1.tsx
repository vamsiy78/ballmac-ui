// Ballmac UI: Forgot Password 1. https://ui.ballmac.com/blocks/forgot-password-1
"use client"

import * as React from "react"
import { ArrowLeft, ArrowRight, Check, KeyRound, MailCheck } from "lucide-react"

import { Button, buttonVariants } from "@/components/ballmac/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, useFieldControl } from "@/components/ballmac/field"
import { Input } from "@/components/ballmac/input"
import { PasswordInput } from "@/components/ballmac/password-input"
import { cn } from "@/lib/utils"

type ForgotPassword1View = "request" | "sent" | "reset" | "done"

type ForgotPassword1Props = Omit<React.ComponentProps<"section">, "onSubmit"> & {
  /** Which screen to start on. Use "reset" on the page the emailed link opens. */
  initialView?: ForgotPassword1View
  /** Email shown on the confirmation screen when you start past the request. */
  defaultEmail?: string
  /** Called with the email. Throw to show an error; resolve to show the confirmation. */
  onRequest?: (email: string) => void | Promise<void>
  /** Called with the new password. Throw to show an error; resolve to show the success screen. */
  onReset?: (password: string) => void | Promise<void>
  /** Seconds before "Resend" works again. */
  resendAfter?: number
  /** Where "Back to sign in" goes. */
  loginHref?: string
}

function FieldInput(props: React.ComponentProps<typeof Input>) {
  return <Input {...useFieldControl()} {...props} />
}
function FieldPassword(props: React.ComponentProps<typeof PasswordInput>) {
  return <PasswordInput {...useFieldControl()} {...props} />
}

const emailPattern = /^\S+@\S+\.\S+$/

function Icon({ children }: { children: React.ReactNode }) {
  return <span aria-hidden="true" className="bg-muted flex size-12 items-center justify-center rounded-2xl [&_svg]:size-6">{children}</span>
}

function ForgotPassword1({
  initialView = "request",
  defaultEmail = "",
  onRequest,
  onReset,
  resendAfter = 30,
  loginHref = "#",
  className,
  ...props
}: ForgotPassword1Props) {
  const [view, setView] = React.useState<ForgotPassword1View>(initialView)
  const [email, setEmail] = React.useState(defaultEmail)
  const [password, setPassword] = React.useState("")
  const [confirm, setConfirm] = React.useState("")
  const [touched, setTouched] = React.useState<Record<string, boolean>>({})
  const [busy, setBusy] = React.useState(false)
  const [failed, setFailed] = React.useState(false)
  const [wait, setWait] = React.useState(initialView === "sent" ? resendAfter : 0)
  const [resent, setResent] = React.useState(false)
  const headingRef = React.useRef<HTMLHeadingElement>(null)

  // Count the resend cooldown down once a second while it is running.
  React.useEffect(() => {
    if (wait <= 0) return
    const id = window.setTimeout(() => setWait((w) => w - 1), 1000)
    return () => window.clearTimeout(id)
  }, [wait])

  // Move focus to the new heading when the screen changes, so keyboard and screen reader users land on it.
  const first = React.useRef(true)
  React.useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    headingRef.current?.focus()
  }, [view])

  const emailError = touched.email && !emailPattern.test(email) ? "Enter a full email address, like name@company.com." : undefined
  const passwordError = touched.password && password.length < 8 ? "Use at least 8 characters." : undefined
  const confirmError = touched.confirm && confirm !== password ? "The passwords don’t match." : undefined

  async function request(e: React.FormEvent) {
    e.preventDefault()
    setTouched((t) => ({ ...t, email: true }))
    if (!emailPattern.test(email)) return
    setBusy(true)
    setFailed(false)
    try {
      if (onRequest) await onRequest(email)
      else await new Promise((r) => setTimeout(r, 800))
      setWait(resendAfter)
      setView("sent")
    } catch {
      setFailed(true)
    } finally {
      setBusy(false)
    }
  }

  async function resend() {
    setBusy(true)
    try {
      if (onRequest) await onRequest(email)
      else await new Promise((r) => setTimeout(r, 500))
      setResent(true)
      setWait(resendAfter)
    } finally {
      setBusy(false)
    }
  }

  async function reset(e: React.FormEvent) {
    e.preventDefault()
    setTouched((t) => ({ ...t, password: true, confirm: true }))
    if (password.length < 8 || confirm !== password) return
    setBusy(true)
    setFailed(false)
    try {
      if (onReset) await onReset(password)
      else await new Promise((r) => setTimeout(r, 800))
      setView("done")
    } catch {
      setFailed(true)
    } finally {
      setBusy(false)
    }
  }

  const heading = "text-2xl font-semibold tracking-[-0.03em] outline-none"
  return (
    <section data-slot="forgot-password-1" className={cn("flex min-h-[36rem] items-center justify-center px-4 py-14", className)} {...props}>
      <div className="bg-card w-full max-w-md rounded-3xl border p-7 shadow-[0_30px_80px_-50px_rgb(0_0_0/0.4)] sm:p-9">
        {view === "request" && (
          <>
            <Icon><KeyRound /></Icon>
            <h1 ref={headingRef} tabIndex={-1} className={cn(heading, "mt-6")}>Forgot your password?</h1>
            <p className="text-muted-foreground mt-2 text-pretty">Enter the email you signed up with and we’ll send you a link to choose a new one.</p>
            <form noValidate onSubmit={request} aria-label="Request a password reset" className="mt-7">
              <FieldGroup>
                {failed && <p role="alert" className="border-destructive/40 text-destructive rounded-lg border px-3 py-2.5 text-sm">We couldn’t send the email. Please try again.</p>}
                <Field invalid={!!emailError}>
                  <FieldLabel>Email</FieldLabel>
                  <FieldInput type="email" autoComplete="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => setTouched((t) => ({ ...t, email: true }))} />
                  <FieldError errors={[emailError]} />
                </Field>
                <Button type="submit" size="lg" shape="pill" loading={busy} className="w-full">Send reset link <ArrowRight  className="rtl:rotate-180"/></Button>
              </FieldGroup>
            </form>
            <a href={loginHref} className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 mt-6 inline-flex items-center gap-1.5 rounded-sm text-sm outline-none focus-visible:ring-[3px]"><ArrowLeft className="size-4 rtl:rotate-180" aria-hidden="true" />Back to sign in</a>
          </>
        )}

        {view === "sent" && (
          <>
            <Icon><MailCheck /></Icon>
            <h1 ref={headingRef} tabIndex={-1} className={cn(heading, "mt-6")}>Check your email</h1>
            <p className="text-muted-foreground mt-2 text-pretty">If an account exists for <span className="text-foreground font-medium break-all">{email || "that address"}</span>, a reset link is on its way. It expires in one hour.</p>
            <a href="mailto:" className={buttonVariants({ size: "lg", shape: "pill", className: "mt-7 w-full" })}>Open email app</a>
            <p role="status" className="text-muted-foreground mt-5 text-center text-sm">
              {resent && wait > 0 ? "Sent again. " : ""}
              {wait > 0 ? <>You can resend in <span className="tabular-nums">{wait}</span>s.</> : "Didn’t get it?"}
            </p>
            <div className="mt-2 flex justify-center gap-2">
              <Button variant="ghost" size="sm" disabled={wait > 0 || busy} loading={busy} onClick={resend}>Resend email</Button>
              <Button variant="ghost" size="sm" onClick={() => { setView("request"); setResent(false) }}>Use a different email</Button>
            </div>
          </>
        )}

        {view === "reset" && (
          <>
            <Icon><KeyRound /></Icon>
            <h1 ref={headingRef} tabIndex={-1} className={cn(heading, "mt-6")}>Choose a new password</h1>
            <p className="text-muted-foreground mt-2 text-pretty">Pick something you haven’t used elsewhere. You’ll be signed out of other devices.</p>
            <form noValidate onSubmit={reset} aria-label="Choose a new password" className="mt-7">
              <FieldGroup>
                {failed && <p role="alert" className="border-destructive/40 text-destructive rounded-lg border px-3 py-2.5 text-sm">This link has expired. Request a new one and try again.</p>}
                <Field invalid={!!passwordError}>
                  <FieldLabel>New password</FieldLabel>
                  <FieldPassword label="New password" value={password} onValueChange={setPassword} onBlur={() => setTouched((t) => ({ ...t, password: true }))} />
                  <FieldError errors={[passwordError]} />
                  {!password && <FieldDescription>At least 8 characters.</FieldDescription>}
                </Field>
                <Field invalid={!!confirmError}>
                  <FieldLabel>Confirm password</FieldLabel>
                  <FieldPassword label="Confirm password" showStrength={false} value={confirm} onValueChange={setConfirm} onBlur={() => setTouched((t) => ({ ...t, confirm: true }))} />
                  <FieldError errors={[confirmError]} />
                </Field>
                <Button type="submit" size="lg" shape="pill" loading={busy} className="w-full">Update password</Button>
              </FieldGroup>
            </form>
          </>
        )}

        {view === "done" && (
          <div className="flex flex-col items-center py-4 text-center">
            <span aria-hidden="true" className="bg-chart-2/15 flex size-14 items-center justify-center rounded-full"><Check className="size-7" /></span>
            <h1 ref={headingRef} tabIndex={-1} className={cn(heading, "mt-6")}>Password updated</h1>
            <p role="status" className="text-muted-foreground mt-2 max-w-xs text-pretty">You can now sign in with your new password.</p>
            <a href={loginHref} className={buttonVariants({ size: "lg", shape: "pill", className: "mt-8 w-full" })}>Continue to sign in</a>
          </div>
        )}
      </div>
    </section>
  )
}

export { ForgotPassword1, type ForgotPassword1Props, type ForgotPassword1View }
