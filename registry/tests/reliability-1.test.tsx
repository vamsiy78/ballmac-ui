import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Reliability1 } from "@/components/ballmac/blocks/reliability-1/reliability-1"

describe("Reliability1", () => {
  it("says in a sentence whether things work and shows a tracker per service", () => {
    render(<Reliability1 />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Reliability")
    expect(screen.getByText("Everything is working")).toBeInTheDocument()
    expect(screen.getAllByText(/% uptime/).length).toBe(4)
  })

  it("names the services that are down or slow right now", () => {
    render(<Reliability1 services={[{ id: "a", name: "API", days: [{ date: "Today", status: "down" }] }, { id: "b", name: "Web", days: [{ date: "Today", status: "up" }] }]} />)
    expect(screen.getByRole("status")).toHaveTextContent("API is down right now")
  })

  it("shows the budgets as meters with their zone and the incidents with a status word", () => {
    render(<Reliability1 />)
    expect(screen.getAllByRole("meter")).toHaveLength(3)
    expect(screen.getByRole("meter", { name: "Error budget left" })).toHaveAttribute("aria-valuetext", "72%, Healthy")
    expect(screen.getByText("Monitoring")).toBeInTheDocument()
    expect(screen.getAllByText("Resolved").length).toBe(2)
  })

  it("says when there were no incidents", () => {
    render(<Reliability1 incidents={[]} />)
    expect(screen.getByText("No incidents in this period.")).toBeInTheDocument()
  })

  it("renders the loading, empty and error states", () => {
    const { rerender } = render(<Reliability1 state="loading" />)
    expect(screen.getByRole("status")).toBeInTheDocument()
    rerender(<Reliability1 services={[]} />)
    expect(screen.getByText("No services yet")).toBeInTheDocument()
    rerender(<Reliability1 state="error" onRetry={() => {}} />)
    expect(screen.getByRole("alert")).toBeInTheDocument()
  })
})
