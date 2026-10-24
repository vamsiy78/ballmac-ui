import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Booking1 } from "@/components/ballmac/blocks/booking-1/booking-1"

describe("Booking1", () => {
  it("groups classes by day in time order and writes places left in words", () => {
    render(<Booking1 />)
    const mon = within(screen.getByRole("region", { name: "Mon 27 Oct" })).getAllByRole("listitem")
    expect(mon.map((li) => li.querySelector("p")?.textContent)).toEqual(["Vinyasa flow", "Strength basics", "Spin 45"])
    expect(screen.getByText("Full", { selector: "p" })).toBeInTheDocument()
    expect(screen.getByText("Only 1 place left")).toBeInTheDocument()
    expect(screen.getByText("You are booked")).toBeInTheDocument()
    expect(screen.getByText("You are booked into 1 class this week.")).toBeInTheDocument()
  })

  it("offers the right button for each class: book, join the waiting list, cancel or leave", () => {
    render(<Booking1 />)
    expect(screen.getByRole("button", { name: "Book Vinyasa flow, Mon 27 Oct at 07:00" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Join the waiting list for Strength basics, Mon 27 Oct at 12:15" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Cancel your place in Spin 45, Mon 27 Oct at 18:30" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Leave the waiting list for Strength basics, Tue 28 Oct at 07:30" })).toBeInTheDocument()
  })

  it("books at once, says so, and updates the weekly count", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn().mockResolvedValue(undefined)
    render(<Booking1 onChange={onChange} />)
    await user.click(screen.getByRole("button", { name: /^Book Vinyasa flow/ }))
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ id: "c1" }), "book")
    expect(await screen.findByText("You are booked into Vinyasa flow, Mon 27 Oct at 07:00.")).toBeInTheDocument()
    expect(screen.getByText("You are booked into 2 classes this week.")).toBeInTheDocument()
  })

  it("undoes a booking that fails and says why", async () => {
    const user = userEvent.setup()
    render(<Booking1 onChange={() => Promise.reject(new Error("That class has just filled up."))} />)
    await user.click(screen.getByRole("button", { name: /^Book Spin 45, Wed 29 Oct/ }))
    expect(await screen.findByRole("alert")).toHaveTextContent("That class has just filled up.")
    expect(screen.getByRole("button", { name: /^Book Spin 45, Wed 29 Oct/ })).toBeInTheDocument()
  })

  it("filters by kind of class", async () => {
    const user = userEvent.setup()
    render(<Booking1 />)
    await user.click(screen.getByRole("button", { name: "Yoga" }))
    expect(screen.queryByText("Spin 45")).toBeNull()
    expect(screen.getAllByText(/Vinyasa flow|Yin and stretch/)).toHaveLength(2)
  })

  it("shows loading, empty and error states", () => {
    const { rerender } = render(<Booking1 state="loading" />)
    expect(screen.getByRole("status")).toHaveTextContent("Loading the timetable")
    rerender(<Booking1 classes={[]} />)
    expect(screen.getByText("No classes this week")).toBeInTheDocument()
    rerender(<Booking1 state="error" onRetry={() => {}} />)
    expect(screen.getByRole("alert")).toHaveTextContent("The timetable could not be loaded")
  })
})
