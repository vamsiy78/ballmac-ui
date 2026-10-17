import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Search1 } from "@/components/ballmac/blocks/search-1/search-1"

describe("Search1", () => {
  it("shows the matching results with counts per type and highlighted words", () => {
    const { container } = render(<Search1 timing="0.14 s" />)
    expect(screen.getByRole("heading", { name: /10 results/ })).toHaveTextContent("for “webhook” · 0.14 s")
    expect(screen.getByRole("radio", { name: /Docs/ })).toBeInTheDocument()
    expect(container.querySelectorAll("mark").length).toBeGreaterThan(5)
    expect(screen.getAllByRole("listitem").length).toBeGreaterThan(0)
  })

  it("narrows as you type and by type", async () => {
    const user = userEvent.setup()
    render(<Search1 pageSize={20} />)
    await user.click(screen.getByRole("radio", { name: /People/ }))
    const results = screen.getByRole("list", { name: "Results" })
    expect(results).toHaveTextContent("Priya Shah")
    expect(results).not.toHaveTextContent("Verify webhook signatures")
    await user.click(screen.getByRole("radio", { name: /All/ }))
    const box = screen.getByRole("searchbox", { name: "Search" })
    await user.clear(box)
    await user.type(box, "invoices")
    expect(screen.getByRole("heading", { name: /1 result/ })).toBeInTheDocument()
  })

  it("shows five at a time and loads more", async () => {
    const user = userEvent.setup()
    render(<Search1 />)
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(5)
    expect(screen.getByText("Showing 5 of 10")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Show 5 more" }))
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(10)
  })

  it("explains an empty search, offers the suggestion, and clears filters", async () => {
    const user = userEvent.setup()
    render(<Search1 defaultQuery="webhok" didYouMean="webhook" />)
    expect(screen.getByRole("heading", { name: "No results for “webhok”" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "webhook" }))
    expect(screen.getByRole("searchbox", { name: "Search" })).toHaveValue("webhook")
    expect(screen.getByRole("heading", { name: /10 results/ })).toBeInTheDocument()
  })

  it("opens a result, and the slash key focuses the search", async () => {
    const user = userEvent.setup()
    const onOpen = vi.fn()
    render(<Search1 onOpen={onOpen} />)
    await user.click(screen.getByRole("link", { name: "Verify webhook signatures" }))
    expect(onOpen).toHaveBeenCalledWith(expect.objectContaining({ id: "r1" }))
    await user.keyboard("/")
    expect(screen.getByRole("searchbox", { name: "Search" })).toHaveFocus()
  })

  it("shows the error state with retry", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    render(<Search1 state="error" onRetry={onRetry} />)
    expect(screen.getByRole("alert")).toHaveTextContent("Search is not available right now")
    await user.click(screen.getByRole("button", { name: "Try again" }))
    expect(onRetry).toHaveBeenCalled()
  })
})
