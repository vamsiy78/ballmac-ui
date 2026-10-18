import * as React from "react"
import { fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { Tasks1 } from "@/components/ballmac/blocks/tasks-1/tasks-1"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

const main = (id: string) => document.querySelector(`[data-task-main="${id}"]`) as HTMLElement

describe("Tasks1", () => {
  it("groups by due date and writes overdue in words", () => {
    render(<Tasks1 />)
    for (const name of [/Overdue/, /Today/, /Upcoming/, /No date/, /Completed/]) expect(screen.getByRole("heading", { name })).toBeInTheDocument()
    expect(screen.getByText("Overdue by 2 days")).toBeInTheDocument()
    // Radix keeps a hidden native select, so the word can appear there too
    expect(screen.getAllByText("Tomorrow").length).toBeGreaterThan(0)
    expect(screen.getAllByText("High priority").length).toBeGreaterThan(0)
    expect(screen.getAllByText(/3 of 11 done/).length).toBeGreaterThan(0)
  })

  it("adds a task with Enter, dated today by default", async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(<Tasks1 onAdd={onAdd} />)
    await user.type(screen.getByRole("textbox", { name: "New task" }), "Call the bank{Enter}")
    expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({ title: "Call the bank", due: "2026-10-18", priority: "normal" }))
    expect(screen.getByRole("heading", { name: /Today/ })).toHaveTextContent("3")
    expect(screen.getByRole("textbox", { name: "New task" })).toHaveValue("")
  })

  it("completes a task, moves it to Completed, and updates the progress", async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    render(<Tasks1 onToggle={onToggle} />)
    await user.click(screen.getByRole("checkbox", { name: "Complete: Review the release notes for 2.5" }))
    expect(onToggle).toHaveBeenCalledWith("t2", true)
    expect(screen.getAllByText(/4 of 11 done/).length).toBeGreaterThan(0)
    expect(screen.getByRole("heading", { name: /Completed/ })).toHaveTextContent("4")
  })

  it("deletes with Undo and restores in place", async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    const onRestore = vi.fn()
    render(<Tasks1 onDelete={onDelete} onRestore={onRestore} />)
    await user.click(screen.getByRole("button", { name: "Delete: Tidy up the icon set" }))
    expect(onDelete).toHaveBeenCalledWith("t7")
    expect(screen.queryByText("Tidy up the icon set")).toBeNull()
    await user.click(screen.getByRole("button", { name: "Undo" }))
    expect(onRestore).toHaveBeenCalledWith(expect.objectContaining({ id: "t7" }))
    expect(screen.getByText("Tidy up the icon set")).toBeInTheDocument()
  })

  it("edits a title in place and cancels with Escape", async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    render(<Tasks1 onEdit={onEdit} />)
    await user.click(main("t7"))
    const box = screen.getByRole("textbox", { name: "Task title" })
    await user.clear(box)
    await user.type(box, "Redraw the icons{Enter}")
    expect(onEdit).toHaveBeenCalledWith("t7", "Redraw the icons")
    expect(screen.getByText("Redraw the icons")).toBeInTheDocument()
    await user.click(main("t7"))
    await user.type(screen.getByRole("textbox", { name: "Task title" }), "xyz{Escape}")
    expect(screen.queryByRole("textbox", { name: "Task title" })).toBeNull()
    expect(screen.getByText("Redraw the icons")).toBeInTheDocument()
  })

  it("completes with X and reorders with Alt and the arrow keys", async () => {
    const user = userEvent.setup()
    const onReorder = vi.fn()
    render(<Tasks1 onReorder={onReorder} />)
    main("t2").focus()
    fireEvent.keyDown(main("t2"), { key: "ArrowDown", altKey: true })
    const order = onReorder.mock.calls[0]![0] as string[]
    expect(order.indexOf("t3")).toBeLessThan(order.indexOf("t2"))
    main("t3").focus()
    await user.keyboard("x")
    expect(screen.getAllByText(/4 of 11 done/).length).toBeGreaterThan(0)
  })

  it("filters to high priority and has move buttons for every open task", async () => {
    const user = userEvent.setup()
    render(<Tasks1 />)
    expect(screen.getByRole("button", { name: "Move up: Review the release notes for 2.5" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Move down: Review the release notes for 2.5" })).toBeEnabled()
    await user.click(screen.getByRole("radio", { name: "High priority" }))
    expect(screen.queryByText("Tidy up the icon set")).toBeNull()
    expect(screen.getByText("Write the launch announcement")).toBeInTheDocument()
  })

  it("shows the calm empty state", () => {
    render(<Tasks1 state="empty" />)
    expect(screen.getByRole("heading", { name: "Nothing to do" })).toBeInTheDocument()
  })
})
