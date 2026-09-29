import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { NumberInput } from "@/components/ballmac/number-input"
describe("NumberInput", () => {
  it("steps and clamps an uncontrolled value", async () => {
    const user = userEvent.setup()
    render(<NumberInput label="Seats" defaultValue={2} min={1} max={3} />)
    await user.click(screen.getByRole("button", { name: "Increase Seats" }))
    expect(screen.getByRole("spinbutton", { name: "Seats" })).toHaveValue(3)
    expect(
      screen.getByRole("button", { name: "Increase Seats" }),
    ).toBeDisabled()
    await user.click(screen.getByRole("button", { name: "Decrease Seats" }))
    expect(screen.getByRole("spinbutton", { name: "Seats" })).toHaveValue(2)
  })
  it("reports controlled changes without mutating the displayed value", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <NumberInput label="Seats" value={2} onValueChange={onValueChange} />,
    )
    await user.click(screen.getByRole("button", { name: "Increase Seats" }))
    expect(onValueChange).toHaveBeenCalledWith(3)
    expect(screen.getByRole("spinbutton", { name: "Seats" })).toHaveValue(2)
  })
})
