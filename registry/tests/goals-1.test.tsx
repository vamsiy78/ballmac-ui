import * as React from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { Goals1, type Goals1Objective } from "@/components/ballmac/blocks/goals-1/goals-1"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

const obj = (id: string, krs: [number, number, number][], team = "Product"): Goals1Objective => ({ id, title: `Objective ${id}`, owner: "Ann Lee", team, keyResults: krs.map(([start, target, current], i) => ({ id: `${id}k${i}`, title: `KR ${id}${i}`, start, target, current })) })

describe("Goals1", () => {
  it("works out a key result's progress from start, current and target", () => {
    render(<Goals1 objectives={[obj("a", [[0, 100, 40]])]} range={["2026-10-01", "2026-12-31"]} today="2026-11-15" />)
    expect(screen.getByText(/40% of the way from 0/)).toBeInTheDocument()
  })

  it("treats a target below the start as lower is better", () => {
    render(<Goals1 objectives={[obj("a", [[20, 10, 15]])]} today="2026-11-15" />)
    expect(screen.getByText(/50% of the way from 20 \(lower is better\)/)).toBeInTheDocument()
  })

  it("judges status against how much of the period is gone, in words", () => {
    // Half the period is gone (about 2026-11-15).
    const { rerender } = render(<Goals1 objectives={[obj("a", [[0, 100, 55]])]} today="2026-11-15" />)
    expect(screen.getByRole("article")).toHaveTextContent("On track")
    rerender(<Goals1 objectives={[obj("a", [[0, 100, 35]])]} today="2026-11-15" />)
    expect(screen.getByRole("article")).toHaveTextContent("At risk")
    rerender(<Goals1 objectives={[obj("a", [[0, 100, 10]])]} today="2026-11-15" />)
    expect(screen.getByRole("article")).toHaveTextContent("Behind")
    rerender(<Goals1 objectives={[obj("a", [[0, 100, 100]])]} today="2026-11-15" />)
    expect(screen.getByRole("article")).toHaveTextContent("Done")
  })

  it("averages key results into the objective and objectives into the overall figure", () => {
    render(<Goals1 objectives={[obj("a", [[0, 100, 100], [0, 100, 0]]), obj("b", [[0, 100, 20]])]} today="2026-11-15" />)
    expect(screen.getAllByText(/· 50%/).length).toBeGreaterThan(0)
    // overall = (50 + 20) / 2 = 35
    expect(screen.getByText("35%")).toBeInTheDocument()
  })

  it("counts objectives by status in a labelled list", () => {
    render(<Goals1 objectives={[obj("a", [[0, 100, 55]]), obj("b", [[0, 100, 5]])]} today="2026-11-15" />)
    const list = screen.getByRole("list", { name: "Objectives by status" })
    expect(within(list).getByText("On track").parentElement).toHaveTextContent("1 On track")
    expect(within(list).getByText("Behind").parentElement).toHaveTextContent("1 Behind")
  })

  it("filters by team", async () => {
    const user = userEvent.setup()
    render(<Goals1 objectives={[obj("a", [[0, 100, 5]], "Product"), obj("b", [[0, 100, 5]], "Growth")]} />)
    await user.click(screen.getByRole("button", { name: "Growth" }))
    expect(screen.getByRole("button", { name: "Growth" })).toHaveAttribute("aria-pressed", "true")
    expect(screen.queryByText("Objective a")).toBeNull()
    expect(screen.getByText("Objective b")).toBeInTheDocument()
  })

  it("updates a number in place with Enter, and everything follows", async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn().mockResolvedValue(undefined)
    render(<Goals1 objectives={[obj("a", [[0, 100, 10]])]} today="2026-11-15" onUpdate={onUpdate} />)
    await user.click(screen.getByRole("button", { name: "Update KR a0" }))
    const field = screen.getByLabelText("New value for KR a0")
    await user.clear(field)
    await user.type(field, "90{Enter}")
    expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ id: "a" }), expect.objectContaining({ current: 90 }), 90)
    expect(screen.getByRole("article")).toHaveTextContent("On track")
  })

  it("puts the old number back and says so when the update fails", async () => {
    const user = userEvent.setup()
    render(<Goals1 objectives={[obj("a", [[0, 100, 10]])]} onUpdate={() => Promise.reject(new Error("You can only edit your own goals."))} />)
    await user.click(screen.getByRole("button", { name: "Update KR a0" }))
    const field = screen.getByLabelText("New value for KR a0")
    await user.clear(field)
    await user.type(field, "80{Enter}")
    expect(await screen.findByRole("alert")).toHaveTextContent("You can only edit your own goals.")
    expect(screen.getByText(/10% of the way/)).toBeInTheDocument()
  })

  it("cancels with Escape and rejects text that is not a number", async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    render(<Goals1 objectives={[obj("a", [[0, 100, 10]])]} onUpdate={onUpdate} />)
    await user.click(screen.getByRole("button", { name: "Update KR a0" }))
    await user.clear(screen.getByLabelText("New value for KR a0"))
    await user.keyboard("{Enter}")
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a number.")
    await user.keyboard("{Escape}")
    expect(screen.queryByLabelText("New value for KR a0")).toBeNull()
    expect(onUpdate).not.toHaveBeenCalled()
  })

  it("shows loading, empty and error states", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const { rerender } = render(<Goals1 state="loading" />)
    expect(screen.getByRole("status")).toBeInTheDocument()
    rerender(<Goals1 state="empty" />)
    expect(screen.getByRole("heading", { name: "No goals for this period yet" })).toBeInTheDocument()
    rerender(<Goals1 state="error" onRetry={onRetry} />)
    await user.click(screen.getByRole("button", { name: /try again/i }))
    expect(onRetry).toHaveBeenCalled()
  })
})
