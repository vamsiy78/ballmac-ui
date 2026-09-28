import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Input, InputGroup, InputGroupAddon } from "@/components/ballmac/input"

describe("Input", () => {
  it("accepts typing and exposes aria-invalid", async () => {
    render(<Input aria-label="Email" aria-invalid="true" />)
    const field = screen.getByRole("textbox", { name: "Email" })
    await userEvent.type(field, "alex@acme.com")
    expect(field).toHaveValue("alex@acme.com")
    expect(field).toBeInvalid()
  })

  it("focuses the input when an addon is clicked", async () => {
    render(
      <InputGroup>
        <InputGroupAddon>https://</InputGroupAddon>
        <Input aria-label="Domain" />
        <InputGroupAddon align="end">.com</InputGroupAddon>
      </InputGroup>
    )
    await userEvent.click(screen.getByText(".com"))
    expect(screen.getByRole("textbox", { name: "Domain" })).toHaveFocus()
  })
})
