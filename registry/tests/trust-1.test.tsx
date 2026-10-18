import * as React from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { Trust1 } from "@/components/ballmac/blocks/trust-1/trust-1"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

describe("Trust1", () => {
  it("writes each standard's status in words and shows what is still in progress", () => {
    render(<Trust1 />)
    expect(screen.getAllByText("Certified")).toHaveLength(2)
    expect(screen.getByText("Compliant")).toBeInTheDocument()
    expect(screen.getAllByText("In progress").length).toBeGreaterThan(0)
    expect(screen.getByText(/Bug bounty with cash rewards/)).toHaveTextContent("(in progress)")
    expect(screen.getByRole("status")).toHaveTextContent("All systems operational")
  })

  it("downloads a public document and asks for a request for a gated one", async () => {
    const user = userEvent.setup()
    const onDownload = vi.fn()
    render(<Trust1 onDownload={onDownload} />)
    await user.click(screen.getByRole("button", { name: /Download Security whitepaper/ }))
    expect(onDownload).toHaveBeenCalledWith(expect.objectContaining({ id: "wp" }))
    expect(screen.queryByRole("dialog")).toBeNull()
    await user.click(screen.getByRole("button", { name: /Request access to SOC 2 Type II report/ }))
    expect(screen.getByRole("dialog", { name: "Request SOC 2 Type II report" })).toBeInTheDocument()
  })

  it("validates the request, then sends it and confirms", async () => {
    const user = userEvent.setup()
    const onRequestAccess = vi.fn().mockResolvedValue(undefined)
    render(<Trust1 defaultRequestId="soc2" onRequestAccess={onRequestAccess} />)
    const dialog = screen.getByRole("dialog")
    await user.click(within(dialog).getByRole("button", { name: "Send request" }))
    expect(onRequestAccess).not.toHaveBeenCalled()
    expect(within(dialog).getAllByRole("alert").map((a) => a.textContent)).toEqual(expect.arrayContaining(["Enter a work email, like name@company.com.", "Tell us which company this is for.", "Agree to keep it confidential to continue."]))
    await user.type(within(dialog).getByLabelText("Work email"), "sec@buyer.com")
    await user.type(within(dialog).getByLabelText("Company"), "Buyer Ltd")
    await user.click(within(dialog).getByRole("checkbox"))
    await user.click(within(dialog).getByRole("button", { name: "Send request" }))
    expect(onRequestAccess).toHaveBeenCalledWith(expect.objectContaining({ id: "soc2" }), { email: "sec@buyer.com", company: "Buyer Ltd" })
    expect(await screen.findByText("Request sent")).toBeInTheDocument()
  })

  it("shows why a request failed and lets people try again", async () => {
    const user = userEvent.setup()
    render(<Trust1 defaultRequestId="pen" onRequestAccess={() => Promise.reject(new Error("We could not reach the request service."))} />)
    const dialog = screen.getByRole("dialog")
    await user.type(within(dialog).getByLabelText("Work email"), "a@b.co")
    await user.type(within(dialog).getByLabelText("Company"), "B")
    await user.click(within(dialog).getByRole("checkbox"))
    await user.click(within(dialog).getByRole("button", { name: "Send request" }))
    expect(await within(dialog).findByText("We could not reach the request service.")).toBeInTheDocument()
    expect(within(dialog).getByRole("button", { name: "Send request" })).toBeEnabled()
  })

  it("filters subprocessors and signs up for change alerts", async () => {
    const user = userEvent.setup()
    const onSubscribe = vi.fn().mockResolvedValue(undefined)
    render(<Trust1 onSubscribe={onSubscribe} />)
    await user.type(screen.getByRole("searchbox", { name: "Filter subprocessors" }), "dublin")
    expect(screen.getByText("2 of 6")).toBeInTheDocument()
    await user.type(screen.getByLabelText("Get an email when this list changes"), "me@co.com")
    await user.click(screen.getByRole("button", { name: "Notify me" }))
    expect(onSubscribe).toHaveBeenCalledWith("me@co.com")
    expect(await screen.findByText(/You are on the list/)).toBeInTheDocument()
  })

  it("keeps the security contact when the page fails to load", () => {
    render(<Trust1 state="error" />)
    expect(screen.getByRole("alert")).toHaveTextContent("The trust center could not be loaded")
    expect(screen.getByRole("link", { name: "security@acme.com" })).toHaveAttribute("href", "mailto:security@acme.com")
  })
})
