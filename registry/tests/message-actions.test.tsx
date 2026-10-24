import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { MessageActions } from "@/components/ballmac/message-actions"

afterEach(() => vi.restoreAllMocks())

describe("MessageActions", () => {
  it("is a toolbar with only the buttons it was given handlers for", () => {
    const { rerender } = render(<MessageActions text="hi" />)
    expect(within(screen.getByRole("toolbar", { name: "Message actions" })).getAllByRole("button")).toHaveLength(1)
    rerender(<MessageActions text="hi" onRegenerate={() => {}} onFeedback={() => {}} onBranch={() => {}} onShare={() => {}} />)
    expect(screen.getAllByRole("button").map((b) => b.getAttribute("aria-label"))).toEqual(["Copy", "Try again", "Good answer", "Bad answer", "Branch from here", "Share"])
  })

  it("renders nothing when there is nothing to do", () => {
    const { container } = render(<MessageActions />)
    expect(container).toBeEmptyDOMElement()
  })

  it("copies the text and says so", async () => {
    const user = userEvent.setup()
    const write = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined)
    render(<MessageActions text="the answer" />)
    await user.click(screen.getByRole("button", { name: "Copy" }))
    expect(write).toHaveBeenCalledWith("the answer")
    expect(await screen.findByText("Copied")).toBeInTheDocument()
  })

  it("keeps one stop in the tab order and moves with the arrow keys, wrapping at the ends", async () => {
    const user = userEvent.setup()
    render(<MessageActions text="x" onRegenerate={() => {}} onFeedback={() => {}} />)
    const buttons = screen.getAllByRole("button")
    expect(buttons.filter((b) => b.getAttribute("tabindex") === "0")).toHaveLength(1)
    buttons[0].focus()
    await user.keyboard("{ArrowRight}")
    expect(buttons[1]).toHaveFocus()
    await user.keyboard("{End}")
    expect(buttons[3]).toHaveFocus()
    await user.keyboard("{ArrowRight}")
    expect(buttons[0]).toHaveFocus()
    await user.keyboard("{ArrowLeft}")
    expect(buttons[3]).toHaveFocus()
  })

  it("regenerates, shows it is working, and says why when it fails", async () => {
    const user = userEvent.setup()
    render(<MessageActions onRegenerate={() => Promise.reject(new Error("The model is busy."))} />)
    await user.click(screen.getByRole("button", { name: "Try again" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("The model is busy.")
  })

  it("sends a thumbs up at once and says thanks", async () => {
    const user = userEvent.setup()
    const onFeedback = vi.fn().mockResolvedValue(undefined)
    render(<MessageActions onFeedback={onFeedback} />)
    await user.click(screen.getByRole("button", { name: "Good answer" }))
    expect(onFeedback).toHaveBeenCalledWith("up", undefined)
    expect(screen.getByRole("button", { name: "Good answer" })).toHaveAttribute("aria-pressed", "true")
    expect(await screen.findByText("Thanks, that helps.")).toBeInTheDocument()
  })

  it("asks what was wrong after a thumbs down, and sends the reason", async () => {
    const user = userEvent.setup()
    const onFeedback = vi.fn().mockResolvedValue(undefined)
    render(<MessageActions onFeedback={onFeedback} />)
    await user.click(screen.getByRole("button", { name: "Bad answer" }))
    expect(onFeedback).not.toHaveBeenCalled()
    expect(screen.getByRole("group", { name: "What was wrong?" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Too long" }))
    expect(onFeedback).toHaveBeenCalledWith("down", "Too long")
    expect(screen.queryByRole("group", { name: "What was wrong?" })).not.toBeInTheDocument()
  })

  it("takes the choice back and says why when the feedback cannot be saved", async () => {
    const user = userEvent.setup()
    render(<MessageActions onFeedback={() => Promise.reject(new Error("You are offline."))} />)
    await user.click(screen.getByRole("button", { name: "Good answer" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("You are offline.")
    expect(screen.getByRole("button", { name: "Good answer" })).toHaveAttribute("aria-pressed", "false")
  })
})
