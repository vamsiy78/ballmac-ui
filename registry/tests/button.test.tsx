import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Button } from "@/components/ballmac/button"

describe("Button", () => {
  it("fires onClick from keyboard and pointer", async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Save</Button>)
    const button = screen.getByRole("button", { name: "Save" })
    await userEvent.click(button)
    button.focus()
    await userEvent.keyboard("{Enter}")
    expect(onClick).toHaveBeenCalledTimes(2)
  })

  it("blocks clicks and announces busy while loading", async () => {
    const onClick = vi.fn()
    render(<Button loading onClick={onClick}>Save</Button>)
    const button = screen.getByRole("button", { name: "Save" })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute("aria-busy", "true")
    await userEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it("renders its child with asChild", () => {
    render(
      <Button asChild>
        <a href="/docs">Docs</a>
      </Button>
    )
    expect(screen.getByRole("link", { name: "Docs" })).toHaveAttribute("data-slot", "button")
  })
})
