import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Agent2, type Agent2Request } from "@/components/ballmac/blocks/agent-2/agent-2"

const requests: Agent2Request[] = [
  { id: "1", agent: "Billing", title: "Refund $40", risk: "high", requested: "1 min ago", status: "pending" },
  { id: "2", agent: "Research", title: "Read 3 pages", risk: "low", requested: "2 min ago", status: "pending" },
  { id: "3", agent: "Research", title: "Search the docs", risk: "low", requested: "3 min ago", status: "pending" },
]

describe("Agent2", () => {
  it("moves with J and K, approves with A and selects the next request", async () => {
    const user = userEvent.setup()
    const onApprove = vi.fn()
    render(<Agent2 requests={requests} onApprove={onApprove} />)
    const list = screen.getByRole("listbox", { name: "Waiting requests" })
    list.focus()
    await user.keyboard("j")
    expect(screen.getAllByRole("option")[1]).toHaveAttribute("aria-selected", "true")
    await user.keyboard("a")
    expect(onApprove).toHaveBeenCalledWith("2")
    expect(screen.getAllByRole("option")).toHaveLength(2)
    expect(screen.getByRole("option", { name: /Search the docs/ })).toHaveAttribute("aria-selected", "true")
  })

  it("denies with D", async () => {
    const user = userEvent.setup()
    const onDeny = vi.fn()
    render(<Agent2 requests={requests} onDeny={onDeny} />)
    screen.getByRole("listbox").focus()
    await user.keyboard("d")
    expect(onDeny).toHaveBeenCalledWith("1")
  })

  it("approves every low-risk request at once and then shows the rest", async () => {
    const user = userEvent.setup()
    const onApprove = vi.fn()
    render(<Agent2 requests={requests} onApprove={onApprove} />)
    await user.click(screen.getByRole("button", { name: "Approve 2 low-risk" }))
    expect(onApprove).toHaveBeenCalledTimes(2)
    expect(screen.getAllByRole("option")).toHaveLength(1)
  })

  it("says all caught up once nothing is waiting", async () => {
    const user = userEvent.setup()
    render(<Agent2 requests={[requests[0]!]} />)
    screen.getByRole("listbox").focus()
    await user.keyboard("a")
    expect(screen.getByText("All caught up")).toBeInTheDocument()
  })
})
