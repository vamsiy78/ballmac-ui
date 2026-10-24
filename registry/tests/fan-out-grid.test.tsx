import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { FanOutGrid, type FanItem } from "@/components/ballmac/fan-out-grid"

const items: FanItem[] = [
  { id: "1", label: "invoice-001.pdf", status: "done", duration: "1.2 s", detail: "Total $340.00" },
  { id: "2", label: "invoice-002.pdf", status: "done" },
  { id: "3", label: "invoice-003.pdf", status: "running" },
  { id: "4", label: "invoice-004.pdf", status: "failed", detail: "The total did not match the line items." },
  { id: "5", label: "invoice-005.pdf", status: "failed", detail: "Unreadable scan." },
  { id: "6", label: "invoice-006.pdf", status: "queued" },
  { id: "7", label: "invoice-007.pdf", status: "skipped" },
]

describe("FanOutGrid", () => {
  it("adds it up in words: finished of total, running and failed", () => {
    render(<FanOutGrid items={items} />)
    expect(screen.getByText(/5 of 7 finished · 1 running · 2 failed/)).toBeInTheDocument()
    expect(screen.getByRole("img", { name: "2 done, 1 running, 2 failed, 1 queued" })).toBeInTheDocument()
  })

  it("makes every tile a button named for the item and its state in words", () => {
    render(<FanOutGrid items={items} title="Invoices" />)
    const group = screen.getByRole("group", { name: "Invoices" })
    expect(within(group).getAllByRole("button")).toHaveLength(7)
    expect(screen.getByRole("button", { name: "invoice-004.pdf, failed" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "invoice-007.pdf, skipped" })).toBeInTheDocument()
  })

  it("filters to one state and says how many are in each", async () => {
    const user = userEvent.setup()
    render(<FanOutGrid items={items} title="Invoices" />)
    expect(screen.getByRole("button", { name: /^Failed 2/ })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /^Failed/ }))
    expect(within(screen.getByRole("group", { name: "Invoices" })).getAllByRole("button")).toHaveLength(2)
    await user.click(screen.getByRole("button", { name: /^All/ }))
    expect(within(screen.getByRole("group", { name: "Invoices" })).getAllByRole("button")).toHaveLength(7)
  })

  it("selects a tile and says what happened to it, and clears on a second click", async () => {
    const user = userEvent.setup()
    render(<FanOutGrid items={items} />)
    await user.click(screen.getByRole("button", { name: "invoice-001.pdf, done" }))
    expect(screen.getByText("Total $340.00")).toBeInTheDocument()
    expect(screen.getByText("1.2 s")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "invoice-001.pdf, done" }))
    expect(screen.queryByText("Total $340.00")).not.toBeInTheDocument()
  })

  it("keeps one stop in the tab order and moves with the arrow keys, Home and End", async () => {
    const user = userEvent.setup()
    render(<FanOutGrid items={items} title="Invoices" />)
    const tiles = within(screen.getByRole("group", { name: "Invoices" })).getAllByRole("button")
    expect(tiles.filter((t) => t.getAttribute("tabindex") === "0")).toHaveLength(1)
    tiles[0].focus()
    await user.keyboard("{ArrowRight}")
    expect(tiles[1]).toHaveFocus()
    await user.keyboard("{End}")
    expect(tiles[6]).toHaveFocus()
    await user.keyboard("{ArrowLeft}{Home}")
    expect(tiles[0]).toHaveFocus()
  })

  it("retries every failed item at once, or one from its detail", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn().mockResolvedValue(undefined)
    render(<FanOutGrid items={items} onRetry={onRetry} />)
    await user.click(screen.getByRole("button", { name: "Retry 2 failed" }))
    expect(onRetry).toHaveBeenLastCalledWith(["4", "5"])
    await user.click(screen.getByRole("button", { name: "invoice-005.pdf, failed" }))
    await user.click(screen.getByRole("button", { name: "Retry this one" }))
    expect(onRetry).toHaveBeenLastCalledWith(["5"])
  })

  it("says why when a retry fails, and has no Retry when nothing failed", async () => {
    const user = userEvent.setup()
    const { rerender } = render(<FanOutGrid items={items} onRetry={() => Promise.reject(new Error("The worker pool is full."))} />)
    await user.click(screen.getByRole("button", { name: "Retry 2 failed" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("The worker pool is full.")
    rerender(<FanOutGrid items={items.filter((i) => i.status !== "failed")} onRetry={() => {}} />)
    expect(screen.queryByRole("button", { name: /^Retry/ })).not.toBeInTheDocument()
  })
})
