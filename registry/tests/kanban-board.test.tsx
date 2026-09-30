import * as React from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { KanbanBoard } from "@/components/ballmac/kanban-board"

const columns = [
  { id: "todo", title: "To do", cards: [{ id: "a", title: "Design" }] },
  { id: "done", title: "Done", cards: [] },
]

describe("KanbanBoard", () => {
  it("moves cards with the visible button and keyboard", async () => {
    const user = userEvent.setup()
    render(<KanbanBoard defaultColumns={columns} />)
    await user.click(
      screen.getByRole("button", { name: "Move Design to next column" }),
    )
    expect(
      within(screen.getByRole("region", { name: "Task board" })).getByText(
        "Done",
      ),
    ).toBeInTheDocument()
    const card = screen.getByRole("article", { name: /Design, Done/ })
    card.focus()
    await user.keyboard("{Alt>}{ArrowLeft}{/Alt}")
    expect(
      screen.getByRole("article", { name: /Design, To do/ }),
    ).toBeInTheDocument()
  })

  it("reports a controlled move while preserving its input", async () => {
    const user = userEvent.setup()
    const onColumnsChange = vi.fn()
    render(<KanbanBoard columns={columns} onColumnsChange={onColumnsChange} />)
    await user.click(
      screen.getByRole("button", { name: "Move Design to next column" }),
    )
    expect(onColumnsChange.mock.calls[0][0][1].cards[0].id).toBe("a")
    expect(
      screen.getByRole("article", { name: /Design, To do/ }),
    ).toBeInTheDocument()
  })
})
