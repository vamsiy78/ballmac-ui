import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Inspection1 } from "@/components/ballmac/blocks/inspection-1/inspection-1"

const group = (name: string) => screen.getByRole("group", { name })
const choose = (name: string, answer: string) => userEvent.click(within(group(name)).getByLabelText(answer))

describe("Inspection1", () => {
  it("has a labelled radio group per item and counts what is answered", async () => {
    render(<Inspection1 />)
    expect(screen.getByText("0 of 8 answered")).toBeInTheDocument()
    await choose("Fridge reads 5 °C or below", "Pass")
    expect(screen.getByText("1 of 8 answered")).toBeInTheDocument()
    expect(screen.getByRole("meter", { name: "Items answered" })).toHaveAttribute("aria-valuetext", "1 of 8 answered")
  })

  it("asks for a note when something fails, and counts failures in words", async () => {
    render(<Inspection1 />)
    await choose("Exits are clear", "Fail")
    expect(screen.getByText("1 failed")).toBeInTheDocument()
    expect(screen.getByLabelText(/What is wrong\?/)).toBeInTheDocument()
    expect(screen.getByText("7 still to answer.")).toBeInTheDocument()
  })

  it("will not submit until every item is answered and every failure has a note, and says which", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<Inspection1 onSubmit={onSubmit} defaultResult={{ c1: { answer: "pass" }, c2: { answer: "pass" }, c3: { answer: "pass" }, k1: { answer: "pass" }, k2: { answer: "pass" }, k3: { answer: "pass" }, f1: { answer: "fail" } }} />)
    await user.click(screen.getByRole("button", { name: "Submit inspection" }))
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getAllByText("Answer this item.")).toHaveLength(1)
    await choose("Extinguisher is in date and in place", "Pass")
    await user.click(screen.getByRole("button", { name: "Submit inspection" }))
    expect(screen.getByText("Say what is wrong so someone can fix it.")).toBeInTheDocument()
    expect(screen.getByLabelText(/What is wrong\?/)).toHaveAttribute("aria-invalid", "true")
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("submits every answer with its note and photos, and says how many failures need following up", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const all = Object.fromEntries(["c1", "c2", "c3", "k1", "k2", "k3", "f2"].map((k) => [k, { answer: "pass" as const }]))
    render(<Inspection1 onSubmit={onSubmit} defaultResult={{ ...all, f1: { answer: "fail" } }} />)
    await user.type(screen.getByLabelText(/What is wrong\?/), "A crate blocks the back door.")
    const file = new File(["x"], "door.jpg", { type: "image/jpeg" })
    await user.upload(screen.getByLabelText("Add photos for Exits are clear"), file)
    expect(screen.getByText("door.jpg")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Submit inspection" }))
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ f1: { answer: "fail", note: "A crate blocks the back door.", photos: ["door.jpg"] } }))
    expect(await screen.findByText("Inspection submitted with 1 failure to follow up.")).toBeInTheDocument()
  })

  it("keeps the answers and says why when submitting fails", async () => {
    const user = userEvent.setup()
    const all = Object.fromEntries(["c1", "c2", "c3", "k1", "k2", "k3", "f1", "f2"].map((k) => [k, { answer: "pass" as const }]))
    render(<Inspection1 defaultResult={all} onSubmit={() => Promise.reject(new Error("The records system is unavailable."))} />)
    await user.click(screen.getByRole("button", { name: "Submit inspection" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("The records system is unavailable.")
    expect(within(group("Exits are clear")).getByLabelText("Pass")).toBeChecked()
  })

  it("shows loading, empty and error states", () => {
    const { rerender } = render(<Inspection1 state="loading" />)
    expect(screen.getByRole("status")).toHaveTextContent("Loading the inspection")
    rerender(<Inspection1 inspection={null} />)
    expect(screen.getByText("No inspection to do")).toBeInTheDocument()
    rerender(<Inspection1 state="error" onRetry={() => {}} />)
    expect(screen.getByRole("alert")).toHaveTextContent("The inspection could not be loaded")
  })
})
