import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { HandoffCard } from "@/components/ballmac/handoff-card"

const base = { from: { name: "Planner", role: "Plans" }, to: { name: "Coder Agent" }, title: "Add a retry" }

describe("HandoffCard", () => {
  it("is an article named by its title, with both agents and the direction in words", () => {
    render(<HandoffCard {...base} />)
    const card = screen.getByRole("article", { name: "Add a retry" })
    expect(within(card).getByText("Planner")).toBeInTheDocument()
    expect(within(card).getByText("Coder Agent")).toBeInTheDocument()
    expect(within(card).getByRole("img", { name: "hands over to" })).toBeInTheDocument()
    expect(within(card).getByText("CA")).toBeInTheDocument()
  })
  it("shows the status as words, with the default text or your own", () => {
    const { rerender } = render(<HandoffCard {...base} />)
    expect(screen.getByText("Waiting to be picked up")).toBeInTheDocument()
    rerender(<HandoffCard {...base} status="accepted" />)
    expect(screen.getByText("Accepted")).toBeInTheDocument()
    rerender(<HandoffCard {...base} status="returned" statusLabel="Needs an answer" />)
    expect(screen.getByText("Needs an answer")).toBeInTheDocument()
  })
  it("lists context with sizes, questions and rules, each in its own labelled section", () => {
    render(<HandoffCard {...base} context={[{ label: "The plan", detail: "four steps", size: "1.2k tokens" }]} questions={["Which runner?"]} constraints={["No new dependencies"]} />)
    expect(within(screen.getByRole("region", { name: "Context passed" })).getByText("1.2k tokens")).toBeInTheDocument()
    expect(within(screen.getByRole("region", { name: "Open questions" })).getByText("Which runner?")).toBeInTheDocument()
    expect(within(screen.getByRole("region", { name: "Rules to keep" })).getByText("No new dependencies")).toBeInTheDocument()
  })
  it("leaves out empty sections and renders the actions you pass", () => {
    render(<HandoffCard {...base} actions={<button type="button">Accept</button>} />)
    expect(screen.queryByRole("region", { name: "Context passed" })).toBeNull()
    expect(screen.getByRole("button", { name: "Accept" })).toBeInTheDocument()
  })
})
