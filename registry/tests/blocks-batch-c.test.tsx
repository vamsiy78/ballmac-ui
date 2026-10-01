import * as React from "react"
import { act, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"

import { ForgotPassword1 } from "@/components/ballmac/blocks/forgot-password-1/forgot-password-1"
import { Invite1 } from "@/components/ballmac/blocks/invite-1/invite-1"
import { Login2 } from "@/components/ballmac/blocks/login-2/login-2"
import { Onboarding1 } from "@/components/ballmac/blocks/onboarding-1/onboarding-1"
import { Signup1 } from "@/components/ballmac/blocks/signup-1/signup-1"
import { Verify1 } from "@/components/ballmac/blocks/verify-1/verify-1"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})
afterEach(() => vi.useRealTimers())

describe("Login2", () => {
  it("validates before submitting and does not call onSubmit", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Login2 onSubmit={onSubmit} />)
    await user.click(screen.getByRole("button", { name: /Sign in/ }))
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText(/full email address/)).toBeInTheDocument()
    expect(screen.getByText("Enter your password.")).toBeInTheDocument()
    expect(screen.getByRole("textbox", { name: "Email" })).toHaveAttribute("aria-invalid", "true")
  })

  it("submits the values", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<Login2 onSubmit={onSubmit} />)
    await user.type(screen.getByRole("textbox", { name: "Email" }), "me@acme.com")
    await user.type(screen.getByLabelText("Password"), "hunter2hunter2")
    await user.click(screen.getByRole("checkbox", { name: "Keep me signed in" }))
    await user.click(screen.getByRole("button", { name: /Sign in/ }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ email: "me@acme.com", password: "hunter2hunter2", remember: false }))
  })

  it("shows the error message when onSubmit throws, and can hide SSO and passkey", async () => {
    const user = userEvent.setup()
    render(<Login2 onSso={null} onPasskey={null} errorMessage="Nope." onSubmit={() => Promise.reject(new Error("x"))} />)
    expect(screen.queryByRole("button", { name: /SSO/ })).not.toBeInTheDocument()
    await user.type(screen.getByRole("textbox", { name: "Email" }), "me@acme.com")
    await user.type(screen.getByLabelText("Password"), "x")
    await user.click(screen.getByRole("button", { name: /Sign in/ }))
    expect(await screen.findByRole("alert")).toHaveTextContent("Nope.")
  })

  it("toggles password visibility", async () => {
    const user = userEvent.setup()
    render(<Login2 />)
    const field = screen.getByLabelText("Password")
    expect(field).toHaveAttribute("type", "password")
    await user.click(screen.getByRole("button", { name: "Show password" }))
    expect(field).toHaveAttribute("type", "text")
  })
})

describe("Signup1", () => {
  it("validates every field including the terms", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Signup1 onSubmit={onSubmit} />)
    await user.click(screen.getByRole("button", { name: /Create account/ }))
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText("Tell us your name.")).toBeInTheDocument()
    expect(screen.getByText("Use at least 8 characters.")).toBeInTheDocument()
    expect(screen.getByText("Please accept the terms to continue.")).toBeInTheDocument()
  })

  it("shows the strength guide, submits and confirms by email", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<Signup1 onSubmit={onSubmit} />)
    await user.type(screen.getByRole("textbox", { name: /Full name/ }), "Jordan Lee")
    await user.type(screen.getByRole("textbox", { name: /Work email/ }), "jordan@acme.com")
    await user.type(screen.getByLabelText("Password"), "Correct-Horse-9")
    expect(screen.getByText(/Strength: Strong/)).toBeInTheDocument()
    await user.click(screen.getByRole("checkbox"))
    await user.click(screen.getByRole("button", { name: /Create account/ }))
    expect(await screen.findByText("Check your inbox")).toBeInTheDocument()
    expect(onSubmit).toHaveBeenCalledWith({ name: "Jordan Lee", email: "jordan@acme.com", password: "Correct-Horse-9" })
  })

  it("hides SSO and benefits when asked", () => {
    render(<Signup1 onSso={null} benefits={[]} />)
    expect(screen.queryByRole("button", { name: /SSO/ })).not.toBeInTheDocument()
    expect(screen.queryByText(/first invoice in under an hour/)).not.toBeInTheDocument()
  })
})

