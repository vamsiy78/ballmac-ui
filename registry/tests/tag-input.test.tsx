import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { TagInput } from "@/components/ballmac/tag-input"
describe("TagInput", () => {
  it("adds on Enter, avoids duplicates, and removes with Backspace", async () => {
    const user = userEvent.setup()
    render(<TagInput label="Tags" />)
    const input = screen.getByRole("textbox", { name: "Tags" })
    await user.type(input, "Design{Enter}")
    expect(screen.getByText("Design")).toBeInTheDocument()
    await user.type(input, "design{Enter}")
    expect(screen.getByText("That tag is already added.")).toBeInTheDocument()
    await user.clear(input)
    await user.keyboard("{Backspace}")
    expect(screen.queryByText("Design")).not.toBeInTheDocument()
  })
  it("reports controlled changes without changing its own value", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<TagInput value={["Product"]} onValueChange={onValueChange} />)
    await user.click(screen.getByRole("button", { name: "Remove Product" }))
    expect(onValueChange).toHaveBeenCalledWith([])
    expect(screen.getByText("Product")).toBeInTheDocument()
  })
})
