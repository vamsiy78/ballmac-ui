import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Desktop2 } from "@/components/ballmac/blocks/desktop-2/desktop-2"

const items = [
  { id: "a", text: "First copied text", source: "Notes" },
  { id: "b", text: "https://acme.com", kind: "link" as const, source: "Safari" },
  { id: "c", text: "Pinned snippet", pinned: true },
]

describe("Desktop2", () => {
  it("lists pinned items first and moves the selection with the arrow keys", async () => {
    const user = userEvent.setup()
    render(<Desktop2 feel="macos" items={items} />)
    const options = screen.getAllByRole("option")
    expect(options[0]).toHaveTextContent("Pinned snippet")
    expect(options[0]).toHaveAttribute("aria-selected", "true")
    const search = screen.getByRole("combobox", { name: "Search clipboard history" })
    await user.click(search)
    await user.keyboard("{ArrowDown}")
    expect(screen.getAllByRole("option")[1]).toHaveAttribute("aria-selected", "true")
    expect(search).toHaveAttribute("aria-activedescendant", screen.getAllByRole("option")[1]!.id)
  })

  it("copies the selected item on Enter and filters as you type", async () => {
    const user = userEvent.setup()
    const onCopy = vi.fn()
    render(<Desktop2 feel="windows" items={items} onCopy={onCopy} />)
    const search = screen.getByRole("combobox")
    await user.type(search, "acme")
    expect(screen.getAllByRole("option")).toHaveLength(1)
    await user.keyboard("{Enter}")
    expect(onCopy).toHaveBeenCalledWith(expect.objectContaining({ id: "b" }))
  })

  it("pins with Mod+P", async () => {
    const user = userEvent.setup()
    const onTogglePin = vi.fn()
    render(<Desktop2 feel="macos" items={items} onTogglePin={onTogglePin} />)
    await user.click(screen.getByRole("combobox"))
    await user.keyboard("{Control>}p{/Control}")
    expect(onTogglePin).toHaveBeenCalledWith(expect.objectContaining({ id: "c" }))
  })

  it("shows the empty and error states, and keeps Quit working", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const onQuit = vi.fn()
    const { rerender } = render(<Desktop2 feel="macos" state="empty" items={[]} />)
    expect(screen.getByText("Nothing copied yet")).toBeInTheDocument()
    rerender(<Desktop2 feel="macos" state="error" onRetry={onRetry} onQuit={onQuit} />)
    expect(screen.getByRole("alert")).toHaveTextContent("History is unavailable")
    await user.click(screen.getByRole("button", { name: "Try again" }))
    expect(onRetry).toHaveBeenCalled()
    await user.click(screen.getByRole("button", { name: /Quit Clips/ }))
    expect(onQuit).toHaveBeenCalled()
  })
})
