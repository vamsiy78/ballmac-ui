import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { RatingDistribution } from "@/components/ballmac/rating-distribution"

const counts = { 5: 6, 4: 2, 3: 1, 2: 1, 1: 0 }

describe("RatingDistribution", () => {
  it("computes the average and total as text", () => {
    render(<RatingDistribution counts={counts} />)
    expect(screen.getByText("4.3", { selector: "p" })).toBeInTheDocument()
    expect(screen.getByText("10 ratings, average 4.3 out of 5")).toBeInTheDocument()
  })

  it("shows a count and a share for every size", () => {
    render(<RatingDistribution counts={counts} />)
    expect(screen.getByText("60%")).toBeInTheDocument()
    expect(screen.getAllByText("10%").length).toBe(2)
  })

  it("makes rows toggle filters", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<RatingDistribution counts={counts} onSelect={onSelect} selected={5} />)
    expect(screen.getByRole("button", { name: "5 stars: 6 ratings. Show only these" })).toHaveAttribute("aria-pressed", "true")
    await user.click(screen.getByRole("button", { name: "5 stars: 6 ratings. Show only these" }))
    expect(onSelect).toHaveBeenCalledWith(null)
    await user.click(screen.getByRole("button", { name: "4 stars: 2 ratings. Show only these" }))
    expect(onSelect).toHaveBeenLastCalledWith(4)
  })

  it("copes with no ratings", () => {
    render(<RatingDistribution counts={{ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }} />)
    expect(screen.getByText("0 ratings, average 0 out of 5")).toBeInTheDocument()
  })
})
