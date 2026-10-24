import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { PromptLibrary, extractVariables, fillPrompt, type LibraryPrompt } from "@/components/ballmac/prompt-library"

afterEach(() => vi.restoreAllMocks())

const prompts: LibraryPrompt[] = [
  { id: "1", title: "Reply to a customer", description: "A calm, specific reply.", body: "Write a {{tone}} reply to {{customer_name}} about {{issue}}.", tags: ["support"] },
  { id: "2", title: "Summarise a thread", body: "Summarise this thread in {{count}} bullet points.", tags: ["summaries"], favourite: true },
  { id: "3", title: "Plain rewrite", body: "Rewrite the text below in plain English.", tags: ["writing"] },
]

describe("extractVariables and fillPrompt", () => {
  it("lists variables once each in order, and fills the ones that have a value", () => {
    expect(extractVariables("Hi {{ name }}, {{name}} and {{customer_name}}")).toEqual(["name", "customer_name"])
    expect(fillPrompt("Hi {{name}} from {{place}}", { name: " Ada " })).toBe("Hi Ada from {{place}}")
  })
})

describe("PromptLibrary", () => {
  it("lists prompts with pinned ones first", () => {
    render(<PromptLibrary prompts={prompts} onFavourite={() => {}} />)
    const titles = screen.getAllByRole("listitem").map((li) => li.textContent)
    expect(titles[0]).toContain("Summarise a thread")
  })

  it("searches the text and filters by tag", async () => {
    const user = userEvent.setup()
    render(<PromptLibrary prompts={prompts} />)
    await user.type(screen.getByRole("searchbox", { name: "Search prompts" }), "plain")
    expect(screen.getAllByRole("listitem")).toHaveLength(1)
    await user.clear(screen.getByRole("searchbox"))
    await user.click(screen.getByRole("button", { name: "support" }))
    expect(screen.getAllByRole("listitem")).toHaveLength(1)
    expect(screen.getByRole("button", { name: "support" })).toHaveAttribute("aria-pressed", "true")
    await user.type(screen.getByRole("searchbox"), "zzzz")
    expect(screen.getByText("No prompts match.")).toBeInTheDocument()
  })

  it("makes a labelled field for each variable, humanised, and shows a live preview", async () => {
    const user = userEvent.setup()
    render(<PromptLibrary prompts={prompts} />)
    await user.click(screen.getByRole("button", { name: /Reply to a customer/ }))
    expect(screen.getByLabelText("tone")).toBeInTheDocument()
    expect(screen.getByLabelText("customer name")).toBeInTheDocument()
    expect(screen.getByLabelText("issue")).toBeInTheDocument()
    const preview = document.querySelector("[data-slot=prompt-library-preview]") as HTMLElement
    expect(preview).toHaveTextContent("{{customer_name}}")
    await user.type(screen.getByLabelText("customer name"), "Maria")
    expect(preview).toHaveTextContent("Write a {{tone}} reply to Maria about {{issue}}.")
  })

  it("will not insert until everything is filled, and names what is missing", async () => {
    const user = userEvent.setup()
    const onInsert = vi.fn()
    render(<PromptLibrary prompts={prompts} onInsert={onInsert} />)
    await user.click(screen.getByRole("button", { name: /Reply to a customer/ }))
    await user.type(screen.getByLabelText("tone"), "calm")
    await user.click(screen.getByRole("button", { name: "Insert" }))
    expect(screen.getByRole("alert")).toHaveTextContent("Fill in: customer name, issue")
    expect(onInsert).not.toHaveBeenCalled()
  })

  it("inserts the finished text and says so", async () => {
    const user = userEvent.setup()
    const onInsert = vi.fn().mockResolvedValue(undefined)
    render(<PromptLibrary prompts={prompts} onInsert={onInsert} />)
    await user.click(screen.getByRole("button", { name: /Summarise a thread/ }))
    await user.type(screen.getByLabelText("count"), "5")
    await user.click(screen.getByRole("button", { name: "Insert" }))
    expect(onInsert).toHaveBeenCalledWith("Summarise this thread in 5 bullet points.", expect.objectContaining({ id: "2" }))
    expect(await screen.findByText("Inserted: Summarise a thread")).toBeInTheDocument()
  })

  it("inserts a prompt with no variables straight away", async () => {
    const user = userEvent.setup()
    const onInsert = vi.fn()
    render(<PromptLibrary prompts={prompts} onInsert={onInsert} />)
    await user.click(screen.getByRole("button", { name: /Plain rewrite/ }))
    await user.click(screen.getByRole("button", { name: "Insert" }))
    expect(onInsert).toHaveBeenCalledWith("Rewrite the text below in plain English.", expect.anything())
  })

  it("says why when inserting fails, and copies the finished text", async () => {
    const user = userEvent.setup()
    const write = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined)
    render(<PromptLibrary prompts={prompts} onInsert={() => Promise.reject(new Error("The composer is closed."))} />)
    await user.click(screen.getByRole("button", { name: /Plain rewrite/ }))
    await user.click(screen.getByRole("button", { name: "Insert" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("The composer is closed.")
    await user.click(screen.getByRole("button", { name: "Copy" }))
    expect(write).toHaveBeenCalledWith("Rewrite the text below in plain English.")
  })

  it("pins a prompt at once and puts it back with the reason when that fails", async () => {
    const user = userEvent.setup()
    render(<PromptLibrary prompts={prompts} onFavourite={() => Promise.reject(new Error("Too many pinned prompts."))} />)
    await user.click(screen.getByRole("button", { name: "Pin Plain rewrite" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("Too many pinned prompts.")
    expect(screen.getByRole("button", { name: "Pin Plain rewrite" })).toHaveAttribute("aria-pressed", "false")
  })
})
