import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

vi.mock("recharts", async (importOriginal) => ({
  ...(await importOriginal<typeof import("recharts")>()),
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))
import { Charts2 } from "@/components/ballmac/blocks/charts-2/charts-2"

const months = [
  { month: "Aug", starter: 100, pro: 200, team: 300, retention: 100 },
  { month: "Sep", starter: 100, pro: 300, team: 400, retention: 105 },
]

describe("Charts2", () => {
  it("works out recurring revenue, run rate, the month's addition and the largest plan", () => {
    render(<Charts2 months={months} />)
    const text = (label: string) => screen.getByText(label, { selector: "dt" }).parentElement!.textContent
    expect(text("Monthly recurring revenue")).toContain("$800")
    expect(text("Monthly recurring revenue")).toContain("+33.3%")
    expect(text("Monthly recurring revenue")).toContain("up from Aug")
    expect(text("Annual run rate")).toContain("$9,600")
    expect(text("Added in Sep")).toContain("+$200")
    expect(text("Largest plan")).toContain("Team")
    expect(text("Largest plan")).toContain("50% of the total")
  })

  it("says a fall in words and shows it with a minus", () => {
    render(<Charts2 months={[...months].reverse().map((m, i) => ({ ...m, month: i ? "Sep" : "Aug" }))} />)
    expect(screen.getByText("Monthly recurring revenue", { selector: "dt" }).parentElement).toHaveTextContent("down from Aug")
    expect(screen.getByText("Added in Sep", { selector: "dt" }).parentElement).toHaveTextContent("−$200")
  })

  it("writes money in the currency and locale it is given", () => {
    render(<Charts2 months={months} currency="EUR" locale="de" />)
    expect(screen.getByText("Annual run rate", { selector: "dt" }).parentElement?.textContent).toMatch(/9\.600\s?€/)
  })

  it("has two charts, each with a table view", async () => {
    const user = userEvent.setup()
    render(<Charts2 months={months} />)
    expect(screen.getByRole("figure", { name: "Revenue by plan" })).toBeInTheDocument()
    expect(screen.getByRole("figure", { name: "Net revenue retention" })).toBeInTheDocument()
    await user.click(screen.getAllByRole("radio", { name: "Table" })[1]!)
    expect(screen.getByRole("table", { name: "Net revenue retention" })).toBeInTheDocument()
  })

  it("shows loading, empty and error", async () => {
    const user = userEvent.setup()
    const retry = vi.fn()
    const { rerender } = render(<Charts2 state="loading" />)
    expect(screen.getByRole("status")).toHaveTextContent("Loading revenue")
    rerender(<Charts2 state="empty" />)
    expect(screen.getByText("No revenue yet")).toBeInTheDocument()
    rerender(<Charts2 months={[]} />)
    expect(screen.getByText("No revenue yet")).toBeInTheDocument()
    rerender(<Charts2 state="error" onRetry={retry} />)
    expect(screen.getByRole("alert")).toHaveTextContent("Revenue could not be loaded")
    await user.click(screen.getByRole("button", { name: /try again/i }))
    expect(retry).toHaveBeenCalledTimes(1)
  })
})
