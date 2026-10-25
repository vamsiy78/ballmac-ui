import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { FunnelChart } from "@/components/ballmac/funnel-chart"

const steps = [
  { id: "a", label: "Visited", value: 1000 },
  { id: "b", label: "Signed up", value: 400 },
  { id: "c", label: "Paid", value: 300 },
]

describe("FunnelChart", () => {
  it("says how many carried on between steps and flags the biggest drop", () => {
    render(<FunnelChart steps={steps} title="Funnel" />)
    expect(screen.getByText("40% carried on, 600 dropped out")).toBeInTheDocument()
    expect(screen.getByText("75% carried on, 100 dropped out")).toBeInTheDocument()
    expect(screen.getAllByText("Biggest drop")).toHaveLength(1)
    expect(screen.getByText("40% carried on, 600 dropped out").parentElement).toHaveTextContent("Biggest drop")
  })

  it("gives each step's share of the start and the overall result in words", () => {
    render(<FunnelChart steps={steps} />)
    expect(screen.getByText("30% of the start")).toBeInTheDocument()
    expect(screen.getByText("30% of everyone who started reached the end (300 of 1,000).")).toBeInTheDocument()
  })

  it("makes steps toggle buttons when onSelect is given", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<FunnelChart steps={steps} onSelect={onSelect} selected="b" />)
    const b = screen.getByRole("button", { name: /Signed up/ })
    expect(b).toHaveAttribute("aria-pressed", "true")
    await user.click(b)
    expect(onSelect).toHaveBeenCalledWith(null)
    await user.click(screen.getByRole("button", { name: /Paid/ }))
    expect(onSelect).toHaveBeenLastCalledWith("c")
  })

  it("has no buttons without onSelect", () => {
    render(<FunnelChart steps={steps} />)
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })
})
