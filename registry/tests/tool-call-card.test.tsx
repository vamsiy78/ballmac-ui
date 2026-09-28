import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { ToolCallCard } from "@/components/ballmac/tool-call-card"

describe("ToolCallCard", () => {
  it("states its status in text and toggles the details", async () => {
    render(<ToolCallCard name="search_docs" status="error" input={{ q: "x" }} result="Timed out" />)
    expect(screen.getByText(/error|failed/i)).toBeInTheDocument()
    const toggle = screen.getAllByRole("button").find((b) => b.hasAttribute("aria-expanded"))!
    expect(toggle).toHaveAttribute("aria-expanded", "false")
    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByText(/Timed out/)).toBeInTheDocument()
  })
})
