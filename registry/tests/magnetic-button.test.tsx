import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { MagneticButton } from "@/components/ballmac/magnetic-button"

describe("MagneticButton", () => {
  it("clicks from pointer and keyboard like a Button", async () => {
    const onClick = vi.fn()
    render(<MagneticButton onClick={onClick}>Start building</MagneticButton>)
    const button = screen.getByRole("button", { name: "Start building" })
    fireEvent.pointerMove(window, { clientX: 5, clientY: 5, pointerType: "mouse" })
    await userEvent.click(button)
    button.focus()
    await userEvent.keyboard("{Enter}")
    await userEvent.keyboard(" ")
    expect(onClick).toHaveBeenCalledTimes(3)
  })

  it("passes Button props through", async () => {
    const onClick = vi.fn()
    render(
      <MagneticButton loading variant="outline" onClick={onClick}>
        Save
      </MagneticButton>
    )
    const button = screen.getByRole("button", { name: "Save" })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute("aria-busy", "true")
    await userEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })
})
