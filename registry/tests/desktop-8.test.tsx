import * as React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Desktop8 } from "@/components/ballmac/blocks/desktop-8/desktop-8"

const commands = [
  { id: "new", label: "New note", group: "File", shortcut: "Mod+N" },
  { id: "find", label: "Find", group: "Edit", shortcut: "Mod+F" },
  { id: "export", label: "Export", group: "File", shortcut: "" },
]

describe("Desktop8", () => {
  it("records a new shortcut and reports only the change", async () => {
    const user = userEvent.setup()
    const onValuesChange = vi.fn()
    render(<Desktop8 feel="macos" commands={commands} onValuesChange={onValuesChange} />)
    const rec = screen.getByRole("button", { name: "Export" })
    expect(rec).toHaveTextContent("None")
    await user.click(rec)
    fireEvent.keyDown(rec, { key: "e", code: "KeyE", metaKey: true, shiftKey: true })
    expect(onValuesChange).toHaveBeenLastCalledWith({ export: "Mod+Shift+E" })
    expect(rec).toHaveTextContent("⇧⌘E")
    expect(screen.getByText("1 shortcut changed")).toBeInTheDocument()
  })

  it("warns about a conflict and replaces on request", async () => {
    const user = userEvent.setup()
    const onValuesChange = vi.fn()
    render(<Desktop8 feel="windows" commands={commands} onValuesChange={onValuesChange} />)
    const rec = screen.getByRole("button", { name: "Export" })
    await user.click(rec)
    fireEvent.keyDown(rec, { key: "f", code: "KeyF", ctrlKey: true })
    expect(screen.getByRole("alert")).toHaveTextContent("Ctrl+F is already used by “Find”")
    expect(onValuesChange).not.toHaveBeenCalled()
    await user.click(screen.getByRole("button", { name: "Replace" }))
    expect(onValuesChange).toHaveBeenLastCalledWith({ export: "Mod+F", find: "" })
    expect(screen.getByRole("button", { name: "Find" })).toHaveTextContent("None")
  })

  it("resets one command and restores all defaults", async () => {
    const user = userEvent.setup()
    const onValuesChange = vi.fn()
    render(<Desktop8 commands={commands} defaultValues={{ new: "Mod+Shift+N", export: "Mod+E" }} onValuesChange={onValuesChange} />)
    await user.click(screen.getByRole("button", { name: "Reset New note" }))
    expect(onValuesChange).toHaveBeenLastCalledWith({ export: "Mod+E" })
    await user.click(screen.getByRole("button", { name: /Restore defaults/i }))
    expect(onValuesChange).toHaveBeenLastCalledWith({})
  })

  it("finds a command by pressing its keys", async () => {
    const user = userEvent.setup()
    render(<Desktop8 feel="macos" commands={commands} />)
    await user.click(screen.getByRole("button", { name: /By keys/ }))
    const listener = screen.getByRole("button", { name: "Search by keys" })
    fireEvent.keyDown(listener, { key: "f", code: "KeyF", metaKey: true })
    expect(screen.getByRole("button", { name: "Find" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "New note" })).toBeNull()
  })
})
