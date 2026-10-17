import * as React from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { Upload1 } from "@/components/ballmac/blocks/upload-1/upload-1"

beforeAll(() => {
  // jsdom has no object URLs; images need them for their preview
  URL.createObjectURL = vi.fn(() => "blob:preview")
  URL.revokeObjectURL = vi.fn()
})

const file = (name: string, size = 1000, type = "application/pdf") => new File([new Uint8Array(size)], name, { type })
const input = (c: HTMLElement) => c.querySelector("input[type=file]") as HTMLInputElement

describe("Upload1", () => {
  it("uploads a file, shows its progress, and marks it done", async () => {
    const user = userEvent.setup()
    let finish!: () => void
    const onUpload = vi.fn((_f: File, report: (p: number) => void) => new Promise<void>((resolve) => {
      report(0.4)
      finish = resolve
    }))
    const { container } = render(<Upload1 defaultItems={[]} onUpload={onUpload} />)
    await user.upload(input(container), file("plan.pdf", 2000))
    expect(onUpload).toHaveBeenCalledTimes(1)
    expect(await screen.findByRole("progressbar", { name: "plan.pdf upload" })).toHaveAttribute("aria-valuenow", "40")
    finish()
    expect(await screen.findByText(/Uploaded/)).toBeInTheDocument()
    expect(screen.getByText("1 of 1 uploaded")).toBeInTheDocument()
  })

  it("explains each rejection instead of dropping the file quietly", async () => {
    const user = userEvent.setup()
    const { container } = render(<Upload1 defaultItems={[]} maxSize={5000} onUpload={async () => {}} />)
    fireEvent.change(input(container), { target: { files: [file("movie.mov", 100, "video/quicktime"), file("huge.pdf", 9000), file("fine.pdf", 100)] } })
    expect(await screen.findByText(/Not allowed. Use PNG, JPG, PDF or CSV./)).toBeInTheDocument()
    expect(screen.getByText(/Too large. The most is 5.0 KB./)).toBeInTheDocument()
    expect(screen.getByText("2 failed", { exact: false })).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText(/Uploaded/)).toBeInTheDocument())
    void user
  })

  it("shows the reason an upload failed and retries it", async () => {
    const user = userEvent.setup()
    const onUpload = vi.fn().mockRejectedValueOnce(new Error("The server closed the connection.")).mockResolvedValueOnce(undefined)
    const { container } = render(<Upload1 defaultItems={[]} onUpload={onUpload} />)
    await user.upload(input(container), file("report.pdf"))
    expect(await screen.findByText(/The server closed the connection./)).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Retry report.pdf" }))
    expect(await screen.findByText(/Uploaded/)).toBeInTheDocument()
    expect(onUpload).toHaveBeenCalledTimes(2)
  })

  it("cancels a running upload through the abort signal", async () => {
    const user = userEvent.setup()
    let signal!: AbortSignal
    const onUpload = vi.fn((_f: File, _r: (p: number) => void, s: AbortSignal) => new Promise<void>((_res, rej) => {
      signal = s
      s.addEventListener("abort", () => rej(new Error("aborted")))
    }))
    const { container } = render(<Upload1 defaultItems={[]} onUpload={onUpload} />)
    await user.upload(input(container), file("slow.pdf"))
    await screen.findByRole("progressbar", { name: "slow.pdf upload" })
    await user.click(screen.getByRole("button", { name: "Cancel slow.pdf" }))
    expect(signal.aborted).toBe(true)
    expect(screen.queryByText("slow.pdf")).toBeNull()
  })

  it("only runs as many uploads at once as the concurrency allows", async () => {
    const user = userEvent.setup()
    const starts: string[] = []
    const releases: (() => void)[] = []
    const onUpload = vi.fn((f: File) => new Promise<void>((resolve) => {
      starts.push(f.name)
      releases.push(resolve)
    }))
    const { container } = render(<Upload1 defaultItems={[]} concurrency={2} onUpload={onUpload} />)
    await user.upload(input(container), [file("a.pdf"), file("b.pdf"), file("c.pdf")])
    await waitFor(() => expect(starts).toEqual(["a.pdf", "b.pdf"]))
    expect(screen.getByText(/Waiting/)).toBeInTheDocument()
    releases[0]!()
    await waitFor(() => expect(starts).toEqual(["a.pdf", "b.pdf", "c.pdf"]))
  })

  it("wakes up when files are dragged over it, and clears finished files", async () => {
    const user = userEvent.setup()
    render(<Upload1 />)
    const drop = screen.getByRole("group", { name: "Drag files here" })
    fireEvent.dragEnter(drop)
    expect(screen.getByText("Drop to upload")).toBeInTheDocument()
    fireEvent.dragLeave(drop)
    expect(screen.getByText("Drag files here")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Clear completed" }))
    expect(screen.queryByText("Q3 report.pdf")).toBeNull()
  })

  it("is switched off with an error and says so", () => {
    render(<Upload1 state="error" defaultItems={[]} />)
    expect(screen.getByRole("alert")).toHaveTextContent("Uploads are unavailable right now")
  })
})
