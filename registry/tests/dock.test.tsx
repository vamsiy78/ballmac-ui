import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Dock, DockItem, DockSeparator } from "@/components/ballmac/dock"

function renderDock(props: Partial<React.ComponentProps<typeof Dock>> = {}, onOpen = vi.fn()) {
  render(
    <>
      <button type="button">Before</button>
      <Dock aria-label="Apps" {...props}>
        <DockItem label="Files" icon={<svg />} active onClick={() => onOpen("Files")} />
        <DockItem label="Mail" icon={<svg />} onClick={() => onOpen("Mail")} />
        <DockSeparator />
        <DockItem label="Trash" icon={<svg />} onClick={() => onOpen("Trash")} />
      </Dock>
      <button type="button">After</button>
    </>
  )
  return onOpen
}

describe("Dock", () => {
  it("is a labelled toolbar of named buttons, with the running state in the name", () => {
    renderDock()
    const toolbar = screen.getByRole("toolbar", { name: "Apps" })
    expect(toolbar).toHaveAttribute("aria-orientation", "horizontal")
    expect(screen.getByRole("button", { name: "Files, running" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Mail" })).toBeInTheDocument()
    expect(screen.getByRole("separator")).toHaveAttribute("aria-orientation", "vertical")
  })

  it("has a single tab stop and moves with arrow keys, Home and End", async () => {
    const user = userEvent.setup()
    renderDock()
    await user.tab()
    await user.tab()
    const files = screen.getByRole("button", { name: "Files, running" })
    const mail = screen.getByRole("button", { name: "Mail" })
    const trash = screen.getByRole("button", { name: "Trash" })
    expect(files).toHaveFocus()
    await user.keyboard("{ArrowRight}")
    expect(mail).toHaveFocus()
    await user.keyboard("{ArrowRight}{ArrowRight}")
    expect(files).toHaveFocus() // wraps around
    await user.keyboard("{End}")
    expect(trash).toHaveFocus()
    await user.keyboard("{ArrowLeft}")
    expect(mail).toHaveFocus()
    await user.keyboard("{Home}")
    expect(files).toHaveFocus()
    await user.keyboard("{ArrowRight}")
    await user.tab()
    expect(screen.getByRole("button", { name: "After" })).toHaveFocus()
    // Returning lands on the last focused item.
    await user.tab({ shift: true })
    expect(mail).toHaveFocus()
  })

  it("activates items with Enter, Space and click", async () => {
    const user = userEvent.setup()
    const onOpen = renderDock()
    await user.click(screen.getByRole("button", { name: "Trash" }))
    screen.getByRole("button", { name: "Mail" }).focus()
    await user.keyboard("{Enter}")
    await user.keyboard(" ")
    expect(onOpen.mock.calls.map((c) => c[0])).toEqual(["Trash", "Mail", "Mail"])
  })

  it("uses up and down arrows when vertical", async () => {
    const user = userEvent.setup()
    renderDock({ orientation: "vertical" })
    expect(screen.getByRole("toolbar")).toHaveAttribute("aria-orientation", "vertical")
    screen.getByRole("button", { name: "Files, running" }).focus()
    await user.keyboard("{ArrowDown}")
    expect(screen.getByRole("button", { name: "Mail" })).toHaveFocus()
    await user.keyboard("{ArrowUp}")
    expect(screen.getByRole("button", { name: "Files, running" })).toHaveFocus()
  })
})
