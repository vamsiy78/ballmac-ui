import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { MultiSelect } from "@/components/ballmac/multi-select"
const options = [
  { value: "design", label: "Design" },
  { value: "product", label: "Product" },
  { value: "support", label: "Support" },
]
describe("MultiSelect", () => {
  it("opens from the keyboard, filters, and toggles checkboxes", async () => {
    const user = userEvent.setup()
    render(<MultiSelect options={options} label="Teams" />)
    await user.tab()
    await user.keyboard("{Enter}")
    expect(screen.getByRole("group", { name: "Teams" })).toBeInTheDocument()
    await user.type(
      screen.getByRole("textbox", { name: "Search options" }),
      "Design",
    )
    await user.click(screen.getByRole("checkbox", { name: "Design" }))
    expect(screen.getByRole("button", { name: "Teams" })).toHaveTextContent(
      "Design",
    )
  })
  it("keeps controlled value and respects selection cap", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <MultiSelect
        options={options}
        value={["design"]}
        maxSelected={1}
        onValueChange={onValueChange}
      />,
    )
    await user.click(screen.getByRole("button", { name: "Select options" }))
    expect(screen.getByRole("checkbox", { name: "Product" })).toBeDisabled()
    await user.click(screen.getByRole("checkbox", { name: "Design" }))
    expect(onValueChange).toHaveBeenCalledWith([])
  })
})
