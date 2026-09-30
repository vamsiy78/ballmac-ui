import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { SliderRange } from "@/components/ballmac/slider-range"

describe("SliderRange", () => {
  it("moves a thumb with the keyboard", async () => {
    const user = userEvent.setup()
    render(<SliderRange label="Budget" defaultValue={[20, 80]} step={5} />)
    const minimum = screen.getByRole("slider", { name: "Budget minimum" })
    minimum.focus()
    await user.keyboard("{ArrowRight}")
    expect(minimum).toHaveAttribute("aria-valuenow", "25")
    expect(screen.getByText("25 – 80")).toBeInTheDocument()
  })
  it("reports changes for controlled values", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<SliderRange label="Budget" value={[20, 80]} onValueChange={onValueChange} />)
    screen.getByRole("slider", { name: "Budget maximum" }).focus()
    await user.keyboard("{ArrowLeft}")
    expect(onValueChange).toHaveBeenCalledWith([20, 79])
  })
})