describe("ForgotPassword1", () => {
  it("requests a link, then shows the confirmation with a resend countdown", async () => {
    const user = userEvent.setup()
    const onRequest = vi.fn().mockResolvedValue(undefined)
    render(<ForgotPassword1 onRequest={onRequest} />)
    await user.type(screen.getByRole("textbox", { name: "Email" }), "me@acme.com")
    await user.click(screen.getByRole("button", { name: /Send reset link/ }))
    expect(await screen.findByRole("heading", { name: "Check your email" })).toBeInTheDocument()
    expect(onRequest).toHaveBeenCalledWith("me@acme.com")
    expect(screen.getByRole("button", { name: "Resend email" })).toBeDisabled()
    expect(screen.getByRole("status")).toHaveTextContent("resend in 30s")
  })

  it("rejects a bad address", async () => {
    const user = userEvent.setup()
    render(<ForgotPassword1 />)
    await user.type(screen.getByRole("textbox", { name: "Email" }), "nope")
    await user.click(screen.getByRole("button", { name: /Send reset link/ }))
    expect(screen.getByText(/full email address/)).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Forgot your password?" })).toBeInTheDocument()
  })

  it("counts down and enables resend", () => {
    vi.useFakeTimers()
    render(<ForgotPassword1 initialView="sent" defaultEmail="me@acme.com" resendAfter={3} />)
    expect(screen.getByRole("button", { name: "Resend email" })).toBeDisabled()
    for (let i = 0; i < 4; i++) act(() => void vi.advanceTimersByTime(1000))
    expect(screen.getByRole("button", { name: "Resend email" })).toBeEnabled()
  })

  it("checks that the two passwords match before resetting", async () => {
    const user = userEvent.setup()
    const onReset = vi.fn().mockResolvedValue(undefined)
    render(<ForgotPassword1 initialView="reset" onReset={onReset} />)
    await user.type(screen.getByLabelText("New password"), "Correct-Horse-9")
    await user.type(screen.getByLabelText("Confirm password"), "different")
    await user.click(screen.getByRole("button", { name: "Update password" }))
    expect(screen.getByText("The passwords don’t match.")).toBeInTheDocument()
    expect(onReset).not.toHaveBeenCalled()
    await user.clear(screen.getByLabelText("Confirm password"))
    await user.type(screen.getByLabelText("Confirm password"), "Correct-Horse-9")
    await user.click(screen.getByRole("button", { name: "Update password" }))
    expect(await screen.findByRole("heading", { name: "Password updated" })).toBeInTheDocument()
    expect(onReset).toHaveBeenCalledWith("Correct-Horse-9")
  })

  it("can go back to change the email", async () => {
    const user = userEvent.setup()
    render(<ForgotPassword1 initialView="sent" defaultEmail="me@acme.com" />)
    await user.click(screen.getByRole("button", { name: "Use a different email" }))
    expect(screen.getByRole("heading", { name: "Forgot your password?" })).toBeInTheDocument()
  })
})

describe("Verify1", () => {
  it("masks the email and submits automatically on the last digit", async () => {
    const user = userEvent.setup()
    const onVerify = vi.fn().mockResolvedValue(undefined)
    render(<Verify1 email="jordan@acme.com" onVerify={onVerify} />)
    expect(screen.getByText("j•••••@acme.com")).toBeInTheDocument()
    await user.type(screen.getByLabelText("6-digit verification code"), "123456")
    await waitFor(() => expect(onVerify).toHaveBeenCalledWith("123456"))
    expect(await screen.findByRole("heading", { name: "You’re verified" })).toBeInTheDocument()
  })

  it("announces a wrong code, clears the field and keeps it usable", async () => {
    const user = userEvent.setup()
    render(<Verify1 onVerify={() => Promise.reject(new Error("wrong"))} />)
    const input = screen.getByLabelText("6-digit verification code")
    await user.type(input, "111111")
    expect(await screen.findByRole("alert")).toHaveTextContent("That code isn’t right")
    expect(input).toHaveValue("")
  })

  it("supports other lengths", async () => {
    const user = userEvent.setup()
    const onVerify = vi.fn().mockResolvedValue(undefined)
    render(<Verify1 length={4} onVerify={onVerify} />)
    await user.type(screen.getByLabelText("4-digit verification code"), "4242")
    await waitFor(() => expect(onVerify).toHaveBeenCalledWith("4242"))
  })

  it("enables resend after the countdown and reports it", async () => {
    vi.useFakeTimers()
    const onResend = vi.fn()
    render(<Verify1 resendAfter={2} onResend={onResend} />)
    const button = screen.getByRole("button", { name: "Resend code" })
    expect(button).toBeDisabled()
    for (let i = 0; i < 3; i++) act(() => void vi.advanceTimersByTime(1000))
    expect(button).toBeEnabled()
    act(() => button.click())
    expect(onResend).toHaveBeenCalled()
  })
})

