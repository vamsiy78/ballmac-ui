import * as React from "react"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { Editor1 } from "@/components/ballmac/blocks/editor-1/editor-1"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

const field = () => screen.getByRole("textbox", { name: "Write in Markdown" }) as HTMLTextAreaElement
const preview = () => screen.getByRole("region", { name: "Preview" })

describe("Editor1", () => {
  it("renders Markdown into safe elements as you type", async () => {
    const user = userEvent.setup()
    render(<Editor1 defaultValue="" />)
    await user.click(field())
    await user.paste("# Title\n\nSome **bold** and *soft* and `code`.\n\n- one\n- two\n\n1. first\n2. second\n\n> quoted")
    expect(within(preview()).getByRole("heading", { level: 1, name: "Title" })).toBeInTheDocument()
    expect(within(preview()).getByText("bold").tagName).toBe("STRONG")
    expect(within(preview()).getByText("soft").tagName).toBe("EM")
    expect(within(preview()).getByText("code").tagName).toBe("CODE")
    expect(within(preview()).getAllByRole("listitem")).toHaveLength(4)
    expect(within(preview()).getByText("quoted").closest("blockquote")).not.toBeNull()
  })

  it("lets only safe links through and never makes HTML", async () => {
    const user = userEvent.setup()
    render(<Editor1 defaultValue="" />)
    await user.click(field())
    await user.paste("[ok](https://example.com) [bad](javascript:alert(1)) <script>alert(1)</script>")
    expect(within(preview()).getByRole("link", { name: "ok" })).toHaveAttribute("href", "https://example.com")
    expect(within(preview()).queryByRole("link", { name: "bad" })).toBeNull()
    expect(preview().querySelector("script")).toBeNull()
    expect(within(preview()).getByText(/<script>alert\(1\)<\/script>/)).toBeInTheDocument()
  })

  it("wraps the selection with the toolbar and the shortcuts", async () => {
    const user = userEvent.setup()
    render(<Editor1 defaultValue="hello world" />)
    field().setSelectionRange(0, 5)
    await user.click(screen.getByRole("button", { name: /^Bold/ }))
    expect(field().value).toBe("**hello** world")
    await waitFor(() => expect(field().selectionStart).toBe(2))
    field().setSelectionRange(10, 15)
    field().focus()
    await user.keyboard("{Control>}i{/Control}")
    expect(field().value).toBe("**hello** *world*")
  })

  it("puts a list mark on each selected line", async () => {
    const user = userEvent.setup()
    render(<Editor1 defaultValue={"one\ntwo\nthree"} />)
    field().setSelectionRange(0, 7)
    await user.click(screen.getByRole("button", { name: "Numbered list" }))
    expect(field().value).toBe("1. one\n2. two\nthree")
  })

  it("counts words and reading time", () => {
    render(<Editor1 defaultValue={"one two three"} />)
    expect(screen.getByText("3 words · 1 min read")).toBeInTheDocument()
  })

  it("says Unsaved changes, then Saving, then Saved after the pause", async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue(undefined)
    render(<Editor1 defaultValue="" autosaveMs={20} onSave={onSave} />)
    expect(screen.getByRole("status")).toHaveTextContent("Saved")
    await user.type(field(), "hi")
    expect(screen.getByRole("status")).toHaveTextContent(/Unsaved changes|Saving/)
    await waitFor(() => expect(onSave).toHaveBeenCalledWith("hi"))
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Saved"))
  })

  it("saves right away with Ctrl S", async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue(undefined)
    render(<Editor1 defaultValue="" autosaveMs={60000} onSave={onSave} />)
    await user.type(field(), "x")
    await user.keyboard("{Control>}s{/Control}")
    await waitFor(() => expect(onSave).toHaveBeenCalledWith("x"))
  })

  it("keeps the text and offers Retry when saving fails", async () => {
    const user = userEvent.setup()
    let offline = true
    const onSave = vi.fn(() => (offline ? Promise.reject(new Error("offline")) : Promise.resolve()))
    render(<Editor1 defaultValue="" autosaveMs={10} onSave={onSave} />)
    await user.type(field(), "draft")
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Not saved"))
    offline = false
    expect(screen.getByRole("status")).toHaveTextContent("Your text is still here.")
    expect(field().value).toBe("draft")
    await user.click(screen.getByRole("button", { name: /Retry/ }))
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Saved"))
  })

  it("switches between Write and Preview on a narrow screen", async () => {
    const user = userEvent.setup()
    render(<Editor1 />)
    await user.click(screen.getByRole("tab", { name: "preview" }))
    expect(screen.getByRole("tab", { name: "preview" })).toHaveAttribute("aria-selected", "true")
  })

  it("shows loading and error states", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const { rerender } = render(<Editor1 state="loading" />)
    expect(screen.getByRole("status")).toBeInTheDocument()
    rerender(<Editor1 state="error" onRetry={onRetry} />)
    await user.click(screen.getByRole("button", { name: /try again/i }))
    expect(onRetry).toHaveBeenCalled()
  })
})
