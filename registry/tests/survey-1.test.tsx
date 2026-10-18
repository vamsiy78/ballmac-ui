import * as React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { Survey1 } from "@/components/ballmac/blocks/survey-1/survey-1"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

describe("Survey1", () => {
  it("asks for a score before it lets you continue", async () => {
    const user = userEvent.setup()
    render(<Survey1 />)
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled()
    await user.click(screen.getByRole("radio", { name: "8" }))
    expect(screen.getByRole("radio", { name: "8" })).toBeChecked()
    expect(screen.getByText("Good, but not great")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled()
  })

  it("moves through the scale with the arrow keys, one tab stop", async () => {
    const user = userEvent.setup()
    render(<Survey1 />)
    await user.tab()
    expect(screen.getByRole("radio", { name: /^0/ })).toHaveFocus()
    await user.keyboard("{ArrowRight}{ArrowRight}")
    expect(screen.getByRole("radio", { name: "2" })).toBeChecked()
    expect(screen.getByRole("radio", { name: "2" })).toHaveFocus()
  })

  it("asks what went wrong of a low score and what is liked of a high one", async () => {
    const user = userEvent.setup()
    const { unmount } = render(<Survey1 />)
    await user.click(screen.getByRole("radio", { name: "3" }))
    await user.click(screen.getByRole("button", { name: "Next" }))
    expect(screen.getByRole("heading", { name: "What got in your way?" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Too slow" })).toBeInTheDocument()
    unmount()
    render(<Survey1 />)
    await user.click(screen.getByRole("radio", { name: /^10/ }))
    await user.click(screen.getByRole("button", { name: "Next" }))
    expect(screen.getByRole("heading", { name: "What do you like most?" })).toBeInTheDocument()
  })

  it("moves focus to the new question and keeps answers when going back", async () => {
    const user = userEvent.setup()
    render(<Survey1 />)
    await user.click(screen.getByRole("radio", { name: "9" }))
    await user.click(screen.getByRole("button", { name: "Next" }))
    await waitFor(() => expect(screen.getByRole("heading", { name: "What do you like most?" })).toHaveFocus())
    await user.click(screen.getByRole("button", { name: "Saves me time" }))
    await user.click(screen.getByRole("button", { name: "Back" }))
    expect(screen.getByRole("radio", { name: "9" })).toBeChecked()
    await user.click(screen.getByRole("button", { name: "Next" }))
    expect(screen.getByRole("button", { name: "Saves me time" })).toHaveAttribute("aria-pressed", "true")
  })

  it("sends everything chosen and thanks the person", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<Survey1 onSubmit={onSubmit} />)
    await user.click(screen.getByRole("radio", { name: "5" }))
    await user.click(screen.getByRole("button", { name: "Next" }))
    await user.click(screen.getByRole("button", { name: "Too slow" }))
    await user.click(screen.getByRole("button", { name: "Next" }))
    await user.type(screen.getByLabelText(/Optional/), "Loading takes ages")
    await user.click(screen.getByRole("checkbox", { name: /contact me/ }))
    await user.click(screen.getByRole("button", { name: "Send" }))
    expect(onSubmit).toHaveBeenCalledWith({ score: 5, reasons: ["Too slow"], comment: "Loading takes ages", mayContact: true })
    expect(await screen.findByRole("heading", { name: "Thank you" })).toBeInTheDocument()
  })

  it("keeps what was typed when sending fails", async () => {
    const user = userEvent.setup()
    render(<Survey1 defaultStep={2} defaultScore={7} onSubmit={() => Promise.reject(new Error("offline"))} />)
    await user.type(screen.getByLabelText(/Optional/), "Hello")
    await user.click(screen.getByRole("button", { name: "Send" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("Nothing you typed was lost")
    expect(screen.getByLabelText(/Optional/)).toHaveValue("Hello")
    expect(screen.getByRole("button", { name: "Try again" })).toBeEnabled()
  })

  it("drives its states from the state prop", () => {
    const { rerender } = render(<Survey1 defaultStep={2} defaultScore={9} state="submitting" />)
    expect(screen.getByRole("button", { name: "Sending" })).toBeDisabled()
    rerender(<Survey1 defaultStep={2} defaultScore={9} state="success" />)
    expect(screen.getByRole("status")).toHaveTextContent("means a lot")
  })
})
