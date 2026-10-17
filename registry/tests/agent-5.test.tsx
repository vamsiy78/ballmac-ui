import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Agent5 } from "@/components/ballmac/blocks/agent-5/agent-5"

describe("Agent5", () => {
  it("calls out regressions and selects the first one", () => {
    render(<Agent5 />)
    expect(screen.getAllByRole("status").some((s) => /1 case that passed now fails/.test(s.textContent ?? ""))).toBe(true)
    expect(screen.getByRole("button", { name: /delete their account/ })).toHaveAttribute("aria-pressed", "true")
  })

  it("says which way each metric moved in words", () => {
    render(<Agent5 />)
    expect(screen.getAllByText("Better")).toHaveLength(3)
    expect(screen.getAllByText("Worse")).toHaveLength(1)
  })

  it("filters to improvements and switches to the diff view", async () => {
    const user = userEvent.setup()
    render(<Agent5 />)
    await user.click(screen.getByRole("radio", { name: /Improved/ }))
    expect(screen.getAllByRole("button", { pressed: false }).filter((b) => b.closest("ul[aria-label=Cases]"))).toHaveLength(1)
    await user.click(screen.getByRole("radio", { name: "Diff" }))
    expect(screen.getByLabelText("baseline → candidate diff")).toBeInTheDocument()
  })

  it("ships or keeps the baseline", async () => {
    const user = userEvent.setup()
    const onShip = vi.fn()
    render(<Agent5 onShip={onShip} onKeepBaseline={() => {}} />)
    await user.click(screen.getByRole("button", { name: "Ship candidate" }))
    expect(onShip).toHaveBeenCalled()
  })
})
