import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { DecisionTrace } from "@/components/ballmac/decision-trace"

const options = [
  { id: "a", label: "Search docs", score: 0.9, reason: "It is written down.", pros: ["Cheap"], cons: ["Generic"] },
  { id: "b", label: "Ask a person", score: 0.3, reason: "Slow.", cost: "4 hours" },
]

describe("DecisionTrace", () => {
  it("marks the highest score as chosen in words and shows the others as not chosen", () => {
    render(<DecisionTrace question="What to do?" options={options} />)
    expect(screen.getByRole("heading", { name: "What to do?" })).toBeInTheDocument()
    expect(screen.getByText("Chosen")).toBeInTheDocument()
    expect(screen.getByText("Not chosen")).toBeInTheDocument()
    expect(screen.getByText("90%")).toBeInTheDocument()
  })

  it("opens the chosen option first and toggles others with aria-expanded", async () => {
    const user = userEvent.setup()
    render(<DecisionTrace question="q" options={options} />)
    expect(screen.getByText("It is written down.")).toBeInTheDocument()
    const b = screen.getByRole("button", { name: /Ask a person/ })
    expect(b).toHaveAttribute("aria-expanded", "false")
    await user.click(b)
    expect(screen.getByText("Slow.")).toBeInTheDocument()
    expect(screen.getByText("4 hours")).toBeInTheDocument()
  })

  it("lets a person choose another option and reports it", async () => {
    const user = userEvent.setup()
    const onOverride = vi.fn().mockResolvedValue(undefined)
    render(<DecisionTrace question="q" options={options} onOverride={onOverride} />)
    await user.click(screen.getByRole("button", { name: /Ask a person/ }))
    await user.click(screen.getByRole("button", { name: "Use this instead" }))
    expect(onOverride).toHaveBeenCalledWith("b")
    expect(await screen.findByText("Now using Ask a person")).toBeInTheDocument()
    expect(screen.getByText("The agent's pick")).toBeInTheDocument()
  })

  it("puts the choice back and says why when the override is rejected", async () => {
    const user = userEvent.setup()
    render(<DecisionTrace question="q" options={options} onOverride={() => Promise.reject(new Error("Not allowed."))} />)
    await user.click(screen.getByRole("button", { name: /Ask a person/ }))
    await user.click(screen.getByRole("button", { name: "Use this instead" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("Not allowed.")
    expect(screen.queryByText("The agent's pick")).not.toBeInTheDocument()
  })

  it("offers no override without a handler", () => {
    render(<DecisionTrace question="q" options={options} />)
    expect(screen.queryByRole("button", { name: "Use this instead" })).not.toBeInTheDocument()
  })
})
