import * as React from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { Expenses1, type Expenses1Line } from "@/components/ballmac/blocks/expenses-1/expenses-1"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

const L = (id: string, merchant: string, category: string, amount: number, receipt?: string): Expenses1Line => ({ id, date: "2026-10-12", merchant, category, amount, receipt })

describe("Expenses1", () => {
  it("works out the total and a text equivalent of the category bar", () => {
    render(<Expenses1 lines={[L("a", "Train", "travel", 100, "t.pdf"), L("b", "Lunch", "meals", 20.5)]} currency="GBP" />)
    expect(screen.getByText("£120.50")).toBeInTheDocument()
    expect(screen.getByRole("img", { name: "Total by category: Travel £100.00, Meals £20.50" })).toBeInTheDocument()
  })

  it("says in words when a line needs a receipt or goes over its category limit", () => {
    render(<Expenses1 lines={[L("a", "Big dinner", "meals", 92.4, "d.jpg"), L("b", "Taxi", "travel", 40)]} currency="GBP" />)
    expect(screen.getByText("Over the £75.00 limit for Meals")).toBeInTheDocument()
    expect(screen.getByText("Needs a receipt: it is over £25.00")).toBeInTheDocument()
  })

  it("will not submit with a missing receipt, and names the line", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Expenses1 lines={[L("a", "Taxi", "travel", 40)]} onSubmit={onSubmit} currency="GBP" />)
    await user.click(screen.getByRole("button", { name: /^Submit/ }))
    expect(screen.getAllByRole("alert").some((a) => /1 expense needs a receipt before you can send: Taxi/.test(a.textContent ?? ""))).toBe(true)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("attaching a receipt clears the problem and allows sending", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<Expenses1 lines={[L("a", "Taxi", "travel", 40)]} onSubmit={onSubmit} currency="GBP" />)
    await user.upload(screen.getByLabelText(/Attach receipt for Taxi/), new File(["x"], "taxi.png", { type: "image/png" }))
    expect(screen.getByText("taxi.png")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /^Submit/ }))
    expect(onSubmit).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ merchant: "Taxi", receipt: "taxi.png" })]), 40)
    expect(await screen.findByText("Report sent for approval")).toBeInTheDocument()
  })

  it("rejects an empty merchant and a bad amount, then adds a good line", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Expenses1 lines={[L("a", "Train", "travel", 10, "t.pdf")]} onChange={onChange} currency="GBP" />)
    await user.click(screen.getByRole("button", { name: "Add" }))
    expect(screen.getByRole("alert")).toHaveTextContent("Say who you paid.")
    await user.type(screen.getByLabelText("Paid to"), "Coffee")
    await user.type(screen.getByLabelText("Amount"), "abc")
    await user.click(screen.getByRole("button", { name: "Add" }))
    expect(screen.getByRole("alert")).toHaveTextContent("Enter the amount")
    await user.clear(screen.getByLabelText("Amount"))
    await user.type(screen.getByLabelText("Amount"), "4,50")
    await user.click(screen.getByRole("button", { name: "Add" }))
    expect(onChange).toHaveBeenLastCalledWith(expect.arrayContaining([expect.objectContaining({ merchant: "Coffee", amount: 4.5 })]))
  })

  it("removes a line, saying which one", async () => {
    const user = userEvent.setup()
    render(<Expenses1 lines={[L("a", "Train", "travel", 10, "t.pdf"), L("b", "Lunch", "meals", 5)]} currency="GBP" />)
    await user.click(screen.getByRole("button", { name: "Remove Lunch, £5.00" }))
    expect(screen.queryByText("Lunch")).toBeNull()
  })

  it("keeps the report open and says why when submitting fails", async () => {
    const user = userEvent.setup()
    render(<Expenses1 lines={[L("a", "Train", "travel", 10, "t.pdf")]} onSubmit={() => Promise.reject(new Error("The report period is closed."))} currency="GBP" />)
    await user.click(screen.getByRole("button", { name: /^Submit/ }))
    expect(await screen.findByText("The report period is closed.")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /^Submit/ })).toBeEnabled()
  })

  it("shows loading, empty and error states", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const { rerender } = render(<Expenses1 state="loading" />)
    expect(screen.getByRole("status")).toBeInTheDocument()
    rerender(<Expenses1 state="empty" />)
    expect(screen.getByRole("heading", { name: "No expenses on this report" })).toBeInTheDocument()
    rerender(<Expenses1 state="error" onRetry={onRetry} />)
    await user.click(screen.getByRole("button", { name: /try again/i }))
    expect(onRetry).toHaveBeenCalled()
  })
})
