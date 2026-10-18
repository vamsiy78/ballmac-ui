import * as React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { Tour1 } from "@/components/ballmac/blocks/tour-1/tour-1"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

describe("Tour1", () => {
  it("starts, says which step it is, and moves focus to the card", async () => {
    const user = userEvent.setup()
    render(<Tour1 />)
    await user.click(screen.getByRole("button", { name: "Start the tour" }))
    const dialog = screen.getByRole("dialog", { name: "Everything starts here" })
    expect(dialog).toHaveTextContent("Step 1 of 4")
    await waitFor(() => expect(screen.getByRole("button", { name: "Next" })).toHaveFocus())
  })

  it("moves with Next and Back, and Back is off on the first step", async () => {
    const user = userEvent.setup()
    render(<Tour1 />)
    await user.click(screen.getByRole("button", { name: "Start the tour" }))
    expect(screen.getByRole("button", { name: "Back" })).toBeDisabled()
    await user.click(screen.getByRole("button", { name: "Next" }))
    expect(screen.getByRole("dialog", { name: "Find anything fast" })).toHaveTextContent("Step 2 of 4")
    await user.click(screen.getByRole("button", { name: "Back" }))
    expect(screen.getByRole("dialog", { name: "Everything starts here" })).toBeInTheDocument()
  })

  it("moves with the arrow keys", async () => {
    const user = userEvent.setup()
    render(<Tour1 defaultStep={0} />)
    screen.getByRole("button", { name: "Next" }).focus()
    await user.keyboard("{ArrowRight}")
    expect(screen.getByRole("dialog", { name: "Find anything fast" })).toBeInTheDocument()
    await user.keyboard("{ArrowLeft}")
    expect(screen.getByRole("dialog", { name: "Everything starts here" })).toBeInTheDocument()
  })

  it("finishes on the last step and reports it was completed", async () => {
    const user = userEvent.setup()
    const onFinish = vi.fn()
    render(<Tour1 defaultStep={3} onFinish={onFinish} />)
    await user.click(screen.getByRole("button", { name: "Finish" }))
    expect(onFinish).toHaveBeenCalledWith({ completed: true, step: 3 })
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("ends with Escape or Skip, reports it was not completed, and returns focus to Start", async () => {
    const user = userEvent.setup()
    const onFinish = vi.fn()
    render(<Tour1 onFinish={onFinish} />)
    await user.click(screen.getByRole("button", { name: "Start the tour" }))
    await user.keyboard("{Escape}")
    expect(onFinish).toHaveBeenLastCalledWith({ completed: false, step: 0 })
    await waitFor(() => expect(screen.getByRole("button", { name: "Start the tour" })).toHaveFocus())
    await user.click(screen.getByRole("button", { name: "Start the tour" }))
    await user.click(screen.getByRole("button", { name: "Skip the tour" }))
    expect(onFinish).toHaveBeenCalledTimes(2)
  })

  it("keeps the page behind inert while the tour runs", async () => {
    const user = userEvent.setup()
    render(<Tour1 />)
    await user.click(screen.getByRole("button", { name: "Start the tour" }))
    expect(screen.getByRole("navigation", { name: "Sample navigation" }).closest("[inert]")).not.toBeNull()
  })

  it("has a labelled progress bar", () => {
    render(<Tour1 defaultStep={1} />)
    expect(screen.getByRole("progressbar", { name: "Tour progress" })).toHaveAttribute("aria-valuenow", "2")
  })

  it("tours your own interface through data-tour attributes", async () => {
    const user = userEvent.setup()
    render(
      <Tour1 steps={[{ target: "mine", title: "My button", body: "This is mine." }]}>
        <button data-tour="mine">Mine</button>
      </Tour1>
    )
    await user.click(screen.getByRole("button", { name: "Start the tour" }))
    expect(screen.getByRole("dialog", { name: "My button" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Finish" })).toBeInTheDocument()
  })
})
