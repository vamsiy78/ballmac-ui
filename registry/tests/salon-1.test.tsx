import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Salon1 } from "@/components/ballmac/blocks/salon-1/salon-1"

describe("Salon1", () => {
  it("adds up the time and price of the chosen services in the summary", async () => {
    const user = userEvent.setup()
    render(<Salon1 />)
    expect(screen.getByText("No services chosen yet.")).toBeInTheDocument()
    await user.click(screen.getByLabelText(/Haircut and finish/))
    await user.click(screen.getByLabelText(/Conditioning treatment/))
    const aside = screen.getByRole("complementary")
    expect(within(aside).getByText("1 h 5 min")).toBeInTheDocument()
    expect(within(aside).getByText("$76.00")).toBeInTheDocument()
  })

  it("shows only the times the chosen stylist is free, and says when a day has none", async () => {
    const user = userEvent.setup()
    render(<Salon1 />)
    expect(screen.getByText("Choose a day to see the times.")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Sat 25 Oct" }))
    expect(within(screen.getByRole("group", { name: "Times on Sat 25 Oct" })).getAllByRole("button")).toHaveLength(4)
    await user.click(screen.getByLabelText(/^Dana/))
    expect(within(screen.getByRole("group", { name: "Times on Sat 25 Oct" })).getAllByRole("button").map((b) => b.textContent)).toEqual(["10:30", "13:00", "15:30"])
    await user.click(screen.getByRole("button", { name: "Tue 28 Oct" }))
    expect(screen.getByText(/Dana has nothing free on Tue 28 Oct\. Try another day or choose anyone free\./)).toBeInTheDocument()
  })

  it("clears the chosen time when the stylist or day changes", async () => {
    const user = userEvent.setup()
    render(<Salon1 />)
    await user.click(screen.getByRole("button", { name: "Sat 25 Oct" }))
    await user.click(screen.getByRole("button", { name: "09:00" }))
    expect(screen.getByText("Sat 25 Oct, 09:00")).toBeInTheDocument()
    await user.click(screen.getByLabelText(/^Dana/))
    expect(screen.getByText("Not chosen")).toBeInTheDocument()
  })

  it("explains what is missing, field by field, when booking too early", async () => {
    const user = userEvent.setup()
    const onBook = vi.fn()
    render(<Salon1 onBook={onBook} />)
    await user.click(screen.getByRole("button", { name: "Book appointment" }))
    expect(screen.getByText("Choose at least one service.")).toBeInTheDocument()
    expect(screen.getByText("Choose a day and a time.")).toBeInTheDocument()
    expect(onBook).not.toHaveBeenCalled()
  })

  it("books with the choices and says exactly what was booked, or keeps them when it fails", async () => {
    const user = userEvent.setup()
    const onBook = vi.fn().mockResolvedValue(undefined)
    const { unmount } = render(<Salon1 onBook={onBook} />)
    await user.click(screen.getByLabelText(/Haircut and finish/))
    await user.click(screen.getByLabelText(/^Luca/))
    await user.click(screen.getByRole("button", { name: "Mon 27 Oct" }))
    await user.click(screen.getByRole("button", { name: "12:00" }))
    await user.click(screen.getByRole("button", { name: "Book appointment" }))
    expect(onBook).toHaveBeenCalledWith({ services: ["cut"], stylist: "luca", day: "mon", time: "12:00" })
    expect(await screen.findByText(/Booked: Mon 27 Oct at 12:00, 45 min, \$52\.00\./)).toBeInTheDocument()
    unmount()
    render(<Salon1 onBook={() => Promise.reject(new Error("That time has just been taken."))} />)
    await user.click(screen.getByLabelText(/Haircut and finish/))
    await user.click(screen.getByRole("button", { name: "Mon 27 Oct" }))
    await user.click(screen.getByRole("button", { name: "12:00" }))
    await user.click(screen.getByRole("button", { name: "Book appointment" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("That time has just been taken.")
  })

  it("shows loading, closed and error states", () => {
    const { rerender } = render(<Salon1 state="loading" />)
    expect(screen.getByRole("status")).toHaveTextContent("Loading the booking page")
    rerender(<Salon1 services={[]} />)
    expect(screen.getByText("Booking is closed")).toBeInTheDocument()
    rerender(<Salon1 state="error" onRetry={() => {}} />)
    expect(screen.getByRole("alert")).toHaveTextContent("The booking page could not be loaded")
  })
})
