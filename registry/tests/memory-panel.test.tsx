import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { MemoryPanel, type MemoryItem } from "@/components/ballmac/memory-panel"

const memories: MemoryItem[] = [
  { id: "1", scope: "you", text: "Lives in Lisbon." },
  { id: "2", scope: "style", text: "Likes short answers.", pinned: true },
]

describe("MemoryPanel", () => {
  it("groups memories under headings and counts them", () => {
    render(<MemoryPanel memories={memories} />)
    expect(screen.getByRole("heading", { name: /^Memory/ })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: /About you/ })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: /Style/ })).toBeInTheDocument()
    expect(screen.queryByRole("heading", { name: /Your work/ })).not.toBeInTheDocument()
  })

  it("is a switch that says memory is off without deleting anything", async () => {
    const user = userEvent.setup()
    const onEnabledChange = vi.fn()
    render(<MemoryPanel memories={memories} onEnabledChange={onEnabledChange} />)
    const sw = screen.getByRole("switch", { name: "Use memory in replies" })
    expect(sw).toBeChecked()
    await user.click(sw)
    expect(sw).not.toBeChecked()
    expect(onEnabledChange).toHaveBeenCalledWith(false)
    expect(screen.getByText("Lives in Lisbon.")).toBeInTheDocument()
  })

  it("filters by search", async () => {
    const user = userEvent.setup()
    render(<MemoryPanel memories={memories} />)
    await user.type(screen.getByRole("searchbox", { name: "Search memory" }), "zzz")
    expect(screen.getByText("Nothing matches “zzz”.")).toBeInTheDocument()
  })

  it("edits with Enter and takes the change back with the reason if it cannot be saved", async () => {
    const user = userEvent.setup()
    render(<MemoryPanel memories={memories} onUpdate={() => Promise.reject(new Error("You are offline."))} />)
    await user.click(screen.getByRole("button", { name: "Edit: Lives in Lisbon." }))
    const box = screen.getByRole("textbox", { name: "Edit this memory" })
    await user.clear(box)
    await user.type(box, "Lives in Porto.{Enter}")
    expect(await screen.findByRole("alert")).toHaveTextContent("You are offline.")
    expect(screen.getByText("Lives in Lisbon.")).toBeInTheDocument()
  })

  it("cancels an edit with Escape", async () => {
    const user = userEvent.setup()
    render(<MemoryPanel memories={memories} />)
    await user.click(screen.getByRole("button", { name: "Edit: Lives in Lisbon." }))
    await user.keyboard("{Escape}")
    expect(screen.queryByRole("textbox", { name: "Edit this memory" })).not.toBeInTheDocument()
  })

  it("pins and reports it", async () => {
    const user = userEvent.setup()
    const onPin = vi.fn()
    render(<MemoryPanel memories={memories} onPin={onPin} />)
    await user.click(screen.getByRole("button", { name: "Pin: Lives in Lisbon." }))
    expect(onPin).toHaveBeenCalledWith("1", true)
    expect(screen.getByRole("button", { name: "Pin: Lives in Lisbon." })).toHaveAttribute("aria-pressed", "true")
  })

  it("adds a memory", async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn().mockResolvedValue("m9")
    render(<MemoryPanel memories={memories} onAdd={onAdd} />)
    await user.type(screen.getByLabelText("Something to remember"), "Uses Linux")
    await user.click(screen.getByRole("button", { name: "Remember" }))
    expect(onAdd).toHaveBeenCalledWith("Uses Linux", "you")
    expect(await screen.findByText("Uses Linux")).toBeInTheDocument()
  })
})

describe("MemoryPanel forgetting", () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }))
  afterEach(() => vi.useRealTimers())

  it("waits for the undo window, and Undo cancels it", async () => {
    const onForget = vi.fn()
    render(<MemoryPanel memories={memories} onForget={onForget} undoMs={3000} />)
    await act(async () => screen.getByRole("button", { name: "Forget: Lives in Lisbon." }).click())
    expect(screen.getByRole("button", { name: "Undo" })).toBeInTheDocument()
    await act(async () => screen.getByRole("button", { name: "Undo" }).click())
    await act(async () => void vi.advanceTimersByTime(4000))
    expect(onForget).not.toHaveBeenCalled()
    expect(screen.getByText("Lives in Lisbon.")).toBeInTheDocument()
  })

  it("forgets after the window", async () => {
    const onForget = vi.fn().mockResolvedValue(undefined)
    render(<MemoryPanel memories={memories} onForget={onForget} undoMs={3000} />)
    await act(async () => screen.getByRole("button", { name: "Forget: Lives in Lisbon." }).click())
    await act(async () => void vi.advanceTimersByTime(3100))
    expect(onForget).toHaveBeenCalledWith("1")
    expect(screen.queryByText("Lives in Lisbon.")).not.toBeInTheDocument()
  })
})
