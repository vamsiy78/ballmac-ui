import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { FileTree } from "@/components/ballmac/file-tree"

describe("FileTree", () => {
  it("names the tree and opens a folder from the keyboard", async () => {
    const user = userEvent.setup()
    render(
      <FileTree
        files={[
          {
            id: "src",
            label: "src",
            type: "folder",
            children: [{ id: "index", label: "index.ts", type: "file" }],
          },
        ]}
      />,
    )
    expect(screen.getByRole("tree", { name: "Files" })).toBeInTheDocument()
    const folder = screen.getByRole("treeitem", { name: "src" })
    folder.focus()
    await user.keyboard("{ArrowRight}")
    expect(folder).toHaveAttribute("aria-expanded", "true")
    expect(
      screen.getByRole("treeitem", { name: "index.ts" }),
    ).toBeInTheDocument()
  })
})
