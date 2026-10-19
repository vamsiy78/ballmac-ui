import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import QuestionnaireDemo from "../examples/questionnaire-demo"
import QuestionnaireMultiple from "../examples/questionnaire-multiple"
import QuestionnaireValidation from "../examples/questionnaire-validation"

describe("Questionnaire", () => {
  it("shows one question at a time with a named progress bar", () => {
    render(<QuestionnaireDemo />)
    expect(screen.getByText("What should we prototype next?")).toBeVisible()
    expect(screen.getByRole("progressbar")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument()
  })

  it("moves on after an answer and hands over native form data on submit", async () => {
    const user = userEvent.setup()
    render(<QuestionnaireDemo />)
    await user.click(screen.getByRole("radio", { name: /Delegation/ }))
    await user.click(screen.getByRole("button", { name: /next/i }))
    expect(screen.getByText("How much detail should it include?")).toBeVisible()
    await user.click(screen.getByRole("radio", { name: "Focused" }))
    await user.click(screen.getByRole("button", { name: /submit/i }))
    expect(await screen.findByText(/"direction": "delegation"/)).toBeInTheDocument()
    expect(screen.getByText(/"detail": "focused"/)).toBeInTheDocument()
  })

  it("does not advance past a required question without an answer", async () => {
    const user = userEvent.setup()
    render(<QuestionnaireDemo />)
    await user.click(screen.getByRole("button", { name: /next/i }))
    expect(screen.getByText("What should we prototype next?")).toBeVisible()
  })

  it("collects several answers for a multiple question", async () => {
    const user = userEvent.setup()
    render(<QuestionnaireMultiple />)
    await user.click(screen.getByRole("checkbox", { name: "Progress" }))
    await user.click(screen.getByRole("checkbox", { name: "Risks" }))
    await user.click(screen.getByRole("button", { name: /submit/i }))
    expect(await screen.findByText(/progress, risks/)).toBeInTheDocument()
  })

  it("lets the page validate on its own and moves to the first problem", async () => {
    const user = userEvent.setup()
    render(<QuestionnaireValidation />)
    await user.click(screen.getByRole("radio", { name: "Launch" }))
    await user.click(screen.getByRole("button", { name: /next/i }))
    await user.click(screen.getByRole("radio", { name: "Focused" }))
    await user.click(screen.getByRole("button", { name: /submit/i }))
    expect(await screen.findByText("A launch needs the complete flow.")).toBeVisible()
    await user.click(screen.getByRole("radio", { name: "Complete" }))
    await user.click(screen.getByRole("button", { name: /submit/i }))
    expect(await screen.findByRole("status")).toHaveTextContent("Thanks")
  })
})
