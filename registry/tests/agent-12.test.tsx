import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Agent12 } from "@/components/ballmac/blocks/agent-12/agent-12"

describe("Agent12", () => {
  it("adds up spend, tokens, running agents and decisions waiting", () => {
    render(<Agent12 />)
    const kpi = (label: string) => screen.getByText(label, { selector: "dt" }).nextElementSibling?.textContent
    expect(kpi("Spend")).toBe("$0.66")
    expect(kpi("Tokens")).toBe("97.8K")
    expect(kpi("Agents")).toBe("3 of 7")
    expect(kpi("Needs you")).toBe("2")
  })

  it("shows the delegation tree and the requests with who asked", () => {
    render(<Agent12 />)
    expect(screen.getByRole("tree")).toBeInTheDocument()
    const asks = screen.getByRole("complementary")
    expect(within(asks).getByText("Refund $340.00 to Maria Lopez")).toBeInTheDocument()
    expect(within(asks).getAllByText("Asked by Payments")).toHaveLength(2)
    expect(within(asks).getByText("High risk")).toBeInTheDocument()
  })

  it("approves a request, removes it and says what was done", async () => {
    const user = userEvent.setup()
    const onApprove = vi.fn().mockResolvedValue(undefined)
    render(<Agent12 onApprove={onApprove} />)
    await user.click(screen.getAllByRole("button", { name: "Approve" })[0])
    expect(onApprove).toHaveBeenCalledWith(expect.objectContaining({ id: "q1" }))
    expect(await screen.findByText("Approved: Refund $340.00 to Maria Lopez.")).toBeInTheDocument()
    expect(screen.queryByText("Refund $340.00 to Maria Lopez", { selector: "p" })).not.toBeInTheDocument()
    expect(screen.getByText("Needs you", { selector: "dt" }).nextElementSibling).toHaveTextContent("1")
  })

  it("keeps a request and says why when denying fails", async () => {
    const user = userEvent.setup()
    render(<Agent12 onDeny={() => Promise.reject(new Error("The agent has already moved on."))} />)
    await user.click(screen.getAllByRole("button", { name: "Deny" })[1])
    expect(await screen.findByRole("alert")).toHaveTextContent("The agent has already moved on.")
    expect(screen.getByText("Refund $58.20 to Tomás Reyes")).toBeInTheDocument()
  })

  it("says nothing is waiting when the inbox is empty", () => {
    render(<Agent12 requests={[]} />)
    expect(screen.getByText("Nothing is waiting for you.")).toBeInTheDocument()
  })

  it("shows loading, empty and error states", () => {
    const { rerender } = render(<Agent12 state="loading" />)
    expect(screen.getByRole("status")).toHaveTextContent("Loading the agents")
    rerender(<Agent12 agents={[]} />)
    expect(screen.getByText("No agents running")).toBeInTheDocument()
    rerender(<Agent12 state="error" onRetry={() => {}} />)
    expect(screen.getByRole("alert")).toHaveTextContent("The agents could not be loaded")
  })
})
