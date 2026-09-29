import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { ColorPicker } from "@/components/ballmac/color-picker"
describe("ColorPicker", () => {
  it("edits the hexadecimal value and flags incomplete input", async () => {
    const user = userEvent.setup()
    render(<ColorPicker defaultValue="#123456" label="Accent" />)
    const input = screen.getByRole("textbox", { name: "Accent hex value" })
    await user.clear(input)
    await user.type(input, "#abcdef")
    expect(input).toHaveValue("#abcdef")
    expect(input).not.toHaveAttribute("aria-invalid", "true")
  })
  it("reports controlled edits", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<ColorPicker value="#123456" onValueChange={onValueChange} />)
    await user.clear(screen.getByRole("textbox", { name: "Color hex value" }))
    expect(onValueChange).toHaveBeenCalledWith("")
    expect(
      screen.getByRole("textbox", { name: "Color hex value" }),
    ).toHaveValue("#123456")
  })
})
