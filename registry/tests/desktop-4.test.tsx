import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Desktop4 } from "@/components/ballmac/blocks/desktop-4/desktop-4"

describe("Desktop4", () => {
  it("strips spaces and line breaks from a pasted key and shows who it is licensed to", async () => {
    const user = userEvent.setup()
    const onActivate = vi.fn().mockResolvedValue({ licensedTo: "jordan@acme.com", plan: "Pro" })
    render(<Desktop4 feel="macos" onActivate={onActivate} />)
    await user.click(screen.getByLabelText("Licence key"))
    await user.paste(" ABCD-1234 \n EFGH-5678 ")
    await user.click(screen.getByRole("button", { name: /Activate/ }))
    expect(onActivate).toHaveBeenCalledWith("ABCD-1234EFGH-5678")
    expect(await screen.findByRole("heading", { name: /Acme Pro is activated/ })).toBeInTheDocument()
    expect(screen.getByText("jordan@acme.com")).toBeInTheDocument()
    expect(screen.getByText(/on this Mac/)).toBeInTheDocument()
  })

  it("shows the thrown message as an alert linked to the field", async () => {
    const user = userEvent.setup()
    const onActivate = vi.fn().mockRejectedValue(new Error("This key was refunded."))
    render(<Desktop4 feel="windows" onActivate={onActivate} />)
    const field = screen.getByLabelText("Licence key")
    await user.type(field, "WXYZ{Enter}")
    expect(await screen.findByRole("alert")).toHaveTextContent("This key was refunded.")
    expect(field).toHaveAttribute("aria-invalid", "true")
    expect(field.getAttribute("aria-describedby")).toBe(screen.getByRole("alert").id)
  })

  it("asks for a key when the field is empty", async () => {
    const user = userEvent.setup()
    const onActivate = vi.fn()
    render(<Desktop4 onActivate={onActivate} />)
    await user.click(screen.getByRole("button", { name: /Activate/ }))
    expect(onActivate).not.toHaveBeenCalled()
    expect(screen.getByRole("alert")).toHaveTextContent(/Enter the licence key/)
  })

  it("offers Quit instead of Continue once the trial has ended", () => {
    render(<Desktop4 feel="macos" trialDaysLeft={0} />)
    expect(screen.getByRole("heading", { name: "Your free trial has ended" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Quit Acme" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /Continue/ })).toBeNull()
  })

  it("deactivates from the licensed view", async () => {
    const user = userEvent.setup()
    const onDeactivate = vi.fn()
    render(<Desktop4 feel="windows" licence={{ licensedTo: "a@b.co" }} onDeactivate={onDeactivate} />)
    await user.click(screen.getByRole("button", { name: "Deactivate this PC" }))
    expect(onDeactivate).toHaveBeenCalled()
    expect(await screen.findByLabelText("Licence key")).toBeInTheDocument()
  })
})
