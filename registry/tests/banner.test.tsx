import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { Banner } from "@/components/ballmac/banner"

describe("Banner", () => {
  it("dismisses with its keyboard accessible control", async () => {
    const user = userEvent.setup()
    render(<Banner title="Update ready" dismissible />)
    screen.getByRole("button", { name: "Dismiss Update ready" }).focus()
    await user.keyboard("{Enter}")
    expect(
      screen.queryByRole("region", { name: "Update ready" }),
    ).not.toBeInTheDocument()
  })

  it("reports controlled dismissal without hiding itself", async () => {
    const user = userEvent.setup()
    const onVisibleChange = vi.fn()
    render(
      <Banner
        title="Update ready"
        visible
        dismissible
        onVisibleChange={onVisibleChange}
      />,
    )
    await user.click(
      screen.getByRole("button", { name: "Dismiss Update ready" }),
    )
    expect(onVisibleChange).toHaveBeenCalledWith(false)
    expect(
      screen.getByRole("region", { name: "Update ready" }),
    ).toBeInTheDocument()
  })
})
