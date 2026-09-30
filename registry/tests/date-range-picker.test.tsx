import * as React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { DateRangePicker } from "@/components/ballmac/date-range-picker"

describe("DateRangePicker", () => {
  it("keeps endpoints ordered and applies presets", async () => {
    const user = userEvent.setup()
    render(<DateRangePicker label="Period" defaultValue={{ from: "2026-09-01", to: "2026-09-10" }} presets={[{ label: "October", from: "2026-10-01", to: "2026-10-31" }]} />)
    fireEvent.change(screen.getByLabelText("From"), { target: { value: "2026-09-20" } })
    expect(screen.getByLabelText("To")).toHaveValue("2026-09-20")
    await user.click(screen.getByRole("button", { name: "October" }))
    expect(screen.getByLabelText("From")).toHaveValue("2026-10-01")
    expect(screen.getByLabelText("To")).toHaveValue("2026-10-31")
  })
  it("reports controlled changes without mutating its own range", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<DateRangePicker label="Period" value={{ from: "2026-09-01", to: "2026-09-30" }} onValueChange={onValueChange} presets={[{ label: "August", from: "2026-08-01", to: "2026-08-31" }]} />)
    await user.click(screen.getByRole("button", { name: "August" }))
    expect(onValueChange).toHaveBeenCalledWith({ from: "2026-08-01", to: "2026-08-31" })
    expect(screen.getByLabelText("From")).toHaveValue("2026-09-01")
  })
})
