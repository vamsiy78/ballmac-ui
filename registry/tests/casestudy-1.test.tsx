import * as React from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it } from "vitest"

import { CaseStudy1 } from "@/components/ballmac/blocks/casestudy-1/casestudy-1"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

describe("CaseStudy1", () => {
  it("features the first story with its quote and gives every result a label", () => {
    render(<CaseStudy1 />)
    expect(screen.getByRole("heading", { level: 2, name: "Teams that got their time back" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { level: 3, name: /Northwind cut onboarding/ })).toBeInTheDocument()
    expect(screen.getByText(/stopped asking where the latest version lived/)).toBeInTheDocument()
    const featured = screen.getByRole("heading", { level: 3, name: /Northwind/ }).closest("article")!
    expect(within(featured).getByText("faster onboarding").tagName).toBe("DT")
  })

  it("links each story and tells a screen reader which company", () => {
    render(<CaseStudy1 />)
    expect(screen.getByRole("link", { name: /Read the story about Northwind/ })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Lumen Health answers patients/ })).toBeInTheDocument()
  })

  it("filters by industry and says which filter is on", async () => {
    const user = userEvent.setup()
    render(<CaseStudy1 />)
    const all = screen.getByRole("button", { name: "All" })
    expect(all).toHaveAttribute("aria-pressed", "true")
    await user.click(screen.getByRole("button", { name: "Healthcare" }))
    expect(screen.getByRole("button", { name: "Healthcare" })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("heading", { level: 3, name: /Lumen Health/ })).toBeInTheDocument()
    expect(screen.queryByRole("heading", { name: /Northwind/ })).toBeNull()
  })

  it("hides the filter when there is one industry", () => {
    render(<CaseStudy1 stories={[{ id: "a", company: "Acme", industry: "Retail", headline: "Acme grew", metrics: [{ value: 5, label: "more" }] }]} />)
    expect(screen.queryByRole("group", { name: "Filter by industry" })).toBeNull()
    expect(screen.getByRole("heading", { level: 3, name: "Acme grew" })).toBeInTheDocument()
  })
})
