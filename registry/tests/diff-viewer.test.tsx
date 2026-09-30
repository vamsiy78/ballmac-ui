import * as React from "react"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { DiffViewer } from "@/components/ballmac/diff-viewer"

describe("DiffViewer", () => {
  it("marks additions and removals after aligning shared lines", () => {
    const { container } = render(
      <DiffViewer
        label="config.ts"
        before={"keep\nold\nend"}
        after={"keep\nnew\nend"}
      />,
    )
    expect(
      screen.getByRole("region", { name: "config.ts diff" }),
    ).toHaveTextContent("1 added · 1 removed")
    expect(container.querySelectorAll('[data-kind="added"]')).toHaveLength(1)
    expect(container.querySelectorAll('[data-kind="removed"]')).toHaveLength(1)
    expect(container.querySelector('[data-kind="added"] code')).toHaveTextContent("Added: new")
  })
})
