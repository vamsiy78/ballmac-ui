import * as React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Desktop1, formatShortcut } from "@/components/ballmac/blocks/desktop-1/desktop-1"

describe("Desktop1", () => {
  it("writes shortcuts the way each platform does", () => {
    expect(formatShortcut("Mod+Shift+Space", "macos")).toBe("⇧⌘Space")
    expect(formatShortcut("Mod+Alt+K", "macos")).toBe("⌥⌘K")
    expect(formatShortcut("Mod+Shift+Space", "windows")).toBe("Ctrl+Shift+Space")
    expect(formatShortcut("", "windows")).toBe("")
  })

  it("names the macOS window after the pane and the Windows one Settings", async () => {
    const user = userEvent.setup()
    const { unmount } = render(<Desktop1 feel="macos" />)
    expect(screen.getByText("General", { selector: "[data-slot=app-window-title]" })).toBeInTheDocument()
    await user.click(screen.getByRole("tab", { name: /Updates/ }))
    expect(screen.getByText("Updates", { selector: "[data-slot=app-window-title]" })).toBeInTheDocument()
    unmount()
    render(<Desktop1 feel="windows" />)
    expect(screen.getByText("Settings", { selector: "[data-slot=app-window-title]" })).toBeInTheDocument()
    expect(screen.getByRole("tablist")).toHaveAttribute("aria-orientation", "vertical")
  })

  it("reports every change with the full values", async () => {
    const user = userEvent.setup()
    const onValuesChange = vi.fn()
    render(<Desktop1 feel="macos" onValuesChange={onValuesChange} />)
    await user.click(screen.getByRole("switch", { name: /Open Acme at login/ }))
    expect(onValuesChange).toHaveBeenLastCalledWith(expect.objectContaining({ launchAtLogin: false, showInMenuBar: true }))
  })

  it("records a shortcut with a modifier, ignores one without, and cancels on Escape", async () => {
    const user = userEvent.setup()
    const onValuesChange = vi.fn()
    render(<Desktop1 feel="macos" defaultPane="shortcuts" onValuesChange={onValuesChange} />)
    const recorder = screen.getByRole("button", { name: "Show Acme" })
    expect(recorder).toHaveTextContent("⇧⌘Space")
    await user.click(recorder)
    expect(recorder).toHaveAttribute("aria-pressed", "true")
    fireEvent.keyDown(recorder, { key: "k", code: "KeyK" })
    expect(onValuesChange).not.toHaveBeenCalled()
    fireEvent.keyDown(recorder, { key: "k", code: "KeyK", metaKey: true, altKey: true })
    expect(onValuesChange).toHaveBeenLastCalledWith(expect.objectContaining({ shortcut: "Mod+Alt+K" }))
    expect(recorder).toHaveTextContent("⌥⌘K")
    await user.click(recorder)
    fireEvent.keyDown(recorder, { key: "Escape" })
    expect(recorder).toHaveAttribute("aria-pressed", "false")
    expect(recorder).toHaveTextContent("⌥⌘K")
  })

  it("draws no window frame when frame is false", () => {
    render(<Desktop1 frame={false} />)
    expect(document.querySelector("[data-slot=app-window]")).toBeNull()
    expect(screen.getByRole("tablist", { name: "Settings" })).toBeInTheDocument()
  })
})
