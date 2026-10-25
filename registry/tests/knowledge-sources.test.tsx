import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { KnowledgeSources, type KnowledgeSource } from "@/components/ballmac/knowledge-sources"

const sources: KnowledgeSource[] = [
  { id: "1", name: "Docs", kind: "notion", status: "synced", docs: 1200, lastSync: "5 minutes ago", included: true },
  { id: "2", name: "Repo", kind: "github", status: "error", docs: 50, error: "Token expired.", included: true },
  { id: "3", name: "Chat", kind: "slack", status: "paused", docs: 300, included: false },
]

describe("KnowledgeSources", () => {
  it("sums only the documents used in answers and flags what needs attention", () => {
    render(<KnowledgeSources sources={sources} />)
    expect(screen.getByText(/1,250 documents from 2 sources are used in answers/)).toBeInTheDocument()
    expect(screen.getByText("1 needs attention")).toBeInTheDocument()
  })

  it("says each status in words and shows the error", () => {
    render(<KnowledgeSources sources={sources} />)
    expect(screen.getByText("Up to date")).toBeInTheDocument()
    expect(screen.getByText("Sync failed")).toBeInTheDocument()
    expect(screen.getByText("Paused")).toBeInTheDocument()
    expect(screen.getByRole("alert")).toHaveTextContent("Token expired.")
  })

  it("switches a source on and off and takes it back if that fails", async () => {
    const user = userEvent.setup()
    render(<KnowledgeSources sources={sources} onToggle={() => Promise.reject(new Error("No permission."))} />)
    const sw = screen.getByRole("switch", { name: "Use Chat in answers" })
    expect(sw).not.toBeChecked()
    await user.click(sw)
    expect(await screen.findByText("No permission.")).toBeInTheDocument()
    expect(sw).not.toBeChecked()
  })

  it("syncs, shows it is syncing and then up to date", async () => {
    const user = userEvent.setup()
    let done!: () => void
    const onSync = vi.fn(() => new Promise<void>((r) => (done = r)))
    render(<KnowledgeSources sources={sources} onSync={onSync} />)
    await user.click(screen.getByRole("button", { name: /Retry/ }))
    expect(onSync).toHaveBeenCalledWith("2")
    expect(await screen.findByText("Syncing")).toBeInTheDocument()
    done()
    expect(await screen.findByText("Repo is up to date")).toBeInTheDocument()
  })

  it("shows the error with Retry when a sync is rejected", async () => {
    const user = userEvent.setup()
    render(<KnowledgeSources sources={sources} onSync={() => Promise.reject(new Error("Rate limited."))} />)
    await user.click(screen.getByRole("button", { name: "Sync now: Docs" }))
    expect(await screen.findByText("Rate limited.")).toBeInTheDocument()
    expect(screen.getAllByRole("button", { name: /Retry/ })).toHaveLength(2)
  })

  it("asks before removing and keeps the source when it is rejected", async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn().mockRejectedValue(new Error("Locked."))
    render(<KnowledgeSources sources={sources} onRemove={onRemove} />)
    await user.click(screen.getByRole("button", { name: "Remove Docs" }))
    expect(onRemove).not.toHaveBeenCalled()
    await user.click(screen.getByRole("button", { name: "Remove" }))
    expect(onRemove).toHaveBeenCalledWith("1")
    expect(await screen.findByText("Locked.")).toBeInTheDocument()
    expect(screen.getByText("Docs")).toBeInTheDocument()
  })

  it("shows an empty message", () => {
    render(<KnowledgeSources sources={[]} onAdd={() => {}} />)
    expect(screen.getByText(/No sources yet/)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Add a source" })).toBeInTheDocument()
  })
})
