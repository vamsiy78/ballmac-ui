import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { WritingAssistant, segmentText, type WritingSuggestion } from "@/components/ballmac/writing-assistant"

const text = "We was thinking that it is very important to basically ship the thing on Friday."
const suggestions: WritingSuggestion[] = [
  { id: "g", find: "We was", replace: "We were", reason: "Subject and verb do not agree.", kind: "grammar" },
  { id: "c", find: "it is very important to basically ship", replace: "we must ship", reason: "Shorter and more direct.", kind: "clarity" },
  { id: "x", find: "not in the text", replace: "ignored", reason: "Its words are not there." },
]

describe("segmentText", () => {
  it("splits the text at each suggestion in order and leaves out ones that are not found", () => {
    const { segments, applied } = segmentText(text, suggestions)
    expect(applied.map((s) => s.id)).toEqual(["g", "c"])
    expect(segments.map((s) => s.text).join("")).toBe(text)
    expect(segments.filter((s) => s.suggestion)).toHaveLength(2)
  })
  it("drops a suggestion that overlaps an earlier one", () => {
    const { applied } = segmentText("abcdef", [{ id: "1", find: "abcd", replace: "x", reason: "r" }, { id: "2", find: "cdef", replace: "y", reason: "r" }])
    expect(applied.map((s) => s.id)).toEqual(["1"])
  })
})

describe("WritingAssistant", () => {
  it("marks each suggestion in the text as a button naming its kind, and lists them with a count", () => {
    render(<WritingAssistant defaultText={text} suggestions={suggestions} />)
    expect(screen.getByRole("button", { name: "Suggestion, grammar: We was" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Suggestion, clarity: it is very important/ })).toBeInTheDocument()
    expect(screen.getByText("Suggestions").parentElement).toHaveTextContent("2")
  })

  it("writes each change as words for assistive technology: what to remove and what to use", () => {
    render(<WritingAssistant defaultText={text} suggestions={suggestions} />)
    const card = screen.getByRole("button", { name: "Accept: We were" }).closest("li")!
    expect(card).toHaveTextContent("Remove: We was")
    expect(card).toHaveTextContent("Use instead: We were")
  })

  it("accepts a suggestion, changes the text, removes it from the list and says so", async () => {
    const user = userEvent.setup()
    const onTextChange = vi.fn()
    const onAccept = vi.fn()
    render(<WritingAssistant defaultText={text} suggestions={suggestions} onTextChange={onTextChange} onAccept={onAccept} />)
    await user.click(screen.getByRole("button", { name: "Accept: We were" }))
    expect(onTextChange).toHaveBeenCalledWith(text.replace("We was", "We were"))
    expect(onAccept).toHaveBeenCalledWith(expect.objectContaining({ id: "g" }))
    expect(screen.queryByRole("button", { name: "Accept: We were" })).not.toBeInTheDocument()
    expect(await screen.findByText("Accepted: We were")).toBeInTheDocument()
  })

  it("dismisses a suggestion without changing the text", async () => {
    const user = userEvent.setup()
    const onTextChange = vi.fn()
    render(<WritingAssistant defaultText={text} suggestions={suggestions} onTextChange={onTextChange} />)
    await user.click(screen.getByRole("button", { name: "Dismiss: We was" }))
    expect(onTextChange).not.toHaveBeenCalled()
    expect(screen.queryByRole("button", { name: "Suggestion, grammar: We was" })).not.toBeInTheDocument()
  })

  it("accepts all of them at once without the edits disturbing each other", async () => {
    const user = userEvent.setup()
    const onTextChange = vi.fn()
    render(<WritingAssistant defaultText={text} suggestions={suggestions} onTextChange={onTextChange} />)
    await user.click(screen.getByRole("button", { name: "Accept all" }))
    expect(onTextChange).toHaveBeenCalledWith("We were thinking that we must ship the thing on Friday.")
    expect(screen.getByText("No suggestions. This reads well.")).toBeInTheDocument()
  })

  it("lets you edit the text, and a suggestion whose words are gone drops away", async () => {
    const user = userEvent.setup()
    render(<WritingAssistant defaultText={text} suggestions={suggestions} />)
    await user.click(screen.getByRole("button", { name: "Edit the text" }))
    expect(screen.getByText("Suggestions come back when you finish editing.")).toBeInTheDocument()
    const box = screen.getByRole("textbox", { name: "Your draft" })
    await user.clear(box)
    await user.type(box, "We were thinking ahead.")
    await user.click(screen.getByRole("button", { name: "Done editing" }))
    expect(screen.getByText("No suggestions. This reads well.")).toBeInTheDocument()
  })

  it("selects the suggestion from the text and expands its reason", async () => {
    const user = userEvent.setup()
    render(<WritingAssistant defaultText={text} suggestions={suggestions} />)
    await user.click(screen.getByRole("button", { name: /Suggestion, clarity/ }))
    expect(screen.getByRole("button", { name: /Suggestion, clarity/ })).toHaveAttribute("aria-pressed", "true")
    expect(within(screen.getByRole("list")).getAllByText("Shorter and more direct.").length).toBeGreaterThan(0)
  })
})
