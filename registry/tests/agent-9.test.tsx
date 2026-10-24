import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Agent9 } from "@/components/ballmac/blocks/agent-9/agent-9"

describe("Agent9", () => {
  it("starts saved, with Save and Discard off", () => {
    render(<Agent9 />)
    expect(screen.getByText("All changes saved.")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Save settings" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Discard" })).toBeDisabled()
  })

  it("says there are unsaved changes, and discard puts everything back", async () => {
    const user = userEvent.setup()
    render(<Agent9 />)
    await user.click(screen.getByLabelText(/Act on its own/))
    expect(screen.getByText("You have unsaved changes.")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Discard" }))
    expect(screen.getByLabelText(/Ask first/)).toBeChecked()
    expect(screen.getByText("All changes saved.")).toBeInTheDocument()
  })

  it("warns, in words, what it may do alone when acting freely with tools that change things", async () => {
    const user = userEvent.setup()
    render(<Agent9 />)
    expect(screen.queryByRole("status")).not.toBeInTheDocument()
    await user.click(screen.getByLabelText(/Act on its own/))
    expect(screen.getByRole("status")).toHaveTextContent("it can send email without asking")
    expect(screen.getByRole("status")).toHaveTextContent("$5.00 a run and $25.00 a day")
  })

  it("refuses a run limit above the daily limit, and a bad step count, and blocks saving", async () => {
    const user = userEvent.setup()
    render(<Agent9 />)
    const run = screen.getByLabelText(/Most per run/)
    await user.clear(run)
    await user.type(run, "40")
    expect(screen.getByRole("alert")).toHaveTextContent("A run cannot cost more than the daily limit.")
    expect(screen.getByRole("button", { name: "Save settings" })).toBeDisabled()
    await user.clear(run)
    await user.type(run, "4")
    const steps = screen.getByLabelText("Most steps in a run")
    await user.clear(steps)
    await user.type(steps, "500")
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a whole number from 1 to 200.")
  })

  it("saves the new settings and says when they apply", async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue(undefined)
    render(<Agent9 onSave={onSave} />)
    await user.click(screen.getByRole("switch", { name: "Make payments is allowed" }))
    await user.click(screen.getByRole("button", { name: "Save settings" }))
    expect(onSave).toHaveBeenCalledWith({ autonomy: "ask", perRun: 5, perDay: 25, tools: ["search", "docs", "mail", "pay"], maxSteps: 30 })
    expect(await screen.findByText(/Saved\. The agent follows these settings from its next run\./)).toBeInTheDocument()
  })

  it("keeps the edits and says why when saving fails", async () => {
    const user = userEvent.setup()
    render(<Agent9 onSave={() => Promise.reject(new Error("You need to be an admin to change this."))} />)
    await user.click(screen.getByLabelText(/Suggest only/))
    await user.click(screen.getByRole("button", { name: "Save settings" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("You need to be an admin to change this.")
    expect(screen.getByLabelText(/Suggest only/)).toBeChecked()
  })

  it("shows loading, empty and error states", () => {
    const { rerender } = render(<Agent9 state="loading" />)
    expect(screen.getByRole("status")).toHaveTextContent("Loading the agent settings")
    rerender(<Agent9 tools={[]} />)
    expect(screen.getByText("No tools connected")).toBeInTheDocument()
    rerender(<Agent9 state="error" onRetry={() => {}} />)
    expect(screen.getByRole("alert")).toHaveTextContent("The settings could not be loaded")
  })
})
