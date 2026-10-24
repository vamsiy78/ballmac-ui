import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Kitchen1 } from "@/components/ballmac/blocks/kitchen-1/kitchen-1"

describe("Kitchen1", () => {
  it("has a labelled column per station with the oldest ticket first", () => {
    render(<Kitchen1 />)
    const grill = screen.getByRole("region", { name: "Grill station" })
    const orders = within(grill).getAllByText(/^\d{3}$/).map((n) => n.textContent)
    expect(orders).toEqual(["Order 126", "Order 127", "Order 128"])
    expect(within(grill).getByText("14:02")).toBeInTheDocument()
  })

  it("says late and due soon in words, and counts late tickets in the header", () => {
    render(<Kitchen1 />)
    expect(screen.getAllByText("Late")).toHaveLength(2)
    expect(screen.getByText("Due soon")).toBeInTheDocument()
    expect(screen.getByText("2 late")).toBeInTheDocument()
    expect(screen.getByText(/6 tickets open/)).toBeInTheDocument()
  })

  it("spells out an allergy and each change to a dish", () => {
    render(<Kitchen1 />)
    expect(screen.getByText("Allergy: Peanuts")).toBeInTheDocument()
    expect(screen.getByText("Allergy: Milk")).toBeInTheDocument()
    expect(screen.getByText("no pickles")).toBeInTheDocument()
  })

  it("bumps a ticket off the screen, then recalls it", async () => {
    const user = userEvent.setup()
    const onBump = vi.fn().mockResolvedValue(undefined)
    const onRecall = vi.fn().mockResolvedValue(undefined)
    render(<Kitchen1 onBump={onBump} onRecall={onRecall} />)
    expect(screen.getByRole("button", { name: "Recall last bump" })).toBeDisabled()
    await user.click(screen.getByRole("button", { name: "Bump order 129 at Fry" }))
    expect(onBump).toHaveBeenCalledWith(expect.objectContaining({ id: "t5" }))
    expect(screen.queryByRole("button", { name: "Bump order 129 at Fry" })).toBeNull()
    expect(screen.getByText(/5 tickets open/)).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Recall order 129" }))
    expect(onRecall).toHaveBeenCalledWith(expect.objectContaining({ id: "t5" }))
    expect(screen.getByRole("button", { name: "Bump order 129 at Fry" })).toBeInTheDocument()
  })

  it("puts a ticket back and says why when bumping fails", async () => {
    const user = userEvent.setup()
    render(<Kitchen1 onBump={() => Promise.reject(new Error("The printer service is offline."))} />)
    await user.click(screen.getByRole("button", { name: "Bump order 128 at Grill" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("The printer service is offline.")
    expect(screen.getByRole("button", { name: "Bump order 128 at Grill" })).toBeInTheDocument()
  })

  it("shows loading, empty and error states", () => {
    const { rerender } = render(<Kitchen1 state="loading" />)
    expect(screen.getByRole("status")).toHaveTextContent("Loading tickets")
    rerender(<Kitchen1 tickets={[]} />)
    expect(screen.getByText("No tickets")).toBeInTheDocument()
    rerender(<Kitchen1 state="error" onRetry={() => {}} />)
    expect(screen.getByRole("alert")).toHaveTextContent("Tickets could not be loaded")
  })
})
