import * as React from "react"
import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { AudioPlayer, formatTime } from "@/components/ballmac/audio-player"

afterEach(() => vi.useRealTimers())

const chapters = [{ start: 0, title: "Intro" }, { start: 60, title: "Main part" }]

describe("formatTime", () => {
  it("formats minutes and hours", () => {
    expect(formatTime(0)).toBe("0:00")
    expect(formatTime(65)).toBe("1:05")
    expect(formatTime(3725)).toBe("1:02:05")
    expect(formatTime(-4)).toBe("0:00")
  })
})

describe("AudioPlayer", () => {
  it("toggles between Play and Pause", async () => {
    const user = userEvent.setup()
    const onPlayingChange = vi.fn()
    render(<AudioPlayer title="Episode" duration={120} onPlayingChange={onPlayingChange} />)
    await user.click(screen.getByRole("button", { name: "Play" }))
    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument()
    expect(onPlayingChange).toHaveBeenLastCalledWith(true)
    await user.click(screen.getByRole("button", { name: "Pause" }))
    expect(onPlayingChange).toHaveBeenLastCalledWith(false)
  })

  it("advances a silent demo and stops at the end", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<AudioPlayer title="Episode" duration={4} />)
    await user.click(screen.getByRole("button", { name: "Play" }))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000)
    })
    expect(screen.getByText("0:04")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument()
  })

  it("skips back and forward and reports the position", async () => {
    const user = userEvent.setup()
    const onTimeChange = vi.fn()
    render(<AudioPlayer title="Episode" duration={300} onTimeChange={onTimeChange} />)
    await user.click(screen.getByRole("button", { name: "Forward 30 seconds" }))
    expect(onTimeChange).toHaveBeenLastCalledWith(30)
    await user.click(screen.getByRole("button", { name: "Back 15 seconds" }))
    expect(onTimeChange).toHaveBeenLastCalledWith(15)
    await user.click(screen.getByRole("button", { name: "Back 15 seconds" }))
    expect(onTimeChange).toHaveBeenLastCalledWith(0)
  })

  it("names the current chapter and follows a controlled time", () => {
    const { rerender } = render(<AudioPlayer title="Episode" duration={300} chapters={chapters} time={10} />)
    expect(screen.getByText("Intro")).toBeInTheDocument()
    rerender(<AudioPlayer title="Episode" duration={300} chapters={chapters} time={90} />)
    expect(screen.getByText("Main part")).toBeInTheDocument()
  })

  it("cycles the speed", async () => {
    const user = userEvent.setup()
    render(<AudioPlayer title="Episode" duration={300} rates={[1, 1.5, 2]} />)
    const speed = () => screen.getByRole("button", { name: /Playback speed/ })
    expect(speed()).toHaveTextContent("1×")
    await user.click(speed())
    expect(speed()).toHaveTextContent("1.5×")
    await user.click(speed())
    await user.click(speed())
    expect(speed()).toHaveTextContent("1×")
  })

  it("has a labelled seek slider that reads the position", () => {
    render(<AudioPlayer title="Episode" duration={300} time={75} />)
    const slider = screen.getByRole("slider", { name: "Seek" })
    expect(slider).toHaveAttribute("aria-valuenow", "75")
  })

  it("renders a compact variant", () => {
    render(<AudioPlayer variant="compact" title="Mini" duration={60} />)
    expect(screen.getByRole("group", { name: "Audio player: Mini" })).toBeInTheDocument()
  })
})
