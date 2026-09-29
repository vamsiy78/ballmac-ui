import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ballmac/pagination"

describe("Pagination", () => {
  it("names the navigation and marks the current page", () => {
    render(
      <Pagination aria-label="Reports">
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="/reports?page=1">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="/reports?page=2" isActive>
              2
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    )
    expect(
      screen.getByRole("navigation", { name: "Reports" }),
    ).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "2" })).toHaveAttribute(
      "aria-current",
      "page",
    )
  })

  it("keeps native links reachable in page order", async () => {
    const user = userEvent.setup()
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="/?page=1">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="/?page=2">2</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    )
    await user.tab()
    expect(screen.getByRole("link", { name: "1" })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole("link", { name: "2" })).toHaveFocus()
  })
})
