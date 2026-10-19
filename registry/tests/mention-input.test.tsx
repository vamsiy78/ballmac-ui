import { act, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { MentionInput, mentionsToMarkup, parseMentionMarkup, shiftMentions, type MentionInputProps, type MentionSource, type MentionValue } from "@/components/ballmac/mention-input"

const people = [
  { id: "u1", label: "Maya Chen", description: "Design" },
  { id: "u2", label: "Jonas Weber", description: "Engineering" },
  { id: "u3", label: "Mateo Silva", description: "Support", disabled: true },
]
const sources: MentionSource[] = [
  { trigger: "@", label: "People", options: people },
  { trigger: "#", label: "Channels", options: [{ id: "c1", label: "launch" }, { id: "c2", label: "design" }] },
]

function Box({ onValueChange, ...props }: Partial<MentionInputProps> & { onValueChange?: (v: MentionValue) => void }) {
  const [value, setValue] = React.useState<MentionValue>({ text: "", mentions: [] })
  return (
    <MentionInput
      aria-label="Message"
      sources={sources}
      value={value}
      onValueChange={(v) => {
        setValue(v)
        onValueChange?.(v)
      }}
      {...props}
    />
  )
}
const field = () => screen.getByRole("combobox", { name: "Message" }) as HTMLTextAreaElement

describe("MentionInput", () => {
  it("is a combobox that is closed until a trigger is typed", async () => {
    const user = userEvent.setup()
    render(<Box />)
    expect(field()).toHaveAttribute("aria-expanded", "false")
    await user.type(field(), "Hi ")
    expect(screen.queryByRole("listbox")).toBeNull()
    await user.type(field(), "@")
    const list = await screen.findByRole("listbox", { name: "People" })
    expect(field()).toHaveAttribute("aria-expanded", "true")
    expect(field()).toHaveAttribute("aria-controls", list.id)
    expect(within(list).getAllByRole("option")).toHaveLength(3)
  })

  it("filters as you type, by name or description", async () => {
    const user = userEvent.setup()
    render(<Box />)
    await user.type(field(), "@ma")
    expect(within(await screen.findByRole("listbox")).getAllByRole("option").map((o) => o.textContent)).toEqual([expect.stringContaining("Maya Chen"), expect.stringContaining("Mateo Silva")])
    await user.type(field(), "ya")
    expect(within(screen.getByRole("listbox")).getAllByRole("option")).toHaveLength(1)
    await user.clear(field())
    await user.type(field(), "@engin")
    expect(within(await screen.findByRole("listbox")).getByRole("option")).toHaveTextContent("Jonas Weber")
  })

  it("inserts the choice with Enter, records the mention and adds a space", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Box onValueChange={onValueChange} />)
    await user.type(field(), "Hi @may")
    await user.keyboard("{Enter}")
    await waitFor(() => expect(field()).toHaveValue("Hi @Maya Chen "))
    expect(onValueChange).toHaveBeenLastCalledWith({ text: "Hi @Maya Chen ", mentions: [{ id: "u1", trigger: "@", label: "Maya Chen", start: 3, end: 13 }] })
    expect(screen.queryByRole("listbox")).toBeNull()
  })

  it("chooses with the arrow keys and skips disabled suggestions", async () => {
    const user = userEvent.setup()
    render(<Box />)
    await user.type(field(), "@")
    await screen.findByRole("listbox")
    const options = screen.getAllByRole("option")
    expect(options[0]).toHaveAttribute("aria-selected", "true")
    expect(field()).toHaveAttribute("aria-activedescendant", options[0]!.id)
    await user.keyboard("{ArrowDown}")
    expect(options[1]).toHaveAttribute("aria-selected", "true")
    await user.keyboard("{ArrowDown}")
    expect(options[0]).toHaveAttribute("aria-selected", "true") // Mateo is disabled, so it wraps
    await user.keyboard("{ArrowUp}")
    expect(options[1]).toHaveAttribute("aria-selected", "true")
    await user.keyboard("{Tab}")
    await waitFor(() => expect(field()).toHaveValue("@Jonas Weber "))
  })

  it("inserts with a click", async () => {
    const user = userEvent.setup()
    render(<Box />)
    await user.type(field(), "#")
    await user.click(await screen.findByRole("option", { name: /launch/ }))
    await waitFor(() => expect(field()).toHaveValue("#launch "))
  })

  it("closes on Escape without inserting, and opens again when you type on", async () => {
    const user = userEvent.setup()
    render(<Box />)
    await user.type(field(), "@m")
    await screen.findByRole("listbox")
    await user.keyboard("{Escape}")
    expect(screen.queryByRole("listbox")).toBeNull()
    expect(field()).toHaveValue("@m")
    await user.type(field(), "a")
    expect(await screen.findByRole("listbox")).toBeInTheDocument()
  })

  it("does not open for a trigger in the middle of a word, such as an email address", async () => {
    const user = userEvent.setup()
    render(<Box />)
    await user.type(field(), "write to me@maya")
    expect(screen.queryByRole("listbox")).toBeNull()
  })

  it("says when nothing matches", async () => {
    const user = userEvent.setup()
    render(<Box />)
    await user.type(field(), "@zzz")
    expect((await screen.findAllByText("No matches for “zzz”")).length).toBeGreaterThan(0)
  })

  it("removes a whole mention with one Backspace", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Box onValueChange={onValueChange} />)
    await user.type(field(), "Hi @may")
    await user.keyboard("{Enter}")
    await waitFor(() => expect(field()).toHaveValue("Hi @Maya Chen "))
    await user.keyboard("{Backspace}") // the space after it
    expect(field()).toHaveValue("Hi @Maya Chen")
    await user.keyboard("{Backspace}")
    expect(field()).toHaveValue("Hi ")
    expect(onValueChange).toHaveBeenLastCalledWith({ text: "Hi ", mentions: [] })
  })

  it("keeps a mention in place when text is typed before it, and drops it when it is edited", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Box onValueChange={onValueChange} />)
    await user.type(field(), "@may")
    await user.keyboard("{Enter}")
    await waitFor(() => expect(field()).toHaveValue("@Maya Chen "))
    field().setSelectionRange(0, 0)
    await user.keyboard("Hey ")
    expect(onValueChange).toHaveBeenLastCalledWith({ text: "Hey @Maya Chen ", mentions: [{ id: "u1", trigger: "@", label: "Maya Chen", start: 4, end: 14 }] })
    field().setSelectionRange(8, 8)
    await user.keyboard("x")
    expect(onValueChange.mock.calls.at(-1)![0].mentions).toEqual([])
  })

  it("highlights mentions in the layer behind the text", async () => {
    const user = userEvent.setup()
    render(<Box />)
    await user.type(field(), "Hi @may")
    await user.keyboard("{Enter}")
    await waitFor(() => expect(document.querySelector("[data-slot=mention-input-layer] mark")).toHaveTextContent("@Maya Chen"))
  })

  it("supports more than one trigger", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Box onValueChange={onValueChange} />)
    await user.type(field(), "@may")
    await user.keyboard("{Enter}")
    await user.type(field(), "in #lau")
    await user.keyboard("{Enter}")
    await waitFor(() => expect(onValueChange.mock.calls.at(-1)![0].mentions.map((m: { trigger: string; label: string }) => m.trigger + m.label)).toEqual(["@Maya Chen", "#launch"]))
  })

  it("searches with a function, shows Searching, and ignores an answer that arrived late", async () => {
    const user = userEvent.setup()
    const calls: string[] = []
    const search = vi.fn((q: string, signal: AbortSignal) => {
      calls.push(q)
      return new Promise<{ id: string; label: string }[]>((resolve) => {
        setTimeout(() => !signal.aborted && resolve([{ id: q, label: `Result for ${q}` }]), q === "a" ? 80 : 20)
      })
    })
    render(<Box sources={[{ trigger: "@", options: search, label: "People" }]} />)
    await user.type(field(), "@a")
    expect((await screen.findAllByText("Searching")).length).toBeGreaterThan(0)
    await user.type(field(), "b")
    expect(await screen.findByRole("option", { name: /Result for ab/ })).toBeInTheDocument()
    await act(async () => new Promise((r) => setTimeout(r, 120)))
    expect(screen.queryByRole("option", { name: /Result for a$/ })).toBeNull()
    expect(calls).toEqual(["", "a", "ab"].filter((c) => calls.includes(c)))
  })

  it("keeps a single line a single line and submits on Enter", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Box singleLine onSubmit={onSubmit} />)
    await user.type(field(), "hello{Enter}there")
    expect(field()).toHaveValue("hellothere")
    expect(onSubmit).toHaveBeenCalledWith({ text: "hello", mentions: [] })
  })

  it("submits a multi-line field with Ctrl+Enter", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Box onSubmit={onSubmit} />)
    await user.type(field(), "line one{Enter}line two")
    expect(field()).toHaveValue("line one\nline two")
    await user.keyboard("{Control>}{Enter}{/Control}")
    expect(onSubmit).toHaveBeenCalledWith({ text: "line one\nline two", mentions: [] })
  })

  it("works uncontrolled, marks invalid and can be disabled", async () => {
    const user = userEvent.setup()
    const { rerender } = render(<MentionInput aria-label="Message" sources={sources} defaultValue={{ text: "Hello", mentions: [] }} invalid />)
    expect(field()).toHaveValue("Hello")
    expect(field()).toHaveAttribute("aria-invalid", "true")
    await user.type(field(), "!")
    expect(field()).toHaveValue("Hello!")
    rerender(<MentionInput aria-label="Message" sources={sources} disabled />)
    expect(field()).toBeDisabled()
  })

  it("announces the suggestions", async () => {
    const user = userEvent.setup()
    render(<Box />)
    await user.type(field(), "@")
    await waitFor(() => expect(document.body).toHaveTextContent("3 suggestions. Maya Chen is highlighted."))
  })
})

describe("mention helpers", () => {
  const value: MentionValue = { text: "Hi @Maya Chen, see #launch.", mentions: [{ id: "u1", trigger: "@", label: "Maya Chen", start: 3, end: 13 }, { id: "c1", trigger: "#", label: "launch", start: 19, end: 26 }] }
  it("writes and reads markup", () => {
    const markup = mentionsToMarkup(value)
    expect(markup).toBe("Hi @[Maya Chen](u1), see #[launch](c1).")
    expect(parseMentionMarkup(markup)).toEqual(value)
  })
  it("reads text with no mentions", () => {
    expect(parseMentionMarkup("just text")).toEqual({ text: "just text", mentions: [] })
  })
  it("moves, keeps and drops mentions as the text changes", () => {
    expect(shiftMentions(value, "Oh " + value.text).map((m) => m.start)).toEqual([6, 22])
    expect(shiftMentions(value, value.text + " more")).toHaveLength(2)
    expect(shiftMentions(value, value.text.replace("Maya", "Mara"))).toHaveLength(1)
    expect(shiftMentions(value, "")).toHaveLength(0)
  })
})
