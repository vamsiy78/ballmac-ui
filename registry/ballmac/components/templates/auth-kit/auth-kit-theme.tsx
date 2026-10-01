// Ballmac UI: Auth Kit template frame. https://ui.ballmac.com/templates/template-auth-kit
"use client"

import * as React from "react"
import { Eye, EyeOff, Loader2 } from "lucide-react"

import { AuroraBackground } from "@/components/ballmac/aurora-background"
import { authSans } from "@/components/ballmac/templates/auth-kit/auth-kit-fonts"
import { cn } from "@/lib/utils"

type AuthLayout = "centered" | "split" | "glass"
type AuthPage = "sign-in" | "sign-up" | "verify" | "forgot" | "reset" | "invite" | "onboarding"
type AuthHrefs = Record<AuthPage, string>

const defaultHrefs: AuthHrefs = {
  "sign-in": "/auth/sign-in",
  "sign-up": "/auth/sign-up",
  verify: "/auth/verify",
  forgot: "/auth/forgot",
  reset: "/auth/reset",
  invite: "/auth/invite",
  onboarding: "/auth/onboarding",
}

/** Auth Kit's palette: soft ivory and ink with one indigo. Friendly, clear and calm. */
const authCss = `
.auth-theme,body:has(.auth-theme){--background:oklch(0.982 0.006 90);--foreground:oklch(0.21 0.03 275);--card:oklch(1 0 0);--card-foreground:oklch(0.21 0.03 275);--popover:oklch(1 0 0);--popover-foreground:oklch(0.21 0.03 275);--primary:oklch(0.46 0.2 275);--primary-foreground:oklch(0.99 0.004 90);--secondary:oklch(0.958 0.01 90);--secondary-foreground:oklch(0.21 0.03 275);--muted:oklch(0.958 0.01 90);--muted-foreground:oklch(0.47 0.03 275);--accent:oklch(0.94 0.014 280);--accent-foreground:oklch(0.21 0.03 275);--border:oklch(0.21 0.03 275 / 12%);--input:oklch(0.21 0.03 275 / 20%);--ring:oklch(0.55 0.2 275);--surface:oklch(0.968 0.01 90);--destructive:oklch(0.53 0.22 25);--chart-1:oklch(0.5 0.2 275);--chart-2:oklch(0.48 0.12 165);--chart-3:oklch(0.62 0.14 75);--chart-4:oklch(0.52 0.19 340);--chart-5:oklch(0.52 0.12 235);--radius:0.875rem}
.dark .auth-theme,.dark body:has(.auth-theme){--background:oklch(0.17 0.022 275);--foreground:oklch(0.95 0.008 90);--card:oklch(0.21 0.026 275);--card-foreground:oklch(0.95 0.008 90);--popover:oklch(0.23 0.028 275);--popover-foreground:oklch(0.95 0.008 90);--primary:oklch(0.76 0.14 275);--primary-foreground:oklch(0.19 0.03 275);--secondary:oklch(0.26 0.028 275);--secondary-foreground:oklch(0.95 0.008 90);--muted:oklch(0.25 0.028 275);--muted-foreground:oklch(0.73 0.025 275);--accent:oklch(0.29 0.034 275);--accent-foreground:oklch(0.95 0.008 90);--border:oklch(1 0 0 / 11%);--input:oklch(1 0 0 / 16%);--ring:oklch(0.74 0.14 275);--surface:oklch(0.19 0.024 275);--destructive:oklch(0.7 0.19 25);--chart-1:oklch(0.76 0.14 275);--chart-2:oklch(0.78 0.13 165);--chart-3:oklch(0.83 0.13 85);--chart-4:oklch(0.76 0.15 340);--chart-5:oklch(0.76 0.11 235)}
body:has(.auth-theme){font-family:var(--auth-sans),ui-sans-serif,system-ui,sans-serif}
`

function AuthMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" aria-hidden="true" className={cn("size-8", className)} fill="none">
      <rect width="28" height="28" rx="9" fill="var(--primary)" />
      <circle cx="14" cy="12" r="3.6" stroke="var(--primary-foreground)" strokeWidth="2" />
      <path d="M14 15.6V21M14 18.5h2.6" stroke="var(--primary-foreground)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

