import * as React from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { Comments1 } from "@/components/ballmac/blocks/comments-1/comments-1"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

const NOW = "2026-10-18T10:00:00Z"
const composer = () => screen.getByRole("combobox", { name: "Write a comment" })

describe("Comments1", () => {
  it("says how long ago each comment was written, from the moment passed in", () => {
    render(<Comments1 now={NOW} />)
    expect(screen.getByText("1 hour ago", { exact: false })).toBeInTheDocument()
    expect(screen.getByText(/18 hours ago/)).toBeInTheDocument()
  })

  it("highlights real mentions and leaves other @ text alone", () => {
    render(<Comments1 comments={[{ id: "x", author: "Noor Haddad", at: NOW, body: "Hi @Priya Shah and @nobody here" }]} now={NOW} />)
    expect(screen.getByText("@Priya Shah")).toHaveClass("font-medium")
    expect(screen.getByText(/and @nobody here/)).toBeInTheDocument()
  })

  it("offers people when @ is typed and picks with the keyboard", async () => {
    const user = userEvent.setup()
    render(<Comments1 comments={[]} now={NOW} />)
    await user.click(composer())
    await user.type(composer(), "Thanks @th")
    const list = screen.getByRole("listbox", { name: "People to mention" })
    expect(within(list).getAllByRole("option")).toHaveLength(1)
    expect(composer()).toHaveAttribute("aria-expanded", "true")
    await user.keyboard("{Enter}")
    expect((composer() as HTMLTextAreaElement).value).toBe("Thanks @Theo Nakamura ")
    expect(screen.queryByRole("listbox")).toBeNull()
  })

  it("closes the people list with Escape and keeps the text", async () => {
    const user = userEvent.setup()
    render(<Comments1 comments={[]} now={NOW} />)
    await user.type(composer(), "hello @pr")
    await user.keyboard("{Escape}")
    expect(screen.queryByRole("listbox")).toBeNull()
    expect((composer() as HTMLTextAreaElement).value).toBe("hello @pr")
  })

  it("posts a comment at the top at once, announces it, and tells the host", async () => {
    const user = userEvent.setup()
    const onPost = vi.fn().mockResolvedValue(undefined)
    render(<Comments1 onPost={onPost} now={NOW} />)
    await user.type(composer(), "Looks good to me")
    await user.click(screen.getByRole("button", { name: "Comment" }))
    expect(onPost).toHaveBeenCalledWith({ body: "Looks good to me", replyTo: undefined })
    expect(screen.getByText("Looks good to me")).toBeInTheDocument()
    expect(composer()).toHaveValue("")
  })

  it("keeps a comment that failed to post with Not posted and Retry", async () => {
    const user = userEvent.setup()
    const onPost = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValue(undefined)
    render(<Comments1 onPost={onPost} now={NOW} />)
    await user.type(composer(), "Second thoughts")
    await user.click(screen.getByRole("button", { name: "Comment" }))
    const alert = await screen.findByRole("alert")
    expect(alert).toHaveTextContent("Not posted.")
    await user.click(within(alert).getByRole("button", { name: "Retry" }))
    await screen.findByText("Second thoughts")
    expect(onPost).toHaveBeenCalledTimes(2)
  })

  it("replies inside a thread", async () => {
    const user = userEvent.setup()
    const onPost = vi.fn().mockResolvedValue(undefined)
    render(<Comments1 onPost={onPost} now={NOW} />)
    const thread = screen.getByRole("article", { name: "Thread by Noor Haddad" })
    await user.click(within(thread).getAllByRole("button", { name: "Reply" })[0]!)
    await user.type(screen.getByRole("combobox", { name: "Reply to Noor Haddad" }), "On it")
    await user.keyboard("{Control>}{Enter}{/Control}")
    expect(onPost).toHaveBeenCalledWith({ body: "On it", replyTo: "c1" })
  })

  it("toggles a reaction for you and says who reacted", async () => {
    const user = userEvent.setup()
    const onReact = vi.fn()
    render(<Comments1 onReact={onReact} now={NOW} />)
    const btn = screen.getByRole("button", { name: /^👍 3: Priya Shah, Sam Okafor, Theo Nakamura/ })
    expect(btn).toHaveAttribute("aria-pressed", "true")
    await user.click(btn)
    expect(onReact).toHaveBeenCalledWith("c1", "👍", false)
    expect(screen.getByRole("button", { name: /^👍 2:/ })).toHaveAttribute("aria-pressed", "false")
  })

  it("adds a new reaction from the picker", async () => {
    const user = userEvent.setup()
    const onReact = vi.fn()
    render(<Comments1 onReact={onReact} now={NOW} />)
    await user.click(screen.getAllByRole("button", { name: "Add a reaction" })[0]!)
    await user.click(screen.getByRole("button", { name: "React with 🙏" }))
    expect(onReact).toHaveBeenCalledWith("c1", "🙏", true)
  })

  it("lets you edit and delete only your own comments", async () => {
    const user = userEvent.setup()
    render(<Comments1 now={NOW} />)
    expect(screen.getAllByRole("button", { name: /^Edit your comment/ })).toHaveLength(1)
    await user.click(screen.getByRole("button", { name: /^Edit your comment/ }))
    const field = screen.getByRole("combobox", { name: "Edit your comment" })
    await user.clear(field)
    await user.type(field, "Support will watch the queue.")
    await user.click(screen.getByRole("button", { name: "Save" }))
    expect(screen.getByText("Support will watch the queue.")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /^Delete your comment/ }))
    expect(screen.queryByText("Support will watch the queue.")).toBeNull()
  })

  it("collapses a resolved thread, shows it, and reopens it", async () => {
    const user = userEvent.setup()
    const onResolve = vi.fn()
    render(<Comments1 onResolve={onResolve} now={NOW} />)
    expect(screen.getByText(/Resolved by Mara Ellison/)).toBeInTheDocument()
    expect(screen.queryByText("Pricing page copy is approved. Closing this thread.")).toBeNull()
    await user.click(screen.getByRole("button", { name: "Show" }))
    expect(screen.getByText("Pricing page copy is approved. Closing this thread.")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Reopen thread" }))
    expect(onResolve).toHaveBeenCalledWith("c3", false)
  })

  it("shows loading, empty and error states", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const { rerender } = render(<Comments1 state="loading" />)
    expect(screen.getByRole("status")).toBeInTheDocument()
    rerender(<Comments1 state="empty" />)
    expect(screen.getByRole("heading", { name: "No comments yet" })).toBeInTheDocument()
    expect(composer()).toBeInTheDocument()
    rerender(<Comments1 state="error" onRetry={onRetry} />)
    await user.click(screen.getByRole("button", { name: /try again/i }))
    expect(onRetry).toHaveBeenCalled()
  })
})
