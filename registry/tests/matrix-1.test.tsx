import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Matrix1 } from "@/components/ballmac/blocks/matrix-1/matrix-1"

describe("Matrix1", () => {
  it("is a grid of services against regions, each cell good, warning or problem in words", () => {
    render(<Matrix1 />)
    expect(screen.getByRole("grid", { name: "Service by Region" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "API, US East: 99.99%, Good" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Payments, Europe: 99.82%, Warning" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Assistant, Asia Pacific: 98.4%, Problem" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Payments, South America: No data" })).toBeInTheDocument()
  })

  it("lists in words what is below the line", () => {
    render(<Matrix1 />)
    expect(screen.getByText(/1 combination is below 99%/)).toBeInTheDocument()
    expect(screen.getByText(/Assistant in Asia Pacific/)).toBeInTheDocument()
  })

  it("shows the last incident for a chosen cell, and says when there was none or the service does not run there", async () => {
    const user = userEvent.setup()
    render(<Matrix1 />)
    await user.click(screen.getByRole("button", { name: /^Payments, Europe/ }))
    expect(screen.getByText(/Last incident, 17 Oct:/)).toBeInTheDocument()
    expect(screen.getByText(/certificate expired/)).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /^API, US East/ }))
    expect(screen.getByText("No incident recorded here in the last 30 days.")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /^Payments, South America/ }))
    expect(screen.getByText("This service does not run in this region.")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Open runbook" })).toBeNull()
  })

  it("opens the runbook for the chosen cell", async () => {
    const user = userEvent.setup()
    const onOpenRunbook = vi.fn()
    render(<Matrix1 onOpenRunbook={onOpenRunbook} />)
    await user.click(screen.getByRole("button", { name: /^Search, Asia Pacific/ }))
    await user.click(screen.getByRole("button", { name: "Open runbook" }))
    expect(onOpenRunbook).toHaveBeenCalledWith("search", "ap")
  })

  it("filters the rows by team and clears the chosen cell", async () => {
    const user = userEvent.setup()
    render(<Matrix1 />)
    await user.click(screen.getByRole("button", { name: /^API, US East/ }))
    await user.selectOptions(screen.getByLabelText("Team"), "AI")
    const grid = screen.getByRole("grid")
    expect(within(grid).getAllByRole("rowheader")).toHaveLength(1)
    expect(within(grid).getByText("Assistant")).toBeInTheDocument()
    expect(screen.getByText(/Select a cell for the last incident there/)).toBeInTheDocument()
  })

  it("shows loading, empty and error states", () => {
    const { rerender } = render(<Matrix1 state="loading" />)
    expect(screen.getByRole("status")).toHaveTextContent("Loading service health")
    rerender(<Matrix1 services={[]} />)
    expect(screen.getByText("No services yet")).toBeInTheDocument()
    rerender(<Matrix1 state="error" onRetry={() => {}} />)
    expect(screen.getByRole("alert")).toHaveTextContent("Service health could not be loaded")
  })
})
