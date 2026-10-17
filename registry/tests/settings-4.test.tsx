import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Settings4, type Settings4Integration } from "@/components/ballmac/blocks/settings-4/settings-4"

const integrations: Settings4Integration[] = [
  { id: "chat", name: "Team chat", description: "Post updates.", category: "Communication", connected: true, account: "acme-team" },
  { id: "cal", name: "Calendar", description: "Show due dates.", category: "Productivity" },
  { id: "sheets", name: "Spreadsheets", description: "Export views.", category: "Productivity", comingSoon: true },
]

describe("Settings4", () => {
  it("connects and moves the integration to Connected with its account", async () => {
    const user = userEvent.setup()
    const onConnect = vi.fn().mockResolvedValue("work-calendar")
    render(<Settings4 integrations={integrations} onConnect={onConnect} />)
    await user.click(screen.getByRole("button", { name: "Connect Calendar" }))
    expect(onConnect).toHaveBeenCalledWith("cal")
    expect(await screen.findByText("work-calendar")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Disconnect Calendar" })).toBeInTheDocument()
  })

  it("shows why a connection failed on the card", async () => {
    const user = userEvent.setup()
    render(<Settings4 integrations={integrations} onConnect={() => Promise.reject(new Error("Access was denied."))} />)
    await user.click(screen.getByRole("button", { name: "Connect Calendar" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("Access was denied.")
  })

  it("confirms before disconnecting", async () => {
    const user = userEvent.setup()
    const onDisconnect = vi.fn()
    render(<Settings4 integrations={integrations} onDisconnect={onDisconnect} />)
    await user.click(screen.getByRole("button", { name: "Disconnect Team chat" }))
    expect(screen.getByRole("alertdialog")).toHaveTextContent("Disconnect Team chat?")
    await user.click(screen.getByRole("button", { name: "Disconnect" }))
    expect(onDisconnect).toHaveBeenCalledWith("chat")
    expect(await screen.findByRole("button", { name: "Connect Team chat" })).toBeInTheDocument()
  })

  it("filters by category and hides Connect on coming-soon entries", async () => {
    const user = userEvent.setup()
    render(<Settings4 integrations={integrations} />)
    await user.click(screen.getByRole("button", { name: "Communication" }))
    expect(screen.queryByText("Calendar")).toBeNull()
    await user.click(screen.getByRole("button", { name: "Productivity" }))
    expect(screen.getByText("Coming soon")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Connect Spreadsheets" })).toBeNull()
  })
})
