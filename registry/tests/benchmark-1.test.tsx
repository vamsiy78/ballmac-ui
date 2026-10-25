import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Benchmark1 } from "@/components/ballmac/blocks/benchmark-1/benchmark-1"

describe("Benchmark1", () => {
  it("sums up what got better and worse in a sentence", () => {
    render(<Benchmark1 />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Model benchmark")
    expect(screen.getByText(/is better on 4 of 6 tasks and worse on 1/)).toBeInTheDocument()
    expect(screen.getByText(/3 of 4 tasks got faster/)).toBeInTheDocument()
  })

  it("writes each change in words, with lower being better for time", () => {
    render(<Benchmark1 />)
    expect(screen.getAllByText(/better/).length).toBeGreaterThan(3)
    expect(screen.getByText(/down 7%, worse|down 7, worse/)).toBeInTheDocument()
    expect(screen.getByText(/up 0.14 s, worse/)).toBeInTheDocument()
  })

  it("shows what a run costs and where the time goes", () => {
    render(<Benchmark1 />)
    expect(screen.getByText("$1,000")).toBeInTheDocument()
    expect(screen.getByText("Search the help center")).toBeInTheDocument()
  })

  it("renders the loading, empty and error states", () => {
    const { rerender } = render(<Benchmark1 state="loading" />)
    expect(screen.getByRole("status")).toBeInTheDocument()
    rerender(<Benchmark1 quality={[]} />)
    expect(screen.getByText("Nothing to compare yet")).toBeInTheDocument()
    rerender(<Benchmark1 state="error" onRetry={() => {}} />)
    expect(screen.getByRole("alert")).toBeInTheDocument()
  })
})
