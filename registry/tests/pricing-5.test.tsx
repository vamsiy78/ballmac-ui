import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Pricing5 } from "@/components/ballmac/blocks/pricing-5/pricing-5"

const setSeats = (n: number) => fireEvent.change(screen.getByLabelText("How many people?"), { target: { value: String(n) } })

describe("Pricing5", () => {
  it("works the price out by volume band and writes the working in a table", () => {
    render(<Pricing5 />)
    setSeats(12)
    const table = screen.getByRole("table", { name: "Seats and price per seat in each volume band" })
    expect(table).toHaveTextContent("1 to 10")
    expect(table).toHaveTextContent("11 to 12")
    expect(table).toHaveTextContent("$120")
    expect(table).toHaveTextContent("$20")
    expect(screen.getByText("Your band")).toBeInTheDocument()
  })

  it("shows the yearly total with the saving, and the monthly price when switched off", async () => {
    const user = userEvent.setup()
    render(<Pricing5 />)
    setSeats(12)
    expect(screen.getByText("$112")).toBeInTheDocument()
    expect(screen.getByText(/\$1,344 billed once a year\. You save \$336\./)).toBeInTheDocument()
    await user.click(screen.getByRole("switch", { name: "Pay yearly" }))
    expect(screen.getByText("$140")).toBeInTheDocument()
    expect(screen.getByText(/Pay yearly and save \$336 a year/)).toBeInTheDocument()
  })

  it("adds a flat add-on to the total and the working", async () => {
    const user = userEvent.setup()
    render(<Pricing5 />)
    setSeats(1)
    await user.click(screen.getByRole("switch", { name: "Pay yearly" }))
    await user.click(screen.getByRole("checkbox", { name: /Single sign-on/ }))
    expect(screen.getByText("$111")).toBeInTheDocument()
    expect(screen.getByRole("table")).toHaveTextContent("Single sign-on")
  })

  it("says the value of the slider in words and turns into Talk to sales at the limit", () => {
    render(<Pricing5 />)
    setSeats(1)
    expect(screen.getByLabelText("How many people?")).toHaveAttribute("aria-valuetext", "1 person")
    expect(screen.getByRole("link", { name: /Start free for 14 days/ })).toBeInTheDocument()
    setSeats(150)
    expect(screen.getByRole("link", { name: /Talk to sales/ })).toBeInTheDocument()
  })

  it("passes the choice to href", () => {
    render(<Pricing5 href={({ seats, yearly, addons }) => `/buy?seats=${seats}&yearly=${yearly}&addons=${addons.join(",")}`} />)
    setSeats(20)
    expect(screen.getByRole("link", { name: /Start free/ })).toHaveAttribute("href", "/buy?seats=20&yearly=true&addons=")
  })
})
