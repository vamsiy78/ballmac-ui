import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Agent16 } from "@/components/ballmac/blocks/agent-16/agent-16"

describe("Agent16", () => {
  it("shows the heading, a cited answer and the memory panel", () => {
    render(<Agent16 />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Ask anything")
    expect(screen.getByRole("list", { name: "Conversation" })).toBeInTheDocument()
    expect(screen.getAllByRole("button", { name: /^Source 1: Refund policy/ }).length).toBeGreaterThan(0)
    expect(screen.getByRole("switch", { name: "Use memory in replies" })).toBeInTheDocument()
  })

  it("sends a question with Enter, shows it is working and then the answer", async () => {
    const user = userEvent.setup()
    const onAsk = vi.fn().mockResolvedValue({ paragraphs: ["Yes it ships [1]."], sources: [{ title: "Shipping", url: "https://a.test", snippet: "We ship." }] })
    render(<Agent16 turns={[]} onAsk={onAsk} />)
    await user.type(screen.getByLabelText("Your question"), "Do you ship?{Enter}")
    expect(onAsk).toHaveBeenCalledWith("Do you ship?")
    expect(await screen.findByRole("button", { name: "Source 1: Shipping" })).toBeInTheDocument()
    expect(screen.getByText("Do you ship?")).toBeInTheDocument()
  })

  it("puts the question back and says why when it cannot be answered", async () => {
    const user = userEvent.setup()
    render(<Agent16 turns={[]} onAsk={() => Promise.reject(new Error("The model is busy."))} />)
    await user.type(screen.getByLabelText("Your question"), "Hello{Enter}")
    expect(await screen.findByRole("alert")).toHaveTextContent("The model is busy.")
    expect(screen.getByLabelText("Your question")).toHaveValue("Hello")
  })

  it("keeps Send off until there is a question", async () => {
    render(<Agent16 turns={[]} />)
    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled()
  })

  it("toggles the memory on a phone with aria-expanded", async () => {
    const user = userEvent.setup()
    render(<Agent16 />)
    const b = screen.getByRole("button", { name: "Show memory" })
    expect(b).toHaveAttribute("aria-expanded", "false")
    await user.click(b)
    expect(screen.getByRole("button", { name: "Hide memory" })).toHaveAttribute("aria-expanded", "true")
  })

  it("renders the loading, empty and error states", () => {
    const { rerender } = render(<Agent16 state="loading" />)
    expect(screen.getByRole("status")).toBeInTheDocument()
    rerender(<Agent16 state="empty" />)
    expect(screen.getByText("Ask your first question")).toBeInTheDocument()
    rerender(<Agent16 state="error" onRetry={() => {}} />)
    expect(screen.getByRole("alert")).toBeInTheDocument()
  })
})
