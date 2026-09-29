import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { TimePicker } from "@/components/ballmac/time-picker"
describe("TimePicker", () => {
  it("selects a time preset from the keyboard", async () => {
    const user = userEvent.setup()
    render(
      <TimePicker
        label="Meeting time"
        presets={[{ label: "Morning", value: "09:00" }]}
      />,
    )
    const button = screen.getByRole("button", { name: "Morning" })
    button.focus()
    await user.keyboard("{Enter}")
    expect(screen.getByLabelText("Meeting time")).toHaveValue("09:00")
  })
  it("reports controlled changes", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <TimePicker
        value="12:00"
        onValueChange={onValueChange}
        presets={[{ label: "Morning", value: "09:00" }]}
      />,
    )
    await user.click(screen.getByRole("button", { name: "Morning" }))
    expect(onValueChange).toHaveBeenCalledWith("09:00")
    expect(screen.getByLabelText("Time")).toHaveValue("12:00")
  })
})