type AuthFrameProps = React.ComponentProps<"div"> & {
  /** How the page is composed. */
  layout?: AuthLayout
  /** Brand name beside the mark. */
  brand?: string
  /** Where the brand links to. */
  homeHref?: string
}

const quote = { text: "We replaced three login screens with one in an afternoon, and support tickets about passwords dropped by half.", name: "Sasha Petrova", role: "Head of Product, Fernhill" }

/** The page around an auth form: centred card, split with art, or frosted glass over a soft aurora. */
function AuthFrame({ layout = "centered", brand = "Keystone", homeHref = "#", className, style, children, ...props }: AuthFrameProps) {
  React.useEffect(() => {
    const cls = authSans.variable
    if (!cls) return
    document.body.classList.add(cls)
    return () => document.body.classList.remove(cls)
  }, [])
  const logo = (
    <a href={homeHref} className="focus-visible:ring-ring/50 inline-flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-[3px]">
      <AuthMark /> <span className="text-xl font-semibold tracking-tight">{brand}</span>
    </a>
  )
  return (
    <div
      data-slot="auth-kit"
      data-layout={layout}
      className={cn("auth-theme bg-background text-foreground relative isolate min-h-dvh overflow-x-clip", authSans.variable, className)}
      style={{ fontFamily: "var(--auth-sans), ui-sans-serif, system-ui, sans-serif", ...style }}
      {...props}
    >
      <style>{authCss}</style>
      {layout === "centered" && (
        <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-12">
          <div aria-hidden="true" className="absolute inset-0 -z-10 [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
          <div className="mb-8">{logo}</div>
          <div className="bg-card w-full max-w-md rounded-3xl border p-7 shadow-[0_24px_60px_-30px_oklch(0.4_0.1_275/0.35)] sm:p-9">{children}</div>
          <p className="text-muted-foreground mt-8 text-xs">Protected by two-factor authentication · <a href="#" className="underline underline-offset-4">Privacy</a></p>
        </main>
      )}
      {layout === "split" && (
        <main className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <div className="flex flex-col px-6 py-8 sm:px-12 lg:px-16">
            {logo}
            <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">{children}</div>
            <p className="text-muted-foreground text-xs">© 2026 {brand}. All rights reserved.</p>
          </div>
          <aside aria-hidden="true" className="bg-primary text-primary-foreground relative hidden overflow-hidden lg:block">
            <div className="absolute inset-0 [background-image:radial-gradient(circle_at_20%_20%,var(--chart-4)_0,transparent_45%),radial-gradient(circle_at_85%_70%,var(--chart-5)_0,transparent_50%)] opacity-45" />
            <div className="absolute inset-0 [background-image:linear-gradient(oklch(1_0_0/0.07)_1px,transparent_1px),linear-gradient(90deg,oklch(1_0_0/0.07)_1px,transparent_1px)] [background-size:48px_48px]" />
            <figure className="relative flex h-full flex-col justify-end p-14">
              <blockquote className="max-w-md text-3xl leading-snug font-medium tracking-[-0.02em] text-balance">“{quote.text}”</blockquote>
              <figcaption className="mt-6 text-sm opacity-85"><span className="font-semibold">{quote.name}</span> · {quote.role}</figcaption>
            </figure>
          </aside>
        </main>
      )}
      {layout === "glass" && (
        <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-12">
          <AuroraBackground aria-hidden="true" className="absolute inset-0 -z-10" colors={["var(--chart-1)", "var(--chart-4)", "var(--chart-5)"]} intensity={0.6} radialMask={false} />
          <div className="mb-8">{logo}</div>
          <div className="bg-card/55 w-full max-w-md rounded-3xl border p-7 shadow-[0_30px_80px_-30px_oklch(0.3_0.1_275/0.5)] backdrop-blur-2xl backdrop-saturate-150 sm:p-9">{children}</div>
        </main>
      )}
    </div>
  )
}

