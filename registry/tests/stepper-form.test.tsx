import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { StepperForm } from "@/components/ballmac/stepper-form"

describe("StepperForm", () => {
  it("gates progression, supports back, and completes", async () => {
    const user = userEvent.setup()
    let valid = false
    const onComplete = vi.fn()
    render(<StepperForm steps={[{ id: "one", title: "Details", content: <p>Enter details</p>, validate: () => valid }, { id: "two", title: "Review", content: <p>Check details</p> }]} onComplete={onComplete} />)
    await user.click(screen.getByRole("button", { name: "Continue" }))
    expect(screen.getByRole("status")).toHaveTextContent("Complete this step")
    valid = true
    await user.click(screen.getByRole("button", { name: "Continue" }))
    expect(screen.getByText("Check details")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Back" }))
    expect(screen.getByText("Enter details")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Continue" }))
    await user.click(screen.getByRole("button", { name: "Complete" }))
    expect(onComplete).toHaveBeenCalledOnce()
  })
  it("reports a controlled step change", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<StepperForm value={0} onValueChange={onValueChange} steps={[{ id: "one", title: "One", content: "First" }, { id: "two", title: "Two", content: "Second" }]} />)
    await user.click(screen.getByRole("button", { name: "Continue" }))
    expect(onValueChange).toHaveBeenCalledWith(1)
    expect(screen.getByText("First")).toBeInTheDocument()
  })
})
