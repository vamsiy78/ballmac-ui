import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Agent11 } from "@/components/ballmac/blocks/agent-11/agent-11"

describe("Agent11", () => {
  it("shows the task, the model and that it is running", () => {
    render(<Agent11 />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Fix the refund for order A-9914")
    const head = document.querySelector("header") as HTMLElement
    expect(within(head).getByText("Running")).toBeInTheDocument()
    expect(within(head).getByText("Sonnet 5.5")).toBeInTheDocument()
  })

  it("shows the conversation as a log with tool calls as cards", () => {
    render(<Agent11 />)
    const log = screen.getByRole("log", { name: "Conversation" })
    expect(log.querySelectorAll("[data-slot=tool-call-card]")).toHaveLength(3)
    expect(within(log).getByText("search_orders")).toBeInTheDocument()
    expect(within(log).getAllByText("Running").length).toBeGreaterThan(0)
    expect(within(log).getByText(/re-issue it as store credit/)).toBeInTheDocument()
  })

  it("shows the plan, the context meter and the steering box beside it", () => {
    render(<Agent11 />)
    expect(screen.getByRole("progressbar", { name: "Plan" })).toBeInTheDocument()
    expect(screen.getByRole("meter", { name: "Context" })).toBeInTheDocument()
    expect(screen.getByRole("textbox", { name: "Instruction for the agent" })).toBeInTheDocument()
    expect(screen.getByText("Working on: Issuing the refund (step 5 of 6)")).toBeInTheDocument()
  })

  it("queues a steering instruction at once and sends it", async () => {
    const user = userEvent.setup()
    const onSteer = vi.fn().mockResolvedValue(undefined)
    render(<Agent11 onSteer={onSteer} />)
    await user.type(screen.getByRole("textbox", { name: "Instruction for the agent" }), "Also email the customer a receipt")
    await user.click(screen.getByRole("button", { name: "Send" }))
    expect(onSteer).toHaveBeenCalledWith("Also email the customer a receipt", "after-step")
    expect(await screen.findByText("Also email the customer a receipt")).toBeInTheDocument()
  })

  it("takes the instruction back and says why when sending fails", async () => {
    const user = userEvent.setup()
    render(<Agent11 onSteer={() => Promise.reject(new Error("The run has already finished."))} />)
    await user.type(screen.getByRole("textbox", { name: "Instruction for the agent" }), "Change course")
    await user.click(screen.getByRole("button", { name: "Send" }))
    expect(await screen.findByText("The run has already finished.")).toBeInTheDocument()
    expect(screen.getByRole("list", { name: "Instructions sent" })).not.toHaveTextContent("Change course")
    expect(screen.getByRole("textbox", { name: "Instruction for the agent" })).toHaveValue("Change course")
  })

  it("stops the run and says it stopped, or says why it could not", async () => {
    const user = userEvent.setup()
    const { unmount } = render(<Agent11 onStop={vi.fn().mockResolvedValue(undefined)} />)
    await user.click(screen.getByRole("button", { name: "Stop the run" }))
    expect(await within(document.querySelector("header") as HTMLElement).findByText("Stopped")).toBeInTheDocument()
    expect(screen.getByRole("textbox", { name: "Instruction for the agent" })).toBeDisabled()
    unmount()
    render(<Agent11 onStop={() => Promise.reject(new Error("The worker did not answer."))} />)
    await user.click(screen.getByRole("button", { name: "Stop the run" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("The worker did not answer.")
    expect(within(document.querySelector("header") as HTMLElement).getByText("Running")).toBeInTheDocument()
  })

  it("shows loading, empty and error states", () => {
    const { rerender } = render(<Agent11 state="loading" />)
    expect(screen.getByRole("status")).toHaveTextContent("Loading the run")
    rerender(<Agent11 messages={[]} />)
    expect(screen.getByText("No run yet")).toBeInTheDocument()
    rerender(<Agent11 state="error" onRetry={() => {}} />)
    expect(screen.getByRole("alert")).toHaveTextContent("The run could not be loaded")
  })
})
