import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Desktop6 } from "@/components/ballmac/blocks/desktop-6/desktop-6"

describe("Desktop6", () => {
  it("shows the version with its build and copies it", async () => {
    const user = userEvent.setup()
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue()
    render(<Desktop6 feel="macos" appName="Acme" version="3.0.0" build="300" />)
    expect(screen.getByText("Version 3.0.0 (300)")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Copy version" }))
    expect(writeText).toHaveBeenCalledWith("Acme Version 3.0.0 (300)")
    expect(await screen.findByRole("button", { name: "Version copied" })).toBeInTheDocument()
  })

  it("opens the acknowledgements and comes back", async () => {
    const user = userEvent.setup()
    render(<Desktop6 feel="macos" acknowledgements={[{ name: "Tauri", license: "MIT" }]} />)
    await user.click(screen.getByRole("button", { name: "Acknowledgements" }))
    expect(screen.getByText("Tauri")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Back" }))
    expect(screen.getByRole("heading", { name: "Acme" })).toBeInTheDocument()
  })

  it("has OK on Windows and calls onClose", async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<Desktop6 feel="windows" onClose={onClose} />)
    expect(screen.getByText("About Acme")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Third-party notices" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "OK" }))
    expect(onClose).toHaveBeenCalled()
  })
})
