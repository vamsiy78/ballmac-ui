import { fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Rentals1, days, firstClash } from "@/components/ballmac/blocks/rentals-1/rentals-1"

const T = "2026-10-24"
const pick = (from: string, to: string) => {
  fireEvent.change(screen.getByLabelText("First day"), { target: { value: from } })
  fireEvent.change(screen.getByLabelText("Last day"), { target: { value: to } })
}

describe("days and firstClash", () => {
  it("counts both ends and refuses a backwards range", () => {
    expect(days("2026-11-01", "2026-11-01")).toBe(1)
    expect(days("2026-11-01", "2026-11-03")).toBe(3)
    expect(days("2026-11-03", "2026-11-01")).toBe(0)
    expect(days("", "2026-11-01")).toBe(0)
  })
  it("finds the first booked day inside the range only", () => {
    expect(firstClash("2026-11-02", "2026-11-06", ["2026-11-05", "2026-11-03"])).toBe("2026-11-03")
    expect(firstClash("2026-11-06", "2026-11-08", ["2026-11-05"])).toBeNull()
  })
})

describe("Rentals1", () => {
  it("works out the rental, the deposit and what to pay today, extras included", async () => {
    const user = userEvent.setup()
    render(<Rentals1 today={T} />)
    await user.click(screen.getByLabelText(/Four-person tent/))
    pick("2026-11-10", "2026-11-12")
    await user.click(screen.getByLabelText(/Damage cover/))
    const aside = screen.getByRole("complementary")
    expect(within(aside).getByText("$34.00")).toBeInTheDocument()
    expect(within(aside).getByText("$102.00")).toBeInTheDocument()
    expect(within(aside).getByText("$182.00")).toBeInTheDocument()
  })

  it("names the first taken day when the range clashes, and stops the booking", async () => {
    const user = userEvent.setup()
    const onReserve = vi.fn()
    render(<Rentals1 today={T} onReserve={onReserve} />)
    pick("2026-11-02", "2026-11-06")
    expect(screen.getByText(/Two-person sea kayak is already out on Nov 3\./)).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Reserve" }))
    expect(onReserve).not.toHaveBeenCalled()
  })

  it("says so when the last day is before the first, or the rental is too long", () => {
    render(<Rentals1 today={T} maxDays={3} />)
    pick("2026-11-10", "2026-11-20")
    expect(screen.getByText("The longest rental is 3 days.")).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText("First day"), { target: { value: "2026-11-30" } })
    expect(screen.getByLabelText("Last day")).toHaveValue("")
  })

  it("asks for the days when reserving with none chosen", async () => {
    const user = userEvent.setup()
    render(<Rentals1 today={T} />)
    await user.click(screen.getByRole("button", { name: "Reserve" }))
    expect(screen.getByRole("alert")).toHaveTextContent("Choose the first and last day.")
  })

  it("reserves and says exactly what, or keeps the choices with the reason", async () => {
    const user = userEvent.setup()
    const onReserve = vi.fn().mockResolvedValue(undefined)
    const { unmount } = render(<Rentals1 today={T} onReserve={onReserve} />)
    await user.click(screen.getByLabelText(/Inflatable paddle board/))
    pick("2026-11-10", "2026-11-11")
    await user.click(screen.getByRole("button", { name: "Reserve" }))
    expect(onReserve).toHaveBeenCalledWith({ item: "sup", from: "2026-11-10", to: "2026-11-11", extras: [] })
    expect(await screen.findByText(/Reserved: Inflatable paddle board, Nov 10 to Nov 11 \(2 days\)\. \$70\.00 plus a \$60\.00 deposit you get back\./)).toBeInTheDocument()
    unmount()
    render(<Rentals1 today={T} onReserve={() => Promise.reject(new Error("Someone just took those days."))} />)
    pick("2026-11-10", "2026-11-11")
    await user.click(screen.getByRole("button", { name: "Reserve" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("Someone just took those days.")
    expect(screen.getByLabelText("First day")).toHaveValue("2026-11-10")
  })

  it("shows loading, empty and error states", () => {
    const { rerender } = render(<Rentals1 state="loading" />)
    expect(screen.getByRole("status")).toHaveTextContent("Loading the rentals")
    rerender(<Rentals1 items={[]} />)
    expect(screen.getByText("Nothing to rent right now")).toBeInTheDocument()
    rerender(<Rentals1 state="error" onRetry={() => {}} />)
    expect(screen.getByRole("alert")).toHaveTextContent("The rentals could not be loaded")
  })
})
