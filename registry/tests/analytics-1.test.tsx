import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Analytics1 } from "@/components/ballmac/blocks/analytics-1/analytics-1"

describe("Analytics1", () => {
  it("shows the heading, four metrics with their change in words, and the funnel", () => {
    render(<Analytics1 />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Analytics")
    expect(screen.getByText("Visitors")).toBeInTheDocument()
    expect(screen.getAllByText(/^(Up|Down) [\d.]+%$/).length).toBeGreaterThanOrEqual(4)
    expect(screen.getAllByText(/carried on/).length).toBeGreaterThan(0)
  })

  it("switches the period and reports it", async () => {
    const user = userEvent.setup()
    const onPeriodChange = vi.fn()
    render(<Analytics1 onPeriodChange={onPeriodChange} />)
    expect(screen.getByRole("radio", { name: "30 days" })).toBeChecked()
    await user.click(screen.getByRole("radio", { name: "7 days" }))
    expect(onPeriodChange).toHaveBeenCalledWith("7d")
    expect(screen.getAllByText("48,210").length).toBeGreaterThan(0)
  })

  it("moves between ranking tabs with the arrow keys", async () => {
    const user = userEvent.setup()
    render(<Analytics1 />)
    const tabs = screen.getAllByRole("tab")
    expect(tabs[0]).toHaveAttribute("aria-selected", "true")
    tabs[0].focus()
    await user.keyboard("{ArrowRight}")
    expect(tabs[1]).toHaveAttribute("aria-selected", "true")
    expect(within(screen.getByRole("tabpanel")).getByText("Google")).toBeInTheDocument()
  })

  it("renders the loading, empty and error states", () => {
    const { rerender } = render(<Analytics1 state="loading" />)
    expect(screen.getByRole("status")).toBeInTheDocument()
    rerender(<Analytics1 periods={[]} />)
    expect(screen.getByText("No data for this period")).toBeInTheDocument()
    rerender(<Analytics1 state="error" onRetry={() => {}} />)
    expect(screen.getByRole("alert")).toBeInTheDocument()
  })
})
