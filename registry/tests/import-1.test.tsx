import * as React from "react"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionGlobalConfig } from "motion/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { Import1 } from "@/components/ballmac/blocks/import-1/import-1"

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})

const csv = `Name,E-mail\nAnn,ann@a.co\nBob,not-an-email\n,cy@c.co\nAnn,ann@a.co`

const fields = [
  { key: "name", label: "Name", required: true },
  { key: "email", label: "Email", required: true, aliases: ["e-mail"], validate: (v: string) => (/^\S+@\S+\.\S+$/.test(v) ? null : "Not an email address") },
]

describe("Import1", () => {
  it("reads a sample file and moves to matching, with focus on the new step", async () => {
    const user = userEvent.setup()
    render(<Import1 fields={fields} sampleCsv={csv} />)
    await user.click(screen.getByRole("button", { name: "Try a sample file" }))
    const heading = await screen.findByRole("heading", { name: "Match your columns" })
    await waitFor(() => expect(heading).toHaveFocus())
    expect(screen.getByText(/contacts\.csv has 4 rows/)).toBeInTheDocument()
  })

  it("matches columns by name and alias, and shows sample values", async () => {
    render(<Import1 fields={fields} sampleCsv={csv} defaultStep={1} />)
    expect(screen.getByRole("combobox", { name: /Name/ })).toHaveTextContent("Name")
    expect(screen.getByRole("combobox", { name: /Email/ })).toHaveTextContent("E-mail")
    expect(screen.getByText("ann@a.co · not-an-email · cy@c.co")).toBeInTheDocument()
  })

  it("will not continue while a required field is unmatched", async () => {
    const user = userEvent.setup()
    render(<Import1 fields={fields} sampleCsv={csv} defaultStep={1} />)
    await user.click(screen.getByRole("combobox", { name: /Email/ }))
    await user.click(await screen.findByRole("option", { name: "Do not import" }))
    expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled()
    expect(screen.getByRole("alert")).toHaveTextContent("Match Email to continue.")
  })

  it("finds missing values, bad emails and duplicates, and says why", () => {
    render(<Import1 fields={fields} sampleCsv={csv} defaultStep={2} />)
    expect(screen.getByText("ready to import").previousElementSibling).toHaveTextContent("1")
    expect(screen.getByText("with problems, skipped").previousElementSibling).toHaveTextContent("3")
    expect(screen.getByText(/Email: Not an email address/)).toBeInTheDocument()
    expect(screen.getByText(/Name is missing/)).toBeInTheDocument()
    expect(screen.getByText(/Same email as row 2/)).toBeInTheDocument()
  })

  it("can show only the problem rows", async () => {
    const user = userEvent.setup()
    render(<Import1 fields={fields} sampleCsv={csv} defaultStep={2} />)
    expect(within(screen.getByRole("table")).getAllByRole("row")).toHaveLength(5)
    await user.click(screen.getByRole("checkbox", { name: /Show only the rows with problems/ }))
    expect(within(screen.getByRole("table")).getAllByRole("row")).toHaveLength(4)
  })

  it("imports only the rows that passed, with progress, then summarises", async () => {
    const user = userEvent.setup()
    const onImport = vi.fn().mockImplementation(async (_rows, progress) => progress(1))
    render(<Import1 fields={fields} sampleCsv={csv} defaultStep={2} onImport={onImport} />)
    await user.click(screen.getByRole("button", { name: /Continue with 1 row/ }))
    await user.click(screen.getByRole("button", { name: "Start import" }))
    expect(onImport).toHaveBeenCalledWith([{ name: "Ann", email: "ann@a.co" }], expect.any(Function))
    expect(await screen.findByRole("heading", { name: "1 contact imported" })).toBeInTheDocument()
    expect(screen.getByText("3 rows were skipped because of problems.")).toBeInTheDocument()
  })

  it("keeps the rows and offers Try again when the import fails", async () => {
    const user = userEvent.setup()
    render(<Import1 fields={fields} sampleCsv={csv} defaultStep={3} onImport={() => Promise.reject(new Error("The server timed out."))} />)
    await user.click(screen.getByRole("button", { name: "Start import" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("The server timed out.")
    expect(screen.getByRole("button", { name: "Try again" })).toBeEnabled()
  })

  it("rejects a file that is not a CSV and says how to export one", async () => {
    const user = userEvent.setup({ applyAccept: false })
    render(<Import1 fields={fields} />)
    await user.upload(screen.getByLabelText("CSV file"), new File(["x"], "photo.png", { type: "image/png" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("Save as and pick CSV")
  })

  it("reads quoted fields with commas inside", async () => {
    const user = userEvent.setup()
    render(<Import1 fields={fields} />)
    await user.upload(screen.getByLabelText("CSV file"), new File(['Name,Email\n"Smith, Ann",ann@a.co\n'], "q.csv", { type: "text/csv" }))
    await screen.findByRole("heading", { name: "Match your columns" })
    expect(screen.getByText(/Smith, Ann/)).toBeInTheDocument()
  })

  it("shows loading and error states", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const { rerender } = render(<Import1 state="loading" />)
    expect(screen.getByRole("status")).toBeInTheDocument()
    rerender(<Import1 state="error" onRetry={onRetry} />)
    await user.click(screen.getByRole("button", { name: /try again/i }))
    expect(onRetry).toHaveBeenCalled()
  })
})
