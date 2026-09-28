import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { ReasoningDisclosure } from "@/components/ballmac/reasoning-disclosure"

describe("ReasoningDisclosure", () => {
  it("opens while streaming and collapses when done", () => {
    const { rerender } = render(<ReasoningDisclosure streaming>Weighing options</ReasoningDisclosure>)
    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true")
    rerender(<ReasoningDisclosure streaming={false} duration={12}>Weighing options</ReasoningDisclosure>)
    const button = screen.getByRole("button", { name: /thought for 12s/i })
    expect(button).toHaveAttribute("aria-expanded", "false")
  })

  it("toggles with the keyboard", async () => {
    render(<ReasoningDisclosure duration={3}>Details</ReasoningDisclosure>)
    const button = screen.getByRole("button")
    button.focus()
    await userEvent.keyboard("{Enter}")
    expect(button).toHaveAttribute("aria-expanded", "true")
  })
})
