import * as React from "react"
import { act, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"

import { LedgerChangelog } from "@/components/ballmac/templates/ledger/ledger-changelog"
import { LedgerDownload } from "@/components/ballmac/templates/ledger/ledger-download"
import { LedgerHome } from "@/components/ballmac/templates/ledger/ledger-home"
import { LedgerPricing } from "@/components/ballmac/templates/ledger/ledger-pricing"
import { LedgerSupport } from "@/components/ballmac/templates/ledger/ledger-support"
import { NorthwindAbout } from "@/components/ballmac/templates/northwind/northwind-about"
import { NorthwindContact } from "@/components/ballmac/templates/northwind/northwind-contact"
import { NorthwindCustomers } from "@/components/ballmac/templates/northwind/northwind-customers"
import { NorthwindHome } from "@/components/ballmac/templates/northwind/northwind-home"
import { NorthwindPricing } from "@/components/ballmac/templates/northwind/northwind-pricing"
import { OrbitAgentRun } from "@/components/ballmac/templates/orbit/orbit-agent-run"
import { OrbitChangelog } from "@/components/ballmac/templates/orbit/orbit-changelog"
import { OrbitHome } from "@/components/ballmac/templates/orbit/orbit-home"
import { OrbitLogin } from "@/components/ballmac/templates/orbit/orbit-login"
import { OrbitPricing } from "@/components/ballmac/templates/orbit/orbit-pricing"
import { RelayDocs } from "@/components/ballmac/templates/relay/relay-docs"
import { RelayHome } from "@/components/ballmac/templates/relay/relay-home"
import { RelayPricing } from "@/components/ballmac/templates/relay/relay-pricing"
import { RelayStatus } from "@/components/ballmac/templates/relay/relay-status"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})
afterEach(() => vi.useRealTimers())

describe("Orbit", () => {
  it("plays the agent run to completion and replays it", async () => {
    vi.useFakeTimers()
    render(<OrbitAgentRun />)
    expect(screen.getByRole("status")).toHaveTextContent("Running")
    // Each step schedules the next from an effect, so let React settle between ticks.
    for (let i = 0; i < 7; i++) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1200)
      })
    }
    expect(screen.getByRole("status")).toHaveTextContent("Completed")
    expect(screen.getByText("$0.006")).toBeInTheDocument()
    await act(async () => {
      screen.getByRole("button", { name: /Replay/ }).click()
    })
    expect(screen.getByRole("status")).toHaveTextContent("Running")
  })

  it("renders the home page with a labelled main nav and the current page marked", () => {
    render(<OrbitHome />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("finish the job")
    const nav = screen.getByRole("navigation", { name: "Main" })
    expect(within(nav).getByRole("link", { name: "Product" })).toHaveAttribute("aria-current", "page")
  })

  it("opens the mobile menu from its button", async () => {
    const user = userEvent.setup()
    render(<OrbitHome />)
    const button = screen.getByRole("button", { name: "Open menu" })
    await user.click(button)
    expect(button).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("navigation", { name: "Mobile" })).toBeInTheDocument()
  })

  it("applies the yearly discount and changes the estimate with the slider", async () => {
    const user = userEvent.setup()
    render(<OrbitPricing />)
    expect(screen.getByText("$39")).toBeInTheDocument()
    expect(screen.getByText("$495")).toBeInTheDocument()
    screen.getByRole("slider").focus()
    await user.keyboard("{ArrowRight}")
    expect(screen.queryByText("$495")).not.toBeInTheDocument()
    await user.click(screen.getByRole("radio", { name: "Monthly" }))
    expect(screen.getByText("$49")).toBeInTheDocument()
  })

  it("renders the changelog feed and sends a sign-in link", async () => {
    const user = userEvent.setup()
    render(<OrbitChangelog />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("What we shipped")
    render(<OrbitLogin />)
    await user.type(screen.getByLabelText("Work email"), "ada@acme.co")
    await user.click(screen.getByRole("button", { name: /Email me a sign-in link/ }))
    expect(screen.getByRole("status")).toHaveTextContent("ada@acme.co")
  })
})

