import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { AiChat1 } from "@/components/ballmac/blocks/ai-chat-1/ai-chat-1"
import { AiChat2 } from "@/components/ballmac/blocks/ai-chat-2/ai-chat-2"

describe.each([
  { name: "AiChat1", Chat: AiChat1 as React.ComponentType<Record<string, unknown>>, welcome: /start a conversation/i },
  { name: "AiChat2", Chat: AiChat2 as React.ComponentType<Record<string, unknown>>, welcome: /what shall we build/i },
])("$name states", ({ Chat, welcome }) => {
  it("loading: a skeleton thread, announced and busy, with the prompt disabled and the conversation list kept", () => {
    const { container } = render(<Chat state="loading" />)
    expect(container.firstElementChild).toHaveAttribute("data-state", "loading")
    expect(container.querySelector("[aria-busy=true]")).toBeTruthy()
    expect(screen.getByRole("status")).toHaveTextContent(/loading the conversation/i)
    expect(container.querySelectorAll("[data-slot=skeleton]").length).toBeGreaterThan(5)
    expect(screen.getByRole("textbox")).toBeDisabled()
    expect(screen.getByRole("navigation", { name: /conversations/i })).toBeInTheDocument()
    expect(container.querySelector("[data-slot=chat-error]")).toBeNull()
  })

  it("empty: a welcome in the thread, with your copy and action, and no old messages", () => {
    const { container } = render(<Chat state="empty" emptyState={{ title: "Nothing yet", description: "Say hello.", action: <button>Try a prompt</button> }} />)
    expect(screen.getByText("Nothing yet")).toBeInTheDocument()
    expect(screen.getByText("Say hello.")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Try a prompt" })).toBeInTheDocument()
    expect(container.querySelector("[data-slot=chat-loading]")).toBeNull()
    expect(screen.getByRole("textbox")).not.toBeDisabled()
  })

  it("empty with default copy", () => {
    render(<Chat state="empty" />)
    expect(screen.getByText(welcome)).toBeInTheDocument()
  })

  it("error: the messages stay and a failed-reply row offers Try again", async () => {
    const onRetry = vi.fn()
    render(<Chat state="error" onRetry={onRetry} errorState={{ title: "Reply failed", description: "The model timed out." }} />)
    expect(screen.getByRole("alert")).toHaveTextContent("Reply failed")
    expect(screen.getByRole("alert")).toHaveTextContent("The model timed out.")
    expect(screen.getAllByRole("button", { name: /copy/i }).length).toBeGreaterThan(0) // the earlier messages are still there
    await userEvent.click(screen.getByRole("button", { name: /try again/i }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it("error without onRetry draws no retry button", () => {
    render(<Chat state="error" />)
    expect(screen.queryByRole("button", { name: /try again/i })).toBeNull()
  })

  it("is the normal chat when ready or when state is left out", () => {
    const { container, rerender } = render(<Chat />)
    expect(container.firstElementChild).not.toHaveAttribute("data-state")
    expect(container.querySelector("[data-slot=chat-error], [data-slot=chat-loading], [data-slot=chat-empty]")).toBeNull()
    rerender(<Chat state="ready" />)
    expect(container.firstElementChild).not.toHaveAttribute("data-state")
    expect(screen.getByRole("textbox")).not.toBeDisabled()
  })
})
