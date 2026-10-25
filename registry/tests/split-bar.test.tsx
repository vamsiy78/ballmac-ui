import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { SplitBar } from "@/components/ballmac/split-bar"

const segments = [
  { id: "a", label: "Compute", value: 75 },
  { id: "b", label: "Storage", value: 25 },
]

describe("SplitBar", () => {
  it("lists every share with its value and percent", () => {
    render(<SplitBar title="Spend" total="$100" segments={segments} />)
    expect(screen.getByRole("list", { name: "Spend" })).toBeInTheDocument()
    expect(screen.getByText("75%")).toBeInTheDocument()
    expect(screen.getByText("25%")).toBeInTheDocument()
    expect(screen.getByText("$100")).toBeInTheDocument()
  })

  it("keeps a slice lit when its row is chosen, and lets go on a second choice", async () => {
    const user = userEvent.setup()
    render(<SplitBar segments={segments} />)
    const b = screen.getByRole("button", { name: /Storage/ })
    expect(b).toHaveAttribute("aria-pressed", "false")
    await user.click(b)
    expect(b).toHaveAttribute("aria-pressed", "true")
    await user.click(b)
    expect(b).toHaveAttribute("aria-pressed", "false")
  })

  it("formats values and shows hints", () => {
    render(<SplitBar segments={[{ id: "a", label: "A", value: 5, hint: "note" }]} format={(v) => `${v} GB`} />)
    expect(screen.getByText("5 GB")).toBeInTheDocument()
    expect(screen.getByText("note")).toBeInTheDocument()
  })
})
