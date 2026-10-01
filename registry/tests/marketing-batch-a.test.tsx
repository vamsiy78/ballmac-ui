import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it } from "vitest"

import { Cta3 } from "@/components/ballmac/blocks/cta-3/cta-3"
import { Features5 } from "@/components/ballmac/blocks/features-5/features-5"
import { Footer2 } from "@/components/ballmac/blocks/footer-2/footer-2"
import { Hero6, Hero6Float } from "@/components/ballmac/blocks/hero-6/hero-6"
import { Hero7 } from "@/components/ballmac/blocks/hero-7/hero-7"
import { Stats1 } from "@/components/ballmac/blocks/stats-1/stats-1"
import { Team1 } from "@/components/ballmac/blocks/team-1/team-1"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

describe("Hero6", () => {
  it("renders the headline with highlighted words, actions and the floating cards", () => {
    render(<Hero6 />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("actually enjoys.")
    expect(screen.getByRole("link", { name: /Start for free/ })).toBeInTheDocument()
    expect(screen.getByText("Payment received")).toBeInTheDocument()
  })

  it("lets you replace the cards", () => {
    render(<Hero6 cards={<Hero6Float>Custom card</Hero6Float>} />)
    expect(screen.getByText("Custom card")).toBeInTheDocument()
    expect(screen.queryByText("Payment received")).not.toBeInTheDocument()
  })
})

describe("Hero7", () => {
  it("renders the copy and a sample screen hidden from assistive technology", () => {
    render(<Hero7 />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("one calm view")
    expect(screen.queryByRole("heading", { name: /Recent invoices/ })).not.toBeInTheDocument()
    expect(document.querySelector("[aria-hidden=true][inert]")).toHaveTextContent("Recent invoices")
  })

  it("shows a screenshot instead of the sample when given one", () => {
    render(<Hero7 screenshot={{ src: "/shot.png", alt: "The dashboard" }} />)
    expect(screen.getByRole("img", { name: "The dashboard" })).toHaveAttribute("src", "/shot.png")
  })
})

describe("Features5", () => {
  it("lists every step in order with its points", () => {
    render(<Features5 />)
    const steps = screen.getAllByRole("heading", { level: 3 })
    expect(steps.map((s) => s.textContent)).toEqual([
      "Capture anything in seconds",
      "Turn it into a plan",
      "Automate the busywork",
      "Share with exactly who needs it",
    ])
    expect(screen.getByText("Paste a link to unfurl it")).toBeInTheDocument()
  })

  it("marks the step in view as active", () => {
    const { container } = render(<Features5 />)
    // The test IntersectionObserver reports every step as visible, so the last one wins.
    expect(container.querySelectorAll("li[data-active=true]")).toHaveLength(1)
  })
})

describe("Stats1", () => {
  it("renders a definition list of metrics with their change and context", () => {
    render(<Stats1 />)
    expect(screen.getAllByRole("term")).toHaveLength(4)
    expect(screen.getByText("+18%")).toBeInTheDocument()
    expect(screen.getByRole("img", { name: /Teams, last 9 months/ })).toBeInTheDocument()
  })

  it("hides the link when null", () => {
    render(<Stats1 link={null} />)
    expect(screen.queryByRole("link")).not.toBeInTheDocument()
  })
})

describe("Team1", () => {
  it("lists members with names, roles, locations and labelled links", () => {
    render(<Team1 />)
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(8)
    expect(screen.getByRole("link", { name: "Priya’s website" })).toBeInTheDocument()
    expect(screen.getByText("Lisbon")).toBeInTheDocument()
  })

  it("hides the action when null", () => {
    render(<Team1 action={null} />)
    expect(screen.queryByRole("link", { name: /open roles/ })).not.toBeInTheDocument()
  })
})

describe("Cta3", () => {
  it("shows the install command per package manager", async () => {
    const user = userEvent.setup()
    render(<Cta3 />)
    expect(screen.getByText(/pnpm dlx create-acme@latest my-app/)).toBeInTheDocument()
    await user.click(screen.getByRole("tab", { name: "npm" }))
    expect(screen.getByText(/npx create-acme@latest my-app/)).toBeInTheDocument()
  })
})

describe("Footer2", () => {
  it("renders the link columns, the status and legal links", () => {
    render(<Footer2 />)
    expect(screen.getByRole("navigation", { name: "Footer" })).toBeInTheDocument()
    expect(screen.getByText("All systems operational")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Privacy" })).toBeInTheDocument()
  })

  it("hides the status when null and keeps the wordmark decorative", () => {
    render(<Footer2 status={null} wordmark="northwind" />)
    expect(screen.queryByText("All systems operational")).not.toBeInTheDocument()
    expect(screen.getByText("northwind").closest("[aria-hidden=true]")).not.toBeNull()
  })
})
