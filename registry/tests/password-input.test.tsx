import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { PasswordInput } from "@/components/ballmac/password-input"
describe("PasswordInput", () => {
  it("shows strength and toggles visibility with the keyboard", async () => {
    const user = userEvent.setup()
    render(<PasswordInput label="New password" />)
    const input = screen.getByLabelText("New password")
    await user.type(input, "Launch2026!")
    expect(screen.getByText(/Strength: Strong/)).toBeInTheDocument()
    await user.tab()
    await user.keyboard(" ")
    expect(input).toHaveAttribute("type", "text")
  })
  it("reports controlled edits", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<PasswordInput value="abc" onValueChange={onValueChange} />)
    await user.type(screen.getByLabelText("Password"), "d")
    expect(onValueChange).toHaveBeenCalledWith("abcd")
    expect(screen.getByLabelText("Password")).toHaveValue("abc")
  })
})
