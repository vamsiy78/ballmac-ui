import * as React from "react"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { Quiz1, type Quiz1Question } from "@/components/ballmac/blocks/quiz-1/quiz-1"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

const qs: Quiz1Question[] = [
  { id: "q1", prompt: "Pick the owner", options: [{ id: "a", text: "Alice" }, { id: "b", text: "Bob" }], answer: "b", explanation: "Bob owns it." },
  { id: "q2", prompt: "Pick all primes", options: [{ id: "a", text: "2" }, { id: "b", text: "4" }, { id: "c", text: "5" }], answer: ["a", "c"] },
]

describe("Quiz1", () => {
  it("uses radio buttons for one answer and checkboxes for several", async () => {
    const user = userEvent.setup()
    render(<Quiz1 questions={qs} />)
    expect(screen.getByRole("group", { name: "Choose one answer" })).toBeInTheDocument()
    expect(screen.getAllByRole("radio")).toHaveLength(2)
    await user.click(screen.getByRole("radio", { name: "Bob" }))
    await user.click(screen.getByRole("button", { name: "Check answer" }))
    await user.click(screen.getByRole("button", { name: "Next question" }))
    expect(screen.getByRole("group", { name: "Choose all the answers that apply" })).toBeInTheDocument()
    expect(screen.getAllByRole("checkbox")).toHaveLength(3)
  })

  it("cannot check until something is chosen, then says right with the reason", async () => {
    const user = userEvent.setup()
    render(<Quiz1 questions={qs} />)
    expect(screen.getByRole("button", { name: "Check answer" })).toBeDisabled()
    await user.click(screen.getByRole("radio", { name: "Bob" }))
    await user.click(screen.getByRole("button", { name: "Check answer" }))
    expect(screen.getByRole("status")).toHaveTextContent("That is right")
    expect(screen.getByRole("status")).toHaveTextContent("Bob owns it.")
  })

  it("says wrong, marks both options in words, and locks the answers", async () => {
    const user = userEvent.setup()
    render(<Quiz1 questions={qs} />)
    await user.click(screen.getByRole("radio", { name: "Alice" }))
    await user.click(screen.getByRole("button", { name: "Check answer" }))
    expect(screen.getByRole("status")).toHaveTextContent("Not quite")
    expect(screen.getByRole("radio", { name: /Alice \(your answer, wrong\)/ })).toBeDisabled()
    expect(screen.getByRole("radio", { name: /Bob \(correct answer\)/ })).toBeDisabled()
  })

  it("moves focus to each new question", async () => {
    const user = userEvent.setup()
    render(<Quiz1 questions={qs} />)
    await user.click(screen.getByRole("radio", { name: "Bob" }))
    await user.click(screen.getByRole("button", { name: "Check answer" }))
    await user.click(screen.getByRole("button", { name: "Next question" }))
    await waitFor(() => expect(screen.getByRole("heading", { name: "Pick all primes" })).toHaveFocus())
  })

  it("scores against the pass mark, reports once, and reviews wrong answers", async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<Quiz1 questions={qs} passMark={0.7} onComplete={onComplete} />)
    await user.click(screen.getByRole("radio", { name: "Bob" }))
    await user.click(screen.getByRole("button", { name: "Check answer" }))
    await user.click(screen.getByRole("button", { name: "Next question" }))
    await user.click(screen.getByRole("checkbox", { name: "2" }))
    await user.click(screen.getByRole("checkbox", { name: "4" }))
    await user.click(screen.getByRole("button", { name: "Check answer" }))
    await user.click(screen.getByRole("button", { name: "See my score" }))
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith({ score: 1, total: 2, passed: false, answers: { q1: ["b"], q2: ["a", "b"] } })
    expect(screen.getByRole("heading", { name: "Not quite yet" })).toBeInTheDocument()
    expect(screen.getByText(/You chose 2; 4. Right answer: 2; 5./)).toBeInTheDocument()
  })

  it("passes when enough are right, and can be retaken", async () => {
    const user = userEvent.setup()
    render(<Quiz1 questions={qs} passMark={0.5} defaultAnswers={{ q1: ["b"], q2: ["a"] }} />)
    expect(screen.getByRole("heading", { name: "You passed" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Take it again" }))
    expect(screen.getByRole("heading", { name: "Pick the owner" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Check answer" })).toBeDisabled()
  })

  it("says so when there are no questions", () => {
    render(<Quiz1 questions={[]} />)
    expect(screen.getByText("This quiz has no questions yet.")).toBeInTheDocument()
  })
})
