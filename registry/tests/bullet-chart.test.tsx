import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { BulletChart, standing } from "@/components/ballmac/bullet-chart"

describe("standing", () => {
  it("compares a value with its target, the right way round for lower-is-better measures", () => {
    expect(standing({ id: "a", label: "a", value: 100, target: 90 })).toBe("met")
    expect(standing({ id: "a", label: "a", value: 80, target: 90 })).toBe("close")
    expect(standing({ id: "a", label: "a", value: 50, target: 90 })).toBe("behind")
    expect(standing({ id: "a", label: "a", value: 150, target: 200, lowerIsBetter: true })).toBe("met")
    expect(standing({ id: "a", label: "a", value: 400, target: 200, lowerIsBetter: true })).toBe("behind")
    expect(standing({ id: "a", label: "a", value: 5 })).toBe("none")
  })
})

describe("BulletChart", () => {
  it("shows each measure as a meter with a spoken value and says whether the target was met, in words", () => {
    render(<BulletChart items={[{ id: "a", label: "Revenue", value: 84, target: 90, max: 120 }, { id: "b", label: "Customers", value: 130, target: 120 }]} />)
    expect(screen.getByRole("meter", { name: "Revenue" })).toHaveAttribute("aria-valuetext", "84 against a target of 90. Close to target")
    expect(screen.getByRole("meter", { name: "Customers" }).getAttribute("aria-valuetext")).toContain("Target met")
    expect(screen.getByText("Close to target")).toBeInTheDocument()
    expect(screen.getByText("Target met")).toBeInTheDocument()
  })
  it("shows the value and the goal as text, and uses your format", () => {
    render(<BulletChart format={(v) => `${v} ms`} items={[{ id: "a", label: "Median", value: 142, target: 200, lowerIsBetter: true }]} />)
    expect(screen.getByText("142 ms")).toBeInTheDocument()
    expect(screen.getByText("of 200 ms")).toBeInTheDocument()
  })
  it("says nothing about a goal when there is none", () => {
    render(<BulletChart items={[{ id: "a", label: "Visits", value: 5, note: "This week" }]} />)
    expect(screen.queryByText(/target/i)).toBeNull()
    expect(screen.getByText("This week")).toBeInTheDocument()
  })
})
