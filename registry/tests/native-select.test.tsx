import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { NativeSelect, NativeSelectGroup, NativeSelectOption } from "@/components/ballmac/native-select"

const options = (
  <>
    <NativeSelectOption value="a">Alpha</NativeSelectOption>
    <NativeSelectOption value="b">Bravo</NativeSelectOption>
    <NativeSelectOption value="c" disabled>
      Charlie
    </NativeSelectOption>
  </>
)

describe("NativeSelect", () => {
  it("is the browser's own select, with its label and options", () => {
    render(
      <>
        <label htmlFor="s">Letter</label>
        <NativeSelect id="s" name="letter">
          {options}
        </NativeSelect>
      </>
    )
    const select = screen.getByRole("combobox", { name: "Letter" })
    expect(select.tagName).toBe("SELECT")
    expect(within(select).getAllByRole("option")).toHaveLength(3)
    expect(select).toHaveAttribute("name", "letter")
  })

  it("chooses a value, and reports it two ways", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const onValueChange = vi.fn()
    render(
      <NativeSelect aria-label="Letter" onChange={onChange} onValueChange={onValueChange}>
        {options}
      </NativeSelect>
    )
    await user.selectOptions(screen.getByRole("combobox"), "b")
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onValueChange).toHaveBeenCalledWith("b")
    expect(screen.getByRole("combobox")).toHaveValue("b")
  })

  it("can be controlled", async () => {
    const user = userEvent.setup()
    function C() {
      const [v, setV] = React.useState("a")
      return (
        <>
          <NativeSelect aria-label="Letter" value={v} onValueChange={setV}>
            {options}
          </NativeSelect>
          <output>{v}</output>
        </>
      )
    }
    render(<C />)
    await user.selectOptions(screen.getByRole("combobox"), "b")
    expect(screen.getByText("b", { selector: "output" })).toBeInTheDocument()
    expect(screen.getByRole("combobox")).toHaveValue("b")
  })

  it("starts on the placeholder, and a required one cannot be chosen again", () => {
    const { rerender } = render(
      <NativeSelect aria-label="Letter" placeholder="Choose one">
        {options}
      </NativeSelect>
    )
    expect(screen.getByRole("combobox")).toHaveValue("")
    expect(screen.getByRole("option", { name: "Choose one" })).not.toBeDisabled()
    rerender(
      <NativeSelect aria-label="Letter" placeholder="Choose one" required>
        {options}
      </NativeSelect>
    )
    expect(screen.getByRole("option", { name: "Choose one" })).toBeDisabled()
  })

  it("keeps a default value over the placeholder", () => {
    render(
      <NativeSelect aria-label="Letter" placeholder="Choose one" defaultValue="b">
        {options}
      </NativeSelect>
    )
    expect(screen.getByRole("combobox")).toHaveValue("b")
  })

  it("groups options", () => {
    render(
      <NativeSelect aria-label="Zone">
        <NativeSelectGroup label="Europe">
          <NativeSelectOption value="lis">Lisbon</NativeSelectOption>
        </NativeSelectGroup>
        <NativeSelectGroup label="Asia">
          <NativeSelectOption value="tok">Tokyo</NativeSelectOption>
        </NativeSelectGroup>
      </NativeSelect>
    )
    expect(screen.getByRole("group", { name: "Europe" })).toContainElement(screen.getByRole("option", { name: "Lisbon" }))
    expect(screen.getAllByRole("group")).toHaveLength(2)
  })

  it("shows invalid and disabled states to assistive technology", () => {
    render(
      <>
        <NativeSelect aria-label="One" aria-invalid="true">
          {options}
        </NativeSelect>
        <NativeSelect aria-label="Two" disabled>
          {options}
        </NativeSelect>
      </>
    )
    expect(screen.getByRole("combobox", { name: "One" })).toBeInvalid()
    expect(screen.getByRole("combobox", { name: "Two" })).toBeDisabled()
  })

  it("marks itself busy while options load, and stays usable", async () => {
    const user = userEvent.setup()
    render(
      <NativeSelect aria-label="City" loading placeholder="Loading cities">
        {options}
      </NativeSelect>
    )
    const select = screen.getByRole("combobox")
    expect(select).toHaveAttribute("aria-busy", "true")
    expect(select).toBeEnabled()
    expect(document.querySelector(".animate-spin")).toBeInTheDocument()
    await user.selectOptions(select, "a")
    expect(select).toHaveValue("a")
  })

  it("keeps the decorative arrow and icon out of the accessibility tree", () => {
    render(
      <NativeSelect aria-label="Letter" startIcon={<svg data-testid="icon" />}>
        {options}
      </NativeSelect>
    )
    expect(screen.getByTestId("icon").closest("[aria-hidden=true]")).toBeInTheDocument()
    expect(document.querySelector("[data-slot=native-select] > span[aria-hidden=true]:last-child svg")).toBeInTheDocument()
  })

  it("supports several choices in a list, with no arrow", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <NativeSelect aria-label="Letters" multiple rows={3} onValueChange={onValueChange}>
        {options}
      </NativeSelect>
    )
    const list = screen.getByRole("listbox")
    expect(list).toHaveAttribute("size", "3")
    expect(document.querySelector("[data-slot=native-select] > span[aria-hidden=true]")).toBeNull()
    await user.selectOptions(list, ["a", "b"])
    expect(onValueChange).toHaveBeenLastCalledWith("a,b")
  })

  it("takes the sizes the input does", () => {
    const { rerender } = render(<NativeSelect aria-label="Letter" size="sm">{options}</NativeSelect>)
    expect(document.querySelector("[data-slot=native-select]")).toHaveAttribute("data-size", "sm")
    expect(screen.getByRole("combobox").className).toContain("h-[var(--bm-control-h-sm")
    rerender(<NativeSelect aria-label="Letter" size="lg">{options}</NativeSelect>)
    expect(screen.getByRole("combobox").className).toContain("h-[var(--bm-control-h-lg")
  })
})
