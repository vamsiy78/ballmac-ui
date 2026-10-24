import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Cost1 } from "@/components/ballmac/blocks/cost-1/cost-1"

describe("Cost1", () => {
  it("shows the total, the comparison in words and the budget standing", () => {
    render(<Cost1 />)
    const kpi = screen.getAllByText("This month", { selector: "p" })[0].parentElement as HTMLElement
    expect(within(kpi).getByText("$15,760")).toBeInTheDocument()
    expect(screen.getByText("11.6%")).toBeInTheDocument()
    expect(screen.getByText("$1,640 more than the period before")).toBeInTheDocument()
    expect(screen.getByText("$240 left of $16,000")).toBeInTheDocument()
  })

  it("switches period and everything on the page follows", async () => {
    const user = userEvent.setup()
    render(<Cost1 />)
    await user.click(screen.getByRole("radio", { name: "Last month" }))
    const kpi = screen.getAllByText("Last month", { selector: "p" })[0].parentElement as HTMLElement
    expect(within(kpi).getByText("$14,120")).toBeInTheDocument()
    expect(screen.getByText("1.7%")).toBeInTheDocument()
    expect(screen.getByText("Nothing unusual in last month.")).toBeInTheDocument()
  })

  it("lists the spend by service as a treemap and the changes as a waterfall with a table", () => {
    render(<Cost1 />)
    expect(screen.getByRole("button", { name: /^Compute: \$4,210/ })).toBeInTheDocument()
    expect(screen.getByRole("figure", { name: "Spend, Last month to This month" })).toBeInTheDocument()
    expect(within(screen.getByRole("table", { name: "Spend, Last month to This month" })).getAllByRole("row")).toHaveLength(8)
  })

  it("says in words when spend is over budget", () => {
    render(<Cost1 periods={[{ id: "x", label: "Q3", total: 120, previous: 100, budget: 100, items: [{ id: "a", label: "A", value: 120 }], bridge: [{ id: "s", label: "Q2", value: 100, kind: "total" }, { id: "u", label: "Up", value: 20 }, { id: "t", label: "Q3", value: 120, kind: "total" }] }]} />)
    expect(screen.getByText("$20 over $100")).toBeInTheDocument()
  })

  it("marks an unusual cost as looked at, or says why it could not", async () => {
    const user = userEvent.setup()
    const onAcknowledge = vi.fn().mockResolvedValue(undefined)
    const { rerender } = render(<Cost1 onAcknowledge={onAcknowledge} />)
    await user.click(screen.getByRole("button", { name: "Mark the Logs cost as looked at" }))
    expect(onAcknowledge).toHaveBeenCalledWith(expect.objectContaining({ id: "an2" }))
    expect(await screen.findByText("Marked as looked at: Logs.")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Mark the Logs cost as looked at" })).toBeNull()
    rerender(<Cost1 onAcknowledge={() => Promise.reject(new Error("The cost service is down."))} />)
    await user.click(screen.getByRole("button", { name: "Mark the Model inference cost as looked at" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("The cost service is down.")
  })

  it("shows loading, empty and error states", () => {
    const { rerender } = render(<Cost1 state="loading" />)
    expect(screen.getByRole("status")).toHaveTextContent("Loading costs")
    rerender(<Cost1 periods={[]} />)
    expect(screen.getByText("No cost data yet")).toBeInTheDocument()
    rerender(<Cost1 state="error" onRetry={() => {}} />)
    expect(screen.getByRole("alert")).toHaveTextContent("Costs could not be loaded")
  })
})
