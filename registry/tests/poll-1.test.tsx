import * as React from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { Poll1 } from "@/components/ballmac/blocks/poll-1/poll-1"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

const opts = [{ id: "a", label: "Alpha", votes: 60 }, { id: "b", label: "Beta", votes: 30 }, { id: "c", label: "Gamma", votes: 10 }]

describe("Poll1", () => {
  it("says how long is left, from the moment passed in", () => {
    const { rerender } = render(<Poll1 options={opts} closesAt="2026-10-20T10:00:00Z" now="2026-10-18T10:00:00Z" />)
    expect(screen.getByText(/Closes in 2 days/)).toBeInTheDocument()
    rerender(<Poll1 options={opts} closesAt="2026-10-18T13:30:00Z" now="2026-10-18T10:00:00Z" />)
    expect(screen.getByText(/Closes in 3 hours/)).toBeInTheDocument()
  })

  it("will not let you vote without choosing", () => {
    render(<Poll1 options={opts} />)
    expect(screen.getByRole("button", { name: "Vote" })).toBeDisabled()
  })

  it("votes, shows results at once with shares, your choice and the leader", async () => {
    const user = userEvent.setup()
    const onVote = vi.fn().mockResolvedValue(undefined)
    render(<Poll1 options={opts} onVote={onVote} />)
    await user.click(screen.getByRole("radio", { name: /Beta/ }))
    await user.click(screen.getByRole("button", { name: "Vote" }))
    expect(onVote).toHaveBeenCalledWith(["b"])
    // 101 votes after: Alpha 60 (59%), Beta 31 (31%), Gamma 10 (10%)
    const list = screen.getByRole("list")
    expect(within(list).getByText("59%")).toBeInTheDocument()
    expect(within(list).getByText("Your vote")).toBeInTheDocument()
    expect(within(list).getByText("Leading")).toBeInTheDocument()
    expect(within(list).getByText("31 votes")).toBeInTheDocument()
  })

  it("takes the vote back and says why when it fails", async () => {
    const user = userEvent.setup()
    render(<Poll1 options={opts} onVote={() => Promise.reject(new Error("Polls are paused."))} />)
    await user.click(screen.getByRole("radio", { name: /Gamma/ }))
    await user.click(screen.getByRole("button", { name: "Vote" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("Polls are paused.")
    expect(screen.getByRole("radio", { name: /Gamma/ })).toBeInTheDocument()
    expect(screen.queryByText("Your vote")).toBeNull()
  })

  it("changes a vote: the old choice loses one and the new gains one", async () => {
    const user = userEvent.setup()
    render(<Poll1 options={opts} defaultVoted={["a"]} />)
    await user.click(screen.getByRole("button", { name: "Change my vote" }))
    await user.click(screen.getByRole("radio", { name: /Gamma/ }))
    await user.click(screen.getByRole("button", { name: "Change my vote" }))
    const list = screen.getByRole("list")
    expect(within(list).getByText("59 votes")).toBeInTheDocument()
    expect(within(list).getByText("11 votes")).toBeInTheDocument()
  })

  it("limits choices when several are allowed", async () => {
    const user = userEvent.setup()
    render(<Poll1 options={opts} multiple maxChoices={2} />)
    await user.click(screen.getByRole("checkbox", { name: /Alpha/ }))
    await user.click(screen.getByRole("checkbox", { name: /Beta/ }))
    expect(screen.getByRole("checkbox", { name: /Gamma/ })).toBeDisabled()
    expect(screen.getAllByText(/Choose up to 2/).length).toBeGreaterThan(0)
  })

  it("shows results without voting, and closed polls only show results", async () => {
    const user = userEvent.setup()
    const { rerender } = render(<Poll1 options={opts} />)
    await user.click(screen.getByRole("button", { name: "See results without voting" }))
    expect(screen.getByText("60%")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Vote now" })).toBeInTheDocument()
    rerender(<Poll1 options={opts} closesAt="2026-10-01T00:00:00Z" now="2026-10-18T10:00:00Z" />)
    expect(screen.getByText(/Voting is closed/)).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /Vote/ })).toBeNull()
  })

  it("shows no Leading mark when two options tie", () => {
    render(<Poll1 options={[{ id: "a", label: "A", votes: 5 }, { id: "b", label: "B", votes: 5 }]} defaultVoted={["a"]} />)
    expect(screen.queryByText("Leading")).toBeNull()
  })

  it("shows loading, empty and error states", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const { rerender } = render(<Poll1 state="loading" />)
    expect(screen.getByRole("status")).toBeInTheDocument()
    rerender(<Poll1 state="empty" />)
    expect(screen.getByRole("heading", { name: "No poll right now" })).toBeInTheDocument()
    rerender(<Poll1 state="error" onRetry={onRetry} />)
    await user.click(screen.getByRole("button", { name: /try again/i }))
    expect(onRetry).toHaveBeenCalled()
  })
})
