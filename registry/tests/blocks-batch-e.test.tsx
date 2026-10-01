import * as React from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it } from "vitest"

import { Devices1 } from "@/components/ballmac/blocks/devices-1/devices-1"
import { Download1 } from "@/components/ballmac/blocks/download-1/download-1"
import { Features7 } from "@/components/ballmac/blocks/features-7/features-7"
import { Pricing4 } from "@/components/ballmac/blocks/pricing-4/pricing-4"
import { Showcase1 } from "@/components/ballmac/blocks/showcase-1/showcase-1"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

describe("Showcase1", () => {
  it("renders a menu bar, the dock and the first windows", () => {
    render(<Showcase1 app="Tempo" />)
    expect(screen.getByRole("menubar", { name: "Menu bar" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Tempo/ })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Notes/ })).toBeInTheDocument()
  })

  it("leaves the Notes dock item out when notes is false", () => {
    render(<Showcase1 notes={false} />)
    expect(screen.queryByRole("button", { name: /Notes/ })).not.toBeInTheDocument()
  })

  it("shows a fixed clock from the time prop", () => {
    render(<Showcase1 time="2026-10-01T14:05:00" />)
    expect(screen.getByText(/2:05 PM/)).toBeInTheDocument()
  })
})

describe("Download1", () => {
  it("swaps the file, size and checksum when the chip changes", async () => {
    const user = userEvent.setup()
    render(<Download1 />)
    const link = screen.getByRole("link", { name: /Download/ })
    const armFile = link.nextElementSibling?.textContent
    expect(armFile).toMatch(/arm64/)
    await user.click(screen.getByRole("radio", { name: "Intel" }))
    expect(link.nextElementSibling?.textContent).not.toBe(armFile)
    expect(link.nextElementSibling?.textContent).toMatch(/x64|intel/i)
  })

  it("announces the download after the link is activated", async () => {
    const user = userEvent.setup()
    render(<Download1 />)
    const link = screen.getByRole("link", { name: /Download/ })
    link.addEventListener("click", (e) => e.preventDefault())
    await user.click(link)
    expect(link.nextElementSibling).toHaveTextContent(/should start/)
  })

  it("hides the Homebrew row when brew is null", () => {
    render(<Download1 brew={null} />)
    expect(screen.queryByText("Homebrew")).not.toBeInTheDocument()
    expect(screen.getByText("SHA-256")).toBeInTheDocument()
  })

  it("switches the release notes version", async () => {
    const user = userEvent.setup()
    render(<Download1 />)
    await user.click(screen.getByRole("radio", { name: "2.3.2" }))
    expect(screen.getAllByText(/2\.3\.2/).length).toBeGreaterThan(0)
  })
})

describe("Devices1", () => {
  it("has four toggle buttons and highlights one on click", async () => {
    const user = userEvent.setup()
    render(<Devices1 />)
    const group = screen.getByRole("group", { name: "Choose a device to highlight" })
    const buttons = within(group).getAllByRole("button")
    expect(buttons).toHaveLength(4)
    expect(buttons.every((b) => b.getAttribute("aria-pressed") === "false")).toBe(true)
    await user.click(buttons[1])
    expect(buttons[1]).toHaveAttribute("aria-pressed", "true")
    await user.click(buttons[1])
    expect(buttons[1]).toHaveAttribute("aria-pressed", "false")
  })

  it("applies a custom title", () => {
    render(<Devices1 title="Everywhere" />)
    expect(screen.getByRole("heading", { name: "Everywhere" })).toBeInTheDocument()
  })
})

describe("Features7", () => {
  it("switches the previewed feature with the arrow keys", async () => {
    const user = userEvent.setup()
    render(<Features7 />)
    const radios = screen.getAllByRole("radio")
    expect(radios[0]).toBeChecked()
    await user.tab()
    await user.keyboard("{ArrowDown}")
    expect(radios[1]).toHaveFocus()
    await user.keyboard(" ")
    expect(radios[1]).toBeChecked()
    expect(radios[0]).not.toBeChecked()
  })
})

describe("Pricing4", () => {
  it("shows the one-time price and a break-even year by default", () => {
    render(<Pricing4 />)
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("pays for itself in year 2")
    expect(screen.getByRole("link", { name: "Buy a license" })).toBeInTheDocument()
  })

  it("switches to the subscription", async () => {
    const user = userEvent.setup()
    render(<Pricing4 />)
    await user.click(screen.getByRole("radio", { name: "Subscribe" }))
    expect(screen.getByRole("link", { name: "Start subscription" })).toBeInTheDocument()
    expect(screen.getByText("per year")).toBeInTheDocument()
  })

  it("recomputes when the license size changes", async () => {
    const user = userEvent.setup()
    render(<Pricing4 />)
    await user.click(screen.getByRole("radio", { name: /1 Mac/ }))
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(/year 2/)
    expect(screen.getByText(/What you pay over time · 1 Mac/i)).toBeInTheDocument()
  })

  it("moves the break-even later when updates are included", async () => {
    const user = userEvent.setup()
    render(<Pricing4 tiers={[{ id: "a", name: "One", once: 100, yearly: 60 }]} renewal={50} years={5} />)
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("year 2")
    await user.click(screen.getByRole("switch"))
    // 100 + 50 per year of updates: 150 vs 120 in year 2, 200 vs 180 in year 3, 250 vs 240 in year 4, 300 vs 300 in year 5
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("year 5")
  })

  it("says the subscription is cheaper when it never catches up", () => {
    render(<Pricing4 tiers={[{ id: "a", name: "One", once: 500, yearly: 20 }]} renewal={0} years={3} />)
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(/Subscribing costs less/)
    expect(screen.queryByRole("switch")).not.toBeInTheDocument()
  })

  it("builds the link from the tier and mode", () => {
    render(<Pricing4 href={(t, m) => `/buy/${t}/${m}`} defaultTier="solo" />)
    expect(screen.getByRole("link", { name: "Buy a license" })).toHaveAttribute("href", "/buy/solo/once")
  })
})
