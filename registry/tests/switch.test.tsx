import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Label } from "@/components/ballmac/label"
import { Switch } from "@/components/ballmac/switch"

describe("Switch", () => {
  it("toggles with Space and updates aria-checked", async () => {
    const onCheckedChange = vi.fn()
    render(
      <>
        <Switch id="wifi" onCheckedChange={onCheckedChange} />
        <Label htmlFor="wifi">Wi-Fi</Label>
      </>
    )
    const control = screen.getByRole("switch", { name: "Wi-Fi" })
    expect(control).toHaveAttribute("aria-checked", "false")
    control.focus()
    await userEvent.keyboard(" ")
    expect(control).toHaveAttribute("aria-checked", "true")
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it("toggles when its label is clicked and respects defaultChecked", async () => {
    render(
      <>
        <Switch id="digest" defaultChecked size="sm" />
        <Label htmlFor="digest">Weekly digest</Label>
      </>
    )
    const control = screen.getByRole("switch", { name: "Weekly digest" })
    expect(control).toHaveAttribute("aria-checked", "true")
    expect(control).toHaveAttribute("data-size", "sm")
    await userEvent.click(screen.getByText("Weekly digest"))
    expect(control).toHaveAttribute("aria-checked", "false")
  })
})
