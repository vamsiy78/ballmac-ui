import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Agent13 } from "@/components/ballmac/blocks/agent-13/agent-13"

describe("Agent13", () => {
  it("shows the heading and the desk with the first item waiting selected", () => {
    render(<Agent13 />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Review desk")
    expect(screen.getByRole("listbox", { name: "Items to review" })).toBeInTheDocument()
    expect(screen.getByText(/4 to review · 1 approved/)).toBeInTheDocument()
    expect(screen.getAllByRole("option")[0]).toHaveAttribute("aria-selected", "true")
  })

  it("shows what an item changed, with added and removed lines in words for screen readers", () => {
    render(<Agent13 />)
    expect(screen.getAllByText("Added:").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Removed:").length).toBeGreaterThan(0)
  })

  it("approves with the keyboard and passes it on", async () => {
    const user = userEvent.setup()
    const onApprove = vi.fn().mockResolvedValue(undefined)
    render(<Agent13 onApprove={onApprove} />)
    screen.getAllByRole("option")[0].focus()
    await user.keyboard("a")
    expect(onApprove).toHaveBeenCalledWith("1")
  })

  it("shows loading, empty and error states", () => {
    const { rerender } = render(<Agent13 state="loading" />)
    expect(screen.getByRole("status")).toHaveTextContent("Loading the items to review")
    rerender(<Agent13 items={[]} />)
    expect(screen.getByText("Nothing to review")).toBeInTheDocument()
    rerender(<Agent13 state="error" onRetry={() => {}} />)
    expect(screen.getByRole("alert")).toHaveTextContent("The items could not be loaded")
  })
})
