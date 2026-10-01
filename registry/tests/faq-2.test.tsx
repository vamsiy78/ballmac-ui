import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Faq2 } from "@/components/ballmac/blocks/faq-2/faq-2"

describe("Faq2", () => {
  it("lists every question with counts on the topic filters", () => {
    render(<Faq2 />)
    expect(screen.getAllByRole("button", { name: /\?/ })).toHaveLength(10)
    expect(screen.getByRole("button", { name: /^All/ })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("status")).toHaveTextContent("10 questions shown")
  })

  it("filters by topic", async () => {
    const user = userEvent.setup()
    render(<Faq2 />)
    const security = screen.getByRole("button", { name: /^Security\s*3$/ })
    await user.click(security)
    expect(security).toHaveAttribute("aria-pressed", "true")
    expect(screen.getAllByRole("button", { name: /\?/ })).toHaveLength(3)
    expect(screen.getByRole("status")).toHaveTextContent("3 questions shown")
  })

  it("searches questions and answers and highlights the match", async () => {
    const user = userEvent.setup()
    render(<Faq2 />)
    await user.type(screen.getByRole("searchbox", { name: "Search questions" }), "single")
    expect(screen.getAllByRole("button", { name: /sign-on/ })).toHaveLength(1)
    expect(document.querySelectorAll("mark").length).toBeGreaterThan(0)
  })

  it("shows an empty state that can be cleared", async () => {
    const user = userEvent.setup()
    render(<Faq2 />)
    await user.type(screen.getByRole("searchbox"), "zzzz")
    expect(screen.getByText("No answers found")).toBeInTheDocument()
    expect(screen.getByRole("status")).toHaveTextContent("No questions match")
    await user.click(screen.getByRole("button", { name: "Reset filters" }))
    expect(screen.getAllByRole("button", { name: /\?/ })).toHaveLength(10)
  })

  it("escapes regular expression characters in the query", async () => {
    const user = userEvent.setup()
    render(<Faq2 />)
    await user.type(screen.getByRole("searchbox"), "(")
    expect(screen.getByText("No answers found")).toBeInTheDocument()
  })
})
