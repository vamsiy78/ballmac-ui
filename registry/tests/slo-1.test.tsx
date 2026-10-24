import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Slo1, budgetLeft } from "@/components/ballmac/blocks/slo-1/slo-1"

describe("Slo1", () => {
  it("computes the error budget left from the target and the current value", () => {
    expect(budgetLeft({ id: "x", name: "x", service: "x", target: 99.9, current: 99.95, windowDays: 30, burn: 1, series: [] })).toBeCloseTo(50, 5)
    expect(budgetLeft({ id: "x", name: "x", service: "x", target: 99.9, current: 99.9, windowDays: 30, burn: 1, series: [] })).toBeCloseTo(0, 5)
    expect(budgetLeft({ id: "x", name: "x", service: "x", target: 99.9, current: 99.8, windowDays: 30, burn: 1, series: [] })).toBeLessThan(0)
  })

  it("puts anything burning fast or past its target first and says so in words", () => {
    render(<Slo1 />)
    const items = screen.getAllByRole("listitem")
    expect(items[0]).toHaveTextContent("API success rate")
    expect(items[0]).toHaveTextContent("Target missed")
    expect(items[1]).toHaveTextContent("Search latency under 300 ms")
    expect(items[1]).toHaveTextContent("Burning budget fast")
    expect(screen.getByText(/2 objectives need attention\./)).toBeInTheDocument()
  })

  it("shows the budget in percent and minutes, as a labelled meter", () => {
    render(<Slo1 />)
    const meter = screen.getByRole("meter", { name: "Error budget left for Checkout availability" })
    expect(meter).toHaveAttribute("aria-valuenow", "40")
    expect(meter.getAttribute("aria-valuetext")).toContain("about 17 of 43 minutes")
    expect(screen.getByText("No error budget left.")).toBeInTheDocument()
    expect(screen.getByText("Using budget 4.8× faster than a steady pace.")).toBeInTheDocument()
  })

  it("filters by service", async () => {
    const user = userEvent.setup()
    render(<Slo1 />)
    await user.selectOptions(screen.getByLabelText("Service"), "Search")
    expect(screen.getAllByRole("listitem")).toHaveLength(1)
    expect(within(screen.getByRole("listitem")).getByText("Search latency under 300 ms")).toBeInTheDocument()
  })

  it("says everything is on track when nothing needs attention, and shows the other states", () => {
    const ok = [{ id: "a", name: "A", service: "S", target: 99, current: 99.9, windowDays: 30, burn: 0.2, series: [99.9, 99.9] }]
    const { rerender } = render(<Slo1 slos={ok} />)
    expect(screen.getByText("Every objective is on track.")).toBeInTheDocument()
    rerender(<Slo1 state="loading" />)
    expect(screen.getByRole("status")).toHaveTextContent("Loading objectives")
    rerender(<Slo1 slos={[]} />)
    expect(screen.getByText("No objectives yet")).toBeInTheDocument()
    rerender(<Slo1 state="error" onRetry={() => {}} />)
    expect(screen.getByRole("alert")).toHaveTextContent("The objectives could not be loaded")
  })
})
