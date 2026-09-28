import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ballmac/accordion"

describe("Accordion", () => {
  it("toggles sections and moves focus with arrow keys", async () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="a">
          <AccordionTrigger>First</AccordionTrigger>
          <AccordionContent>One</AccordionContent>
        </AccordionItem>
        <AccordionItem value="b">
          <AccordionTrigger>Second</AccordionTrigger>
          <AccordionContent>Two</AccordionContent>
        </AccordionItem>
      </Accordion>
    )
    const first = screen.getByRole("button", { name: "First" })
    await userEvent.click(first)
    expect(first).toHaveAttribute("aria-expanded", "true")
    first.focus()
    await userEvent.keyboard("{ArrowDown}")
    expect(screen.getByRole("button", { name: "Second" })).toHaveFocus()
  })
})
