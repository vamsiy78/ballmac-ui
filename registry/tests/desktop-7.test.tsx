import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Desktop7 } from "@/components/ballmac/blocks/desktop-7/desktop-7"

const recents = [
  { id: "a", name: "acme-web", path: "~/Code/acme-web" },
  { id: "b", name: "tokens", path: "~/Code/tokens" },
]

describe("Desktop7", () => {
  it("writes action shortcuts per platform and runs actions", async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    const { unmount } = render(<Desktop7 feel="macos" onAction={onAction} />)
    expect(screen.getByText("⌘N")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /Clone repository/ }))
    expect(onAction).toHaveBeenCalledWith("clone")
    unmount()
    render(<Desktop7 feel="windows" />)
    expect(screen.getByText("Ctrl+N")).toBeInTheDocument()
  })

  it("searches recents and opens with the arrow keys and Enter", async () => {
    const user = userEvent.setup()
    const onOpenRecent = vi.fn()
    render(<Desktop7 recents={recents} onOpenRecent={onOpenRecent} />)
    const search = screen.getByRole("combobox", { name: "Search recent projects" })
    await user.click(search)
    await user.keyboard("{ArrowDown}{Enter}")
    expect(onOpenRecent).toHaveBeenCalledWith("b")
    await user.type(search, "acme")
    expect(screen.getAllByRole("option")).toHaveLength(1)
  })

  it("removes the selected project from the list", async () => {
    const user = userEvent.setup()
    const onRemoveRecent = vi.fn()
    render(<Desktop7 recents={recents} onRemoveRecent={onRemoveRecent} />)
    await user.click(screen.getByRole("button", { name: /Remove from list/ }))
    expect(onRemoveRecent).toHaveBeenCalledWith("a")
    expect(screen.getAllByRole("option")).toHaveLength(1)
  })

  it("reports the show-on-launch choice and shows the empty state", async () => {
    const user = userEvent.setup()
    const onShowOnLaunchChange = vi.fn()
    render(<Desktop7 recents={[]} onShowOnLaunchChange={onShowOnLaunchChange} />)
    expect(screen.getByText("Nothing opened yet")).toBeInTheDocument()
    await user.click(screen.getByRole("checkbox", { name: /Show this window/ }))
    expect(onShowOnLaunchChange).toHaveBeenCalledWith(false)
  })
})
