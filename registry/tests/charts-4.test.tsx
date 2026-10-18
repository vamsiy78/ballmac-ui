import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

vi.mock("recharts", async (importOriginal) => ({
  ...(await importOriginal<typeof import("recharts")>()),
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))
import { Charts4 } from "@/components/ballmac/blocks/charts-4/charts-4"

const goals = [
  { name: "a", label: "Revenue", value: 120 },
  { name: "b", label: "Retention", value: 60 },
]
const profile = [
  { area: "Quality", current: 80, target: 90 },
  { area: "Docs", current: 50, target: 85 },
]
const leaders = [
  { name: "Ana", value: 10 },
  { name: "Bo", value: 30 },
]

describe("Charts4", () => {
  it("works out goals met, average progress, the biggest gap and the leader", () => {
    render(<Charts4 goals={goals} profile={profile} leaders={leaders} leaderFormatter={(v) => `${v} deals`} leaderTitle="Deals" />)
    const text = (label: string) => screen.getByText(label, { selector: "dt" }).parentElement!.textContent
    expect(text("Goals met")).toContain("1 of 2")
    expect(text("Average progress")).toContain("90%")
    expect(text("Biggest gap")).toContain("Docs")
    expect(text("Biggest gap")).toContain("35 points under target")
    expect(text("Leading")).toContain("Bo")
    expect(text("Leading")).toContain("30 deals deals")
  })

  it("says when nothing is under target", () => {
    render(<Charts4 goals={goals} profile={[{ area: "Quality", current: 95, target: 90 }]} leaders={leaders} />)
    expect(screen.getByText("Biggest gap", { selector: "dt" }).parentElement).toHaveTextContent("Every area is on target")
  })

  it("has three charts, each a named figure with a summary", () => {
    render(<Charts4 goals={goals} profile={profile} leaders={leaders} leaderTitle="Deals" />)
    expect(screen.getByRole("figure", { name: "Goals" })).toHaveAccessibleDescription("Revenue: 120% of 120% (100%). Retention: 60% of 120% (50%).")
    expect(screen.getByRole("figure", { name: "Team profile" })).toBeInTheDocument()
    expect(screen.getByRole("figure", { name: "Deals" })).toBeInTheDocument()
  })

  it("shows loading, empty and error", async () => {
    const user = userEvent.setup()
    const retry = vi.fn()
    const { rerender } = render(<Charts4 state="loading" />)
    expect(screen.getByRole("status")).toHaveTextContent("Loading the scorecard")
    rerender(<Charts4 state="empty" />)
    expect(screen.getByText("No goals yet")).toBeInTheDocument()
    rerender(<Charts4 goals={[]} />)
    expect(screen.getByText("No goals yet")).toBeInTheDocument()
    rerender(<Charts4 state="error" onRetry={retry} />)
    expect(screen.getByRole("alert")).toHaveTextContent("The scorecard could not be loaded")
    await user.click(screen.getByRole("button", { name: /try again/i }))
    expect(retry).toHaveBeenCalledTimes(1)
  })
})