describe("Onboarding1", () => {
  async function toTeamStep(user: ReturnType<typeof userEvent.setup>) {
    await user.type(screen.getByRole("textbox", { name: /Workspace name/ }), "Northwind Studio")
    await user.click(screen.getByRole("button", { name: /Continue/ }))
    await user.click(screen.getByRole("checkbox", { name: /Send invoices/ }))
    await user.click(screen.getByRole("button", { name: /Continue/ }))
  }

  it("fills the web address from the name and requires a name to continue", async () => {
    const user = userEvent.setup()
    render(<Onboarding1 />)
    await user.click(screen.getByRole("button", { name: /Continue/ }))
    expect(screen.getByText("Give your workspace a name.")).toBeInTheDocument()
    await user.type(screen.getByRole("textbox", { name: /Workspace name/ }), "Northwind Studio")
    expect(screen.getByRole("textbox", { name: /Web address/ })).toHaveValue("northwind-studio")
  })

  it("moves through the steps, validates goals and focuses each heading", async () => {
    const user = userEvent.setup()
    render(<Onboarding1 />)
    await user.type(screen.getByRole("textbox", { name: /Workspace name/ }), "Northwind")
    await user.click(screen.getByRole("button", { name: /Continue/ }))
    expect(await screen.findByRole("heading", { name: /What will you use/ })).toHaveFocus()
    await user.click(screen.getByRole("button", { name: /Continue/ }))
    expect(screen.getByRole("alert")).toHaveTextContent("Choose at least one.")
    await user.click(screen.getByRole("checkbox", { name: /Track expenses/ }))
    await user.click(screen.getByRole("button", { name: /Continue/ }))
    expect(await screen.findByRole("heading", { name: "Invite your team" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Back" }))
    expect(await screen.findByRole("heading", { name: /What will you use/ })).toBeInTheDocument()
  })

  it("adds, rejects duplicates of and removes invitations", async () => {
    const user = userEvent.setup()
    render(<Onboarding1 />)
    await toTeamStep(user)
    const box = await screen.findByRole("textbox", { name: "Email addresses" })
    await user.type(box, "nope{Enter}")
    expect(screen.getByText("Enter a full email address.")).toBeInTheDocument()
    await user.clear(box)
    await user.type(box, "maya@acme.com{Enter}")
    expect(screen.getByRole("list", { name: "People to invite" })).toHaveTextContent("maya@acme.com")
    await user.type(box, "maya@acme.com{Enter}")
    expect(screen.getByText("Already on the list.")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Remove maya@acme.com" }))
    expect(screen.queryByRole("list", { name: "People to invite" })).not.toBeInTheDocument()
  })

  it("completes with every answer", async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn().mockResolvedValue(undefined)
    render(<Onboarding1 onComplete={onComplete} />)
    await toTeamStep(user)
    await user.type(await screen.findByRole("textbox", { name: "Email addresses" }), "maya@acme.com{Enter}")
    await user.click(screen.getByRole("button", { name: /Continue/ }))
    expect(await screen.findByRole("heading", { name: "Ready to go?" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Create workspace" }))
    expect(await screen.findByRole("heading", { name: "Northwind Studio is ready" })).toBeInTheDocument()
    expect(onComplete).toHaveBeenCalledWith({ name: "Northwind Studio", slug: "northwind-studio", color: "chart-1", goals: ["invoicing"], invites: ["maya@acme.com"] })
  })
})

describe("Invite1", () => {
  it("accepts and shows the welcome screen", async () => {
    const user = userEvent.setup()
    const onAccept = vi.fn().mockResolvedValue(undefined)
    render(<Invite1 onAccept={onAccept} />)
    expect(screen.getByRole("heading", { name: "Northwind Studio" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Accept invitation" }))
    expect(await screen.findByRole("heading", { name: "Welcome to Northwind Studio" })).toBeInTheDocument()
    expect(onAccept).toHaveBeenCalled()
  })

  it("declines, and lets you go back", async () => {
    const user = userEvent.setup()
    render(<Invite1 onDecline={() => {}} />)
    await user.click(screen.getByRole("button", { name: "Decline" }))
    expect(await screen.findByRole("heading", { name: "Invitation declined" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /Changed your mind/ }))
    expect(screen.getByRole("button", { name: "Accept invitation" })).toBeInTheDocument()
  })

  it("announces a failed accept", async () => {
    const user = userEvent.setup()
    render(<Invite1 onAccept={() => Promise.reject(new Error("x"))} />)
    await user.click(screen.getByRole("button", { name: "Accept invitation" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("couldn’t complete")
  })

  it("offers a new request when expired", async () => {
    const user = userEvent.setup()
    const onRequestNew = vi.fn()
    render(<Invite1 status="expired" onRequestNew={onRequestNew} />)
    expect(screen.getByRole("heading", { name: "This invitation has expired" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Accept invitation" })).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Request a new invitation" }))
    expect(await screen.findByRole("heading", { name: "Request sent" })).toBeInTheDocument()
    expect(onRequestNew).toHaveBeenCalled()
  })

  it("hides decline and switch account when null", () => {
    render(<Invite1 onDecline={null} onSwitchAccount={null} />)
    expect(screen.queryByRole("button", { name: "Decline" })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Not you?" })).not.toBeInTheDocument()
  })
})
