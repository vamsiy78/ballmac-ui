import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { StreamingText } from "@/components/ballmac/streaming-text"

describe("StreamingText", () => {
  it("is a polite live region that is busy only while streaming", () => {
    const { rerender, container } = render(<StreamingText text="Hel" streaming />)
    const region = container.querySelector("[aria-live]")!
    expect(region).toHaveAttribute("aria-live", "polite")
    expect(region).toHaveAttribute("aria-busy", "true")
    rerender(<StreamingText text="Hello" />)
    expect(region).not.toHaveAttribute("aria-busy", "true")
    expect(screen.getByText("Hello")).toBeInTheDocument()
  })
})
