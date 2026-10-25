import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Hero8 } from "@/components/ballmac/blocks/hero-8/hero-8"

describe("Hero8", () => {
  it("has the headline, the announcement link and the proof", () => {
    render(<Hero8 />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("The calm way to run a team")
    expect(screen.getByRole("link", { name: /New: shared workspaces/ })).toBeInTheDocument()
    expect(screen.getByText("4.9 out of 5")).toBeInTheDocument()
  })

  it("names a bad address beside the field on submit", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Hero8 onSubmit={onSubmit} />)
    await user.type(screen.getByLabelText("Work email"), "nope")
    await user.click(screen.getByRole("button", { name: "Get started free" }))
    expect(screen.getByRole("alert")).toHaveTextContent("does not look like an email")
    expect(screen.getByLabelText("Work email")).toHaveAttribute("aria-invalid", "true")
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("sends the email and then shows the success as a status", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<Hero8 onSubmit={onSubmit} />)
    await user.type(screen.getByLabelText("Work email"), "sam@company.com")
    await user.click(screen.getByRole("button", { name: "Get started free" }))
    expect(onSubmit).toHaveBeenCalledWith("sam@company.com")
    expect(await screen.findByRole("status")).toHaveTextContent("You are in")
  })

  it("keeps what was typed and says why when it fails", async () => {
    const user = userEvent.setup()
    render(<Hero8 onSubmit={() => Promise.reject(new Error("That address is already on the list."))} />)
    await user.type(screen.getByLabelText("Work email"), "sam@company.com")
    await user.click(screen.getByRole("button", { name: "Get started free" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("already on the list")
    expect(screen.getByLabelText("Work email")).toHaveValue("sam@company.com")
  })

  it("hides the floating screen from assistive technology", () => {
    const { container } = render(<Hero8 />)
    const screenEl = container.querySelector("[inert]")
    expect(screenEl).toHaveAttribute("aria-hidden", "true")
  })
})
