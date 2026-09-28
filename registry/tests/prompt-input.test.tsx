import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { PromptInput, PromptInputSubmit, PromptInputTextarea, PromptInputToolbar } from "@/components/ballmac/prompt-input"

function Setup(props: Partial<React.ComponentProps<typeof PromptInput>>) {
  return (
    <PromptInput {...props}>
      <PromptInputTextarea aria-label="Message" />
      <PromptInputToolbar>
        <PromptInputSubmit />
      </PromptInputToolbar>
    </PromptInput>
  )
}

describe("PromptInput", () => {
  it("submits trimmed text on Enter and clears itself", async () => {
    const onSubmit = vi.fn()
    render(<Setup onSubmit={onSubmit} />)
    const box = screen.getByRole("textbox", { name: "Message" })
    await userEvent.type(box, "  hello  {Enter}")
    expect(onSubmit).toHaveBeenCalledWith("hello", [])
    expect(box).toHaveValue("")
  })

  it("inserts a newline on Shift+Enter instead of submitting", async () => {
    const onSubmit = vi.fn()
    render(<Setup onSubmit={onSubmit} />)
    const box = screen.getByRole("textbox", { name: "Message" })
    await userEvent.type(box, "line one{Shift>}{Enter}{/Shift}line two")
    expect(onSubmit).not.toHaveBeenCalled()
    expect(box).toHaveValue("line one\nline two")
  })

  it("does not submit empty input", async () => {
    const onSubmit = vi.fn()
    render(<Setup onSubmit={onSubmit} />)
    await userEvent.type(screen.getByRole("textbox", { name: "Message" }), "   {Enter}")
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("shows a Stop button while streaming", async () => {
    const onStop = vi.fn()
    render(<Setup status="streaming" onStop={onStop} />)
    await userEvent.click(screen.getByRole("button", { name: /stop/i }))
    expect(onStop).toHaveBeenCalled()
  })
})
