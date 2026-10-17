import * as React from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { Agent7 } from "@/components/ballmac/blocks/agent-7/agent-7"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

describe("Agent7", () => {
  it("shows a tool's permission choice only while it is on, and defaults a writing tool to Ask first", async () => {
    const user = userEvent.setup()
    render(<Agent7 />)
    expect(screen.queryByRole("radiogroup", { name: "Read web pages: when to use" })).toBeNull()
    await user.click(screen.getByRole("switch", { name: /Read web pages/ }))
    const group = screen.getByRole("radiogroup", { name: "Read web pages: when to use" })
    expect(within(group).getByRole("radio", { name: "Allowed", checked: true })).toBeInTheDocument()
    // a tool that changes data starts at Ask first
    const refunds = screen.getByRole("radiogroup", { name: "Issue refunds: when to use" })
    expect(within(refunds).getByRole("radio", { name: "Ask first", checked: true })).toBeInTheDocument()
  })

  it("previews the approval flow for a tool set to Ask first", async () => {
    const user = userEvent.setup()
    render(<Agent7 />)
    const preview = screen.getByRole("complementary", { name: "Preview" })
    expect(preview).toHaveTextContent("Use “Issue refunds”")
    await user.click(screen.getByRole("button", { name: /Approve/ }))
    expect(preview).toHaveTextContent("Done.")
    await user.click(screen.getByRole("button", { name: "Replay the preview" }))
    expect(screen.getByRole("button", { name: /Approve/ })).toBeInTheDocument()
  })

  it("says what is missing instead of publishing, and keeps the draft status honest", async () => {
    const user = userEvent.setup()
    const onPublish = vi.fn()
    render(<Agent7 onPublish={onPublish} defaultConfig={{ name: "", instructions: "short", model: "lyra-mini", tools: {}, sources: [], askBeforeExternal: true, maxSteps: 6 }} />)
    await user.click(screen.getByRole("button", { name: "Publish" }))
    expect(onPublish).not.toHaveBeenCalled()
    expect(screen.getAllByRole("alert").map((a) => a.textContent)).toEqual(expect.arrayContaining(["Give the agent a name.", "Describe what the agent should do in a sentence or two."]))
  })

  it("publishes the current settings and then says Published", async () => {
    const user = userEvent.setup()
    const onPublish = vi.fn().mockResolvedValue(undefined)
    render(<Agent7 onPublish={onPublish} />)
    await user.click(screen.getByRole("switch", { name: /Read web pages/ }))
    expect(screen.getByText("Unpublished changes")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Publish" }))
    expect(onPublish).toHaveBeenCalledWith(expect.objectContaining({ name: "Support agent", tools: expect.objectContaining({ "web.fetch": "allow" }) }))
    expect(await screen.findByRole("button", { name: "Published" })).toBeInTheDocument()
  })

  it("shows why publishing failed and keeps the changes", async () => {
    const user = userEvent.setup()
    render(<Agent7 onPublish={() => Promise.reject(new Error("Lyra Mid is not on your plan."))} />)
    await user.click(screen.getByRole("button", { name: "Publish" }))
    expect(await screen.findByText("Lyra Mid is not on your plan.")).toBeInTheDocument()
    expect(screen.getByText("Not published")).toBeInTheDocument()
  })

  it("turns a source off and removes one", async () => {
    const user = userEvent.setup()
    const onRemoveSource = vi.fn()
    render(<Agent7 onRemoveSource={onRemoveSource} />)
    const preview = screen.getByRole("complementary", { name: "Preview" })
    expect(preview).toHaveTextContent("check 2 sources")
    await user.click(screen.getByRole("switch", { name: "Refund policy.pdf" }))
    expect(preview).toHaveTextContent("Help center")
    await user.click(screen.getByRole("button", { name: "Remove Support macros" }))
    expect(onRemoveSource).toHaveBeenCalledWith("macros")
    expect(screen.queryByText("Support macros")).toBeNull()
  })
})
