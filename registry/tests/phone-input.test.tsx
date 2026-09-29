import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { PhoneInput } from "@/components/ballmac/phone-input"
describe("PhoneInput", () => {
  it("preserves typed formatting and changes dialing prefix", async () => {
    const user = userEvent.setup()
    render(<PhoneInput label="Mobile" />)
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Country dialing code" }),
      "+91",
    )
    await user.type(
      screen.getByRole("textbox", { name: "Mobile" }),
      "98765 43210",
    )
    expect(screen.getByRole("combobox")).toHaveValue("+91")
    expect(screen.getByRole("textbox", { name: "Mobile" })).toHaveValue(
      "98765 43210",
    )
  })
  it("reports controlled number changes", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<PhoneInput value="123" onValueChange={onValueChange} />)
    await user.type(screen.getByRole("textbox", { name: "Phone number" }), "4")
    expect(onValueChange).toHaveBeenCalledWith("1234")
    expect(screen.getByRole("textbox", { name: "Phone number" })).toHaveValue(
      "123",
    )
  })
})
