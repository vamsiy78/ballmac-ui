import * as React from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { Workflow1 } from "@/components/ballmac/blocks/workflow-1/workflow-1"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

describe("Workflow1", () => {
  it("shows the steps as readable sentences", () => {
    render(<Workflow1 />)
    expect(screen.getByText("Order total is more than 500")).toBeInTheDocument()
    expect(screen.getByText("Wait 1 day")).toBeInTheDocument()
    expect(screen.getByText(/Big order from/)).toBeInTheDocument()
  })

  it("adds a step where the plus was pressed, and reports the whole flow", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Workflow1 onChange={onChange} />)
    await user.click(screen.getByRole("button", { name: "Add a step after the trigger" }))
    await user.click(screen.getByRole("button", { name: "Wait" }))
    const last = onChange.mock.calls.at(-1)![0]
    expect(last.steps).toHaveLength(5)
    expect(last.steps[0]).toMatchObject({ type: "delay", amount: 1, unit: "hours" })
    expect(screen.getByRole("button", { name: /^1\. Wait/ })).toHaveAttribute("aria-expanded", "true")
  })

  it("edits a step's settings", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Workflow1 onChange={onChange} defaultSelectedId="s1" />)
    const value = screen.getByLabelText("Value")
    await user.clear(value)
    await user.type(value, "900")
    expect(screen.getByText("Order total is more than 900")).toBeInTheDocument()
    expect(onChange.mock.calls.at(-1)![0].steps[0]).toMatchObject({ value: "900" })
  })

  it("moves and deletes steps, naming which one, and announces it", async () => {
    const user = userEvent.setup()
    render(<Workflow1 />)
    expect(screen.getByRole("button", { name: "Move step 1 up" })).toBeDisabled()
    await user.click(screen.getByRole("button", { name: "Move step 2 up" }))
    expect(screen.getByRole("button", { name: /^1\. Post to Slack/ })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Delete step 1" }))
    expect(screen.getAllByRole("button", { name: /^\d\. / })).toHaveLength(3)
  })

  it("test run completes every step when the condition is met", async () => {
    const user = userEvent.setup()
    render(<Workflow1 stepMs={0} />)
    await user.click(screen.getByRole("button", { name: "Test run" }))
    expect(await screen.findByText(/Test run finished. All 4 steps ran./)).toBeInTheDocument()
    expect(screen.getAllByText("Ran fine")).toHaveLength(4)
  })

  it("test run stops at a condition that is not met and says where and why", async () => {
    const user = userEvent.setup()
    render(<Workflow1 stepMs={0} sample={{ "Order total": "120" }} />)
    await user.click(screen.getByRole("button", { name: "Test run" }))
    expect((await screen.findAllByText(/Test run stopped at step 1/)).length).toBeGreaterThan(0)
    expect(screen.getByText(/Stopped here: 120 does not match/)).toBeInTheDocument()
    expect(screen.queryAllByText("Ran fine")).toHaveLength(0)
  })

  it("switches the automation off and reports it", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Workflow1 onChange={onChange} />)
    await user.click(screen.getByRole("switch", { name: "Run this automation" }))
    expect(onChange.mock.calls.at(-1)![0].enabled).toBe(false)
    expect(screen.getByText("Off: paused")).toBeInTheDocument()
  })

  it("changes the trigger", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Workflow1 onChange={onChange} />)
    await user.click(screen.getByRole("combobox", { name: "What starts this automation" }))
    await user.click(await screen.findByRole("option", { name: "A customer signs up" }))
    expect(onChange.mock.calls.at(-1)![0].trigger).toBe("A customer signs up")
  })

  it("shows loading, empty and error states", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const { rerender } = render(<Workflow1 state="loading" />)
    expect(screen.getByRole("status")).toBeInTheDocument()
    rerender(<Workflow1 state="empty" />)
    expect(screen.getByRole("heading", { name: "Nothing automated yet" })).toBeInTheDocument()
    rerender(<Workflow1 state="error" onRetry={onRetry} />)
    await user.click(screen.getByRole("button", { name: /try again/i }))
    expect(onRetry).toHaveBeenCalled()
  })
})
