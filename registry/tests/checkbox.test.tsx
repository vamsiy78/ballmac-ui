import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Checkbox } from "@/components/ballmac/checkbox"

describe("Checkbox", () => {
  it("toggles with Space and reports aria-checked", async () => {
    const onCheckedChange = vi.fn()
    render(<Checkbox aria-label="Accept terms" onCheckedChange={onCheckedChange} />)
    const box = screen.getByRole("checkbox", { name: "Accept terms" })
    expect(box).toHaveAttribute("aria-checked", "false")
    box.focus()
    await userEvent.keyboard(" ")
    expect(box).toHaveAttribute("aria-checked", "true")
    expect(onCheckedChange).toHaveBeenLastCalledWith(true)
    await userEvent.keyboard(" ")
    expect(box).toHaveAttribute("aria-checked", "false")
  })

  it("announces the indeterminate state as mixed and resolves to checked", async () => {
    function SelectAll() {
      const [checked, setChecked] = React.useState<boolean | "indeterminate">("indeterminate")
      return <Checkbox aria-label="Select all" checked={checked} onCheckedChange={setChecked} />
    }
    render(<SelectAll />)
    const box = screen.getByRole("checkbox", { name: "Select all" })
    expect(box).toHaveAttribute("aria-checked", "mixed")
    expect(box).toHaveAttribute("data-state", "indeterminate")
    await userEvent.click(box)
    expect(box).toHaveAttribute("aria-checked", "true")
  })

  it("does not toggle when disabled", async () => {
    render(<Checkbox aria-label="Beta" disabled />)
    const box = screen.getByRole("checkbox", { name: "Beta" })
    await userEvent.click(box)
    expect(box).toHaveAttribute("aria-checked", "false")
  })
})
