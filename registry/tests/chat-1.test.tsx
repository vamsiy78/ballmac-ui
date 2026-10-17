import * as React from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Chat1 } from "@/components/ballmac/blocks/chat-1/chat-1"

describe("Chat1", () => {
  it("sends with Enter, shows Sending, then the message", async () => {
    const user = userEvent.setup()
    let done!: () => void
    const onSend = vi.fn(() => new Promise<void>((r) => (done = r)))
    render(<Chat1 onSend={onSend} />)
    await user.type(screen.getByRole("textbox", { name: "Message #launch" }), "Ship it{Enter}")
    expect(onSend).toHaveBeenCalledWith({ channelId: "launch", text: "Ship it", threadId: undefined })
    expect(screen.getByText("Sending…")).toBeInTheDocument()
    done()
    expect(await screen.findByText("Ship it")).toBeInTheDocument()
    expect(screen.queryByText("Sending…")).toBeNull()
  })

  it("marks a failed message Not sent and retries it", async () => {
    const user = userEvent.setup()
    const onSend = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(undefined)
    render(<Chat1 onSend={onSend} />)
    await user.type(screen.getByRole("textbox", { name: "Message #launch" }), "Hello{Enter}")
    expect(await screen.findByRole("alert")).toHaveTextContent("Not sent.")
    await user.click(screen.getByRole("button", { name: "Retry" }))
    expect(onSend).toHaveBeenCalledTimes(2)
    await vi.waitFor(() => expect(screen.queryByText("Not sent.")).toBeNull())
  })

  it("suggests people after @ and inserts the mention", async () => {
    const user = userEvent.setup()
    render(<Chat1 />)
    const box = screen.getByRole("textbox", { name: "Message #launch" })
    await user.type(box, "thanks @Pr")
    expect(screen.getByRole("listbox", { name: "People to mention" })).toBeInTheDocument()
    await user.keyboard("{Tab}")
    expect(box).toHaveValue("thanks @Priya Shah ")
  })

  it("toggles a reaction and opens a thread", async () => {
    const user = userEvent.setup()
    const onReact = vi.fn()
    render(<Chat1 onReact={onReact} />)
    await user.click(screen.getByRole("button", { name: "🎉 3, including you" }))
    expect(onReact).toHaveBeenCalledWith({ channelId: "launch", messageId: "m3", emoji: "🎉", on: false })
    expect(screen.getByRole("button", { name: "🎉 2" })).toHaveAttribute("aria-pressed", "false")
    await user.click(screen.getByRole("button", { name: "2 replies" }))
    const thread = screen.getByRole("complementary", { name: "Thread" })
    expect(within(thread).getByText("Done, it’s under step 4.")).toBeInTheDocument()
  })

  it("switches channels and shows the start of an empty one", async () => {
    const user = userEvent.setup()
    const onChannelChange = vi.fn()
    render(<Chat1 onChannelChange={onChannelChange} />)
    await user.click(screen.getByRole("button", { name: /design/ }))
    expect(onChannelChange).toHaveBeenCalledWith("design")
    expect(screen.getByText("This is the start of #design")).toBeInTheDocument()
  })
})
