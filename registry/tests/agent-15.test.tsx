import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Agent15 } from "@/components/ballmac/blocks/agent-15/agent-15"

describe("Agent15", () => {
  it("shows the prompts, the draft with its suggestions, and the actions under it", () => {
    render(<Agent15 />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Draft studio")
    expect(screen.getByRole("list", { name: "Saved prompts" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Suggestion, grammar: we was" })).toBeInTheDocument()
    expect(screen.getByRole("toolbar", { name: "Message actions" })).toBeInTheDocument()
  })

  it("writes a new draft from a filled prompt and replaces the suggestions", async () => {
    const user = userEvent.setup()
    const onGenerate = vi.fn().mockResolvedValue({ text: "Dear Ada, thank you for waiting.", suggestions: [{ id: "n", find: "thank you for waiting", replace: "thanks for your patience", reason: "Warmer.", kind: "tone" }] })
    render(<Agent15 onGenerate={onGenerate} />)
    await user.click(screen.getByRole("button", { name: /Explain it in plain English/ }))
    await user.click(screen.getByRole("button", { name: "Insert" }))
    expect(onGenerate).toHaveBeenCalledWith("Rewrite the text below so a new customer can follow it. No jargon, short sentences.", expect.objectContaining({ id: "3" }))
    expect(await screen.findByRole("button", { name: /Suggestion, tone: thank you for waiting/ })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Suggestion, grammar: we was" })).not.toBeInTheDocument()
    expect(screen.getByText("Drafted from “Explain it in plain English”.")).toBeInTheDocument()
  })

  it("says why when the draft cannot be written, and keeps the old one", async () => {
    const user = userEvent.setup()
    render(<Agent15 onGenerate={() => Promise.reject(new Error("The model is busy."))} />)
    await user.click(screen.getByRole("button", { name: /Explain it in plain English/ }))
    await user.click(screen.getByRole("button", { name: "Insert" }))
    expect((await screen.findAllByText("The model is busy.")).length).toBeGreaterThan(0)
    expect(screen.getByRole("button", { name: "Suggestion, grammar: we was" })).toBeInTheDocument()
  })

  it("accepts a suggestion and the text under the actions follows", async () => {
    const user = userEvent.setup()
    const write = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined)
    render(<Agent15 />)
    await user.click(screen.getByRole("button", { name: "Accept: we were" }))
    await user.click(screen.getByRole("button", { name: "Copy" }))
    expect(write).toHaveBeenCalledWith(expect.stringContaining("we were thinking"))
  })

  it("shows loading, empty and error states", () => {
    const { rerender } = render(<Agent15 state="loading" />)
    expect(screen.getByRole("status")).toHaveTextContent("Loading the studio")
    rerender(<Agent15 prompts={[]} />)
    expect(screen.getByText("No prompts yet")).toBeInTheDocument()
    rerender(<Agent15 state="error" onRetry={() => {}} />)
    expect(screen.getByRole("alert")).toHaveTextContent("The studio could not be loaded")
  })
})
