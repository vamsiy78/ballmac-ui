import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { EmojiPicker, type EmojiData } from "@/components/ballmac/emoji-picker"

const wave = { emoji: "👋", label: "waving hand", hexcode: "1F44B", tags: ["hello", "hi", "bye"], skins: [1, 2, 3, 4, 5].map((n) => ({ emoji: `👋${n}`, label: `waving hand: tone ${n}`, hexcode: `1F44B-${n}` })) }
const smile = (n: number) => ({ emoji: `😀${n}`, label: `grin ${n}`, hexcode: `S${n}`, tags: ["happy"] })
const data: EmojiData = {
  groups: [
    { key: "smileys-emotion", label: "Smileys & Emotion", emojis: Array.from({ length: 10 }, (_, i) => smile(i)) },
    { key: "people-body", label: "People & Body", emojis: [wave, { emoji: "👍", label: "thumbs up", hexcode: "1F44D", tags: ["yes", "like"] }] },
    { key: "flags", label: "Flags", emojis: [{ emoji: "🏁", label: "chequered flag", hexcode: "1F3C1", tags: ["race"] }] },
  ],
}
const load = () => Promise.resolve(data)

beforeEach(() => localStorage.clear())

const open = async (props: Partial<React.ComponentProps<typeof EmojiPicker>> = {}) => {
  const onSelect = vi.fn()
  render(<EmojiPicker onSelect={onSelect} loadEmojis={load} columns={4} {...props} />)
  await screen.findByRole("button", { name: "grin 0" })
  return onSelect
}

