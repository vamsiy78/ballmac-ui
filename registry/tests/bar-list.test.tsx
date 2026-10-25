import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { BarList } from "@/components/ballmac/bar-list"

const items = [
  { id: "a", label: "Alpha", value: 10 },
  { id: "b", label: "Beta", value: 30 },
  { id: "c", label: "Gamma", value: 20 },
]

describe("BarList", () => {
  it("sorts by value and numbers the rows for screen readers", () => {
    render(<BarList items={items} title="Top" />)
    const rows = screen.getAllByRole("listitem")
    expect(rows[0]).toHaveTextContent("Beta")
    expect(rows[0]).toHaveTextContent("Number 1")
    expect(rows[2]).toHaveTextContent("Alpha")
    expect(screen.getByRole("list", { name: "Top" })).toBeInTheDocument()
  })

  it("keeps the given order when sort is false", () => {
    render(<BarList items={items} sort={false} />)
    expect(screen.getAllByRole("listitem")[0]).toHaveTextContent("Alpha")
  })

  it("shows the share of the total as text", () => {
    render(<BarList items={items} showShare />)
    expect(screen.getByText("50%")).toBeInTheDocument()
  })

  it("folds a long list and shows the rest on request", async () => {
    const user = userEvent.setup()
    render(<BarList items={items} limit={2} />)
    expect(screen.getAllByRole("listitem")).toHaveLength(2)
    const more = screen.getByRole("button", { name: "Show 1 more" })
    expect(more).toHaveAttribute("aria-expanded", "false")
    await user.click(more)
    expect(screen.getAllByRole("listitem")).toHaveLength(3)
    expect(screen.getByRole("button", { name: "Show fewer" })).toHaveAttribute("aria-expanded", "true")
  })

  it("makes rows links or buttons when asked", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const { rerender } = render(<BarList items={[{ id: "a", label: "Alpha", value: 1, href: "/a" }]} />)
    expect(screen.getByRole("link", { name: /Alpha/ })).toHaveAttribute("href", "/a")
    rerender(<BarList items={items} onSelect={onSelect} selected="b" />)
    await user.click(screen.getByRole("button", { name: /Gamma/ }))
    expect(onSelect).toHaveBeenCalledWith("c")
    expect(screen.getByRole("button", { name: /Beta/ })).toHaveAttribute("aria-pressed", "true")
  })

  it("formats values", () => {
    render(<BarList items={[{ id: "a", label: "A", value: 1500 }]} format={(v) => `${v / 1000}k`} />)
    expect(screen.getByText("1.5k")).toBeInTheDocument()
  })
})
