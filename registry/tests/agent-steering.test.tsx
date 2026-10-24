import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { AgentSteering, type SteeringNote } from "@/components/ballmac/agent-steering"

const notes: SteeringNote[] = [
  { id: "1", text: "Skip the competitor pages.", mode: "now", state: "applied", at: "2:10 pm" },
  { id: "2", text: "Also check annual pricing.", mode: "after-step", state: "queued", at: "2:12 pm" },
  { id: "3", text: "Write it as a table.", mode: "end", state: "dropped" },
]

describe("AgentSteering", () => {
  it("says what the agent is doing, and when it is not running", () => {
    const { rerender } = render(<AgentSteering notes={[]} step="Reading the pricing page (step 4 of 9)" />)
    expect(screen.getByText("Working on: Reading the pricing page (step 4 of 9)")).toBeInTheDocument()
    rerender(<AgentSteering notes={[]} running={false} />)
    expect(screen.getByText("Not running")).toBeInTheDocument()
    expect(screen.getByRole("textbox", { name: "Instruction for the agent" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled()
  })

  it("lists each instruction with its state and timing in words", () => {
    render(<AgentSteering notes={notes} />)
    const list = screen.getByRole("list", { name: "Instructions sent" })
    const items = within(list).getAllByRole("listitem")
    expect(items[0]).toHaveTextContent("Applied")
    expect(items[0]).toHaveTextContent("Now")
    expect(items[1]).toHaveTextContent("Queued")
    expect(items[1]).toHaveTextContent("After this step")
    expect(items[2]).toHaveTextContent("Dropped")
    expect(items[2]).toHaveTextContent("At the end")
  })

  it("sends the instruction with the chosen timing and clears the box", async () => {
    const user = userEvent.setup()
    const onSend = vi.fn().mockResolvedValue(undefined)
    render(<AgentSteering notes={[]} onSend={onSend} />)
    await user.type(screen.getByRole("textbox"), "Use the 2026 price list")
    await user.click(screen.getByRole("radio", { name: "Now" }))
    await user.click(screen.getByRole("button", { name: "Send" }))
    expect(onSend).toHaveBeenCalledWith("Use the 2026 price list", "now")
    expect(screen.getByRole("textbox")).toHaveValue("")
  })

  it("starts on after this step, and sends with Ctrl and Enter", async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(<AgentSteering notes={[]} onSend={onSend} />)
    expect(screen.getByRole("radio", { name: "After this step" })).toBeChecked()
    await user.type(screen.getByRole("textbox"), "Go on{Control>}{Enter}{/Control}")
    expect(onSend).toHaveBeenCalledWith("Go on", "after-step")
  })

  it("refuses an empty instruction", async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(<AgentSteering notes={[]} onSend={onSend} />)
    await user.click(screen.getByRole("button", { name: "Send" }))
    expect(screen.getByRole("alert")).toHaveTextContent("Write what the agent should change first.")
    expect(onSend).not.toHaveBeenCalled()
  })

  it("keeps the text and says why when sending fails", async () => {
    const user = userEvent.setup()
    render(<AgentSteering notes={[]} onSend={() => Promise.reject(new Error("The run has already finished."))} />)
    await user.type(screen.getByRole("textbox"), "Change course")
    await user.click(screen.getByRole("button", { name: "Send" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("The run has already finished.")
    expect(screen.getByRole("textbox")).toHaveValue("Change course")
  })

  it("lets only a queued instruction be taken back, and says why when that fails", async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn().mockRejectedValueOnce(new Error("It was applied a moment ago.")).mockResolvedValueOnce(undefined)
    render(<AgentSteering notes={notes} onRemove={onRemove} />)
    expect(screen.getAllByRole("button", { name: /^Take back/ })).toHaveLength(1)
    await user.click(screen.getByRole("button", { name: "Take back: Also check annual pricing." }))
    expect(await screen.findByRole("alert")).toHaveTextContent("It was applied a moment ago.")
    await user.click(screen.getByRole("button", { name: "Take back: Also check annual pricing." }))
    expect(onRemove).toHaveBeenLastCalledWith("2")
  })
})
