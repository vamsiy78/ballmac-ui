import { act, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Sortable, SortableGroup, SortableGroups, SortableHandle, SortableItem, SortableMove, type SortableGroupsValue } from "@/components/ballmac/sortable"

// jsdom has no layout. Give every sortable item a box by its place in the list, so dnd-kit can tell what is over what.
let restore: () => void
beforeEach(() => {
  const original = Element.prototype.getBoundingClientRect
  Element.prototype.getBoundingClientRect = function (this: Element) {
    const el = this as HTMLElement
    const id = el.dataset?.sortableId
    if (id) {
      const siblings = Array.from(el.parentElement!.querySelectorAll<HTMLElement>(":scope > [data-sortable-id]"))
      const index = siblings.indexOf(el)
      const group = el.parentElement!.dataset.col ? Number(el.parentElement!.dataset.col) : 0
      if (el.parentElement!.dataset.orientation === "horizontal") return { x: index * 100, y: 0, left: index * 100, top: 0, width: 80, height: 40, right: index * 100 + 80, bottom: 40, toJSON() {} } as DOMRect
      return { x: group * 300, y: index * 50, left: group * 300, top: index * 50, width: 200, height: 40, right: group * 300 + 200, bottom: index * 50 + 40, toJSON() {} } as DOMRect
    }
    if (el.dataset?.slot === "sortable-group") {
      const col = Number(el.dataset.col ?? 0)
      return { x: col * 300, y: 0, left: col * 300, top: 0, width: 220, height: 400, right: col * 300 + 220, bottom: 400, toJSON() {} } as DOMRect
    }
    return original.call(this)
  }
  restore = () => {
    Element.prototype.getBoundingClientRect = original
  }
})
afterEach(() => restore())

function List({ onValueChange = vi.fn(), initial = ["a", "b", "c"], moves = false }: { onValueChange?: (ids: string[]) => void; initial?: string[]; moves?: boolean }) {
  const [order, setOrder] = React.useState(initial)
  return (
    <Sortable
      label="Songs"
      value={order}
      onValueChange={(ids) => {
        setOrder(ids)
        onValueChange(ids)
      }}
    >
      {order.map((id) => (
        <SortableItem key={id} id={id} label={`Song ${id.toUpperCase()}`}>
          <SortableHandle />
          <span>{id}</span>
          {moves ? (
            <>
              <SortableMove direction="previous" />
              <SortableMove direction="next" />
            </>
          ) : null}
        </SortableItem>
      ))}
    </Sortable>
  )
}

const status = () => document.querySelector("[data-slot=sortable-status]")!
const tick = () => act(() => new Promise<void>((r) => setTimeout(r, 60)))
const text = () => screen.getAllByRole("listitem").map((li) => li.textContent)

