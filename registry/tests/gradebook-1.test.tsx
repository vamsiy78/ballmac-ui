import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Gradebook1, average, letter } from "@/components/ballmac/blocks/gradebook-1/gradebook-1"

const as = [{ id: "a", title: "A", max: 50, weight: 1 }, { id: "b", title: "B", max: 100, weight: 3 }]

describe("average and letter", () => {
  it("weights each graded score by its weight and ignores what is not graded yet", () => {
    expect(average("s", as, { "s:a": 50, "s:b": 50 })?.percent).toBeCloseTo((1 * 100 + 3 * 50) / 4, 6)
    expect(average("s", as, { "s:a": 25, "s:b": null })).toMatchObject({ percent: 50, graded: 1 })
    expect(average("s", as, {})).toBeNull()
  })
  it("maps a percentage to a letter", () => {
    expect([95, 85, 75, 65, 40].map(letter)).toEqual(["A", "B", "C", "D", "F"])
  })
})

describe("Gradebook1", () => {
  it("is a table with an input for every score, named for the student, assignment and maximum", () => {
    render(<Gradebook1 />)
    expect(screen.getByRole("textbox", { name: "Amara Okafor, Essay, out of 40" })).toHaveValue("36")
    expect(screen.getByRole("textbox", { name: "Lina Rossi, Quiz 2, out of 20" })).toHaveValue("")
    expect(screen.getAllByRole("textbox")).toHaveLength(20)
  })

  it("shows each student's average with a letter and how much is graded, and the class average per assignment", () => {
    render(<Gradebook1 />)
    const row = screen.getByRole("rowheader", { name: "Amara Okafor" }).closest("tr") as HTMLElement
    expect(within(row).getByText("92%")).toBeInTheDocument()
    expect(within(row).getByText("A")).toBeInTheDocument()
    const lina = screen.getByRole("rowheader", { name: "Lina Rossi" }).closest("tr") as HTMLElement
    expect(within(lina).getByText("2 of 4 graded")).toBeInTheDocument()
    expect(within(screen.getByRole("rowheader", { name: "Class average" }).closest("tr") as HTMLElement).getAllByRole("cell")[0]).toHaveTextContent("78%")
  })

  it("calls out a student below the pass mark in words, in the header and on the row", () => {
    render(<Gradebook1 />)
    expect(screen.getByText(/1 student is below the 60% pass mark:/)).toBeInTheDocument()
    expect(within(screen.getByRole("rowheader", { name: "Kofi Mensah" }).closest("tr") as HTMLElement).getByText("Below pass mark")).toBeInTheDocument()
  })

  it("saves a score when you leave the cell and the average follows", async () => {
    const user = userEvent.setup()
    const onScoreChange = vi.fn().mockResolvedValue(undefined)
    render(<Gradebook1 onScoreChange={onScoreChange} />)
    const cell = screen.getByRole("textbox", { name: "Lina Rossi, Quiz 2, out of 20" })
    await user.type(cell, "18")
    await user.tab()
    expect(onScoreChange).toHaveBeenCalledWith("s3", "a3", 18)
    expect(within(screen.getByRole("rowheader", { name: "Lina Rossi" }).closest("tr") as HTMLElement).getByText("3 of 4 graded")).toBeInTheDocument()
  })

  it("refuses a score out of range with a message and does not save it", async () => {
    const user = userEvent.setup()
    const onScoreChange = vi.fn()
    render(<Gradebook1 onScoreChange={onScoreChange} />)
    const cell = screen.getByRole("textbox", { name: "Amara Okafor, Essay, out of 40" })
    await user.clear(cell)
    await user.type(cell, "55")
    await user.tab()
    expect(onScoreChange).not.toHaveBeenCalled()
    expect(await screen.findByRole("alert")).toHaveTextContent("Essay is out of 40. Enter a number from 0 to 40")
    expect(screen.getByRole("textbox", { name: "Amara Okafor, Essay, out of 40" })).toHaveAttribute("aria-invalid", "true")
    expect(screen.getByRole("textbox", { name: "Amara Okafor, Essay, out of 40" })).toHaveValue("36")
  })

  it("puts the old score back and says why when saving fails", async () => {
    const user = userEvent.setup()
    render(<Gradebook1 onScoreChange={() => Promise.reject(new Error("The school system is offline."))} />)
    const cell = screen.getByRole("textbox", { name: "Jonas Weber, Quiz 1, out of 20" })
    await user.clear(cell)
    await user.type(cell, "19")
    await user.tab()
    expect(await screen.findByRole("alert")).toHaveTextContent("The school system is offline.")
    expect(screen.getByRole("textbox", { name: "Jonas Weber, Quiz 1, out of 20" })).toHaveValue("12")
  })

  it("shows loading, empty and error states", () => {
    const { rerender } = render(<Gradebook1 state="loading" />)
    expect(screen.getByRole("status")).toHaveTextContent("Loading the gradebook")
    rerender(<Gradebook1 students={[]} />)
    expect(screen.getByText("No students yet")).toBeInTheDocument()
    rerender(<Gradebook1 state="error" onRetry={() => {}} />)
    expect(screen.getByRole("alert")).toHaveTextContent("The gradebook could not be loaded")
  })
})
