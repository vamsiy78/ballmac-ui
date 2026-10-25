import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Agent18 } from "@/components/ballmac/blocks/agent-18/agent-18"

describe("Agent18", () => {
  it("shows the sources and the test box", () => {
    render(<Agent18 />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Knowledge base")
    expect(screen.getByRole("switch", { name: "Use Product docs in answers" })).toBeChecked()
    expect(screen.getByLabelText("Question to test")).toHaveValue("What is the refund policy?")
  })

  it("tests a question and shows the answer with its sources", async () => {
    const user = userEvent.setup()
    const onTest = vi.fn().mockResolvedValue({ paragraphs: ["Fourteen days [1]."], sources: [{ title: "Policy", url: "https://a.test", snippet: "14 days." }] })
    render(<Agent18 onTest={onTest} />)
    await user.click(screen.getByRole("button", { name: "Test" }))
    expect(onTest).toHaveBeenCalledWith("What is the refund policy?")
    expect(await screen.findByRole("button", { name: "Source 1: Policy" })).toBeInTheDocument()
  })

  it("says why a test failed", async () => {
    const user = userEvent.setup()
    render(<Agent18 onTest={() => Promise.reject(new Error("Index is rebuilding."))} />)
    await user.click(screen.getByRole("button", { name: "Test" }))
    expect(await screen.findByText("Index is rebuilding.")).toBeInTheDocument()
  })

  it("renders the loading, empty and error states", () => {
    const { rerender } = render(<Agent18 state="loading" />)
    expect(screen.getByRole("status")).toBeInTheDocument()
    rerender(<Agent18 sources={[]} />)
    expect(screen.getByText("No sources yet")).toBeInTheDocument()
    rerender(<Agent18 state="error" onRetry={() => {}} />)
    expect(screen.getByRole("alert")).toBeInTheDocument()
  })
})
