import * as React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { Waitlist1 } from "@/components/ballmac/blocks/waitlist-1/waitlist-1"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

describe("Waitlist1", () => {
  it("says how many are waiting and validates the email", async () => {
    const user = userEvent.setup()
    render(<Waitlist1 waiting={2431} />)
    expect(screen.getByText("2,431")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /Join the waitlist/ }))
    expect(screen.getByRole("alert")).toHaveTextContent("Enter an email address")
  })

  it("joins and shows the place in line, the link and the rewards", async () => {
    const user = userEvent.setup()
    const onJoin = vi.fn().mockResolvedValue({ position: 77, link: "acme.com/r/abc", referrals: 3 })
    render(<Waitlist1 onJoin={onJoin} />)
    await user.type(screen.getByLabelText("Email address"), "me@acme.com")
    await user.click(screen.getByRole("button", { name: /Join the waitlist/ }))
    expect(onJoin).toHaveBeenCalledWith("me@acme.com")
    const heading = await screen.findByRole("heading", { level: 2 })
    await waitFor(() => expect(heading).toHaveFocus())
    expect(heading).toHaveTextContent("Number 77")
    expect(screen.getByText("acme.com/r/abc")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Copy link/ })).toBeInTheDocument()
  })

  it("says in words which rewards are unlocked and what the next one needs", () => {
    render(<Waitlist1 defaultJoined={{ position: 10, link: "acme.com/r/x", referrals: 3 }} />)
    expect(screen.getByText(/Early access/).closest("li")).toHaveTextContent("unlocked")
    expect(screen.getByText(/A year free/).closest("li")).toHaveTextContent("needs 7 more friends")
    expect(screen.getByText(/Bring 7 more friends/)).toBeInTheDocument()
  })

  it("thanks someone who has unlocked everything", () => {
    render(<Waitlist1 defaultJoined={{ position: 3, link: "acme.com/r/x", referrals: 12 }} />)
    expect(screen.getByText(/unlocked every reward/)).toBeInTheDocument()
  })

  it("keeps the email and says so when joining fails", async () => {
    const user = userEvent.setup()
    render(<Waitlist1 onJoin={() => Promise.reject(new Error("The list is full for today."))} />)
    await user.type(screen.getByLabelText("Email address"), "me@acme.com")
    await user.click(screen.getByRole("button", { name: /Join the waitlist/ }))
    expect(await screen.findByRole("alert")).toHaveTextContent("full for today")
    expect(screen.getByLabelText("Email address")).toHaveValue("me@acme.com")
  })

  it("drives its states from the state prop", () => {
    const { rerender } = render(<Waitlist1 state="submitting" />)
    expect(screen.getByRole("button", { name: "Joining" })).toBeDisabled()
    expect(screen.getByLabelText("Email address")).toBeDisabled()
    rerender(<Waitlist1 state="error" />)
    expect(screen.getByRole("alert")).toHaveTextContent("Your email is still here")
    rerender(<Waitlist1 state="success" />)
    expect(screen.getByText("You are on the list")).toBeInTheDocument()
  })
})
