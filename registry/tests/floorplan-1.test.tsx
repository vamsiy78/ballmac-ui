import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Floorplan1 } from "@/components/ballmac/blocks/floorplan-1/floorplan-1"

describe("Floorplan1", () => {
  it("names each table with its seats, its state in words and who is at it or holding it", () => {
    render(<Floorplan1 />)
    expect(screen.getByRole("button", { name: "T4, seats 4, seated, Weber party of 3" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "T3, seats 4, reserved, held for Marsh at 19:30" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "T5, seats 4, needs clearing" })).toBeInTheDocument()
    expect(screen.getByText("3 free · 3 seated · 2 reserved · 1 to clear · 3 waiting")).toBeInTheDocument()
  })

  it("only offers waiting parties that fit the table, and seats the chosen one", async () => {
    const user = userEvent.setup()
    const onSeat = vi.fn().mockResolvedValue(undefined)
    render(<Floorplan1 onSeat={onSeat} />)
    await user.click(screen.getByRole("button", { name: /^T2, seats 2/ }))
    const select = screen.getByLabelText("Party to seat at T2")
    expect(within(select).getAllByRole("option").map((o) => o.textContent)).toEqual(["Choose a waiting party", "Lopez, 2, waited 12 min"])
    await user.selectOptions(select, "w1")
    await user.click(screen.getByRole("button", { name: "Seat at T2" }))
    expect(onSeat).toHaveBeenCalledWith("t2", { name: "Lopez", size: 2 })
    expect(await screen.findByText("Lopez (2) is seated at T2.")).toBeInTheDocument()
    expect(screen.getByText("2 free · 4 seated · 2 reserved · 1 to clear · 2 waiting")).toBeInTheDocument()
  })

  it("seats a reservation, clears a table and marks it clean", async () => {
    const user = userEvent.setup()
    const onStatus = vi.fn().mockResolvedValue(undefined)
    render(<Floorplan1 onStatus={onStatus} onSeat={() => Promise.resolve()} />)
    await user.click(screen.getByRole("button", { name: /^T3, seats 4/ }))
    await user.click(screen.getByRole("button", { name: "Seat them now" }))
    expect(await screen.findByText("Marsh is seated at T3.")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Clear table" }))
    expect(onStatus).toHaveBeenLastCalledWith("t3", "dirty")
    await user.click(screen.getByRole("button", { name: "Mark clean" }))
    expect(onStatus).toHaveBeenLastCalledWith("t3", "free")
    expect(await screen.findByText("T3 is free.")).toBeInTheDocument()
  })

  it("puts a table back and says why when seating fails", async () => {
    const user = userEvent.setup()
    render(<Floorplan1 onSeat={() => Promise.reject(new Error("The booking system is offline."))} />)
    await user.click(screen.getByRole("button", { name: /^T6, seats 6/ }))
    await user.selectOptions(screen.getByLabelText("Party to seat at T6"), "w2")
    await user.click(screen.getByRole("button", { name: "Seat at T6" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("The booking system is offline.")
    expect(screen.getByRole("button", { name: /^T6, seats 6, free/ })).toBeInTheDocument()
  })

  it("shows loading, empty and error states", () => {
    const { rerender } = render(<Floorplan1 state="loading" />)
    expect(screen.getByRole("status")).toHaveTextContent("Loading the floor")
    rerender(<Floorplan1 tables={[]} />)
    expect(screen.getByText("No tables yet")).toBeInTheDocument()
    rerender(<Floorplan1 state="error" onRetry={() => {}} />)
    expect(screen.getByRole("alert")).toHaveTextContent("The floor could not be loaded")
  })
})
