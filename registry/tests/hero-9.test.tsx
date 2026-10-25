import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Hero9 } from "@/components/ballmac/blocks/hero-9/hero-9"

describe("Hero9", () => {
  it("has one heading, the actions as links and the note", () => {
    render(<Hero9 primaryAction={{ label: "Start", href: "/start" }} secondaryAction={{ label: "Docs", href: "/docs" }} note="Free forever." />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Software that grows with you")
    expect(screen.getByRole("link", { name: "Start" })).toHaveAttribute("href", "/start")
    expect(screen.getByRole("link", { name: "Docs" })).toHaveAttribute("href", "/docs")
    expect(screen.getByText("Free forever.")).toBeInTheDocument()
  })

  it("leaves the tree out of the accessibility tree", () => {
    const { container } = render(<Hero9 />)
    expect(container.querySelector('[data-slot="particle-tree"]')).toHaveAttribute("aria-hidden", "true")
  })

  it("can drop the eyebrow and the note", () => {
    render(<Hero9 eyebrow="" note="" />)
    expect(screen.queryByText("Now in public beta")).not.toBeInTheDocument()
  })
})
