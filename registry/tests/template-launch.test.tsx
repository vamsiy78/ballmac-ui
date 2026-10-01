import * as React from "react"
import { cleanup, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { afterEach, beforeAll, describe, expect, it } from "vitest"

import { LaunchChangelog } from "@/components/ballmac/templates/launch/launch-changelog"
import { LaunchContact } from "@/components/ballmac/templates/launch/launch-contact"
import { LaunchPage } from "@/components/ballmac/templates/launch/launch-page"
import { LaunchPricing } from "@/components/ballmac/templates/launch/launch-pricing"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})
afterEach(() => cleanup())

describe("Launch template", () => {
  it("composes the home page from blocks with Beacon's links", () => {
    render(<LaunchPage hrefs={{ pricing: "/p" }} />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Ship every branch with nothing to fear.")
    expect(within(screen.getByRole("navigation", { name: "Main" })).getByRole("link", { name: "Pricing" })).toHaveAttribute("href", "/p")
    expect(screen.getByRole("heading", { name: "Preview it. Check it. Undo it." })).toBeInTheDocument()
  })

  it("shows plans, the comparison and the FAQ on the pricing page", () => {
    render(<LaunchPricing />)
    expect(screen.getByRole("heading", { name: "Pay for the team you have." })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Compare every feature" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Pricing questions" })).toBeInTheDocument()
  })

  it("lists releases and reveals older ones", async () => {
    const user = userEvent.setup()
    render(<LaunchChangelog />)
    expect(screen.getByRole("heading", { name: "Automatic rollbacks" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /older releases/i }))
    expect(screen.getByRole("heading", { name: "Beacon 3" })).toBeInTheDocument()
  })

  it("validates the contact form", async () => {
    const user = userEvent.setup()
    render(<LaunchContact />)
    expect(screen.getByRole("heading", { name: "Talk to a person." })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /send/i }))
    expect(screen.getAllByRole("alert").length).toBeGreaterThan(0)
  })
})
