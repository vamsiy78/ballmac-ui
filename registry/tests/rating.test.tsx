import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { Rating } from "@/components/ballmac/rating"
describe("Rating", () => {
  it("selects a star from the keyboard and clears it", async () => {
    const user = userEvent.setup()
    render(<Rating label="Guide rating" />)
    await user.tab()
    await user.keyboard(" ")
    expect(screen.getByRole("radio", { name: "1 of 5 stars" })).toBeChecked()
    await user.click(screen.getByRole("button", { name: "Clear" }))
    expect(screen.getByText("Not rated")).toBeInTheDocument()
  })
  it("reports controlled selection", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Rating value={2} onValueChange={onValueChange} />)
    await user.click(screen.getByRole("radio", { name: "4 of 5 stars" }))
    expect(onValueChange).toHaveBeenCalledWith(4)
    expect(screen.getByRole("radio", { name: "2 of 5 stars" })).toBeChecked()
  })
})
