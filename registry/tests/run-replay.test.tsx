import * as React from "react"
import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { RunReplay } from "@/components/ballmac/run-replay"

const markers = [{ time: 10, label: "Failure" }, { time: 30, label: "Handoff" }]

beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }))
afterEach(() => vi.useRealTimers())

describe("RunReplay", () => {
  it("shows the time, a scrubber and a play button, and does not start by itself", () => {
    render(<RunReplay duration={60} markers={markers} />)
    expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument()
    expect(screen.getByRole("slider", { name: "Position in the run" })).toHaveAttribute("aria-valuetext", "0:00 of 1:00")
    act(() => void vi.advanceTimersByTime(2000))
    expect(screen.getByRole("slider")).toHaveValue("0")
  })
  it("plays at the chosen speed and pauses", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const onTimeChange = vi.fn()
    render(<RunReplay duration={60} onTimeChange={onTimeChange} />)
    await user.click(screen.getByRole("button", { name: "Play" }))
    act(() => void vi.advanceTimersByTime(3000))
    expect(screen.getByRole("slider")).toHaveValue("3")
    await user.click(screen.getByRole("button", { name: "2×" }))
    act(() => void vi.advanceTimersByTime(2000))
    expect(screen.getByRole("slider")).toHaveValue("7")
    await user.click(screen.getByRole("button", { name: "Pause" }))
    act(() => void vi.advanceTimersByTime(3000))
    expect(screen.getByRole("slider")).toHaveValue("7")
  })
  it("steps between markers and jumps to one", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<RunReplay duration={60} markers={markers} />)
    expect(screen.getByRole("button", { name: "Previous marker" })).toBeDisabled()
    await user.click(screen.getByRole("button", { name: "Next marker" }))
    expect(screen.getByRole("slider")).toHaveValue("10")
    await user.click(screen.getByRole("button", { name: /Handoff/ }))
    expect(screen.getByRole("slider")).toHaveValue("30")
    expect(screen.getByRole("button", { name: "Next marker" })).toBeDisabled()
    await user.click(screen.getByRole("button", { name: "Previous marker" }))
    expect(screen.getByRole("slider")).toHaveValue("10")
  })
  it("stops at the end and offers to replay", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<RunReplay duration={5} defaultTime={3} defaultPlaying />)
    act(() => void vi.advanceTimersByTime(3000))
    expect(screen.getByRole("slider")).toHaveValue("5")
    const again = screen.getByRole("button", { name: "Replay from the start" })
    await user.click(again)
    expect(screen.getByRole("slider")).toHaveValue("0")
  })
  it("says which marker playback reached, and can be controlled", () => {
    function Controlled() {
      const [t, setT] = React.useState(9)
      return <RunReplay duration={60} markers={markers} time={t} onTimeChange={setT} defaultPlaying />
    }
    const { unmount } = render(<Controlled />)
    act(() => void vi.advanceTimersByTime(1500))
    expect(screen.getByText("Reached: Failure")).toBeInTheDocument()
    unmount()
    const { rerender } = render(<RunReplay duration={60} time={5} />)
    rerender(<RunReplay duration={60} time={42} />)
    expect(screen.getByRole("slider")).toHaveValue("42")
  })
})
