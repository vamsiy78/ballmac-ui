import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import {
  SpotlightSearch,
  SpotlightSearchDialog,
  SpotlightSearchEmpty,
  SpotlightSearchGroup,
  SpotlightSearchInput,
  SpotlightSearchItem,
  SpotlightSearchList,
} from "@/components/ballmac/spotlight-search"

function Results({ onSelect }: { onSelect: (v: string) => void }) {
  return (
    <>
      <SpotlightSearchInput />
      <SpotlightSearchList>
        <SpotlightSearchEmpty>No results</SpotlightSearchEmpty>
        <SpotlightSearchGroup heading="Applications">
          <SpotlightSearchItem detail="Application" onSelect={() => onSelect("Calendar")}>
            Calendar
          </SpotlightSearchItem>
          <SpotlightSearchItem detail="Application" onSelect={() => onSelect("Terminal")}>
            Terminal
          </SpotlightSearchItem>
        </SpotlightSearchGroup>
        <SpotlightSearchGroup heading="Actions">
          <SpotlightSearchItem detail="⌘N" onSelect={() => onSelect("New Note")}>
            New Note
          </SpotlightSearchItem>
        </SpotlightSearchGroup>
      </SpotlightSearchList>
    </>
  )
}

describe("SpotlightSearch", () => {
  it("exposes a combobox that controls a listbox of options", () => {
    render(
      <SpotlightSearch label="Spotlight">
        <Results onSelect={() => {}} />
      </SpotlightSearch>
    )
    const input = screen.getByRole("combobox")
    expect(input).toHaveAttribute("placeholder", "Spotlight Search")
    expect(input).toHaveAttribute("aria-controls", screen.getByRole("listbox").id)
    expect(screen.getAllByRole("option")).toHaveLength(3)
    expect(screen.getByRole("option", { name: /Calendar/ })).toHaveAttribute("aria-selected", "true")
  })

  it("moves the selection with arrow keys, wraps, and runs onSelect with Enter", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <SpotlightSearch>
        <Results onSelect={onSelect} />
      </SpotlightSearch>
    )
    await user.click(screen.getByRole("combobox"))
    await user.keyboard("{ArrowDown}")
    expect(screen.getByRole("option", { name: /Terminal/ })).toHaveAttribute("aria-selected", "true")
    await user.keyboard("{ArrowDown}{ArrowDown}")
    expect(screen.getByRole("option", { name: /Calendar/ })).toHaveAttribute("aria-selected", "true")
    await user.keyboard("{ArrowUp}{Enter}")
    expect(onSelect).toHaveBeenCalledWith("New Note")
  })

  it("filters by title, not by the detail text, and shows the empty state", async () => {
    const user = userEvent.setup()
    render(
      <SpotlightSearch>
        <Results onSelect={() => {}} />
      </SpotlightSearch>
    )
    await user.type(screen.getByRole("combobox"), "term")
    expect(screen.getAllByRole("option")).toHaveLength(1)
    await user.clear(screen.getByRole("combobox"))
    await user.type(screen.getByRole("combobox"), "application")
    expect(screen.queryAllByRole("option")).toHaveLength(0)
    expect(screen.getByText("No results")).toBeInTheDocument()
  })

  it("opens the dialog with Ctrl+K and closes it with Escape", async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(
      <SpotlightSearchDialog onOpenChange={onOpenChange}>
        <Results onSelect={() => {}} />
      </SpotlightSearchDialog>
    )
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    await user.keyboard("{Control>}k{/Control}")
    const dialog = screen.getByRole("dialog", { name: "Spotlight Search" })
    expect(dialog).toBeInTheDocument()
    expect(onOpenChange).toHaveBeenLastCalledWith(true)
    await user.keyboard("{Escape}")
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it("does not listen for the hotkey when hotkey is false", async () => {
    const user = userEvent.setup()
    render(
      <SpotlightSearchDialog hotkey={false}>
        <Results onSelect={() => {}} />
      </SpotlightSearchDialog>
    )
    await user.keyboard("{Meta>}k{/Meta}")
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })
})
