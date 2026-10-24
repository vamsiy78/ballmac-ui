import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { RunLedger, formatDuration, type LedgerRow } from "@/components/ballmac/run-ledger"

const rows: LedgerRow[] = [
  { id: "a", label: "Alpha", ms: 1000, cost: 0.5, tokensIn: 1000, tokensOut: 200 },
  { id: "b", label: "Beta", ms: 5000, cost: 2, tokensIn: 5000 },
  { id: "c", label: "Gamma", ms: 3000, cost: 1.5 },
]
const order = () => screen.getAllByRole("rowheader").map((h) => h.textContent?.replace(/Most expensive|Model|Tool/g, "").trim()).filter((t) => t && t !== "Total")

describe("RunLedger", () => {
  it("is a table with a caption, a total row and the most expensive step marked in words", () => {
    render(<RunLedger rows={rows} />)
    expect(screen.getByRole("table", { name: "Run ledger" })).toBeInTheDocument()
    const total = screen.getByRole("rowheader", { name: "Total" }).closest("tr") as HTMLElement
    expect(within(total).getByText("$4.00")).toBeInTheDocument()
    expect(within(total).getByText("9 s")).toBeInTheDocument()
    expect(screen.getByText("Most expensive")).toBeInTheDocument()
  })
  it("starts sorted by cost, highest first, and sorts again from the column buttons", async () => {
    const user = userEvent.setup()
    render(<RunLedger rows={rows} />)
    expect(order()).toEqual(["Beta", "Gamma", "Alpha"])
    expect(screen.getByRole("columnheader", { name: /Cost/ })).toHaveAttribute("aria-sort", "descending")
    await user.click(screen.getByRole("button", { name: "Cost" }))
    expect(order()).toEqual(["Alpha", "Gamma", "Beta"])
    expect(screen.getByRole("columnheader", { name: /Cost/ })).toHaveAttribute("aria-sort", "ascending")
    await user.click(screen.getByRole("button", { name: "Step" }))
    expect(order()).toEqual(["Alpha", "Beta", "Gamma"])
  })
  it("shows a budget meter that warns and then says it is over, in words", () => {
    const { rerender } = render(<RunLedger rows={rows} budget={10} />)
    expect(screen.getByRole("meter", { name: "Budget" }).getAttribute("aria-valuetext")).toContain("$4.00 of $10.00")
    expect(screen.queryByRole("status")).toBeNull()
    rerender(<RunLedger rows={rows} budget={4.5} />)
    expect(screen.getByRole("status")).toHaveTextContent("Nearing the budget, $0.50 left")
    rerender(<RunLedger rows={rows} budget={3} />)
    expect(screen.getByRole("status")).toHaveTextContent("Over budget by $1.00")
  })
  it("formats small amounts with more digits and uses the currency and locale you give it", () => {
    render(<RunLedger rows={[{ id: "x", label: "Tiny", ms: 10, cost: 0.0123 }]} currency="EUR" locale="de-DE" />)
    expect(screen.getAllByText(/0,0123/).length).toBeGreaterThan(0)
  })
  it("formats durations", () => {
    expect(formatDuration(850)).toBe("850 ms")
    expect(formatDuration(4200)).toBe("4.2 s")
    expect(formatDuration(125_000)).toBe("2 min 5 s")
    expect(formatDuration(120_000)).toBe("2 min")
  })
})
