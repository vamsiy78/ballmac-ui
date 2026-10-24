import { describe, expect, it } from "vitest"

import { licenceText, proLicence, proLicenceSummary, resolveRefs, sectionNumber } from "../lib/pro-licence"

describe("the Pro licence", () => {
  it("has unique section ids", () => {
    const ids = proLicence.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("resolves every cross-reference to a real section", () => {
    expect(() => licenceText()).not.toThrow()
    expect(licenceText()).not.toMatch(/\[\[|\]\]/)
  })

  it("refuses a reference to a section that does not exist", () => {
    expect(() => resolveRefs("see [[nowhere]]")).toThrow(/unknown section/)
    expect(resolveRefs("see [[grant]]")).toBe(`see section ${sectionNumber("grant")}`)
  })

  it("keeps the unmatched ** markers out of the plain text", () => {
    expect(licenceText()).not.toContain("**")
  })

  it("keeps the clauses that protect the licensor", () => {
    const text = licenceText()
    for (const needle of [
      "purchases are final",
      "non-transferable",
      "train, fine-tune",
      "Prohibited Product",
      "Arbitration and Conciliation Act, 1996",
      "laws of India",
      "total aggregate liability",
      "injunctive",
    ]) {
      expect(text).toContain(needle)
    }
  })

  it("states the refund policy exactly: fix within 14 days or refund, nothing wider", () => {
    const text = licenceText()
    expect(text).toContain("within 14 days of your request")
    expect(text).toContain("within 14 days of purchase")
    expect(text).not.toMatch(/\[[A-Za-z ]+\]/) // no leftover [bracketed] placeholders
  })

  it("describes the Team licence as 10 named people at one organisation", () => {
    const text = licenceText()
    expect(text).toMatch(/up to 10 named people/)
    expect(text).not.toMatch(/company licence does not give/i)
  })

  it("has a plain-English summary for each side", () => {
    expect(proLicenceSummary.can.length).toBeGreaterThan(0)
    expect(proLicenceSummary.cannot.length).toBeGreaterThan(0)
  })
})
