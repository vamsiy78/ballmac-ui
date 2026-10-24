import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Matter1 } from "@/components/ballmac/blocks/matter-1/matter-1"

describe("Matter1", () => {
  it("lists the dates that cannot be missed first, soonest first, and says overdue in words", () => {
    render(<Matter1 />)
    const dates = within(screen.getByRole("region", { name: "Dates that cannot be missed" })).getAllByRole("listitem")
    expect(dates[0]).toHaveTextContent("File the response (ET3)")
    expect(dates[0]).toHaveTextContent("1 day overdue")
    expect(dates[1]).toHaveTextContent("In 3 days")
    expect(screen.getByRole("status")).toHaveTextContent("3 dates are overdue or due within 7 days.")
  })

  it("hides closed matters until asked, and the count follows", async () => {
    const user = userEvent.setup()
    render(<Matter1 />)
    expect(screen.getByText("5 matters")).toBeInTheDocument()
    expect(screen.queryByText("Boundary dispute")).toBeNull()
    await user.click(screen.getByRole("checkbox", { name: "Show closed" }))
    expect(screen.getByText("6 matters")).toBeInTheDocument()
    expect(screen.getByText("Boundary dispute")).toBeInTheDocument()
  })

  it("filters by practice area and searches, and recovers from no match", async () => {
    const user = userEvent.setup()
    render(<Matter1 />)
    await user.selectOptions(screen.getByLabelText("Practice area"), "Property")
    expect(screen.getByText("1 matter")).toBeInTheDocument()
    await user.type(screen.getByRole("searchbox", { name: "Search matters" }), "tribunal")
    expect(screen.getByText(/No matters match/)).toBeInTheDocument()
    await user.clear(screen.getByRole("searchbox"))
    await user.selectOptions(screen.getByLabelText("Practice area"), "all")
    await user.type(screen.getByRole("searchbox"), "tribunal")
    expect(screen.getByText("1 matter")).toBeInTheDocument()
    expect(document.querySelector("mark")?.textContent).toBe("tribunal")
  })

  it("says in words when a matter is over its budget", () => {
    render(<Matter1 />)
    expect(screen.getByText("Over budget by 3 h")).toBeInTheDocument()
    const row = screen.getByText("Lease renewal, Unit 4").closest("tr") as HTMLElement
    expect(within(row).getByText("14.5 h")).toBeInTheDocument()
    expect(within(row).getByText(/of 20 h/)).toBeInTheDocument()
  })

  it("shows loading, empty and error states", () => {
    const { rerender } = render(<Matter1 state="loading" />)
    expect(screen.getByRole("status")).toHaveTextContent("Loading matters")
    rerender(<Matter1 matters={[]} />)
    expect(screen.getByText("No matters yet")).toBeInTheDocument()
    rerender(<Matter1 state="error" onRetry={() => {}} />)
    expect(screen.getByRole("alert")).toHaveTextContent("Matters could not be loaded")
  })
})
