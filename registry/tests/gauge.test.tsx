import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Gauge } from "@/components/ballmac/gauge"

const zones = [{ to: 30, label: "Low" }, { to: 70, label: "Fine" }, { to: 100, label: "High" }]

describe("Gauge", () => {
  it("is a meter with the value and the zone in its text", () => {
    render(<Gauge label="Load" value={55} zones={zones} format={(v) => `${v}%`} />)
    const m = screen.getByRole("meter", { name: "Load" })
    expect(m).toHaveAttribute("aria-valuenow", "55")
    expect(m).toHaveAttribute("aria-valuemin", "0")
    expect(m).toHaveAttribute("aria-valuemax", "100")
    expect(m).toHaveAttribute("aria-valuetext", "55%, Fine")
    expect(screen.getByText("Fine")).toBeInTheDocument()
  })

  it("says the target in words", () => {
    render(<Gauge label="Budget" value={20} target={50} format={(v) => `${v}`} />)
    expect(screen.getByText("Target 50")).toBeInTheDocument()
  })

  it("uses the last zone above the top and works with any range", () => {
    render(<Gauge label="Score" value={4.6} min={0} max={5} zones={[{ to: 2.5, label: "Poor" }, { to: 5, label: "Great" }]} />)
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuetext", "4.6, Great")
  })

  it("shows the ends", () => {
    render(<Gauge label="L" value={1} min={0} max={10} />)
    expect(screen.getByText("10")).toBeInTheDocument()
  })
})