describe("Relay", () => {
  it("sends an event from the console and shows the response", async () => {
    const user = userEvent.setup()
    render(<RelayHome />)
    await user.click(screen.getByRole("button", { name: /^Send/ }))
    expect(await screen.findByText("HTTP/1.1 202 Accepted")).toBeInTheDocument()
  })

  it("keeps every code sample on the language you picked", async () => {
    const user = userEvent.setup()
    window.localStorage.removeItem("relay-language")
    render(<RelayDocs />)
    const tabs = screen.getAllByRole("tab", { name: "Python" })
    expect(tabs.length).toBeGreaterThan(1)
    await user.click(tabs[0])
    for (const t of screen.getAllByRole("tab", { name: "Python" })) expect(t).toHaveAttribute("aria-selected", "true")
  })

  it("estimates the Pro bill and marks the current nav link", async () => {
    const user = userEvent.setup()
    render(<RelayPricing />)
    expect(within(screen.getByRole("navigation", { name: "Main" })).getByRole("link", { name: "Pricing" })).toHaveAttribute("aria-current", "page")
    const out = screen.getByText("3,000,000")
    expect(out).toBeInTheDocument()
    screen.getByRole("slider").focus()
    await user.keyboard("{ArrowRight}")
    expect(screen.getByText("3,500,000")).toBeInTheDocument()
  })

  it("lists every component with a text summary of its history", () => {
    render(<RelayStatus />)
    expect(screen.getByRole("status")).toHaveTextContent("All systems operational")
    expect(screen.getAllByRole("img", { name: /of 90 days operational/ })).toHaveLength(5)
  })
})

describe("Ledger", () => {
  it("renders the Mac desktop and press quotes", () => {
    render(<LedgerHome />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("beautifully")
    expect(screen.getByRole("menubar", { name: "Menu bar" })).toBeInTheDocument()
  })

  it("filters help topics as you type and reports the count", async () => {
    const user = userEvent.setup()
    render(<LedgerSupport />)
    await user.type(screen.getByRole("searchbox", { name: "Search help articles" }), "license")
    expect(screen.getByRole("status")).toHaveTextContent(/1 topic match/)
    await user.clear(screen.getByRole("searchbox"))
    await user.type(screen.getByRole("searchbox"), "zzzz")
    expect(screen.getByText("Nothing found")).toBeInTheDocument()
  })

  it("renders download, pricing and changelog pages", () => {
    render(<LedgerDownload />)
    expect(screen.getByRole("link", { name: /Download Ledger/ })).toBeInTheDocument()
    render(<LedgerPricing />)
    expect(screen.getByRole("table", { name: "Trial and licensed features" })).toBeInTheDocument()
    render(<LedgerChangelog />)
    expect(screen.getAllByText(/2\.4\.0/).length).toBeGreaterThan(0)
  })
})

describe("Northwind", () => {
  it("keeps the tour steps and pins in sync", async () => {
    const user = userEvent.setup()
    render(<NorthwindHome />)
    const steps = screen.getByRole("radiogroup", { name: "Product tour steps" })
    expect(within(steps).getByRole("radio", { name: /Issue a card/ })).toBeChecked()
    const pin = (id: string) => document.querySelector(`[data-pin="${id}"]`) as HTMLElement
    expect(pin("budgets")).toHaveAttribute("aria-hidden", "true")
    await user.click(pin("budgets"))
    expect(within(steps).getByRole("radio", { name: /Budgets that warn early/ })).toBeChecked()
    await user.click(within(steps).getByRole("radio", { name: /Approve from anywhere/ }))
    expect(document.querySelector('[data-region="approvals"]')).toHaveAttribute("data-active", "true")
  })

  it("applies the annual discount to plan prices", async () => {
    const user = userEvent.setup()
    render(<NorthwindPricing />)
    expect(screen.getByText("$6")).toBeInTheDocument()
    await user.click(screen.getByRole("radio", { name: "Monthly" }))
    expect(screen.getByText("$8")).toBeInTheDocument()
  })

  it("validates the demo form, focuses the first problem and confirms on success", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<NorthwindContact />)
    await user.click(screen.getByRole("button", { name: "Request a demo" }))
    expect(screen.getByText("Tell us your name.")).toBeInTheDocument()
    expect(screen.getByLabelText("Full name")).toHaveFocus()
    expect(screen.getByLabelText("Full name")).toHaveAttribute("aria-invalid", "true")
    await user.type(screen.getByLabelText("Full name"), "Ada Lovelace")
    await user.type(screen.getByLabelText("Work email"), "ada@acme.co")
    await user.selectOptions(screen.getByLabelText("Team size"), "26–100 people")
    await user.click(screen.getByRole("button", { name: "Request a demo" }))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(800)
    })
    expect(screen.getByRole("status")).toHaveTextContent("Thanks, Ada.")
  })

  it("renders customers and about pages", () => {
    render(<NorthwindCustomers />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("weekends")
    render(<NorthwindAbout />)
    expect(screen.getAllByRole("heading", { level: 1 }).at(-1)).toHaveTextContent("quiet")
  })
})
