import * as React from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { Reviews1, type Reviews1Review } from "@/components/ballmac/blocks/reviews-1/reviews-1"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

const mk = (id: string, rating: number, extra: Partial<Reviews1Review> = {}): Reviews1Review => ({ id, author: `Person ${id}`, rating, body: "Short body.", date: "1 October 2026", iso: "2026-10-01", ...extra })

describe("Reviews1", () => {
  it("works out the average and each bar from the reviews", () => {
    render(<Reviews1 reviews={[mk("a", 5), mk("b", 5), mk("c", 4), mk("d", 2)]} />)
    expect(screen.getByText("4.0 out of 5 from 4 reviews")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "5 stars, 2 reviews" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "3 stars, 0 reviews" })).toBeDisabled()
    expect(screen.getByText("75%")).toBeInTheDocument()
  })

  it("filters by star count from the bars and clears it", async () => {
    const user = userEvent.setup()
    render(<Reviews1 reviews={[mk("a", 5), mk("b", 4), mk("c", 4)]} />)
    await user.click(screen.getByRole("button", { name: "4 stars, 2 reviews" }))
    expect(screen.getByRole("button", { name: "4 stars, 2 reviews" })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByText("Showing 2 of 2 reviews")).toBeInTheDocument()
    expect(screen.queryByText("Person a")).toBeNull()
    await user.click(screen.getByRole("button", { name: /Clear the star filter/ }))
    expect(screen.getByText("Showing 3 of 3 reviews")).toBeInTheDocument()
  })

  it("shows only verified customers when asked, and says when nothing matches", async () => {
    const user = userEvent.setup()
    render(<Reviews1 reviews={[mk("a", 5, { verified: true }), mk("b", 1)]} />)
    await user.click(screen.getByRole("checkbox", { name: /Verified customers only/ }))
    expect(screen.getByText("Showing 1 of 1 review")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "1 star, 1 review" }))
    expect(screen.getByText("No reviews match")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Clear filters" }))
    expect(screen.getByText("Showing 2 of 2 reviews")).toBeInTheDocument()
  })

  it("sorts by newest", async () => {
    const user = userEvent.setup()
    render(<Reviews1 reviews={[mk("old", 5, { iso: "2026-01-01", helpful: 99 }), mk("new", 3, { iso: "2026-09-01", helpful: 1 })]} />)
    const order = () => screen.getAllByRole("article").map((a) => a.getAttribute("aria-labelledby"))
    expect(screen.getAllByRole("article")[0]).toHaveTextContent("Person old")
    await user.click(screen.getByRole("combobox", { name: "Sort reviews" }))
    await user.click(await screen.findByRole("option", { name: "Newest" }))
    expect(screen.getAllByRole("article")[0]).toHaveTextContent("Person new")
    expect(order()).toHaveLength(2)
  })

  it("expands a long review, and counts a helpful vote at once and undoes it", async () => {
    const user = userEvent.setup()
    const onHelpful = vi.fn()
    render(<Reviews1 reviews={[mk("a", 5, { body: "Long ".repeat(60), helpful: 7 })]} onHelpful={onHelpful} />)
    const more = screen.getByRole("button", { name: /Read more/ })
    expect(more).toHaveAttribute("aria-expanded", "false")
    await user.click(more)
    expect(screen.getByRole("button", { name: /Show less/ })).toHaveAttribute("aria-expanded", "true")
    await user.click(screen.getByRole("button", { name: /Helpful/ }))
    expect(screen.getByRole("button", { name: /Helpful/ })).toHaveTextContent("8")
    expect(onHelpful).toHaveBeenLastCalledWith(expect.objectContaining({ id: "a" }), true)
    await user.click(screen.getByRole("button", { name: /Helpful/ }))
    expect(screen.getByRole("button", { name: /Helpful/ })).toHaveTextContent("7")
    expect(onHelpful).toHaveBeenLastCalledWith(expect.objectContaining({ id: "a" }), false)
  })

  it("says the rating in words and shows a reply", () => {
    render(<Reviews1 reviews={[mk("a", 4, { reply: { from: "Acme team", body: "Thanks!", date: "2 October 2026" } })]} />)
    expect(screen.getByText("4 out of 5 stars")).toBeInTheDocument()
    expect(within(screen.getByRole("article")).getByText(/Acme team/)).toBeInTheDocument()
  })

  it("pages through many reviews", async () => {
    const user = userEvent.setup()
    render(<Reviews1 reviews={Array.from({ length: 6 }, (_, i) => mk(String(i), 5))} />)
    expect(screen.getByText("Showing 4 of 6 reviews")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Show more reviews" }))
    expect(screen.getByText("Showing 6 of 6 reviews")).toBeInTheDocument()
  })

  it("shows loading, empty and error states", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const onWrite = vi.fn()
    const { rerender } = render(<Reviews1 state="loading" />)
    expect(screen.getByRole("status")).toBeInTheDocument()
    rerender(<Reviews1 state="empty" onWrite={onWrite} />)
    await user.click(screen.getByRole("button", { name: "Write a review" }))
    expect(onWrite).toHaveBeenCalled()
    rerender(<Reviews1 state="error" onRetry={onRetry} />)
    await user.click(screen.getByRole("button", { name: /try again/i }))
    expect(onRetry).toHaveBeenCalled()
  })
})
