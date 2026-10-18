import * as React from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { Inventory1, type Inventory1Item } from "@/components/ballmac/blocks/inventory-1/inventory-1"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

const I = (id: string, name: string, onHand: number, reorderAt: number, perDay: number, extra: Partial<Inventory1Item> = {}): Inventory1Item => ({ id, sku: `SKU-${id}`, name, category: "Tops", onHand, reorderAt, perDay, cost: 10, ...extra })
const items = [I("a", "Alpha", 0, 10, 2), I("b", "Bravo", 8, 10, 4), I("c", "Charlie", 30, 10, 3), I("d", "Delta", 90, 10, 1)]
const row = (n: string) => screen.getAllByText(n)[0]!.closest("li")!

describe("Inventory1", () => {
  it("works out the status of each item in words", () => {
    render(<Inventory1 items={items} />)
    expect(within(row("Alpha")).getByText("Out of stock")).toBeInTheDocument()
    expect(within(row("Bravo")).getByText("Low")).toBeInTheDocument()
    expect(within(row("Charlie")).getByText("In stock")).toBeInTheDocument()
    expect(within(row("Delta")).getByText("Plenty")).toBeInTheDocument()
  })

  it("works out days left and stock value", () => {
    render(<Inventory1 items={items} currency="USD" />)
    expect(within(row("Bravo")).getByText("2 days left")).toBeInTheDocument()
    expect(within(row("Delta")).getByText("90 days left")).toBeInTheDocument()
    // (0 + 8 + 30 + 90) * 10 = 1,280
    expect(screen.getByText("$1,280")).toBeInTheDocument()
  })

  it("sorts what will run out first to the top", () => {
    render(<Inventory1 items={items} />)
    const names = screen.getAllByRole("listitem").filter((l) => l.querySelector("button")).map((l) => l.textContent!.slice(0, 5))
    expect(names[0]).toMatch(/Alpha/)
    expect(names[1]).toMatch(/Bravo/)
  })

  it("filters by stock level and by search, with counts", async () => {
    const user = userEvent.setup()
    render(<Inventory1 items={items} />)
    await user.click(screen.getByRole("button", { name: /^Low/ }))
    expect(screen.getAllByText("1 product").length).toBeGreaterThan(0)
    await user.click(screen.getByRole("button", { name: /^All/ }))
    await user.type(screen.getByRole("searchbox", { name: "Search products" }), "zzzz")
    expect(screen.getByText("No products match")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Clear filters" }))
    expect(screen.getAllByText("4 products").length).toBeGreaterThan(0)
  })

  it("suggests an order of two reorder points plus two weeks of sales, minus what is held and coming", async () => {
    const user = userEvent.setup()
    render(<Inventory1 items={[I("b", "Bravo", 8, 10, 4, { incoming: { qty: 5, eta: "Oct 24" } })]} />)
    await user.click(screen.getByRole("button", { name: "Reorder Bravo" }))
    // 10*2 + 4*14 - 8 - 5 = 63
    expect(screen.getByLabelText("How many")).toHaveValue("63")
  })

  it("places an order, adds it to what is on the way, and tells the host", async () => {
    const user = userEvent.setup()
    const onReorder = vi.fn().mockResolvedValue(undefined)
    render(<Inventory1 items={items} onReorder={onReorder} />)
    await user.click(screen.getByRole("button", { name: "Reorder Alpha" }))
    const qty = screen.getByLabelText("How many")
    await user.clear(qty)
    await user.type(qty, "50")
    await user.click(screen.getByRole("button", { name: "Place order" }))
    expect(onReorder).toHaveBeenCalledWith(expect.objectContaining({ id: "a" }), 50)
    expect(await screen.findByText(/50 arriving in 7 days/)).toBeInTheDocument()
  })

  it("rejects a bad quantity and shows a failed order in place", async () => {
    const user = userEvent.setup()
    render(<Inventory1 items={items} defaultOrderingId="a" onReorder={() => Promise.reject(new Error("The supplier is closed."))} />)
    const qty = screen.getByLabelText("How many")
    await user.clear(qty)
    await user.type(qty, "abc")
    await user.click(screen.getByRole("button", { name: "Place order" }))
    expect(screen.getByRole("alert")).toHaveTextContent("whole number")
    await user.clear(qty)
    await user.type(qty, "10")
    await user.click(screen.getByRole("button", { name: "Place order" }))
    expect(await screen.findByText("The supplier is closed.")).toBeInTheDocument()
    expect(screen.queryByText(/arriving in 7 days/)).toBeNull()
  })

  it("shows loading, empty and error states", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const { rerender } = render(<Inventory1 state="loading" />)
    expect(screen.getByRole("status")).toBeInTheDocument()
    rerender(<Inventory1 state="empty" />)
    expect(screen.getByRole("heading", { name: "No stock recorded" })).toBeInTheDocument()
    rerender(<Inventory1 state="error" onRetry={onRetry} />)
    await user.click(screen.getByRole("button", { name: /try again/i }))
    expect(onRetry).toHaveBeenCalled()
  })
})
