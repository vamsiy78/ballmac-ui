import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ballmac/avatar"

describe("AvatarGroup", () => {
  it("caps visible avatars with max and announces the overflow", () => {
    render(
      <AvatarGroup max={2} size="sm" aria-label="Members">
        {["AM", "JL", "SK", "RC"].map((i) => (
          <Avatar key={i}>
            <AvatarFallback>{i}</AvatarFallback>
          </Avatar>
        ))}
      </AvatarGroup>
    )
    expect(screen.getByText("AM")).toBeInTheDocument()
    expect(screen.queryByText("SK")).not.toBeInTheDocument()
    expect(screen.getByText("2 more")).toBeInTheDocument()
    expect(screen.getByText("AM").closest("[data-slot=avatar]")).toHaveAttribute("data-size", "sm")
  })

  it("announces presence as text", () => {
    render(
      <Avatar status="online">
        <AvatarFallback>AM</AvatarFallback>
      </Avatar>
    )
    expect(screen.getByText("Online")).toHaveClass("sr-only")
  })
})
