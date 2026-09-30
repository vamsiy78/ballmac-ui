import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { CurrencyInput } from "@/components/ballmac/currency-input"

describe("CurrencyInput", () => {
  it("keeps raw text during editing and formats on blur", async () => {
    const user = userEvent.setup()
    render(<CurrencyInput label="Budget" defaultValue={1250.5} />)
    const field = screen.getByRole("textbox", { name: "Budget" })
    expect(field).toHaveValue("$1,250.50")
    await user.click(field)
    expect(field).toHaveValue("1250.5")
    await user.clear(field)
    await user.type(field, "2350.75")
    await user.tab()
    expect(field).toHaveValue("$2,350.75")
  })
  it("parses a locale decimal separator and reports a controlled value", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<CurrencyInput label="Amount" currency="EUR" locale="de-DE" value={12} onValueChange={onValueChange} />)
    const field = screen.getByRole("textbox", { name: "Amount" })
    await user.click(field)
    await user.clear(field)
    await user.type(field, "42,50")
    expect(onValueChange).toHaveBeenCalledWith(42.5)
    await user.tab()
    expect(field).toHaveValue("12,00 €")
  })
})
