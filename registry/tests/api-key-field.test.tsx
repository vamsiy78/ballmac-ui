import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { ApiKeyField } from "@/components/ballmac/api-key-field"

const KEY = "sk-live-abcdefghijklmnop1234"

describe("ApiKeyField", () => {
  it("masks by default, reveals on toggle, and copies the full key", async () => {
    const user = userEvent.setup()
    const writeText = vi.spyOn(navigator.clipboard, "writeText")
    render(<ApiKeyField label="Secret key" value={KEY} visiblePrefix={8} visibleSuffix={4} />)
    expect(screen.queryByText(KEY)).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /copy/i }))
    expect(writeText).toHaveBeenCalledWith(KEY)
    const reveal = screen.getByRole("button", { name: /show|reveal/i })
    await user.click(reveal)
    expect(reveal).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByText(KEY)).toBeInTheDocument()
  })

  it("lets keyboard users reach the value, so a long key can be scrolled", async () => {
    const user = userEvent.setup()
    const { container } = render(<ApiKeyField label="Secret key" value={KEY} />)
    const value = container.querySelector("[data-slot=api-key-field-value]")
    await user.tab()
    expect(value).toHaveFocus()
  })
})
