import * as React from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { Agent6, type Agent6Memory } from "@/components/ballmac/blocks/agent-6/agent-6"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

const memories: Agent6Memory[] = [
  { id: "a", scope: "you", text: "Lives in Lisbon.", uses: 3 },
  { id: "b", scope: "work", text: "Uses pnpm and Vitest.", uses: 5 },
  { id: "c", scope: "preferences", text: "Prefers short answers.", uses: 9, pinned: true },
]

describe("Agent6", () => {
  it("groups memories by kind and lists pinned ones first", () => {
    render(<Agent6 memories={memories} />)
    expect(screen.getByRole("region", { name: /About you/ })).toBeInTheDocument()
    expect(screen.getByRole("region", { name: /Your work/ })).toBeInTheDocument()
    expect(screen.getByRole("region", { name: /How you like answers/ })).toBeInTheDocument()
    expect(screen.getByLabelText("Pinned")).toBeInTheDocument()
  })

  it("edits a memory in place with Ctrl+Enter", async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn().mockResolvedValue(undefined)
    render(<Agent6 memories={memories} onEdit={onEdit} />)
    const card = screen.getByRole("article", { name: "Lives in Lisbon." })
    await user.click(within(card).getByRole("button", { name: "Edit this memory" }))
    const box = screen.getByRole("textbox", { name: "Edit this memory" })
    await user.clear(box)
    await user.type(box, "Lives in Porto.")
    await user.keyboard("{Control>}{Enter}{/Control}")
    expect(onEdit).toHaveBeenCalledWith("a", "Lives in Porto.")
    expect(await screen.findByText("Lives in Porto.")).toBeInTheDocument()
  })

  it("keeps the old text and shows the error when saving fails", async () => {
    const user = userEvent.setup()
    render(<Agent6 memories={memories} onEdit={() => Promise.reject(new Error("The server said no."))} />)
    await user.click(within(screen.getByRole("article", { name: "Lives in Lisbon." })).getByRole("button", { name: "Edit this memory" }))
    await user.type(screen.getByRole("textbox", { name: "Edit this memory" }), " Often.")
    await user.click(screen.getByRole("button", { name: "Save" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("The server said no.")
    await user.click(screen.getByRole("button", { name: "Cancel" }))
    expect(screen.getByText("Lives in Lisbon.")).toBeInTheDocument()
  })

  it("forgets a memory, offers Undo, and puts it back in place", async () => {
    const user = userEvent.setup()
    const onForget = vi.fn()
    const onRestore = vi.fn()
    render(<Agent6 memories={memories} onForget={onForget} onRestore={onRestore} />)
    await user.click(within(screen.getByRole("article", { name: "Uses pnpm and Vitest." })).getByRole("button", { name: "Forget this memory" }))
    expect(onForget).toHaveBeenCalledWith("b")
    expect(screen.queryByRole("article", { name: "Uses pnpm and Vitest." })).toBeNull()
    await user.click(screen.getByRole("button", { name: "Undo" }))
    expect(onRestore).toHaveBeenCalledWith(expect.objectContaining({ id: "b" }))
    expect(screen.getByRole("article", { name: "Uses pnpm and Vitest." })).toBeInTheDocument()
  })

  it("pauses memory and shows what that means", async () => {
    const user = userEvent.setup()
    const onPausedChange = vi.fn()
    render(<Agent6 memories={memories} assistantName="Sage" onPausedChange={onPausedChange} />)
    await user.click(screen.getByRole("switch"))
    expect(onPausedChange).toHaveBeenCalledWith(true)
    expect(screen.getByText("Memory is paused")).toBeInTheDocument()
    expect(screen.getByRole("note")).toHaveTextContent("Sage is not using it")
  })

  it("forgets everything only after confirming", async () => {
    const user = userEvent.setup()
    const onForgetAll = vi.fn()
    render(<Agent6 memories={memories} onForgetAll={onForgetAll} />)
    await user.click(screen.getByRole("button", { name: /Forget everything/ }))
    expect(onForgetAll).not.toHaveBeenCalled()
    await user.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Forget everything" }))
    expect(onForgetAll).toHaveBeenCalled()
    expect(await screen.findByText("Nothing remembered yet")).toBeInTheDocument()
  })

  it("filters by kind and by search", async () => {
    const user = userEvent.setup()
    render(<Agent6 memories={memories} />)
    await user.click(screen.getByRole("radio", { name: "Work" }))
    expect(screen.queryByText("Lives in Lisbon.")).toBeNull()
    await user.click(screen.getByRole("radio", { name: "All" }))
    await user.type(screen.getByRole("searchbox", { name: "Search memories" }), "short")
    expect(screen.getByText("Prefers short answers.")).toBeInTheDocument()
    expect(screen.queryByText("Lives in Lisbon.")).toBeNull()
  })
})
