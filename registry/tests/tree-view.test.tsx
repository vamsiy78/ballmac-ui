import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { TreeView } from "@/components/ballmac/tree-view"

const nodes = [
  { id: "root", label: "Root", children: [{ id: "child", label: "Child" }] },
  { id: "other", label: "Other" },
]

describe("TreeView", () => {
  it("expands and navigates the tree with arrow keys", async () => {
    const user = userEvent.setup()
    render(<TreeView label="Files" nodes={nodes} />)
    const root = screen.getByRole("treeitem", { name: "Root" })
    root.focus()
    await user.keyboard("{ArrowRight}{ArrowDown}")
    expect(screen.getByRole("treeitem", { name: "Child" })).toHaveFocus()
    await user.keyboard("{ArrowLeft}")
    expect(root).toHaveFocus()
  })

  it("keeps one tabbable item when the controlled selection is hidden", () => {
    render(<TreeView label="Files" nodes={nodes} selectedId="child" />)
    expect(screen.getByRole("treeitem", { name: "Root" })).toHaveAttribute(
      "tabindex",
      "0",
    )
  })

  it("reports a controlled selection without changing it", async () => {
    const user = userEvent.setup()
    const onSelectedIdChange = vi.fn()
    render(
      <TreeView
        label="Files"
        nodes={nodes}
        selectedId="root"
        onSelectedIdChange={onSelectedIdChange}
      />,
    )
    await user.click(screen.getByRole("treeitem", { name: "Other" }))
    expect(onSelectedIdChange).toHaveBeenCalledWith("other")
    expect(screen.getByRole("treeitem", { name: "Root" })).toHaveAttribute(
      "aria-selected",
      "true",
    )
  })
})
