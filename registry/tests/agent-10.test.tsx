import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Agent10 } from "@/components/ballmac/blocks/agent-10/agent-10"

describe("Agent10", () => {
  it("writes who said what, and lists the agent's steps with what they asked and got", async () => {
    const user = userEvent.setup()
    render(<Agent10 />)
    expect(screen.getAllByText(/^You · /)).toHaveLength(2)
    expect(screen.getByText("Agent · 10:02")).toBeInTheDocument()
    const steps = screen.getByRole("list", { name: "Steps the agent took" })
    expect(within(steps).getAllByText("Done")).toHaveLength(2)
    await user.click(within(steps).getByText("check_refund"))
    expect(within(steps).getByText(/Issued 14 Oct, returned by the bank/)).toBeVisible()
  })

  it("shows a failed or running step in words", () => {
    render(<Agent10 messages={[{ id: "a", role: "agent", text: "Trying.", tools: [{ name: "x", input: "i", status: "failed" }, { name: "y", input: "j", status: "running" }] }]} />)
    expect(screen.getByText("Failed")).toBeInTheDocument()
    expect(screen.getByText("Working")).toBeInTheDocument()
  })

  it("refuses an empty message, then sends with Enter and clears the box", async () => {
    const user = userEvent.setup()
    const onSend = vi.fn().mockResolvedValue(undefined)
    render(<Agent10 onSend={onSend} />)
    await user.click(screen.getByRole("button", { name: "Send" }))
    expect(screen.getByRole("alert")).toHaveTextContent("Write a message first.")
    expect(onSend).not.toHaveBeenCalled()
    await user.type(screen.getByLabelText("Message the agent"), "Thanks{Enter}")
    expect(onSend).toHaveBeenCalledWith("Thanks")
    expect(await screen.findByText("Thanks")).toBeInTheDocument()
    expect(screen.getByLabelText("Message the agent")).toHaveValue("")
  })

  it("adds a new line with Shift and Enter instead of sending", async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(<Agent10 onSend={onSend} />)
    await user.type(screen.getByLabelText("Message the agent"), "a{Shift>}{Enter}{/Shift}b")
    expect(onSend).not.toHaveBeenCalled()
    expect(screen.getByLabelText("Message the agent")).toHaveValue("a\nb")
  })

  it("keeps the message and says why when sending fails", async () => {
    const user = userEvent.setup()
    render(<Agent10 onSend={() => Promise.reject(new Error("You are offline."))} />)
    await user.type(screen.getByLabelText("Message the agent"), "Hello")
    await user.click(screen.getByRole("button", { name: "Send" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("You are offline.")
    expect(screen.getByLabelText("Message the agent")).toHaveValue("Hello")
  })

  it("shows Stop while the agent works, and calls onStop", async () => {
    const user = userEvent.setup()
    const onStop = vi.fn()
    render(<Agent10 running onStop={onStop} />)
    expect(screen.getByText("The agent is working…")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Stop" }))
    expect(onStop).toHaveBeenCalled()
  })

  it("lets a person take over and hand back, marking their replies as a person's", async () => {
    const user = userEvent.setup()
    const onHandoff = vi.fn().mockResolvedValue(undefined)
    render(<Agent10 onHandoff={onHandoff} />)
    await user.click(screen.getByRole("button", { name: "Take over" }))
    expect(onHandoff).toHaveBeenCalledWith(true)
    expect(await screen.findByText("A person is handling this. The agent is paused.")).toBeInTheDocument()
    await user.type(screen.getByLabelText("Reply as a person"), "On it{Enter}")
    expect(await screen.findByText("You (a person)")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Hand back to the agent" }))
    expect(onHandoff).toHaveBeenLastCalledWith(false)
  })

  it("shows loading, empty and error states", () => {
    const { rerender } = render(<Agent10 state="loading" />)
    expect(screen.getByRole("status")).toHaveTextContent("Loading the conversation")
    rerender(<Agent10 messages={[]} />)
    expect(screen.getByText("No messages yet")).toBeInTheDocument()
    rerender(<Agent10 state="error" onRetry={() => {}} />)
    expect(screen.getByRole("alert")).toHaveTextContent("The conversation could not be loaded")
  })
})
