import * as React from "react"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Contact1 } from "@/components/ballmac/blocks/contact-1/contact-1"
import { ForgotPassword1 } from "@/components/ballmac/blocks/forgot-password-1/forgot-password-1"
import { Invite1 } from "@/components/ballmac/blocks/invite-1/invite-1"
import { Login1 } from "@/components/ballmac/blocks/login-1/login-1"
import { Login2 } from "@/components/ballmac/blocks/login-2/login-2"
import { Newsletter1 } from "@/components/ballmac/blocks/newsletter-1/newsletter-1"
import { Onboarding1 } from "@/components/ballmac/blocks/onboarding-1/onboarding-1"
import { Settings1 } from "@/components/ballmac/blocks/settings-1/settings-1"
import { Settings2 } from "@/components/ballmac/blocks/settings-2/settings-2"
import { Settings3 } from "@/components/ballmac/blocks/settings-3/settings-3"
import { Signup1 } from "@/components/ballmac/blocks/signup-1/signup-1"
import { Verify1 } from "@/components/ballmac/blocks/verify-1/verify-1"
import type { FormStateProps } from "@/lib/ballmac/use-resource"

type Form = React.ComponentType<FormStateProps & Record<string, unknown>>

/**
 * Every form takes the same `state`, so they are tested the same way. `lock` is whether a request in flight disables the fields
 * (a settings page saves while you keep reading it); `success` is text that only the confirmation shows, or null when the form
 * has no confirmation screen.
 */
const forms: { name: string; Form: Form; props?: Record<string, unknown>; lock: boolean; success: RegExp | null; error: RegExp | null }[] = [
  { name: "Login1", Form: Login1 as Form, lock: true, success: null, error: /not right/i },
  { name: "Login2", Form: Login2 as Form, lock: true, success: null, error: /don’t match/i },
  { name: "Signup1", Form: Signup1 as Form, lock: true, success: /check your inbox/i, error: /couldn’t create/i },
  { name: "ForgotPassword1", Form: ForgotPassword1 as Form, props: { defaultEmail: "a@b.co" }, lock: true, success: /check your email/i, error: /couldn’t send/i },
  { name: "Verify1", Form: Verify1 as Form, props: { defaultCode: "123456" }, lock: false, success: /you’re verified/i, error: /isn’t right/i },
  { name: "Contact1", Form: Contact1 as Form, lock: true, success: /message sent/i, error: /went wrong/i },
  { name: "Newsletter1", Form: Newsletter1 as Form, lock: true, success: /you’re subscribed/i, error: /couldn’t subscribe/i },
  { name: "Invite1", Form: Invite1 as Form, lock: false, success: /welcome to/i, error: /couldn’t complete/i },
  { name: "Onboarding1", Form: Onboarding1 as Form, lock: false, success: /is ready/i, error: /couldn’t create the workspace/i },
]

describe.each(forms)("$name states", ({ Form, props = {}, lock, success, error }) => {
  it("submitting: marked busy, and nothing can be changed or sent twice", () => {
    const { container } = render(<Form state="submitting" {...props} />)
    if (lock) {
      expect(container.querySelector("form[aria-busy=true], [aria-busy=true]")).toBeTruthy()
      const fieldset = container.querySelector("fieldset[disabled]")
      expect(fieldset).toBeTruthy()
      // a disabled fieldset disables everything inside it; `:disabled` is the browser's own check for that
      const controls = fieldset!.querySelectorAll("input, textarea, select, button")
      expect(controls.length).toBeGreaterThan(1)
      for (const control of controls) expect(control.matches(":disabled"), control.outerHTML.slice(0, 80)).toBe(true)
    }
    expect(container.querySelector("[aria-busy=true], button[disabled], [data-loading=true]")).toBeTruthy()
  })

  it("error: an alert with the message, and the form can still be fixed", () => {
    const { container } = render(<Form state="error" errorState={{ description: "Custom failure message" }} {...props} />)
    expect(screen.getAllByRole("alert").some((a) => /custom failure message/i.test(a.textContent ?? ""))).toBe(true)
    expect(container.querySelector("fieldset[disabled]")).toBeNull()
  })

  it("error without your copy has a sensible default", () => {
    render(<Form state="error" {...props} />)
    if (error) expect(screen.getAllByRole("alert").some((a) => error.test(a.textContent ?? ""))).toBe(true)
  })

  it(success ? "success: the confirmation screen" : "success: this form has no confirmation, so it looks ready", () => {
    const { container } = render(<Form state="success" {...props} />)
    if (success) {
      expect(screen.getByText(success)).toBeInTheDocument()
      expect(container.querySelector("fieldset[disabled]")).toBeNull()
    } else {
      expect(screen.queryAllByRole("alert")).toHaveLength(0)
    }
  })

  it("is unchanged when state is left out: no lock, no error, no confirmation", () => {
    const { container } = render(<Form {...props} />)
    expect(container.querySelector("fieldset[disabled]")).toBeNull()
    expect(container.querySelector("[aria-busy=true]")).toBeNull()
    if (success) expect(screen.queryByText(success)).toBeNull()
  })
})

