import * as React from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

vi.mock("recharts", async (importOriginal) => ({
  ...(await importOriginal<typeof import("recharts")>()),
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))
import { Charts3 } from "@/components/ballmac/blocks/charts-3/charts-3"

const metrics = [
  { id: "rev", label: "Revenue", format: "currency" as const, values: [100, 150] },
  { id: "ref", label: "Refund rate", format: "percent" as const, better: "lower" as const, values: [0.04, 0.03] },
  { id: "tix", label: "Tickets", better: "lower" as const, values: [10, 20] },
]

describe("Charts3", () => {
  it("shows the latest value, written for its format", () => {
    render(<Charts3 metrics={metrics} />)
    const tile = (label: string) => screen.getByRole("heading", { name: label }).closest("li")!
    expect(tile("Revenue")).toHaveTextContent("$150")
    expect(tile("Refund rate")).toHaveTextContent("3.0%")
    expect(tile("Tickets")).toHaveTextContent("20")
  })

  it("works out the change and says whether it is better or worse, whichever way is good", () => {
    render(<Charts3 metrics={metrics} />)
    const tile = (label: string) => screen.getByRole("heading", { name: label }).closest("li")!
    expect(tile("Revenue")).toHaveTextContent("+50%")
    expect(tile("Revenue")).toHaveTextContent(", better than 1 weeks ago")
    expect(tile("Refund rate")).toHaveTextContent("-25%")
    expect(tile("Refund rate")).toHaveTextContent(", better than")
    expect(tile("Tickets")).toHaveTextContent("+100%")
    expect(tile("Tickets")).toHaveTextContent(", worse than")
  })

  it("names each chart and summarizes it for screen readers", () => {
    render(<Charts3 metrics={metrics} />)
    const figure = screen.getByRole("figure", { name: "Revenue, last 2 weeks" })
    expect(figure).toHaveAccessibleDescription("Revenue went from $100 to $150 over 2 weeks, a change of +50%. The highest was $150 and the lowest $100.")
  })

  it("uses the period you name", () => {
    render(<Charts3 metrics={metrics} period="month" />)
    expect(screen.getByRole("figure", { name: "Revenue, last 2 months" })).toBeInTheDocument()
  })

  it("leaves out a metric with fewer than two values", () => {
    render(<Charts3 metrics={[...metrics, { id: "x", label: "Lonely", values: [1] }]} />)
    expect(screen.queryByRole("heading", { name: "Lonely" })).not.toBeInTheDocument()
    expect(within(screen.getByRole("list")).getAllByRole("listitem")).toHaveLength(3)
  })

  it("shows loading, empty and error", async () => {
    const user = userEvent.setup()
    const retry = vi.fn()
    const { rerender } = render(<Charts3 state="loading" />)
    expect(screen.getByRole("status")).toHaveTextContent("Loading metrics")
    rerender(<Charts3 state="empty" />)
    expect(screen.getByText("No metrics yet")).toBeInTheDocument()
    rerender(<Charts3 metrics={[]} />)
    expect(screen.getByText("No metrics yet")).toBeInTheDocument()
    rerender(<Charts3 state="error" onRetry={retry} />)
    expect(screen.getByRole("alert")).toHaveTextContent("Metrics could not be loaded")
    await user.click(screen.getByRole("button", { name: /try again/i }))
    expect(retry).toHaveBeenCalledTimes(1)
  })
})
