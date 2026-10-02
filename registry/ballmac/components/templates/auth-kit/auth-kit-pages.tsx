// Ballmac UI: Auth Kit pages. https://ui.ballmac.com/templates/template-auth-kit
"use client"

import * as React from "react"

import { SegmentedControl, SegmentedControlItem } from "@/components/ballmac/segmented-control"
import { ForgotForm, InviteForm, OnboardingForm, ResetForm, SignInForm, SignUpForm, VerifyForm } from "@/components/ballmac/templates/auth-kit/auth-kit-forms"
import { AuthFrame, authDefaultHrefs, type AuthHrefs, type AuthLayout, type AuthPage } from "@/components/ballmac/templates/auth-kit/auth-kit-theme"
import { cn } from "@/lib/utils"

const forms: Record<AuthPage, React.ComponentType<{ hrefs?: Partial<AuthHrefs> }>> = {
  "sign-in": SignInForm,
  "sign-up": SignUpForm,
  verify: VerifyForm,
  forgot: ForgotForm,
  reset: ResetForm,
  invite: InviteForm,
  onboarding: OnboardingForm,
}

const labels: Record<AuthPage, string> = { "sign-in": "Sign in", "sign-up": "Sign up", verify: "Verify", forgot: "Forgot", reset: "Reset", invite: "Invite", onboarding: "Onboarding" }
const defaultLayout: Record<AuthPage, AuthLayout> = { "sign-in": "split", "sign-up": "centered", verify: "glass", forgot: "centered", reset: "centered", invite: "split", onboarding: "glass" }

type AuthKitPageProps = React.ComponentProps<"div"> & {
  /** Which page to show. */
  page: AuthPage
  /** How the page is composed. Defaults to the layout that suits the page. */
  layout?: AuthLayout
  /** Override where pages live (used by previews). */
  hrefs?: Partial<AuthHrefs>
}

/** One page of the auth flow in a chosen layout. */
function AuthKitPage({ page, layout, hrefs, ...props }: AuthKitPageProps) {
  const Form = forms[page]
  return (
    <AuthFrame layout={layout ?? defaultLayout[page]} {...props}>
      <Form hrefs={hrefs} />
    </AuthFrame>
  )
}

type AuthKitPlaygroundProps = React.ComponentProps<"div"> & {
  /** Page shown first. */
  defaultPage?: AuthPage
  /** Layout shown first. */
  defaultLayout?: AuthLayout
}

/** Every page and every layout in one place: pick a flow and a layout from the bar and see the result. */
function AuthKitPlayground({ defaultPage = "sign-in", defaultLayout: initialLayout = "split", ...props }: AuthKitPlaygroundProps) {
  const [page, setPage] = React.useState<AuthPage>(defaultPage)
  const [layout, setLayout] = React.useState<AuthLayout>(initialLayout)
  const Form = forms[page]
  // Links between forms switch the page here instead of navigating away.
  const hrefs = Object.fromEntries((Object.keys(forms) as AuthPage[]).map((k) => [k, `#${k}`])) as AuthHrefs
  React.useEffect(() => {
    const onHash = () => {
      const k = window.location.hash.slice(1) as AuthPage
      if (k in forms) setPage(k)
    }
    window.addEventListener("hashchange", onHash)
    return () => window.removeEventListener("hashchange", onHash)
  }, [])
  return (
    <AuthFrame layout={layout} {...props}>
      <Form key={page} hrefs={hrefs} />
      <div role="region" aria-label="Auth Kit controls" className="bg-popover/90 fixed inset-x-3 top-3 z-50 mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border p-3 shadow-[0_20px_50px_-12px_rgb(0_0_0/0.35)] backdrop-blur-xl sm:flex-row sm:items-center">
        <div role="group" aria-label="Page" className="flex gap-1 overflow-x-auto [scrollbar-width:none]">
          {(Object.keys(forms) as AuthPage[]).map((k) => (
            <button key={k} type="button" aria-pressed={page === k} onClick={() => setPage(k)} className={cn("focus-visible:ring-ring/50 h-8 shrink-0 rounded-lg px-3 text-[13px] font-medium outline-none transition-colors focus-visible:ring-[3px]", page === k ? "bg-primary text-primary-foreground" : "hover:bg-accent text-muted-foreground")}>{labels[k]}</button>
          ))}
        </div>
        <SegmentedControl aria-label="Layout" value={layout} onValueChange={(v) => setLayout(v as AuthLayout)} size="sm" className="sm:ms-auto">
          <SegmentedControlItem value="centered">Centered</SegmentedControlItem>
          <SegmentedControlItem value="split">Split</SegmentedControlItem>
          <SegmentedControlItem value="glass">Glass</SegmentedControlItem>
        </SegmentedControl>
      </div>
    </AuthFrame>
  )
}

export { AuthKitPage, AuthKitPlayground, authDefaultHrefs, type AuthKitPageProps, type AuthKitPlaygroundProps }
