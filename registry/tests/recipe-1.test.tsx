import * as React from "react"
import { act, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"

import { Recipe1 } from "@/components/ballmac/blocks/recipe-1/recipe-1"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})
afterEach(() => vi.useRealTimers())

const base = { serves: 4, ingredients: [{ id: "a", qty: 400, unit: "g", name: "pasta" }, { id: "b", qty: 1, unit: "tsp", name: "salt" }, { id: "c", qty: 4, name: "eggs" }], steps: [{ id: "s", text: "Boil it.", minutes: 1 }, { id: "t", text: "Serve it." }] }

describe("Recipe1", () => {
  it("scales every amount with the number of people", async () => {
    const user = userEvent.setup()
    render(<Recipe1 {...base} />)
    await user.click(screen.getByRole("button", { name: "More people" }))
    await user.click(screen.getByRole("button", { name: "More people" }))
    expect(screen.getByLabelText("6 people")).toBeInTheDocument()
    expect(screen.getByText("600 g")).toBeInTheDocument()
    expect(screen.getByText("1 ½ tsp")).toBeInTheDocument()
    expect(screen.getByRole("checkbox", { name: /^6 eggs/ })).toBeInTheDocument()
  })

  it("reads spoon amounts as fractions and weights as whole numbers", async () => {
    const user = userEvent.setup()
    render(<Recipe1 {...base} />)
    await user.click(screen.getByRole("button", { name: "Fewer people" }))
    await user.click(screen.getByRole("button", { name: "Fewer people" }))
    // 2 people: 200 g, ½ tsp, 2 eggs
    expect(screen.getByText("200 g")).toBeInTheDocument()
    expect(screen.getByText("½ tsp")).toBeInTheDocument()
  })

  it("switches to US units for weights and volumes", async () => {
    const user = userEvent.setup()
    render(<Recipe1 {...base} />)
    await user.click(screen.getByRole("radio", { name: "US" }))
    expect(screen.getByText("14.1 oz")).toBeInTheDocument()
    expect(screen.getByText("1 tsp")).toBeInTheDocument()
  })

  it("keeps the number of people between 1 and 24", async () => {
    const user = userEvent.setup()
    render(<Recipe1 {...base} serves={1} />)
    expect(screen.getByRole("button", { name: "Fewer people" })).toBeDisabled()
  })

  it("counts gathered ingredients and finished steps", async () => {
    const user = userEvent.setup()
    render(<Recipe1 {...base} />)
    await user.click(screen.getByRole("checkbox", { name: /pasta/ }))
    expect(screen.getByText("1 of 3 gathered")).toBeInTheDocument()
    await user.click(screen.getByRole("checkbox", { name: "Done with step 1" }))
    expect(screen.getByText("1 of 2 steps done")).toBeInTheDocument()
    await user.click(screen.getByRole("checkbox", { name: "Done with step 2" }))
    expect(screen.getByText("All done. Enjoy.")).toBeInTheDocument()
  })

  it("runs a timer on a step that needs waiting, and says when time is up", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<Recipe1 {...base} tick={100} />)
    expect(screen.getByRole("timer")).toHaveAttribute("aria-label", "Step 1: 1 minutes 0 seconds left")
    await user.click(screen.getByRole("button", { name: "Start 1 min timer" }))
    expect(screen.getByRole("button", { name: "Pause" })).toHaveAttribute("aria-pressed", "true")
    await act(async () => { vi.advanceTimersByTime(3000) })
    expect(screen.getByRole("timer").textContent).not.toBe("1:00")
    await act(async () => { vi.advanceTimersByTime(7000) })
    expect(screen.getByText("Time is up")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Reset the timer" }))
    expect(screen.getByRole("timer")).toHaveTextContent("1:00")
  })

  it("only gives a timer to steps that have minutes", () => {
    render(<Recipe1 {...base} />)
    expect(screen.getAllByRole("timer")).toHaveLength(1)
    expect(within(screen.getByText("Serve it.").closest("li")!).queryByRole("timer")).toBeNull()
  })
})
