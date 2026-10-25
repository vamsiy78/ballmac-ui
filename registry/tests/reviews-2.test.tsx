import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Reviews2 } from "@/components/ballmac/blocks/reviews-2/reviews-2"

describe("Reviews2", () => {
  it("shows the summary and every review", () => {
    render(<Reviews2 />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("What customers say")
    expect(screen.getByText("Showing all 6 reviews.")).toBeInTheDocument()
    expect(screen.getByText("Saved us a week of work")).toBeInTheDocument()
  })

  it("filters the list by star size and says how many it shows", async () => {
    const user = userEvent.setup()
    render(<Reviews2 />)
    await user.click(screen.getByRole("button", { name: /^5 stars/ }))
    expect(screen.getByText("Showing 3 5-star reviews.")).toBeInTheDocument()
    expect(screen.queryByText("Needed more examples")).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /^5 stars/ }))
    expect(screen.getByText("Showing all 6 reviews.")).toBeInTheDocument()
  })

  it("says the rating of each review for screen readers", () => {
    render(<Reviews2 />)
    expect(screen.getAllByText("5 out of 5 stars.").length).toBe(3)
  })

  it("explains an empty filter", async () => {
    const user = userEvent.setup()
    render(<Reviews2 />)
    await user.click(screen.getByRole("button", { name: /^1 stars/ }))
    expect(screen.getByText("No reviews with this rating.")).toBeInTheDocument()
  })

  it("renders the loading, empty and error states", () => {
    const { rerender } = render(<Reviews2 state="loading" />)
    expect(screen.getByRole("status")).toBeInTheDocument()
    rerender(<Reviews2 reviews={[]} />)
    expect(screen.getByText("No reviews yet")).toBeInTheDocument()
    rerender(<Reviews2 state="error" onRetry={() => {}} />)
    expect(screen.getByRole("alert")).toBeInTheDocument()
  })
})
