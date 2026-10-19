import { act, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { Editor } from "@tiptap/core"
import * as React from "react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { cleanUrl, RichTextEditor, type RichTextEditorProps } from "@/components/ballmac/rich-text-editor"

// ProseMirror measures text with ranges; jsdom has no layout, so give it empty answers.
beforeAll(() => {
  const rects = { length: 0, item: () => null, [Symbol.iterator]: () => [][Symbol.iterator]() } as unknown as DOMRectList
  Range.prototype.getBoundingClientRect = () => new DOMRect()
  Range.prototype.getClientRects = () => rects
  Element.prototype.getClientRects = () => rects
})

/** The editor, handed over by a callback ref as soon as Tiptap has made it. */
function Ed({ onReady, ...rest }: Partial<RichTextEditorProps> & { onReady?: (e: Editor) => void }) {
  return <RichTextEditor label="Notes" editorRef={(e) => e && onReady?.(e)} {...rest} />
}

const setup = async (props: Partial<RichTextEditorProps> = {}) => {
  let editor: Editor | undefined
  render(<Ed onReady={(e) => (editor = e)} {...props} />)
  await screen.findByRole("textbox", { name: "Notes" })
  await waitFor(() => expect(editor).toBeTruthy())
  return editor!
}

describe("RichTextEditor", () => {
  it("is a labelled multiline textbox with a formatting toolbar", async () => {
    await setup()
    const box = screen.getByRole("textbox", { name: "Notes" })
    expect(box).toHaveAttribute("aria-multiline", "true")
    expect(box).toHaveAttribute("contenteditable", "true")
    expect(screen.getByRole("toolbar", { name: "Formatting" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Bold" })).toHaveAttribute("aria-pressed", "false")
  })

  it("shows the placeholder", async () => {
    await setup({ placeholder: "Say hello" })
    expect(document.querySelector("[data-placeholder]")).toHaveAttribute("data-placeholder", "Say hello")
  })

  it("applies bold from the toolbar and reports the HTML", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const editor = await setup({ defaultValue: "<p>hello world</p>", onChange })
    act(() => {
      editor.commands.selectAll()
    })
    await user.click(screen.getByRole("button", { name: "Bold" }))
    expect(editor.getHTML()).toContain("<strong>hello world</strong>")
    expect(onChange).toHaveBeenLastCalledWith("<p><strong>hello world</strong></p>", editor)
    await waitFor(() => expect(screen.getByRole("button", { name: "Bold" })).toHaveAttribute("aria-pressed", "true"))
  })

  it("reports an empty editor as an empty string", async () => {
    const onChange = vi.fn()
    const editor = await setup({ defaultValue: "<p>x</p>", onChange })
    act(() => {
      editor.commands.clearContent(true)
    })
    expect(onChange).toHaveBeenLastCalledWith("", editor)
  })

  it("follows a value that changes from outside", async () => {
    let editor: Editor | undefined
    const { rerender } = render(<Ed value="<p>one</p>" onReady={(e) => (editor = e)} />)
    await screen.findByRole("textbox")
    expect(screen.getByText("one")).toBeInTheDocument()
    rerender(<Ed value="<p>two</p>" onReady={(e) => (editor = e)} />)
    await waitFor(() => expect(screen.getByText("two")).toBeInTheDocument())
    expect(editor!.getHTML()).toBe("<p>two</p>")
  })

  it("makes headings, lists and quotes from the toolbar", async () => {
    const user = userEvent.setup()
    const editor = await setup({ defaultValue: "<p>Title</p>" })
    await user.click(screen.getByRole("button", { name: "Heading 2" }))
    expect(editor.getHTML()).toMatch(/^<h2>Title<\/h2>/)
    await user.click(screen.getByRole("button", { name: "Heading 2" }))
    await user.click(screen.getByRole("button", { name: "Bulleted list" }))
    expect(editor.getHTML()).toContain("<ul>")
    await user.click(screen.getByRole("button", { name: "Bulleted list" }))
    await user.click(screen.getByRole("button", { name: "Quote" }))
    expect(editor.getHTML()).toContain("<blockquote>")
  })

  it("has one tab stop in the toolbar and moves along it with the arrow keys", async () => {
    const user = userEvent.setup()
    await setup()
    const tools = within(screen.getByRole("toolbar")).getAllByRole("button")
    expect(tools.filter((b) => b.getAttribute("tabindex") === "0")).toHaveLength(1)
    tools[0]!.focus()
    await user.keyboard("{ArrowRight}")
    expect(tools[1]).toHaveFocus()
    await user.keyboard("{End}")
    expect(document.activeElement).not.toBe(tools[0])
    await user.keyboard("{Home}")
    expect(tools[0]).toHaveFocus()
  })

  it("disables undo until there is something to undo", async () => {
    const user = userEvent.setup()
    const editor = await setup({ defaultValue: "<p>abc</p>" })
    expect(screen.getByRole("button", { name: "Undo" })).toBeDisabled()
    act(() => {
      editor.commands.selectAll()
      editor.commands.toggleItalic()
    })
    await waitFor(() => expect(screen.getByRole("button", { name: "Undo" })).toBeEnabled())
    await user.click(screen.getByRole("button", { name: "Undo" }))
    expect(editor.getHTML()).toBe("<p>abc</p>")
  })

  it("adds a link from the popover, and adds https to a bare domain", async () => {
    const user = userEvent.setup()
    const editor = await setup({ defaultValue: "<p>docs</p>" })
    act(() => {
      editor.commands.selectAll()
    })
    await user.click(screen.getByRole("button", { name: "Link" }))
    const dialog = await screen.findByRole("dialog", { name: "Edit link" })
    await user.type(within(dialog).getByLabelText("Web address"), "example.com")
    await user.click(within(dialog).getByRole("button", { name: "Apply" }))
    expect(editor.getHTML()).toContain('href="https://example.com"')
    expect(editor.getHTML()).toContain('rel="noopener noreferrer nofollow"')
  })

  it("refuses a link that is not a web address", async () => {
    const user = userEvent.setup()
    const editor = await setup({ defaultValue: "<p>docs</p>" })
    act(() => {
      editor.commands.selectAll()
    })
    await user.click(screen.getByRole("button", { name: "Link" }))
    const dialog = await screen.findByRole("dialog")
    await user.type(within(dialog).getByLabelText("Web address"), "javascript:alert(1){Enter}")
    expect(within(dialog).getByRole("alert")).toHaveTextContent("Enter a web address like example.com.")
    expect(editor.getHTML()).not.toContain("javascript")
  })

  it("removes a link", async () => {
    const user = userEvent.setup()
    const editor = await setup({ defaultValue: '<p><a href="https://a.test">docs</a></p>' })
    act(() => {
      editor.commands.setTextSelection(3)
    })
    await user.click(screen.getByRole("button", { name: "Link" }))
    const dialog = await screen.findByRole("dialog")
    expect(within(dialog).getByLabelText("Web address")).toHaveValue("https://a.test")
    await user.click(within(dialog).getByRole("button", { name: "Remove" }))
    expect(editor.getHTML()).toBe("<p>docs</p>")
  })

  it("counts words and characters and holds to the limit", async () => {
    const editor = await setup({ defaultValue: "<p>one two</p>", characterLimit: 12 })
    expect(screen.getByText("2 words")).toBeInTheDocument()
    expect(screen.getByText("7 of 12 characters")).toBeInTheDocument()
    act(() => {
      editor.commands.insertContent(" three four five six")
    })
    expect(editor.storage.characterCount.characters()).toBeLessThanOrEqual(12)
    await waitFor(() => expect(screen.getByText(/of 12 characters/).textContent).toBe(`${editor.storage.characterCount.characters()} of 12 characters`))
  })

  it("only offers the tools it is given", async () => {
    await setup({ features: ["bold", "italic"] })
    const tools = within(screen.getByRole("toolbar")).getAllByRole("button")
    expect(tools.map((b) => b.getAttribute("aria-label"))).toEqual(["Bold", "Italic"])
  })

  it("marks itself invalid and describes why", async () => {
    await setup({ invalid: true, description: "Write something." })
    const box = screen.getByRole("textbox")
    await waitFor(() => expect(box).toHaveAttribute("aria-invalid", "true"))
    expect(box).toHaveAccessibleDescription("Write something.")
  })

  it("can be disabled", async () => {
    await setup({ disabled: true })
    const box = screen.getByRole("textbox")
    await waitFor(() => expect(box).toHaveAttribute("contenteditable", "false"))
    expect(screen.getByRole("button", { name: "Bold" })).toBeDisabled()
    expect(box).toHaveAttribute("aria-disabled", "true")
  })

  it("opens the slash menu, filters it and inserts a block", async () => {
    const editor = await setup({ defaultValue: "<p></p>" })
    act(() => {
      editor.commands.focus("end")
      editor.commands.insertContent("/head")
    })
    const list = await screen.findByRole("listbox", { name: "Blocks" })
    expect(within(list).getAllByRole("option").map((o) => o.textContent)).toEqual([expect.stringContaining("Heading 1"), expect.stringContaining("Heading 2"), expect.stringContaining("Heading 3")])
    expect(within(list).getAllByRole("option")[0]).toHaveAttribute("aria-selected", "true")
    await userEvent.setup().click(within(list).getAllByRole("option")[1]!)
    await waitFor(() => expect(editor.getHTML()).toMatch(/^<h2><\/h2>/))
    expect(screen.queryByRole("listbox")).toBeNull()
  })

  it("shows loading and error states", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const { rerender } = render(<RichTextEditor label="Notes" state="loading" />)
    expect(screen.getByText("Loading the editor")).toBeInTheDocument()
    expect(screen.queryByRole("textbox")).toBeNull()
    rerender(<RichTextEditor label="Notes" state="error" onRetry={onRetry} />)
    await user.click(screen.getByRole("button", { name: /try again/i }))
    expect(onRetry).toHaveBeenCalled()
  })
})

describe("cleanUrl", () => {
  it("adds https to a bare domain and keeps real links", () => {
    expect(cleanUrl("example.com/path")).toBe("https://example.com/path")
    expect(cleanUrl("https://a.test")).toBe("https://a.test")
    expect(cleanUrl("mailto:me@a.test")).toBe("mailto:me@a.test")
    expect(cleanUrl("/docs")).toBe("/docs")
    expect(cleanUrl("#top")).toBe("#top")
    expect(cleanUrl("  example.org ")).toBe("https://example.org")
  })
  it("refuses other schemes and non-addresses", () => {
    expect(cleanUrl("javascript:alert(1)")).toBeNull()
    expect(cleanUrl("data:text/html,x")).toBeNull()
    expect(cleanUrl("not an address")).toBeNull()
    expect(cleanUrl("")).toBeNull()
  })
})
