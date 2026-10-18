import * as React from "react"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { Seatmap1 } from "@/components/ballmac/blocks/seatmap-1/seatmap-1"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

const seat = (row: string, n: number) => screen.getByRole("gridcell", { name: new RegExp(`^Row ${row}, seat ${n},`) })

describe("Seatmap1", () => {
  it("reads each seat with its tier, price and state in words", () => {
    render(<Seatmap1 />)
    expect(screen.getByRole("gridcell", { name: "Row E, seat 5, Premium, $16.00, available" })).toBeInTheDocument()
    expect(screen.getByRole("gridcell", { name: "Row B, seat 4, Standard, $12.00, taken" })).toHaveAttribute("aria-disabled", "true")
    expect(screen.getByRole("gridcell", { name: /Row A, seat 1, .*wheelchair space/ })).toBeInTheDocument()
  })

  it("chooses and unchooses seats, with a running total and announcements", async () => {
    const user = userEvent.setup()
    render(<Seatmap1 />)
    await user.click(seat("E", 5))
    await user.click(seat("H", 5))
    expect(seat("E", 5)).toHaveAttribute("aria-selected", "true")
    // E is Premium $16 and H is Recliner $22.
    expect(screen.getByText("$38.00")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Hold 2 seats" })).toBeEnabled()
    await user.click(screen.getByRole("button", { name: "Remove row E, seat 5" }))
    expect(screen.getByText("$22.00", { selector: "p" })).toBeInTheDocument()
  })

  it("does not let a taken seat be chosen", async () => {
    const user = userEvent.setup()
    render(<Seatmap1 />)
    await user.click(seat("B", 4))
    expect(screen.getByRole("button", { name: "Choose seats" })).toBeDisabled()
  })

  it("stops at the limit and says so", async () => {
    const user = userEvent.setup()
    render(<Seatmap1 maxSeats={2} />)
    await user.click(seat("E", 5))
    await user.click(seat("E", 6))
    await user.click(seat("E", 8))
    expect(screen.getByRole("alert")).toHaveTextContent("You can choose up to 2 seats")
    expect(seat("E", 8)).toHaveAttribute("aria-selected", "false")
  })

  it("moves with the arrow keys and chooses with Enter", async () => {
    const user = userEvent.setup()
    render(<Seatmap1 />)
    seat("A", 1).focus()
    await user.keyboard("{ArrowRight}")
    await waitFor(() => expect(document.activeElement).toBe(seat("A", 2)))
    await user.keyboard("{ArrowDown}")
    await waitFor(() => expect(document.activeElement).toBe(seat("B", 2)))
    await user.keyboard("{Enter}")
    expect(seat("B", 2)).toHaveAttribute("aria-selected", "true")
    expect(screen.getAllByRole("gridcell").filter((c) => c.getAttribute("tabindex") === "0")).toHaveLength(1)
  })

  it("picks the best seats together for the party, never across a taken seat", async () => {
    const user = userEvent.setup()
    render(<Seatmap1 />)
    await user.selectOptions(screen.getByLabelText("For"), "3")
    await user.click(screen.getByRole("button", { name: "Pick for me" }))
    const chosen = screen.getAllByRole("gridcell").filter((c) => c.getAttribute("aria-selected") === "true")
    expect(chosen).toHaveLength(3)
    const labels = chosen.map((c) => c.getAttribute("aria-label")!)
    const row = labels[0]!.match(/^Row (\w)/)![1]
    expect(labels.every((l) => l.startsWith(`Row ${row},`))).toBe(true)
    const nums = labels.map((l) => Number(l.match(/seat (\d+)/)![1])).sort((a, b) => a - b)
    expect(nums[2]! - nums[0]!).toBe(2)
  })

  it("holds the seats and says so", async () => {
    const user = userEvent.setup()
    const onContinue = vi.fn().mockResolvedValue(undefined)
    render(<Seatmap1 onContinue={onContinue} />)
    await user.click(seat("E", 5))
    await user.click(screen.getByRole("button", { name: "Hold 1 seat" }))
    expect(onContinue).toHaveBeenCalledWith([expect.objectContaining({ id: "E5" })], 16)
    expect(await screen.findByText("Seats held for you")).toBeInTheDocument()
  })

  it("marks a lost seat taken, keeps the others chosen, and says which", async () => {
    const user = userEvent.setup()
    render(<Seatmap1 defaultSelected={["E4", "E5", "E6"]} onContinue={() => Promise.reject(Object.assign(new Error("x"), { taken: ["E5"] }))} />)
    await user.click(screen.getByRole("button", { name: "Hold 3 seats" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("E5 was just taken by someone else. Your other seats are still chosen.")
    expect(seat("E", 5)).toHaveAttribute("aria-disabled", "true")
    expect(seat("E", 4)).toHaveAttribute("aria-selected", "true")
    expect(screen.getByRole("button", { name: "Hold 2 seats" })).toBeInTheDocument()
  })

  it("says nothing was charged when a hold fails for another reason", async () => {
    const user = userEvent.setup()
    render(<Seatmap1 defaultSelected={["E6"]} onContinue={() => Promise.reject(new Error("The box office is closed."))} />)
    await user.click(screen.getByRole("button", { name: "Hold 1 seat" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("The box office is closed.")
  })

  it("shows loading, empty and error states", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const { rerender } = render(<Seatmap1 state="loading" />)
    expect(screen.getByRole("status")).toBeInTheDocument()
    rerender(<Seatmap1 state="empty" />)
    expect(screen.getByRole("heading", { name: "No showing selected" })).toBeInTheDocument()
    rerender(<Seatmap1 state="error" onRetry={onRetry} />)
    await user.click(screen.getByRole("button", { name: /try again/i }))
    expect(onRetry).toHaveBeenCalled()
  })
})
