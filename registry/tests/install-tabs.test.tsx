import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { InstallTabs } from "@/components/ballmac/install-tabs"

describe("InstallTabs", () => {
  it("shows each package manager's runner and moves with arrow keys", async () => {
    render(<InstallTabs command="shadcn@latest add @ballmac/button" defaultValue="pnpm" />)
    expect(screen.getByText(/pnpm dlx shadcn@latest add @ballmac\/button/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole("tab", { name: "bun" }))
    expect(screen.getByText(/bunx --bun shadcn@latest add @ballmac\/button/)).toBeInTheDocument()
    screen.getByRole("tab", { name: "bun" }).focus()
    await userEvent.keyboard("{ArrowLeft}")
    expect(screen.getByRole("tab", { name: "yarn" })).toHaveFocus()
  })
})
