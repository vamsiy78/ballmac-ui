import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { EvalScorecard, type EvalCase } from "@/components/ballmac/eval-scorecard"

const cases: EvalCase[] = [
  { id: "1", name: "Alpha", status: "pass", previous: "pass", input: "in1", expected: "ex1", actual: "ac1", ms: 1000, cost: 0.01 },
  { id: "2", name: "Beta", status: "fail", previous: "pass", input: "in2", expected: "ex2", actual: "ac2", note: "Wrong policy." },
  { id: "3", name: "Gamma", status: "pass", previous: "fail", input: "in3", expected: "ex3", actual: "ac3" },
  { id: "4", name: "Delta", status: "error", input: "in4", expected: "ex4", actual: "" },
]

describe("EvalScorecard", () => {
  it("says the pass rate and the change from the baseline in words", () => {
    render(<EvalScorecard cases={cases} history={[0.8, 0.75]} />)
    expect(screen.getByText("2 of 4 cases passed")).toBeInTheDocument()
    expect(screen.getByText("Down 25 points from the baseline")).toBeInTheDocument()
    expect(screen.getByText("Pass rate over the last 2 runs, from 80% to 75%")).toBeInTheDocument()
  })

  it("marks cases that got worse or were fixed", () => {
    render(<EvalScorecard cases={cases} />)
    expect(screen.getAllByText("Got worse").length).toBeGreaterThan(1)
    expect(screen.getAllByText("Fixed").length).toBeGreaterThan(1)
  })

  it("filters to failed and to cases that got worse", async () => {
    const user = userEvent.setup()
    render(<EvalScorecard cases={cases} />)
    await user.click(screen.getByRole("button", { name: /^Failed/ }))
    expect(screen.getByText("Beta")).toBeInTheDocument()
    expect(screen.getByText("Delta")).toBeInTheDocument()
    expect(screen.queryByText("Alpha")).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /^Got worse/ }))
    expect(screen.queryByText("Delta")).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: /^Got worse/ })).toHaveAttribute("aria-pressed", "true")
  })

  it("opens a case to show the question, a good answer and what the model said", async () => {
    const user = userEvent.setup()
    render(<EvalScorecard cases={cases} />)
    const row = screen.getByRole("button", { name: /Beta/ })
    expect(row).toHaveAttribute("aria-expanded", "false")
    await user.click(row)
    expect(screen.getByText("Wrong policy.")).toBeInTheDocument()
    expect(screen.getByText("in2")).toBeInTheDocument()
    expect(screen.getByText("ex2")).toBeInTheDocument()
    expect(screen.getByText("ac2")).toBeInTheDocument()
  })

  it("runs the failed cases again and shows why when that fails", async () => {
    const user = userEvent.setup()
    const onRerun = vi.fn().mockRejectedValueOnce(new Error("The runner is busy."))
    render(<EvalScorecard cases={cases} onRerun={onRerun} />)
    await user.click(screen.getByRole("button", { name: "Run the 2 failed again" }))
    expect(onRerun).toHaveBeenCalledWith(["2", "4"])
    expect(await screen.findByRole("alert")).toHaveTextContent("The runner is busy.")
  })

  it("celebrates when nothing failed", async () => {
    const user = userEvent.setup()
    render(<EvalScorecard cases={cases.filter((c) => c.status === "pass")} />)
    await user.click(screen.getByRole("button", { name: /^Failed/ }))
    expect(screen.getByText("Every case passed.")).toBeInTheDocument()
  })
})
