// Ballmac UI: Login 1. https://ui.ballmac.com/blocks/login-1
"use client"

import * as React from "react"
import { KeyRound, Mail } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { Checkbox } from "@/components/ballmac/checkbox"
import { Input } from "@/components/ballmac/input"
import { Label } from "@/components/ballmac/label"
import { formPhase, type FormStateProps } from "@/lib/ballmac/use-resource"
import { cn } from "@/lib/utils"

type Login1Props = Omit<React.ComponentProps<"section">, "onSubmit"> & FormStateProps & {
  /** The email to start with. */
  defaultEmail?: string
  /** Brand name or logo above the form. */
  brand?: React.ReactNode
  /** Heading. */
  title?: string
  /** Called with the form values. Show errors by passing `error`. */
  onSubmit?: (values: { email: string; password: string; remember: boolean }) => void | Promise<void>
  /** Called when "Continue with SSO" is pressed. Pass null to hide the button. */
  onSso?: (() => void) | null
  /** Called when "Email me a sign-in link" is pressed. Pass null to hide the button. */
  onMagicLink?: (() => void) | null
  /** Error message shown above the form. With `state="error"` it is the message too, unless `errorState.description` is given. */
  error?: string
  /** Where the "Forgot password?" link goes. */
  forgotHref?: string
  /** Where the "Create an account" link goes. */
  signupHref?: string
}

function Login1({
  brand = "Acme",
  title = "Sign in to your account",
  onSubmit,
  onSso = () => {},
  onMagicLink = () => {},
  error,
  forgotHref = "#",
  signupHref = "#",
  defaultEmail,
  state: stateProp,
  errorState,
  className,
  ...props
}: Login1Props) {
  const id = React.useId()
  const [pendingInternal, setPending] = React.useState(false)
  // a `state` prop drives the form; without it the form runs by itself. This form has no confirmation screen, so success looks like ready.
  const phase = formPhase(stateProp)
  const pending = phase === "sending" || pendingInternal
  const message = phase === "error" ? (errorState?.description ?? error ?? "The email or password is not right. Check them and try again.") : phase === undefined ? error : undefined
  return (
    <section data-slot="login-1" className={cn("flex min-h-[640px] items-center justify-center px-4 py-16", className)} {...props}>
      <div className="w-full max-w-sm">
        <div className="text-center">
          <div className="text-lg font-semibold tracking-tight">{brand}</div>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">{title}</h1>
        </div>
        <div className="mt-8 rounded-2xl border bg-card p-6 shadow-[0_20px_60px_-40px_rgb(0_0_0/0.35)]">
          <div className="grid gap-2">
            {onSso && (
              <Button variant="outline" onClick={onSso}>
                <KeyRound /> Continue with SSO
              </Button>
            )}
            {onMagicLink && (
              <Button variant="outline" onClick={onMagicLink}>
                <Mail /> Email me a sign-in link
              </Button>
            )}
          </div>
          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground" aria-hidden="true">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>
          <form
            className="grid gap-4"
            aria-busy={pending || undefined}
            onSubmit={async (e) => {
              e.preventDefault()
              const data = new FormData(e.currentTarget)
              setPending(true)
              try {
                await onSubmit?.({ email: String(data.get("email")), password: String(data.get("password")), remember: data.get("remember") === "on" })
              } finally {
                setPending(false)
              }
            }}
          >
            {/* while the request is in flight nothing in the form can be changed or sent twice */}
            <fieldset disabled={pending} className="contents">
            {message && (
              <p role="alert" className="rounded-md border border-destructive/40 px-3 py-2 text-sm text-destructive">
                {message}
              </p>
            )}
            <div className="grid gap-2">
              <Label htmlFor={`${id}-email`}>Email</Label>
              <Input id={`${id}-email`} name="email" type="email" autoComplete="email" defaultValue={defaultEmail} required aria-invalid={message ? true : undefined} />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={`${id}-password`}>Password</Label>
                <a href={forgotHref} className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                  Forgot password?
                </a>
              </div>
              <Input id={`${id}-password`} name="password" type="password" autoComplete="current-password" required aria-invalid={message ? true : undefined} />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id={`${id}-remember`} name="remember" />
              <Label htmlFor={`${id}-remember`} className="font-normal">
                Keep me signed in
              </Label>
            </div>
            <Button type="submit" loading={pending} className="mt-2 w-full">
              Sign in
            </Button>
            </fieldset>
          </form>
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          New here?{" "}
          <a href={signupHref} className="text-foreground underline underline-offset-4">
            Create an account
          </a>
        </p>
      </div>
    </section>
  )
}

export { Login1, type Login1Props }
