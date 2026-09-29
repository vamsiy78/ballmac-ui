import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { FileDropzone } from "@/components/ballmac/file-dropzone"
describe("FileDropzone", () => {
  it("accepts native file selection and removes a file from the keyboard", async () => {
    const user = userEvent.setup()
    const { container } = render(<FileDropzone accept=".pdf" />)
    const input =
      container.querySelector<HTMLInputElement>('input[type="file"]')!
    await user.upload(
      input,
      new File(["report"], "review.pdf", { type: "application/pdf" }),
    )
    expect(screen.getByText("review.pdf")).toBeInTheDocument()
    const remove = screen.getByRole("button", { name: "Remove review.pdf" })
    remove.focus()
    await user.keyboard("{Enter}")
    expect(screen.queryByText("review.pdf")).not.toBeInTheDocument()
  })
  it("rejects oversized files and reports controlled selections", async () => {
    const user = userEvent.setup()
    const onFilesChange = vi.fn()
    const { container } = render(
      <FileDropzone files={[]} maxSize={2} onFilesChange={onFilesChange} />,
    )
    const input =
      container.querySelector<HTMLInputElement>('input[type="file"]')!
    await user.upload(
      input,
      new File(["123"], "large.txt", { type: "text/plain" }),
    )
    expect(screen.getByRole("alert")).toHaveTextContent(
      "exceeds the size limit",
    )
    expect(onFilesChange).not.toHaveBeenCalled()
    await user.upload(
      input,
      new File(["1"], "small.txt", { type: "text/plain" }),
    )
    expect(onFilesChange).toHaveBeenCalledWith([
      expect.objectContaining({ name: "small.txt" }),
    ])
    expect(screen.queryByText("small.txt")).not.toBeInTheDocument()
  })
})
