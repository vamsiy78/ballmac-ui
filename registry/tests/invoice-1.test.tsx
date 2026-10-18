import * as React from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { Invoice1, type Invoice1Data } from "@/components/ballmac/blocks/invoice-1/invoice-1"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

const inv: Invoice1Data = {
  number: "INV-1",
  issued: "2026-10-01",
  due: "2026-10-15",
  from: { name: "Acme", lines: ["Lisbon"] },
  to: { name: "Buyer", lines: ["London"] },
  lines: [{ id: "a", description: "Design", quantity: 2, unitPrice: 500 }, { id: "b", description: "Hosting", quantity: 3, unitPrice: 10 }],
  discountPercent: 10,
  taxPercent: 20,
}

describe("Invoice1", () => {
  it("works out subtotal, discount, tax and total from the lines", () => {
    render(<Invoice1 invoice={inv} />)
    // 2*500 + 3*10 = 1030; 10% off = 927; 20% tax = 185.40; total 1112.40
    const totals = screen.getByText("Subtotal").closest("dl")!
    expect(within(totals).getByText("$1,030.00")).toBeInTheDocument()
    expect(within(totals).getByText("−$103.00")).toBeInTheDocument()
    expect(within(totals).getByText("$185.40")).toBeInTheDocument()
    expect(within(totals).getByText("$1,112.40")).toBeInTheDocument()
  })

  it("says overdue by how many days, from the day passed in", () => {
    render(<Invoice1 invoice={inv} today="2026-10-18" />)
    expect(screen.getByRole("status")).toHaveTextContent("Overdue by 3 days")
  })

  it("says due today and due in N days", () => {
    const { rerender } = render(<Invoice1 invoice={inv} today="2026-10-15" />)
    expect(screen.getByRole("status")).toHaveTextContent("Due today")
    rerender(<Invoice1 invoice={inv} today="2026-10-14" />)
    expect(screen.getByRole("status")).toHaveTextContent("Due in 1 day")
    rerender(<Invoice1 invoice={inv} today="2026-10-10" />)
    expect(screen.getByRole("status")).toHaveTextContent("Due in 5 days")
  })

  it("says paid on a date and offers no payment", () => {
    render(<Invoice1 invoice={{ ...inv, paidOn: "2026-10-09" }} locale="en-GB" currency="GBP" onPay={() => {}} />)
    expect(screen.getByRole("status")).toHaveTextContent("Paid on 9 October 2026")
    expect(screen.queryByRole("button", { name: /Pay .* now/ })).toBeNull()
    expect(screen.getByText("Amount paid")).toBeInTheDocument()
  })

  it("pays, shows Paying, then marks it paid", async () => {
    const user = userEvent.setup()
    let done: () => void = () => {}
    const onPay = vi.fn(() => new Promise<void>((r) => (done = r)))
    render(<Invoice1 invoice={inv} onPay={onPay} />)
    await user.click(screen.getByRole("button", { name: "Pay $1,112.40 now" }))
    expect(screen.getByRole("button", { name: "Paying" })).toBeDisabled()
    done()
    expect(await screen.findByText(/Paid/)).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /Pay .* now/ })).toBeNull()
  })

  it("shows a failed payment in place and stays unpaid", async () => {
    const user = userEvent.setup()
    render(<Invoice1 invoice={inv} onPay={() => Promise.reject(new Error("Declined. You have not been charged."))} />)
    await user.click(screen.getByRole("button", { name: /Pay .* now/ }))
    expect(await screen.findByRole("alert")).toHaveTextContent("You have not been charged")
    expect(screen.getByRole("button", { name: /Pay .* now/ })).toBeEnabled()
  })

  it("has a captioned table of the items", () => {
    render(<Invoice1 invoice={inv} />)
    const table = screen.getByRole("table", { name: "Items on invoice INV-1" })
    expect(within(table).getAllByRole("row")).toHaveLength(3)
    expect(within(table).getByText("$1,000.00")).toBeInTheDocument()
  })

  it("prints from the Print button", async () => {
    const user = userEvent.setup()
    const print = vi.spyOn(window, "print").mockImplementation(() => {})
    render(<Invoice1 invoice={inv} />)
    await user.click(screen.getByRole("button", { name: "Print" }))
    expect(print).toHaveBeenCalled()
  })

  it("shows loading and error states", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const { rerender } = render(<Invoice1 state="loading" />)
    expect(screen.getByRole("status")).toBeInTheDocument()
    rerender(<Invoice1 state="error" onRetry={onRetry} />)
    await user.click(screen.getByRole("button", { name: /try again/i }))
    expect(onRetry).toHaveBeenCalled()
  })
})
