import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Agent14 } from "@/components/ballmac/blocks/agent-14/agent-14"

describe("Agent14", () => {
  it("shows the heading, the grid of items and the queue of what runs next", () => {
    render(<Agent14 />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Matching invoices")
    expect(within(screen.getByRole("group", { name: "Invoices" })).getAllByRole("button")).toHaveLength(48)
    expect(screen.getByRole("heading", { name: "What runs next" })).toBeInTheDocument()
    expect(screen.getByText("2 running")).toBeInTheDocument()
  })

  it("starts on a failed item and says what went wrong", () => {
    render(<Agent14 />)
    expect(screen.getByText("The total did not match the line items: $412.00 against $421.00.")).toBeInTheDocument()
  })

  it("retries the failed items from the grid", async () => {
    const user = userEvent.setup()
    const onRetryItems = vi.fn().mockResolvedValue(undefined)
    render(<Agent14 onRetryItems={onRetryItems} />)
    await user.click(screen.getByRole("button", { name: "Retry 3 failed" }))
    expect(onRetryItems).toHaveBeenCalledWith(["7", "19", "33"])
  })

  it("reorders the waiting work from the queue", async () => {
    const user = userEvent.setup()
    const onMove = vi.fn().mockResolvedValue(undefined)
    render(<Agent14 onMove={onMove} />)
    await user.click(screen.getByRole("button", { name: "Move Post matched invoices to the ledger up" }))
    expect(onMove).toHaveBeenCalledWith("b", 0)
  })

  it("shows loading, empty and error states", () => {
    const onRetry = vi.fn()
    const { rerender } = render(<Agent14 state="loading" />)
    expect(screen.getByRole("status")).toHaveTextContent("Loading the batch")
    rerender(<Agent14 items={[]} />)
    expect(screen.getByText("No batch running")).toBeInTheDocument()
    rerender(<Agent14 state="error" onRetry={onRetry} />)
    expect(screen.getByRole("alert")).toHaveTextContent("The batch could not be loaded")
  })
})
