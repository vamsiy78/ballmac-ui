import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { StateView } from "@/components/ballmac/state-view"
import { I18nProvider } from "@/lib/ballmac/i18n"

const ready = <p>Ready content</p>

describe("StateView", () => {
  it("shows the children when ready, and for the form states", () => {
    for (const state of ["ready", "submitting", "success"] as const) {
      const { unmount } = render(<StateView state={state}>{ready}</StateView>)
      expect(screen.getByText("Ready content")).toBeInTheDocument()
      unmount()
    }
  })

  it("marks the region busy and announces loading, hiding the skeleton from assistive technology", () => {
    const { container } = render(
      <StateView state="loading" loading={<div data-testid="skeleton" aria-hidden="true" />}>
        {ready}
      </StateView>
    )
    expect(container.querySelector("[data-slot=state-view]")).toHaveAttribute("aria-busy", "true")
    expect(screen.getByRole("status")).toHaveTextContent("Loading")
    expect(screen.queryByText("Ready content")).toBeNull()
    expect(screen.getByTestId("skeleton")).toHaveAttribute("aria-hidden", "true")
  })

  it("is not busy once loaded, and busy while submitting", () => {
    const { container, rerender } = render(<StateView state="ready">{ready}</StateView>)
    expect(container.querySelector("[data-slot=state-view]")).not.toHaveAttribute("aria-busy")
    rerender(<StateView state="submitting">{ready}</StateView>)
    expect(container.querySelector("[data-slot=state-view]")).toHaveAttribute("aria-busy", "true")
  })

  it("draws default placeholder lines when no skeleton is given", () => {
    const { container } = render(<StateView state="loading">{ready}</StateView>)
    expect(container.querySelectorAll("[data-slot=skeleton]").length).toBeGreaterThan(2)
  })

  it("shows an empty state with its copy and action", () => {
    render(
      <StateView state="empty" empty={{ title: "No invoices", description: "Bill a customer first.", action: <button>Create invoice</button> }}>
        {ready}
      </StateView>
    )
    expect(screen.getByRole("heading", { name: "No invoices" })).toBeInTheDocument()
    expect(screen.getByText("Bill a customer first.")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Create invoice" })).toBeInTheDocument()
  })

  it("has sensible default copy for empty and error", () => {
    const { rerender } = render(<StateView state="empty">{ready}</StateView>)
    expect(screen.getByRole("heading", { name: "Nothing here yet" })).toBeInTheDocument()
    rerender(<StateView state="error">{ready}</StateView>)
    expect(screen.getByRole("heading", { name: "Something went wrong" })).toBeInTheDocument()
  })

  it("announces an error as an alert and retries without moving focus", async () => {
    const onRetry = vi.fn()
    const user = userEvent.setup()
    render(
      <>
        <button>Elsewhere</button>
        <StateView state="error" error={{ title: "Could not load", details: "GET /x 504" }} onRetry={onRetry}>
          {ready}
        </StateView>
      </>
    )
    expect(screen.getByRole("alert")).toHaveTextContent("Could not load")
    screen.getByRole("button", { name: "Elsewhere" }).focus()
    expect(screen.getByRole("button", { name: "Elsewhere" })).toHaveFocus() // it did not steal focus
    await user.click(screen.getByRole("button", { name: "Try again" }))
    expect(onRetry).toHaveBeenCalledTimes(1)
    expect(screen.getByText("Details")).toBeInTheDocument()
    expect(screen.getByText("GET /x 504")).toBeInTheDocument()
  })

  it("draws no retry button without a handler, and accepts a custom retry label and action", () => {
    const { rerender } = render(<StateView state="error">{ready}</StateView>)
    expect(screen.queryByRole("button", { name: "Try again" })).toBeNull()
    rerender(
      <StateView state="error" onRetry={() => {}} error={{ retryLabel: "Reload", action: <a href="/status">Status</a> }}>
        {ready}
      </StateView>
    )
    expect(screen.getByRole("button", { name: "Reload" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Status" })).toBeInTheDocument()
  })

  it("accepts your own nodes for loading, empty and error", () => {
    const { rerender } = render(
      <StateView state="empty" empty={<p>Custom empty</p>}>
        {ready}
      </StateView>
    )
    expect(screen.getByText("Custom empty")).toBeInTheDocument()
    rerender(
      <StateView state="error" error={<p>Custom error</p>}>
        {ready}
      </StateView>
    )
    expect(screen.getByText("Custom error")).toBeInTheDocument()
    rerender(
      <StateView state="loading" loading={<p>Custom loading</p>}>
        {ready}
      </StateView>
    )
    expect(screen.getByText("Custom loading")).toBeInTheDocument()
  })

  it("translates its built-in text", () => {
    render(
      <I18nProvider messages={{ "state-view.loading": "Cargando" }}>
        <StateView state="loading">{ready}</StateView>
      </I18nProvider>
    )
    expect(screen.getByRole("status")).toHaveTextContent("Cargando")
  })

  it("exposes the state for styling and takes a custom label", () => {
    const { container } = render(
      <StateView state="loading" label="Loading invoices">
        {ready}
      </StateView>
    )
    expect(container.querySelector("[data-slot=state-view]")).toHaveAttribute("data-state", "loading")
    expect(screen.getByRole("status")).toHaveTextContent("Loading invoices")
  })
})
