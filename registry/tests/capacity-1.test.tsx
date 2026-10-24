import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Capacity1, runway } from "@/components/ballmac/blocks/capacity-1/capacity-1"

describe("runway", () => {
  it("is the days until the limit at the current growth, or null when it is not growing", () => {
    expect(runway({ id: "a", name: "a", unit: "GB", used: 800, limit: 1000, perDay: 10 })).toBe(20)
    expect(runway({ id: "a", name: "a", unit: "GB", used: 1000, limit: 1000, perDay: 10 })).toBe(0)
    expect(runway({ id: "a", name: "a", unit: "GB", used: 500, limit: 1000, perDay: 0 })).toBeNull()
  })
})

describe("Capacity1", () => {
  it("puts what fills soonest first and says the days left in words", () => {
    render(<Capacity1 />)
    const items = screen.getAllByRole("listitem")
    expect(items[0]).toHaveTextContent("Queue throughput")
    expect(items[0]).toHaveTextContent("Full in about 8 days")
    expect(items[1]).toHaveTextContent("Database storage")
    expect(items[1]).toHaveTextContent("Full in about 14 days")
    expect(items[2]).toHaveTextContent("Database connections")
    expect(items[2]).toHaveTextContent("Full in about 28 days")
    expect(screen.getByText(/2 resources fill within 14 days\./)).toBeInTheDocument()
  })

  it("says so when a resource is not growing, instead of a number", () => {
    render(<Capacity1 />)
    expect(screen.getByText("Not growing")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Ask for more log retention" })).toBeNull()
  })

  it("shows each resource as a meter with a spoken value", () => {
    render(<Capacity1 />)
    const meter = screen.getByRole("meter", { name: "Database storage used" })
    expect(meter).toHaveAttribute("aria-valuenow", "842")
    expect(meter.getAttribute("aria-valuetext")).toContain("842 of 1,000 GB, 84 percent. Full in about 14 days.")
  })

  it("asks for more, says so, and says why when it fails", async () => {
    const user = userEvent.setup()
    const onRequest = vi.fn().mockResolvedValue(undefined)
    const { rerender } = render(<Capacity1 onRequest={onRequest} />)
    await user.click(screen.getByRole("button", { name: "Ask for more database storage" }))
    expect(onRequest).toHaveBeenCalledWith(expect.objectContaining({ id: "r1" }))
    expect(await screen.findByText("Requested more database storage. The team will confirm.")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Ask for more database storage" })).toBeNull()
    rerender(<Capacity1 onRequest={() => Promise.reject(new Error("The ticket system is down."))} />)
    await user.click(screen.getByRole("button", { name: "Ask for more database connections" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("The ticket system is down.")
  })

  it("shows loading, empty and error states", () => {
    const { rerender } = render(<Capacity1 state="loading" />)
    expect(screen.getByRole("status")).toHaveTextContent("Loading capacity")
    rerender(<Capacity1 resources={[]} />)
    expect(screen.getByText("No resources tracked")).toBeInTheDocument()
    rerender(<Capacity1 state="error" onRetry={() => {}} />)
    expect(screen.getByRole("alert")).toHaveTextContent("Capacity could not be loaded")
  })
})
