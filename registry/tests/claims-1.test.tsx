import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Claims1 } from "@/components/ballmac/blocks/claims-1/claims-1"

describe("Claims1", () => {
  it("lists claims with their stage in words and how many things are needed", () => {
    render(<Claims1 />)
    const list = screen.getByRole("list", { name: "Claims" })
    expect(within(list).getByText("1 thing needed")).toBeInTheDocument()
    expect(within(list).getByText("Declined")).toBeInTheDocument()
    expect(within(list).getByText("Paid")).toBeInTheDocument()
  })

  it("marks the current stage and says which stages are done, now and to come", () => {
    render(<Claims1 />)
    const steps = within(screen.getByRole("list", { name: "Progress" })).getAllByRole("listitem")
    expect(steps[0]).toHaveTextContent("Received (done)")
    expect(steps[1]).toHaveAttribute("aria-current", "step")
    expect(steps[1]).toHaveTextContent("In review (now)")
    expect(steps[4]).toHaveTextContent("Paid (to come)")
  })

  it("stops a declined claim at the decision and says so", async () => {
    const user = userEvent.setup()
    render(<Claims1 />)
    await user.click(screen.getByRole("button", { name: /Stolen bicycle/ }))
    const steps = within(screen.getByRole("list", { name: "Progress" })).getAllByRole("listitem")
    expect(steps[3]).toHaveTextContent("Declined (now)")
    expect(steps[4]).toHaveTextContent("Paid (not reached)")
    expect(screen.getByText(/This claim was declined/)).toBeInTheDocument()
    expect(screen.getByText("Nothing needed from you right now.")).toBeInTheDocument()
  })

  it("shows answered requests as answered and open ones with a form", () => {
    render(<Claims1 />)
    expect(screen.getByText(/Uploaded invoice from Hale Plumbing/)).toBeInTheDocument()
    expect(screen.getAllByRole("textbox")).toHaveLength(1)
  })

  it("asks for an answer first, then sends it and updates the count", async () => {
    const user = userEvent.setup()
    const onAnswer = vi.fn().mockResolvedValue(undefined)
    render(<Claims1 onAnswer={onAnswer} />)
    await user.click(screen.getByRole("button", { name: "Send answer" }))
    expect(screen.getByRole("alert")).toHaveTextContent("Write your answer first.")
    await user.type(screen.getByRole("textbox"), "Photos sent by email")
    await user.click(screen.getByRole("button", { name: "Send answer" }))
    expect(onAnswer).toHaveBeenCalledWith("c1", "r1", "Photos sent by email")
    expect(await screen.findByText("Photos sent by email")).toBeInTheDocument()
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
    expect(screen.queryByText("1 thing needed")).not.toBeInTheDocument()
  })

  it("keeps the answer and says why when sending fails", async () => {
    const user = userEvent.setup()
    render(<Claims1 onAnswer={() => Promise.reject(new Error("The file service is down."))} />)
    await user.type(screen.getByRole("textbox"), "Photos sent")
    await user.click(screen.getByRole("button", { name: "Send answer" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("The file service is down.")
    expect(screen.getByRole("textbox")).toHaveValue("Photos sent")
  })

  it("shows loading, empty and error states", () => {
    const { rerender } = render(<Claims1 state="loading" />)
    expect(screen.getByRole("status")).toHaveTextContent("Loading your claims")
    rerender(<Claims1 claims={[]} />)
    expect(screen.getByText("No claims yet")).toBeInTheDocument()
    rerender(<Claims1 state="error" onRetry={() => {}} />)
    expect(screen.getByRole("alert")).toHaveTextContent("Your claims could not be loaded")
  })
})
