import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it } from "vitest"

import { Header2 } from "@/components/ballmac/blocks/header-2/header-2"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

describe("Header2", () => {
  it("renders the brand, main navigation and both actions", () => {
    render(<Header2 />)
    expect(screen.getByRole("link", { name: /Acme/ })).toBeInTheDocument()
    expect(screen.getByRole("navigation", { name: "Main" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Get started" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Pricing" })).toBeInTheDocument()
  })

  it("opens the mobile sheet, lists the links as disclosures and closes on Escape", async () => {
    const user = userEvent.setup()
    render(<Header2 />)
    await user.click(screen.getByRole("button", { name: "Open menu" }))
    const sheet = await screen.findByRole("dialog")
    expect(sheet).toHaveTextContent("Product")
    await user.keyboard("{Escape}")
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("closes the sheet when a link is chosen", async () => {
    const user = userEvent.setup()
    render(<Header2 />)
    await user.click(screen.getByRole("button", { name: "Open menu" }))
    const dialog = await screen.findByRole("dialog")
    const links = dialog.querySelectorAll("a")
    await user.click(Array.from(links).find((a) => a.textContent === "Pricing")!)
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("is sticky unless told otherwise", () => {
    const { rerender, container } = render(<Header2 />)
    expect(container.querySelector("header")).toHaveClass("sticky")
    rerender(<Header2 sticky={false} />)
    expect(container.querySelector("header")).not.toHaveClass("sticky")
  })
})
