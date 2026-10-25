import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Agent17 } from "@/components/ballmac/blocks/agent-17/agent-17"

describe("Agent17", () => {
  it("shows the scorecard and the prompt diff", () => {
    render(<Agent17 />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Prompt evaluation")
    expect(screen.getByText("6 of 8 cases passed")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "What changed in the prompt" })).toBeInTheDocument()
  })

  it("flags the cases that got worse", async () => {
    const user = userEvent.setup()
    render(<Agent17 />)
    await user.click(screen.getByRole("button", { name: /^Got worse/ }))
    expect(screen.getByText("Refund after 30 days")).toBeInTheDocument()
    expect(screen.queryByText("Greets")).not.toBeInTheDocument()
  })

  it("runs the failures again", async () => {
    const user = userEvent.setup()
    const onRerun = vi.fn().mockResolvedValue(undefined)
    render(<Agent17 onRerun={onRerun} />)
    await user.click(screen.getByRole("button", { name: "Run the 2 failed again" }))
    expect(onRerun).toHaveBeenCalledWith(["2", "5"])
  })

  it("renders the loading, empty and error states", () => {
    const { rerender } = render(<Agent17 state="loading" />)
    expect(screen.getByRole("status")).toBeInTheDocument()
    rerender(<Agent17 cases={[]} />)
    expect(screen.getByText("No cases yet")).toBeInTheDocument()
    rerender(<Agent17 state="error" onRetry={() => {}} />)
    expect(screen.getByRole("alert")).toBeInTheDocument()
  })
})
