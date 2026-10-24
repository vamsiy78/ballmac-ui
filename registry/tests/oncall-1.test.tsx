import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Oncall1 } from "@/components/ballmac/blocks/oncall-1/oncall-1"

describe("Oncall1", () => {
  it("shows who is on call now for each layer, and a table with a button per shift", () => {
    render(<Oncall1 />)
    const now = screen.getByText("On call now").closest("div") as HTMLElement
    expect(within(now).getByText("Theo Nakamura")).toBeInTheDocument()
    expect(within(now).getByText("Ana Souza")).toBeInTheDocument()
    expect(screen.getByRole("table", { name: "On-call this week" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Primary, Friday 24 October: Theo Nakamura" })).toBeInTheDocument()
  })

  it("calls out a day nobody covers in words and in the grid", () => {
    render(<Oncall1 />)
    expect(screen.getByRole("status")).toHaveTextContent("1 shift has no one on call: Secondary on Saturday 25 October")
    expect(screen.getByRole("button", { name: "Secondary, Saturday 25 October: nobody on call" })).toBeInTheDocument()
  })

  it("selecting a shift shows who is on it and offers to take it or swap, but not to swap with yourself", async () => {
    const user = userEvent.setup()
    const onTake = vi.fn().mockResolvedValue(undefined)
    const onRequestSwap = vi.fn().mockResolvedValue(undefined)
    render(<Oncall1 onTake={onTake} onRequestSwap={onRequestSwap} />)
    await user.click(screen.getByRole("button", { name: "Primary, Friday 24 October: Theo Nakamura" }))
    expect(screen.getByText("Theo Nakamura is on call, 09:00 to 09:00.")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Ask Theo to swap" }))
    expect(onRequestSwap).toHaveBeenCalledWith({ layer: "Primary", day: "Friday 24 October", person: "Theo Nakamura" })
    expect(await screen.findByText("Swap request sent to Theo Nakamura.")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Primary, Monday 20 October: Priya Shah" }))
    expect(screen.queryByRole("button", { name: "Take this shift" })).toBeNull()
    expect(screen.queryByRole("button", { name: /Ask .* to swap/ })).toBeNull()
  })

  it("takes an uncovered shift and says it failed when the request is rejected", async () => {
    const user = userEvent.setup()
    const { rerender } = render(<Oncall1 onTake={() => Promise.resolve()} />)
    await user.click(screen.getByRole("button", { name: "Secondary, Saturday 25 October: nobody on call" }))
    await user.click(screen.getByRole("button", { name: "Take this shift" }))
    expect(await screen.findByText("You are now secondary on Saturday 25 October.")).toBeInTheDocument()
    rerender(<Oncall1 onTake={() => Promise.reject(new Error("The scheduler is down."))} />)
    await user.click(screen.getByRole("button", { name: "Take this shift" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("The scheduler is down.")
  })

  it("shows loading, empty and error states", () => {
    const { rerender } = render(<Oncall1 state="loading" />)
    expect(screen.getByRole("status")).toHaveTextContent("Loading the rota")
    rerender(<Oncall1 layers={[]} />)
    expect(screen.getByText("No rota yet")).toBeInTheDocument()
    rerender(<Oncall1 state="error" onRetry={() => {}} />)
    expect(screen.getByRole("alert")).toHaveTextContent("The rota could not be loaded")
  })
})