const inputClass = "bg-background focus-visible:ring-ring/50 placeholder:text-muted-foreground h-11 w-full rounded-xl border px-3.5 text-[15px] outline-none transition-shadow focus-visible:ring-[3px] aria-[invalid=true]:border-destructive"

/** A labelled text field with an inline error. */
function AuthField({ label, error, hint, id, className, ...props }: Omit<React.ComponentProps<"input">, "id"> & { label: string; error?: string; hint?: string; id: string }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <input id={id} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined} className={cn(inputClass, "mt-1.5")} {...props} />
      {error ? <p id={`${id}-err`} className="text-destructive mt-1.5 text-sm">{error}</p> : hint ? <p id={`${id}-hint`} className="text-muted-foreground mt-1.5 text-sm">{hint}</p> : null}
    </div>
  )
}

/** A password field with a show and hide button. */
function AuthPassword({ label = "Password", error, id, ...props }: Omit<React.ComponentProps<"input">, "id" | "type"> & { label?: string; error?: string; id: string }) {
  const [show, setShow] = React.useState(false)
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <div className="relative mt-1.5">
        <input id={id} type={show ? "text" : "password"} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} className={cn(inputClass, "pr-11")} {...props} />
        <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"} aria-pressed={show} className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 absolute top-1/2 right-1.5 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-lg outline-none focus-visible:ring-[3px]">
          {show ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
        </button>
      </div>
      {error && <p id={`${id}-err`} className="text-destructive mt-1.5 text-sm">{error}</p>}
    </div>
  )
}

/** The main button of a form. */
function AuthButton({ busy, className, children, ...props }: React.ComponentProps<"button"> & { busy?: boolean }) {
  return (
    <button disabled={busy || props.disabled} className={cn("bg-primary text-primary-foreground focus-visible:ring-ring/50 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-[15px] font-semibold outline-none transition-opacity hover:opacity-90 focus-visible:ring-[3px] disabled:opacity-60", className)} {...props}>
      {busy && <Loader2 className="size-4 motion-safe:animate-spin" aria-hidden="true" />}
      {children}
    </button>
  )
}

/** Password rules, scored live. */
const rules = [
  { id: "len", label: "At least 10 characters", test: (p: string) => p.length >= 10 },
  { id: "case", label: "An upper and a lower case letter", test: (p: string) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
  { id: "num", label: "A number", test: (p: string) => /\d/.test(p) },
  { id: "sym", label: "A symbol", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
]

/** A strength bar and checklist for a new password. */
function PasswordStrength({ value, id }: { value: string; id: string }) {
  const passed = rules.filter((r) => r.test(value)).length
  const label = value.length === 0 ? "Enter a password" : passed <= 1 ? "Weak" : passed <= 3 ? "Fair" : "Strong"
  const tone = passed <= 1 ? "bg-destructive" : passed <= 3 ? "bg-chart-3" : "bg-chart-2"
  return (
    <div id={id} className="mt-3">
      <div className="flex gap-1.5" aria-hidden="true">
        {rules.map((r, i) => <span key={r.id} className={cn("h-1.5 flex-1 rounded-full transition-colors duration-300 motion-reduce:transition-none", i < passed && value ? tone : "bg-muted")} />)}
      </div>
      <p className="mt-2 text-sm font-medium" role="status">Strength: {label}</p>
      <ul className="text-muted-foreground mt-2 grid gap-1 text-sm">
        {rules.map((r) => {
          const ok = r.test(value)
          return <li key={r.id} className={cn("flex items-center gap-2", ok && "text-foreground")}><span className={cn("flex size-4 items-center justify-center rounded-full border text-[10px]", ok ? "bg-chart-2 text-background border-transparent" : "")} aria-hidden="true">{ok ? "✓" : ""}</span>{r.label}<span className="sr-only">{ok ? " (met)" : " (not met)"}</span></li>
        })}
      </ul>
    </div>
  )
}

export { AuthButton, AuthField, AuthFrame, AuthMark, AuthPassword, PasswordStrength, defaultHrefs as authDefaultHrefs, rules as passwordRules, type AuthFrameProps, type AuthHrefs, type AuthLayout, type AuthPage }
