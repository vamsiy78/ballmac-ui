import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { JsonViewer } from "@/components/ballmac/json-viewer"

describe("JsonViewer", () => {
  it("expands nested data with an accessible toggle", async () => {
    const user = userEvent.setup()
    render(<JsonViewer value={{ account: { active: true } }} />)
    expect(
      screen.getByRole("region", { name: "JSON data" }),
    ).toBeInTheDocument()
    const toggle = screen.getByRole("button", { name: "Expand account" })
    await user.click(toggle)
    expect(screen.getByText(/active/)).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Collapse account" }),
    ).toHaveAttribute("aria-expanded", "true")
  })
})
