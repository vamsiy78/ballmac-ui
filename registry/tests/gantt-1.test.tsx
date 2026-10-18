import * as React from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { Gantt1 } from "@/components/ballmac/blocks/gantt-1/gantt-1"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

const bars = () => screen.getAllByRole("button").filter((b) => b.hasAttribute("data-bar"))

describe("Gantt1", () => {
  it("names each bar with its dates, progress and status in words", () => {
    render(<Gantt1 />)
    expect(screen.getByRole("button", { name: /User interviews: .* to .*, 100% done, Done/ })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Legal review: .*, 60% done, Late/ })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Wireframes: .*, 55% done, In progress/ })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Web app: .*, 0% done, Planned/ })).toBeInTheDocument()
  })

  it("works out status from today, never the clock", () => {
    render(<Gantt1 today="2026-12-30" />)
    expect(screen.getByRole("button", { name: /Private beta: .*, Late/ })).toBeInTheDocument()
  })

  it("selects a task, shows what it waits for, and tells the host", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<Gantt1 onSelect={onSelect} />)
    await user.click(screen.getByRole("button", { name: /^Visual design:/ }))
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "t5" }))
    const waits = screen.getByText("Waits for", { selector: "span" }).parentElement!
    expect(waits).toHaveTextContent("Waits for Wireframes")
  })

  it("moves between bars with the arrow keys, Home and End", async () => {
    const user = userEvent.setup()
    render(<Gantt1 />)
    const list = bars()
    list[0]!.focus()
    await user.keyboard("{ArrowDown}")
    expect(bars()[1]).toHaveFocus()
    await user.keyboard("{End}")
    expect(bars().at(-1)).toHaveFocus()
    await user.keyboard("{Home}")
    expect(bars()[0]).toHaveFocus()
    await user.keyboard("{ArrowUp}")
    expect(bars()[0]).toHaveFocus()
  })

  it("switches zoom and keeps the data", async () => {
    const user = userEvent.setup()
    render(<Gantt1 defaultScale="weeks" />)
    const region = screen.getByRole("region", { name: /Project timeline/ })
    const before = region.firstElementChild!.getAttribute("style") ?? region.innerHTML.length
    await user.click(screen.getByRole("radio", { name: "Days" }))
    expect(screen.getByRole("radio", { name: "Days" })).toBeChecked()
    expect(bars().length).toBeGreaterThan(8)
    expect(before).toBeDefined()
  })

  it("gives screen readers a table with the same tasks", () => {
    render(<Gantt1 />)
    const table = screen.getByRole("table", { hidden: true })
    expect(within(table).getByRole("columnheader", { name: "Waits for", hidden: true })).toBeInTheDocument()
    expect(within(table).getByText("Accessibility audit")).toBeInTheDocument()
  })

  it("shows loading, empty and error states", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const { rerender } = render(<Gantt1 state="loading" />)
    expect(screen.getByRole("status")).toBeInTheDocument()
    rerender(<Gantt1 state="empty" />)
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument()
    rerender(<Gantt1 tasks={[]} />)
    expect(bars()).toHaveLength(0)
    rerender(<Gantt1 state="error" onRetry={onRetry} />)
    await user.click(screen.getByRole("button", { name: /try again/i }))
    expect(onRetry).toHaveBeenCalled()
  })
})
