import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Textarea } from "@/components/ballmac/textarea"

describe("Textarea", () => {
  it("works uncontrolled and forwards refs", async () => {
    const ref = React.createRef<HTMLTextAreaElement>()
    render(<Textarea aria-label="Notes" ref={ref} />)
    const field = screen.getByRole("textbox", { name: "Notes" })
    await userEvent.type(field, "Ship it")
    expect(field).toHaveValue("Ship it")
    expect(ref.current).toBe(field)
  })

  it("sets an explicit height and disables manual resize with autoResize", async () => {
    function Controlled() {
      const [value, setValue] = React.useState("")
      return <Textarea aria-label="Message" autoResize minRows={1} maxRows={4} value={value} onChange={(e) => setValue(e.target.value)} />
    }
    render(<Controlled />)
    const field = screen.getByRole("textbox", { name: "Message" })
    expect(field).toHaveAttribute("rows", "1")
    expect(field).toHaveAttribute("data-autoresize", "true")
    expect(field.style.height).toMatch(/px$/)
    await userEvent.type(field, "Hello")
    expect(field).toHaveValue("Hello")
  })
})
