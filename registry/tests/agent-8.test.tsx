import * as React from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it, vi } from "vitest"
import { expectDisabled } from "./helpers";

import { Agent8 } from "@/components/ballmac/blocks/agent-8/agent-8"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

describe("Agent8", () => {
  it("summarises the health of the sources", () => {
    render(<Agent8 />)
    expect(screen.getByRole("img", { name: "3 ready, 1 syncing, 1 failed" })).toBeInTheDocument()
    expect(screen.getByText("666")).toBeInTheDocument()
    expect(screen.getByRole("progressbar", { name: "Support macros sync" })).toHaveAttribute("aria-valuenow", "58")
  })

  it("shows why a source failed, keeps it off, and retries it", async () => {
    const user = userEvent.setup()
    const onResync = vi.fn()
    render(<Agent8 onResync={onResync} />)
    expect(screen.getByText(/saved password has expired/)).toBeInTheDocument()
    expectDisabled(screen.getByRole("switch", { name: "Internal wiki" }))
    await user.click(screen.getByRole("button", { name: "Retry" }))
    expect(onResync).toHaveBeenCalledWith("wiki")
  })

  it("finds passages for a question and highlights the words", async () => {
    const user = userEvent.setup()
    render(<Agent8 />)
    await user.type(screen.getByRole("textbox", { name: "Question to test" }), "refund policy for duplicate charges")
    await user.click(screen.getByRole("button", { name: "Test" }))
    expect(await screen.findByText(/passages? from \d sources?/)).toBeInTheDocument()
    // the passages are the ordered list; the sources are a plain list of cards
    const passages = document.querySelector("aside ol") as HTMLElement
    expect(passages).toBeTruthy()
    expect(passages.querySelectorAll("mark").length).toBeGreaterThan(0)
    expect(within(passages).getAllByText("Refund policy.pdf").length).toBeGreaterThan(0)
  })

  it("says so when no source covers the question", async () => {
    const user = userEvent.setup()
    render(<Agent8 />)
    await user.type(screen.getByRole("textbox", { name: "Question to test" }), "parental leave")
    await user.click(screen.getByRole("button", { name: "Test" }))
    expect(await screen.findByText("Your sources do not cover this")).toBeInTheDocument()
  })

  it("only searches sources that are turned on", async () => {
    const user = userEvent.setup()
    render(<Agent8 />)
    await user.click(screen.getByRole("switch", { name: "Refund policy.pdf" }))
    await user.click(screen.getByRole("button", { name: "Can support refund $150 without approval?" }))
    expect(await screen.findByText(/passages? from/)).toBeInTheDocument()
    expect(screen.queryByText(/without approval and a written/)).toBeNull()
    expect(screen.queryAllByText("Refund policy.pdf", { selector: "span" })).toHaveLength(0)
  })

  it("lets your own search answer, with an answer text", async () => {
    const user = userEvent.setup()
    const onAsk = vi.fn().mockResolvedValue({ passages: [{ sourceId: "help", text: "Refunds take 5 to 10 days.", score: 0.9 }], answer: "Usually 5 to 10 business days." })
    render(<Agent8 onAsk={onAsk} defaultQuestion="refund time" />)
    expect(await screen.findByText("Usually 5 to 10 business days.")).toBeInTheDocument()
    expect(onAsk).toHaveBeenCalledWith("refund time", expect.arrayContaining([expect.objectContaining({ id: "help" })]))
  })

  it("asks before removing a source", async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()
    render(<Agent8 onRemove={onRemove} />)
    await user.click(screen.getByRole("button", { name: "Remove Tone of voice" }))
    expect(onRemove).not.toHaveBeenCalled()
    await user.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Remove" }))
    expect(onRemove).toHaveBeenCalledWith("tone")
    expect(screen.queryByText("Tone of voice")).toBeNull()
  })

  it("offers the three ways to add knowledge when there is none", async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(<Agent8 state="empty" onAdd={onAdd} />)
    await user.click(screen.getByRole("button", { name: /A website/ }))
    expect(onAdd).toHaveBeenCalledWith("website")
    expect(screen.getByRole("button", { name: /Pasted text/ })).toBeInTheDocument()
  })
})