describe("EmojiPicker", () => {
  it("is a named group with a search box, group buttons and a grid per group", async () => {
    await open()
    expect(screen.getByRole("group", { name: "Emoji picker" })).toBeInTheDocument()
    expect(screen.getByRole("searchbox", { name: "Search emoji" })).toBeEnabled()
    expect(screen.getByRole("toolbar", { name: "Emoji groups" })).toBeInTheDocument()
    expect(screen.getByRole("grid", { name: "Smileys & Emotion" })).toHaveAttribute("aria-rowcount", "3")
    expect(screen.getByRole("grid", { name: "Flags" })).toBeInTheDocument()
  })

  it("loads English emoji from the data package by default", async () => {
    render(<EmojiPicker onSelect={vi.fn()} />)
    expect(await screen.findByRole("button", { name: "grinning face" }, { timeout: 4000 })).toBeInTheDocument()
    expect(screen.getAllByRole("grid").length).toBeGreaterThan(7)
    expect(screen.getByRole("grid", { name: "Flags" })).toBeInTheDocument()
  })

  it("shows loading, then offers a retry when loading fails", async () => {
    const user = userEvent.setup()
    const loader = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValue(data)
    render(<EmojiPicker onSelect={vi.fn()} loadEmojis={loader} columns={4} />)
    expect(screen.getByText("Loading emoji")).toBeInTheDocument()
    expect(screen.getByRole("searchbox")).toBeDisabled()
    await user.click(await screen.findByRole("button", { name: /try again/i }))
    expect(await screen.findByRole("button", { name: "grin 0" })).toBeInTheDocument()
    expect(loader).toHaveBeenCalledTimes(2)
  })

  it("picks an emoji with a click and says which", async () => {
    const user = userEvent.setup()
    const onSelect = await open()
    await user.click(screen.getByRole("button", { name: "thumbs up" }))
    expect(onSelect).toHaveBeenCalledWith({ emoji: "👍", label: "thumbs up", hexcode: "1F44D", skinTone: 0 })
    expect(document.body).toHaveTextContent("Selected thumbs up")
  })

  it("searches by name and by word, and says when nothing matches", async () => {
    const user = userEvent.setup()
    await open()
    await user.type(screen.getByRole("searchbox"), "hello")
    expect(screen.getByRole("grid", { name: "Search results" })).toBeInTheDocument()
    expect(within(screen.getByRole("grid")).getAllByRole("button")).toHaveLength(1)
    expect(screen.getByRole("button", { name: "waving hand" })).toBeInTheDocument()
    expect(screen.queryByRole("toolbar")).toBeNull()
    await user.clear(screen.getByRole("searchbox"))
    await user.type(screen.getByRole("searchbox"), "zzzz")
    expect(screen.getByText("No emoji found for “zzzz”")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Clear search" }))
    expect(screen.getByRole("button", { name: "grin 0" })).toBeInTheDocument()
  })

  it("has one tab stop in the grid and moves with the arrow keys", async () => {
    const user = userEvent.setup()
    await open()
    expect(document.querySelectorAll('[data-s][data-i][tabindex="0"]')).toHaveLength(1)
    screen.getByRole("button", { name: "grin 0" }).focus()
    await user.keyboard("{ArrowRight}")
    expect(screen.getByRole("button", { name: "grin 1" })).toHaveFocus()
    await user.keyboard("{ArrowDown}")
    expect(screen.getByRole("button", { name: "grin 5" })).toHaveFocus()
    await user.keyboard("{ArrowUp}{ArrowLeft}")
    expect(screen.getByRole("button", { name: "grin 0" })).toHaveFocus()
    await user.keyboard("{End}")
    expect(screen.getByRole("button", { name: "grin 3" })).toHaveFocus()
    await user.keyboard("{Home}")
    expect(screen.getByRole("button", { name: "grin 0" })).toHaveFocus()
  })

  it("carries on into the next group, and back", async () => {
    const user = userEvent.setup()
    await open()
    screen.getByRole("button", { name: "grin 9" }).focus()
    await user.keyboard("{ArrowRight}")
    expect(screen.getByRole("button", { name: "waving hand" })).toHaveFocus()
    await user.keyboard("{ArrowLeft}")
    expect(screen.getByRole("button", { name: "grin 9" })).toHaveFocus()
    await user.keyboard("{ArrowDown}")
    expect(screen.getByRole("button", { name: "thumbs up" })).toHaveFocus() // the next group, in the same column when it can
    await user.keyboard("{Control>}{End}{/Control}")
    expect(screen.getByRole("button", { name: "chequered flag" })).toHaveFocus()
    await user.keyboard("{Control>}{Home}{/Control}")
    expect(screen.getByRole("button", { name: "grin 0" })).toHaveFocus()
  })

  it("swaps the left and right arrows in right-to-left", async () => {
    const user = userEvent.setup()
    document.documentElement.dir = "rtl"
    try {
      await open()
      screen.getByRole("button", { name: "grin 0" }).focus()
      await user.keyboard("{ArrowLeft}")
      expect(screen.getByRole("button", { name: "grin 1" })).toHaveFocus()
    } finally {
      document.documentElement.dir = ""
    }
  })

  it("moves from the search box into the grid with Arrow Down", async () => {
    const user = userEvent.setup()
    await open()
    screen.getByRole("searchbox").focus()
    await user.keyboard("{ArrowDown}")
    expect(screen.getByRole("button", { name: "grin 0" })).toHaveFocus()
  })

  it("applies a skin tone to the emoji that have one, and remembers it", async () => {
    const user = userEvent.setup()
    const onSelect = await open()
    await user.click(screen.getByRole("button", { name: "Skin tone 3" }))
    expect(screen.getByRole("button", { name: "Skin tone 3" })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("button", { name: "waving hand: tone 3" })).toHaveTextContent("👋3")
    expect(screen.getByRole("button", { name: "thumbs up" })).toHaveTextContent("👍")
    await user.click(screen.getByRole("button", { name: "waving hand: tone 3" }))
    expect(onSelect).toHaveBeenCalledWith({ emoji: "👋3", label: "waving hand: tone 3", hexcode: "1F44B", skinTone: 3 })
    expect(localStorage.getItem("ballmac-emoji-recent-tone")).toBe("3")
  })

  it("keeps recent emoji first, newest first, and without repeats", async () => {
    const user = userEvent.setup()
    await open()
    await user.click(screen.getByRole("button", { name: "grin 2" }))
    await user.click(screen.getByRole("button", { name: "thumbs up" }))
    await user.click(screen.getAllByRole("button", { name: "grin 2" })[0]!)
    const recent = screen.getByRole("grid", { name: "Recently used" })
    expect(within(recent).getAllByRole("button").map((b) => b.getAttribute("aria-label"))).toEqual(["grin 2", "thumbs up"])
    expect(JSON.parse(localStorage.getItem("ballmac-emoji-recent")!)).toEqual([{ hexcode: "S2" }, { hexcode: "1F44D" }])
  })

  it("restores recent emoji after a reload, and can turn them off", async () => {
    localStorage.setItem("ballmac-emoji-recent", JSON.stringify([{ hexcode: "1F3C1" }]))
    const { unmount } = render(<EmojiPicker onSelect={vi.fn()} loadEmojis={load} columns={4} />)
    expect(await screen.findByRole("grid", { name: "Recently used" })).toBeInTheDocument()
    unmount()
    render(<EmojiPicker onSelect={vi.fn()} loadEmojis={load} columns={4} recent={false} />)
    await screen.findByRole("button", { name: "grin 0" })
    expect(screen.queryByRole("grid", { name: "Recently used" })).toBeNull()
  })

  it("lets you hold the skin tone yourself", async () => {
    const user = userEvent.setup()
    const onSkinToneChange = vi.fn()
    await open({ skinTone: 2, onSkinToneChange })
    expect(screen.getByRole("button", { name: "waving hand: tone 2" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Skin tone 5" }))
    expect(onSkinToneChange).toHaveBeenCalledWith(5)
    expect(screen.getByRole("button", { name: "waving hand: tone 2" })).toBeInTheDocument()
  })

  it("jumps to a group from the group buttons", async () => {
    const user = userEvent.setup()
    await open()
    const scrollTo = vi.fn()
    Element.prototype.scrollTo = scrollTo
    await user.click(screen.getByRole("button", { name: "Flags" }))
    expect(scrollTo).toHaveBeenCalled()
  })

  it("shows the emoji under the pointer or focus in the preview", async () => {
    const user = userEvent.setup()
    await open()
    expect(screen.getByText("Pick an emoji")).toBeInTheDocument()
    await user.hover(screen.getByRole("button", { name: "thumbs up" }))
    expect(screen.queryByText("Pick an emoji")).toBeNull()
    expect(screen.getAllByText("thumbs up").length).toBeGreaterThan(0)
    await user.unhover(screen.getByRole("button", { name: "thumbs up" }))
    expect(screen.getByText("Pick an emoji")).toBeInTheDocument()
  })
})
