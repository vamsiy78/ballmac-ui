import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Secrets1 } from "@/components/ballmac/blocks/secrets-1/secrets-1"

describe("Secrets1", () => {
  it("lists oldest first, calls out old secrets in words and never shows a value", () => {
    render(<Secrets1 />)
    const items = screen.getAllByRole("listitem")
    expect(items[0]).toHaveTextContent("S3_ACCESS_KEY")
    expect(items[0]).toHaveTextContent("Not changed for 340 days")
    expect(items[0]).toHaveTextContent("due for rotation")
    expect(screen.getByText(/4 not changed for 90 days or more/)).toBeInTheDocument()
    expect(screen.getByText("Values are never shown here.", { exact: false })).toBeInTheDocument()
  })

  it("filters by environment, searches, and reverses the order", async () => {
    const user = userEvent.setup()
    render(<Secrets1 />)
    await user.selectOptions(screen.getByLabelText("Environment"), "staging")
    expect(screen.getByText(/^1 secret/)).toBeInTheDocument()
    await user.selectOptions(screen.getByLabelText("Environment"), "all")
    await user.type(screen.getByRole("searchbox", { name: "Search secrets" }), "billing")
    expect(screen.getByText(/^2 secrets/)).toBeInTheDocument()
    expect(document.querySelector("mark")?.textContent?.toLowerCase()).toBe("billing")
    await user.clear(screen.getByRole("searchbox"))
    await user.click(screen.getByRole("button", { name: "Oldest first" }))
    expect(screen.getByRole("button", { name: "Newest first" })).toBeInTheDocument()
    expect(screen.getAllByRole("listitem")[0]).toHaveTextContent("Not changed for 19 days")
  })

  it("asks before rotating, says what happens, then shows it as changed today", async () => {
    const user = userEvent.setup()
    const onRotate = vi.fn().mockResolvedValue(undefined)
    render(<Secrets1 onRotate={onRotate} />)
    await user.click(screen.getByRole("button", { name: "Rotate STRIPE_SECRET_KEY in production" }))
    const dialog = await screen.findByRole("alertdialog")
    expect(dialog).toHaveTextContent("billing-api picks it up on its next start")
    expect(onRotate).not.toHaveBeenCalled()
    await user.click(within(dialog).getByRole("button", { name: "Rotate" }))
    expect(onRotate).toHaveBeenCalledWith(expect.objectContaining({ id: "k1" }))
    expect(await screen.findByText(/STRIPE_SECRET_KEY in production was rotated/)).toBeInTheDocument()
    expect(screen.getAllByText("Changed today")).toHaveLength(1)
  })

  it("leaves the secret as it was and says why when rotation fails", async () => {
    const user = userEvent.setup()
    render(<Secrets1 onRotate={() => Promise.reject(new Error("The vault is sealed."))} />)
    await user.click(screen.getByRole("button", { name: "Rotate DATABASE_URL in production" }))
    await user.click(within(await screen.findByRole("alertdialog")).getByRole("button", { name: "Rotate" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("The vault is sealed.")
    expect(screen.getByText("Not changed for 61 days")).toBeInTheDocument()
  })

  it("shows loading, empty and error states", () => {
    const { rerender } = render(<Secrets1 state="loading" />)
    expect(screen.getByRole("status")).toHaveTextContent("Loading secrets")
    rerender(<Secrets1 secrets={[]} />)
    expect(screen.getByText("No secrets yet")).toBeInTheDocument()
    rerender(<Secrets1 state="error" onRetry={() => {}} />)
    expect(screen.getByRole("alert")).toHaveTextContent("Secrets could not be loaded")
  })
})
