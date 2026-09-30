import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { ProgressSteps } from "@/components/ballmac/progress-steps"

const steps = [
  { id: "one", label: "Details" },
  { id: "two", label: "Team" },
  { id: "three", label: "Review" },
]

describe("ProgressSteps", () => {
  it("returns to a completed step through the keyboard", async () => {
    const user = userEvent.setup()
    render(<ProgressSteps steps={steps} defaultActiveIndex={2} navigable />)
    screen.getByRole("button", { name: "Return to Details" }).focus()
    await user.keyboard("{Enter}")
    expect(
      screen.getByText("Details").closest("[aria-current]"),
    ).toHaveAttribute("aria-current", "step")
  })

  it("reports controlled navigation without changing the active step", async () => {
    const user = userEvent.setup()
    const onActiveIndexChange = vi.fn()
    render(
      <ProgressSteps
        steps={steps}
        activeIndex={2}
        navigable
        onActiveIndexChange={onActiveIndexChange}
      />,
    )
    await user.click(screen.getByRole("button", { name: "Return to Team" }))
    expect(onActiveIndexChange).toHaveBeenCalledWith(1)
    expect(
      screen.getByText("Review").closest("[aria-current]"),
    ).toHaveAttribute("aria-current", "step")
  })
})
