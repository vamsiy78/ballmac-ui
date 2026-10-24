import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Runbook1 } from "@/components/ballmac/blocks/runbook-1/runbook-1"

describe("Runbook1", () => {
  it("lists the steps in order with the next one marked as the current step, and counts the minutes left", () => {
    render(<Runbook1 />)
    const steps = within(screen.getByRole("list")).getAllByRole("listitem")
    expect(steps).toHaveLength(5)
    expect(steps[0]).toHaveAttribute("aria-current", "step")
    expect(steps[0]).toHaveTextContent("Next")
    expect(screen.getByText("0 of 5 steps done")).toBeInTheDocument()
    expect(screen.getByText("About 22 min left")).toBeInTheDocument()
    expect(screen.getByRole("meter", { name: "Steps done" })).toHaveAttribute("aria-valuetext", "0 of 5 steps done")
  })

  it("ticking a step moves the marker to the next one and updates the count", async () => {
    const user = userEvent.setup()
    const onStepChange = vi.fn().mockResolvedValue(undefined)
    render(<Runbook1 onStepChange={onStepChange} />)
    await user.click(screen.getByRole("checkbox", { name: /Confirm it is the connection limit/ }))
    expect(onStepChange).toHaveBeenCalledWith("s1", true)
    expect(screen.getByText("1 of 5 steps done")).toBeInTheDocument()
    expect(screen.getByText("About 20 min left")).toBeInTheDocument()
    const steps = within(screen.getByRole("list")).getAllByRole("listitem")
    expect(steps[1]).toHaveAttribute("aria-current", "step")
    expect(steps[0]).not.toHaveAttribute("aria-current")
  })

  it("puts a tick back and says why when it cannot be saved", async () => {
    const user = userEvent.setup()
    render(<Runbook1 onStepChange={() => Promise.reject(new Error("Your session expired."))} />)
    await user.click(screen.getByRole("checkbox", { name: /Confirm it is the connection limit/ }))
    expect(await screen.findByRole("alert")).toHaveTextContent("Your session expired.")
    expect(screen.getByRole("checkbox", { name: /Confirm it is the connection limit/ })).not.toBeChecked()
  })

  it("shows a caution in words before the step and commands left to right, with a copy button", async () => {
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true })
    render(<Runbook1 />)
    expect(screen.getByText("Careful:")).toBeInTheDocument()
    expect(screen.getByLabelText("Command for step 1")).toHaveAttribute("dir", "ltr")
    await user.click(screen.getByRole("button", { name: "Copy the command for step 1" }))
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining("pg_stat_activity"))
    expect(await screen.findByText("Copied")).toBeInTheDocument()
  })

  it("only lets the runbook be finished when every step is done", async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn().mockResolvedValue(undefined)
    render(<Runbook1 defaultDone={["s1", "s2", "s3", "s4"]} onComplete={onComplete} />)
    const finish = screen.getByRole("button", { name: "Finish runbook" })
    expect(finish).toBeDisabled()
    await user.click(screen.getByRole("checkbox", { name: /Post an update/ }))
    expect(finish).toBeEnabled()
    await user.click(finish)
    expect(onComplete).toHaveBeenCalled()
    expect(await screen.findByText(/Runbook finished\./)).toBeInTheDocument()
  })

  it("shows loading, empty and error states", () => {
    const { rerender } = render(<Runbook1 state="loading" />)
    expect(screen.getByRole("status")).toHaveTextContent("Loading the runbook")
    rerender(<Runbook1 runbook={null} />)
    expect(screen.getByText("No runbook for this")).toBeInTheDocument()
    rerender(<Runbook1 state="error" onRetry={() => {}} />)
    expect(screen.getByRole("alert")).toHaveTextContent("The runbook could not be loaded")
  })
})