describe("Sortable", () => {
  it("is a named list of items with a handle each", () => {
    render(<List />)
    expect(screen.getByRole("list", { name: "Songs" })).toBeInTheDocument()
    expect(screen.getAllByRole("listitem")).toHaveLength(3)
    expect(screen.getByRole("button", { name: "Reorder Song A" })).toBeInTheDocument()
  })

  it("gives the handle the instructions screen readers need", () => {
    render(<List />)
    const handle = screen.getByRole("button", { name: "Reorder Song A" })
    expect(handle).toHaveAttribute("aria-roledescription", "sortable")
    const described = handle.getAttribute("aria-describedby")!
    expect(document.getElementById(described)).toHaveTextContent("To pick up an item, press Space or Enter.")
  })

  it("picks up with Space, moves with the arrow keys, drops with Space and says what happened", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<List onValueChange={onValueChange} />)
    screen.getByRole("button", { name: "Reorder Song A" }).focus()
    await user.keyboard(" ")
    await tick()
    await waitFor(() => expect(document.body).toHaveTextContent(/Song A is over position 1 of 3/))
    await user.keyboard("{ArrowDown}")
    await waitFor(() => expect(document.body).toHaveTextContent(/Song A is over position 2 of 3/))
    await user.keyboard(" ")
    await waitFor(() => expect(onValueChange).toHaveBeenCalledWith(["b", "a", "c"]))
    expect(text()[0]).toContain("b")
    await waitFor(() => expect(document.body).toHaveTextContent(/Dropped Song A at position 2 of 3/))
  })

  it("puts the item back on Escape", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<List onValueChange={onValueChange} />)
    screen.getByRole("button", { name: "Reorder Song B" }).focus()
    await user.keyboard(" ")
    await tick()
    await user.keyboard("{ArrowDown}")
    await tick()
    await user.keyboard("{Escape}")
    expect(onValueChange).not.toHaveBeenCalled()
    expect(text()[1]).toContain("b")
    await waitFor(() => expect(document.body).toHaveTextContent(/Cancelled\. Song B went back to position 2/))
  })

  it("moves an item with the buttons, announces it, and keeps focus on the button", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<List onValueChange={onValueChange} moves />)
    const later = within(screen.getAllByRole("listitem")[0]!).getByRole("button", { name: "Move Song A later" })
    await user.click(later)
    expect(onValueChange).toHaveBeenCalledWith(["b", "a", "c"])
    expect(status()).toHaveTextContent("Moved Song A to position 2 of 3.")
    expect(screen.getByRole("button", { name: "Move Song A later" })).toHaveFocus()
  })

  it("disables a move button at the end of the list", () => {
    render(<List moves />)
    const items = screen.getAllByRole("listitem")
    expect(within(items[0]!).getByRole("button", { name: "Move Song A earlier" })).toBeDisabled()
    expect(within(items[2]!).getByRole("button", { name: "Move Song C later" })).toBeDisabled()
    expect(within(items[1]!).getByRole("button", { name: "Move Song B later" })).toBeEnabled()
  })

  it("can disable dragging", () => {
    render(
      <Sortable label="Fixed" value={["a"]} onValueChange={() => undefined} disabled>
        <SortableItem id="a" label="A">
          <SortableHandle />
        </SortableItem>
      </Sortable>
    )
    expect(screen.getByRole("button", { name: "Reorder A" })).toBeDisabled()
  })

  it("lets a whole item be the handle", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <Sortable label="Chips" value={["a", "b"]} onValueChange={onValueChange} orientation="horizontal">
        {["a", "b"].map((id) => (
          <SortableItem key={id} id={id} dragEverywhere label={`Chip ${id}`}>
            {id}
          </SortableItem>
        ))}
      </Sortable>
    )
    const chip = screen.getAllByRole("listitem")[0]!
    expect(chip).toHaveAttribute("tabindex", "0")
    chip.focus()
    await user.keyboard(" ")
    await tick()
    await user.keyboard("{ArrowRight}")
    await tick()
    await user.keyboard(" ")
    await waitFor(() => expect(onValueChange).toHaveBeenCalledWith(["b", "a"], expect.objectContaining({ activeId: "a", from: 0, to: 1 })))
  })
})

describe("SortableGroups", () => {
  function Board({ onValueChange = vi.fn() }: { onValueChange?: (g: SortableGroupsValue) => void }) {
    const [groups, setGroups] = React.useState<SortableGroupsValue>({ todo: ["a", "b"], done: ["c"] })
    return (
      <SortableGroups
        label="Board"
        value={groups}
        onValueChange={(g) => {
          setGroups(g)
          onValueChange(g)
        }}
        getGroupLabel={(g) => (g === "todo" ? "To do" : "Done")}
      >
        {Object.keys(groups).map((g, i) => (
          <SortableGroup key={g} id={g} data-col={i}>
            {groups[g]!.map((id) => (
              <SortableItem key={id} id={id} label={`Card ${id.toUpperCase()}`}>
                <SortableHandle />
                <SortableMove direction="next" />
                {id}
              </SortableItem>
            ))}
          </SortableGroup>
        ))}
      </SortableGroups>
    )
  }

  it("is a group of named lists", () => {
    render(<Board />)
    expect(screen.getByRole("group", { name: "Board" })).toBeInTheDocument()
    expect(screen.getByRole("list", { name: "To do" })).toBeInTheDocument()
    expect(screen.getByRole("list", { name: "Done" })).toBeInTheDocument()
    expect(within(screen.getByRole("list", { name: "To do" })).getAllByRole("listitem")).toHaveLength(2)
  })

  it("moves an item within its list with the buttons", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Board onValueChange={onValueChange} />)
    await user.click(screen.getByRole("button", { name: "Move Card A later" }))
    expect(onValueChange).toHaveBeenCalledWith({ todo: ["b", "a"], done: ["c"] })
    expect(status()).toHaveTextContent("Moved Card A to position 2 of 2 in To do.")
  })

  it("announces the group when an item is picked up", async () => {
    const user = userEvent.setup()
    render(<Board />)
    screen.getByRole("button", { name: "Reorder Card A" }).focus()
    await user.keyboard(" ")
    await tick()
    await waitFor(() => expect(document.body).toHaveTextContent(/Card A is over To do, position 1 of 2/))
    await act(async () => {
      await user.keyboard("{Escape}")
    })
  })
})
