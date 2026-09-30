import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { SignaturePad } from "@/components/ballmac/signature-pad"

describe("SignaturePad", () => {
  it("offers a keyboard typing path and clear action", async () => {
    const user = userEvent.setup()
    render(<SignaturePad label="Signature" name="signature" />)
    await user.click(screen.getByRole("button", { name: "Type" }))
    const input = screen.getByRole("textbox", { name: "Type signature" })
    await user.type(input, "Alex Morgan")
    expect(input).toHaveValue("Alex Morgan")
    await user.click(screen.getByRole("button", { name: "Clear signature" }))
    expect(input).toHaveValue("")
  })
  it("reports controlled typing without changing its own value", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<SignaturePad label="Signature" value={{ mode: "type", text: "Alex" }} onValueChange={onValueChange} />)
    await user.type(screen.getByRole("textbox", { name: "Type signature" }), " M")
    expect(onValueChange).toHaveBeenCalled()
    expect(screen.getByRole("textbox", { name: "Type signature" })).toHaveValue("Alex")
  })
})
