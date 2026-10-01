import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it } from "vitest"

import { Features6 } from "@/components/ballmac/blocks/features-6/features-6"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

describe("Features6", () => {
  it("shows the first tab's panel and switches with a click and arrow keys", async () => {
    const user = userEvent.setup()
    render(<Features6 />)
    expect(screen.getByRole("tablist", { name: "Feature areas" })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Analytics" })).toHaveAttribute("aria-selected", "true")
    expect(screen.getByText("Know what’s working, the same day.")).toBeInTheDocument()
    await user.click(screen.getByRole("tab", { name: "Security" }))
    expect(screen.getByText(/Enterprise controls/)).toBeInTheDocument()
    await user.keyboard("{ArrowRight}")
    expect(screen.getByRole("tab", { name: "Integrations" })).toHaveAttribute("aria-selected", "true")
  })

  it("starts on defaultValue and hides the picture from assistive technology", () => {
    render(<Features6 defaultValue="collaboration" />)
    expect(screen.getByRole("tab", { name: "Collaboration" })).toHaveAttribute("aria-selected", "true")
    expect(document.querySelector("[aria-hidden=true] .bg-card")).not.toBeNull()
  })
})
