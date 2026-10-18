import * as React from "react"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { Api1 } from "@/components/ballmac/blocks/api-1/api-1"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

const ok = { status: 200, statusText: "OK", ms: 12, headers: { "content-type": "application/json" }, body: { hello: "world" } }

describe("Api1", () => {
  it("sends the request with its method, address and headers, then shows status in words, time and size", async () => {
    const user = userEvent.setup()
    const onSend = vi.fn().mockResolvedValue(ok)
    render(<Api1 onSend={onSend} />)
    await user.click(screen.getByRole("button", { name: "Send" }))
    expect(onSend).toHaveBeenCalledWith(expect.objectContaining({ method: "GET", url: "https://api.acme.com/v1/users", headers: expect.arrayContaining([expect.objectContaining({ key: "Authorization" })]) }))
    expect(await screen.findByText("200 OK")).toBeInTheDocument()
    expect(screen.getByText("12 ms")).toBeInTheDocument()
    expect(screen.getByText("17 B")).toBeInTheDocument()
  })

  it("answers from the built-in demo API: 401 without credentials, 200 with", async () => {
    const user = userEvent.setup()
    render(<Api1 />)
    await user.click(screen.getByRole("button", { name: "Remove header 1" }))
    await user.click(screen.getByRole("button", { name: "Send" }))
    expect(await screen.findByText(/401 Unauthorized/)).toBeInTheDocument()
  })

  it("explains a 404 from the demo API", async () => {
    const user = userEvent.setup()
    render(<Api1 defaultRequest={{ url: "https://api.acme.com/v1/users/usr_99" }} />)
    await user.click(screen.getByRole("button", { name: "Send" }))
    expect(await screen.findByText(/404 Not Found/)).toBeInTheDocument()
    await user.click(screen.getByRole("tab", { name: "headers" }))
    expect(screen.getByText("x-request-id")).toBeInTheDocument()
  })

  it("catches a broken body before sending and says why Send is off", async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(<Api1 defaultRequest={{ method: "POST", body: '{"a": ' }} onSend={onSend} />)
    await user.click(screen.getByRole("tab", { name: "Body" }))
    expect(screen.getByRole("alert")).toHaveTextContent("The body is not valid JSON")
    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled()
    expect(onSend).not.toHaveBeenCalled()
  })

  it("catches a bad address", async () => {
    const user = userEvent.setup()
    render(<Api1 />)
    const address = screen.getByLabelText("Address")
    await user.clear(address)
    await user.type(address, "not a url")
    expect(screen.getByRole("alert")).toHaveTextContent("full address")
    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled()
  })

  it("hides the body field for GET and says so", async () => {
    const user = userEvent.setup()
    render(<Api1 />)
    await user.click(screen.getByRole("tab", { name: "Body" }))
    expect(screen.getByText("GET requests do not send a body.")).toBeInTheDocument()
  })

  it("adds and removes headers, naming each row", async () => {
    const user = userEvent.setup()
    render(<Api1 />)
    expect(screen.getByLabelText("Header 2 name")).toHaveValue("Accept")
    await user.click(screen.getByRole("button", { name: "Add header" }))
    await user.type(screen.getByLabelText("Header 3 name"), "X-Trace")
    expect(screen.getByRole("tab", { name: "Headers · 3" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Remove header 3" }))
    expect(screen.getByRole("tab", { name: "Headers · 2" })).toBeInTheDocument()
  })

  it("keeps a history and restores a past request", async () => {
    const user = userEvent.setup()
    render(<Api1 onSend={() => Promise.resolve(ok)} />)
    await user.click(screen.getByRole("button", { name: "Send" }))
    await screen.findByText("200 OK")
    const address = screen.getByLabelText("Address")
    await user.clear(address)
    await user.type(address, "https://api.acme.com/v1/other")
    await user.click(screen.getByRole("button", { name: /Use this request again/ }))
    expect(screen.getByLabelText("Address")).toHaveValue("https://api.acme.com/v1/users")
  })

  it("shows No response when the request fails to arrive", async () => {
    const user = userEvent.setup()
    render(<Api1 onSend={() => Promise.reject(new Error("The connection timed out."))} />)
    await user.click(screen.getByRole("button", { name: "Send" }))
    const alert = await screen.findByRole("alert")
    expect(alert).toHaveTextContent("No response")
    expect(alert).toHaveTextContent("The connection timed out.")
  })

  it("copies the request as a cURL command", async () => {
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true })
    render(<Api1 defaultRequest={{ method: "POST", url: "https://api.acme.com/v1/users" }} />)
    await user.click(screen.getByRole("button", { name: /Copy as cURL/ }))
    await waitFor(() => expect(writeText).toHaveBeenCalled())
    const cmd = writeText.mock.calls[0]![0] as string
    expect(cmd).toContain("curl -X POST 'https://api.acme.com/v1/users'")
    expect(cmd).toContain("-H 'Accept: application/json'")
    expect(cmd).toContain(`-d '{ "name": "Sam Okafor", "email": "sam@acme.com" }'`)
  })

  it("shows loading and error states", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const { rerender } = render(<Api1 state="loading" />)
    expect(screen.getByRole("status")).toBeInTheDocument()
    rerender(<Api1 state="error" onRetry={onRetry} />)
    await user.click(screen.getByRole("button", { name: /try again/i }))
    expect(onRetry).toHaveBeenCalled()
  })
})