describe("prefill", () => {
  it("login, newsletter, contact and signup start with the values you give", () => {
    const { unmount } = render(<Login2 defaultEmail="jordan@acme.com" />)
    expect(screen.getByDisplayValue("jordan@acme.com")).toBeInTheDocument()
    unmount()
    const n = render(<Newsletter1 defaultEmail="jordan@acme.com" />)
    expect(screen.getByDisplayValue("jordan@acme.com")).toBeInTheDocument()
    n.unmount()
    const c = render(<Contact1 defaultValues={{ name: "Jordan Lee", message: "Hello there" }} />)
    expect(screen.getByDisplayValue("Jordan Lee")).toBeInTheDocument()
    expect(screen.getByDisplayValue("Hello there")).toBeInTheDocument()
    c.unmount()
    render(<Signup1 defaultValues={{ name: "Jordan Lee", email: "jordan@acme.com" }} />)
    expect(screen.getByDisplayValue("Jordan Lee")).toBeInTheDocument()
    expect(screen.getByDisplayValue("jordan@acme.com")).toBeInTheDocument()
  })

  it("the confirmation screens fall back to words, not blanks, when nothing was typed", () => {
    const c = render(<Contact1 state="success" />)
    expect(c.container.textContent).not.toMatch(/Thanks, \./)
    expect(c.container.textContent).toMatch(/reply to you soon/)
    c.unmount()
    const s = render(<Signup1 state="success" />)
    expect(s.container.textContent).toMatch(/your email/)
    s.unmount()
    const o = render(<Onboarding1 state="success" />)
    expect(o.container.textContent).toMatch(/Your workspace is ready/)
  })
})

describe("settings states", () => {
  it("loading: a skeleton under the real heading, announced, busy", () => {
    for (const [Block, heading] of [[Settings1 as Form, "Account settings"], [Settings2 as Form, "Notifications"]] as const) {
      const { container, unmount } = render(<Block state="loading" />)
      expect(container.querySelector("[data-state=loading]")).toBeTruthy()
      expect(container.querySelector("[aria-busy=true]")).toBeTruthy()
      expect(screen.getByRole("status")).toHaveTextContent(/loading/i)
      expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument()
      expect(container.querySelectorAll("[data-slot=skeleton]").length).toBeGreaterThan(5)
      unmount()
    }
  })

  it("Settings1 shows the save bar for each state, even with nothing edited", () => {
    const saving = render(<Settings1 state="submitting" />)
    expect(screen.getByText("Saving…")).toBeInTheDocument()
    saving.unmount()
    const saved = render(<Settings1 state="success" />)
    expect(screen.getByText("All changes saved")).toBeInTheDocument()
    saved.unmount()
    render(<Settings1 state="error" errorState={{ description: "Offline" }} />)
    expect(screen.getByText("Offline")).toBeInTheDocument()
  })

  it("Settings2 shows its status beside the heading", () => {
    const a = render(<Settings2 state="submitting" />)
    expect(screen.getByText("Saving…")).toBeInTheDocument()
    a.unmount()
    const b = render(<Settings2 state="success" />)
    expect(screen.getByText("Saved")).toBeInTheDocument()
    b.unmount()
    render(<Settings2 state="error" />)
    expect(screen.getByText(/couldn’t save/i)).toBeInTheDocument()
  })

  it("Settings3 is a data block: loading, error with retry, and the real page with nobody on the team", () => {
    const l = render(<Settings3 state="loading" />)
    expect(l.container.querySelector("[aria-busy=true]")).toBeTruthy()
    l.unmount()
    const e = render(<Settings3 state="error" onRetry={() => {}} />)
    expect(screen.getByRole("alert")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument()
    e.unmount()
    render(<Settings3 state="empty" />)
    expect(screen.getByRole("heading", { name: "Team" })).toBeInTheDocument()
    expect(screen.getByText(/0 of \d+ used/)).toBeInTheDocument()
  })
})
