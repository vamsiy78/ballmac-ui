import * as React from "react"
import { render, screen, within } from "@testing-library/react"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it } from "vitest"

import { About1 } from "@/components/ballmac/blocks/about-1/about-1"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

describe("About1", () => {
  it("has one h1 with both lines of the statement, and a section heading for each part", () => {
    render(<About1 />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("We make software for people who make things.Quietly, and for the long run.")
    expect(screen.getByRole("heading", { level: 2, name: "What we believe" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { level: 2, name: "How we got here" })).toBeInTheDocument()
  })

  it("shows a year as written and counts the other stats", async () => {
    render(<About1 />)
    // the year is in the stats and again in the timeline
    expect(screen.getAllByText("2019").length).toBe(2)
    expect(await screen.findByText("74")).toBeInTheDocument()
    expect(screen.getByText("Founded")).toBeInTheDocument()
  })

  it("renders the quote as a blockquote with its caption, values and an ordered timeline", () => {
    render(<About1 />)
    const quote = screen.getByRole("blockquote")
    expect(quote).toHaveTextContent("The best compliment we get")
    expect(quote.closest("figure")).toHaveTextContent("Mara Ellison")
    expect(screen.getAllByRole("heading", { level: 3 }).slice(0, 4).map((h) => h.textContent)).toEqual(["Make it quiet", "Be honest about trade-offs", "Build for the long term", "Treat people as adults"])
    expect(document.querySelectorAll("ol > li")).toHaveLength(5)
  })

  it("leaves a section out when you leave its content out", () => {
    render(<About1 stats={[]} values={[]} milestones={[]} cta={null} quote={null} />)
    expect(screen.queryByText("What we believe")).toBeNull()
    expect(screen.queryByText("How we got here")).toBeNull()
    expect(screen.queryByRole("blockquote")).toBeNull()
    expect(screen.getByText("Our story")).toBeInTheDocument()
  })

  it("links the call to action", () => {
    render(<About1 cta={{ title: "Join us", primary: { label: "See open roles", href: "/careers" }, secondary: { label: "Talk to us", href: "/contact" } }} />)
    expect(screen.getByRole("link", { name: "See open roles" })).toHaveAttribute("href", "/careers")
    expect(within(screen.getByRole("heading", { name: "Join us" }).parentElement!).getByRole("link", { name: "Talk to us" })).toHaveAttribute("href", "/contact")
  })
})
