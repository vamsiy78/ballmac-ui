import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { SearchField } from "@/components/ballmac/search-field"
describe("SearchField", () => {
  it("submits with Enter and clears while restoring focus", async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn()
    render(<SearchField defaultValue="reports" onSearch={onSearch} />)
    const input = screen.getByRole("searchbox", { name: "Search" })
    await user.click(input)
    await user.keyboard("{Enter}")
    expect(onSearch).toHaveBeenCalledWith("reports")
    await user.click(screen.getByRole("button", { name: "Clear search" }))
    expect(input).toHaveValue("")
    expect(input).toHaveFocus()
  })
  it("reports a controlled clear without changing the value", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<SearchField value="reports" onValueChange={onValueChange} />)
    await user.click(screen.getByRole("button", { name: "Clear search" }))
    expect(onValueChange).toHaveBeenCalledWith("")
    expect(screen.getByRole("searchbox")).toHaveValue("reports")
  })
})
