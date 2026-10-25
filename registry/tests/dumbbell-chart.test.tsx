import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { DumbbellChart } from "@/components/ballmac/dumbbell-chart"

const rows = [
  { id: "a", label: "Search", before: 10, after: 15 },
  { id: "b", label: "Login", before: 20, after: 12 },
  { id: "c", label: "Cart", before: 5, after: 5 },
]

describe("DumbbellChart", () => {
  it("says each change in words with better or worse", () => {
    render(<DumbbellChart rows={rows} />)
    expect(screen.getByText(/up 5, better/)).toBeInTheDocument()
    expect(screen.getByText(/down 8, worse/)).toBeInTheDocument()
    expect(screen.getByText("no change")).toBeInTheDocument()
  })

  it("flips better and worse when lower is better", () => {
    render(<DumbbellChart rows={rows} lowerIsBetter />)
    expect(screen.getByText(/up 5, worse/)).toBeInTheDocument()
    expect(screen.getByText(/down 8, better/)).toBeInTheDocument()
  })

  it("shows the legend and the before and after values", () => {
    render(<DumbbellChart rows={rows} beforeLabel="v1" afterLabel="v2" title="Speed" format={(v) => `${v} ms`} />)
    expect(screen.getByText("v1")).toBeInTheDocument()
    expect(screen.getByText("v2")).toBeInTheDocument()
    expect(screen.getByText("10 ms → 15 ms")).toBeInTheDocument()
    expect(screen.getByRole("figure", { name: "Speed" })).toBeInTheDocument()
  })
})
