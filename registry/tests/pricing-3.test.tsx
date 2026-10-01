import * as React from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Pricing3 } from "@/components/ballmac/blocks/pricing-3/pricing-3"

describe("Pricing3", () => {
  it("renders a table with a column per plan and labelled boolean cells", () => {
    render(<Pricing3 />)
    const table = screen.getByRole("table", { name: "Plan comparison" })
    expect(table.querySelectorAll("thead th")).toHaveLength(4)
    expect(within(table).getAllByLabelText("Custom domain: included")).toHaveLength(2)
    expect(within(table).getAllByLabelText("Custom domain: not included")).toHaveLength(1)
  })

  it("collapses and expands a feature group", async () => {
    const user = userEvent.setup()
    render(<Pricing3 />)
    const table = screen.getByRole("table")
    const toggle = within(table).getByRole("button", { name: "Core" })
    expect(toggle).toHaveAttribute("aria-expanded", "true")
    expect(within(table).getByText("Storage")).toBeInTheDocument()
    await user.click(toggle)
    expect(toggle).toHaveAttribute("aria-expanded", "false")
    expect(within(table).queryByText("Storage")).not.toBeInTheDocument()
    await user.click(toggle)
    expect(within(table).getByText("Storage")).toBeInTheDocument()
  })

  it("switches the plan shown in the phone layout", async () => {
    const user = userEvent.setup()
    render(<Pricing3 />)
    expect(screen.getByRole("radio", { name: "Pro" })).toHaveAttribute("aria-checked", "true")
    await user.click(screen.getByRole("radio", { name: "Starter" }))
    expect(screen.getByRole("radio", { name: "Starter" })).toHaveAttribute("aria-checked", "true")
  })

  it("applies the sticky offset to the header cells", () => {
    render(<Pricing3 stickyOffset={64} />)
    expect(screen.getAllByRole("columnheader")[1]).toHaveStyle({ top: "64px" })
  })
})
