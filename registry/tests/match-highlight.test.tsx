import * as React from "react"
import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { countMatches, MatchHighlight, matchesAll, queryTokens } from "@/components/ballmac/match-highlight"

describe("match-highlight", () => {
  it("splits a query into lowercase words without blanks or repeats", () => {
    expect(queryTokens("  Web hook WEB ")).toEqual(["web", "hook"])
    expect(queryTokens(["A", "a", ""])).toEqual(["a"])
  })

  it("tests that every word occurs, ignoring case", () => {
    expect(matchesAll("Create an API key", "api KEY")).toBe(true)
    expect(matchesAll("Create an API key", "api token")).toBe(false)
    expect(matchesAll("anything", "")).toBe(true)
  })

  it("counts occurrences of any word", () => {
    expect(countMatches("key by key, not a token", "key token")).toBe(3)
    expect(countMatches("nothing here", "zzz")).toBe(0)
    expect(countMatches("text", "")).toBe(0)
  })

  it("marks every occurrence with a mark element and keeps the text whole", () => {
    const { container } = render(<MatchHighlight text="Web hooks and webhook secrets" query="web" />)
    const marks = [...container.querySelectorAll("mark")].map((m) => m.textContent)
    expect(marks).toEqual(["Web", "web"])
    expect(container.textContent).toBe("Web hooks and webhook secrets")
  })

  it("treats special characters in the query as plain text", () => {
    const { container } = render(<MatchHighlight text="a (b) c" query="(b)" />)
    expect(container.querySelectorAll("mark")).toHaveLength(1)
    expect(container.querySelector("mark")?.textContent).toBe("(b)")
  })

  it("marks words in Arabic and Hebrew text, in a right-to-left container", () => {
    const { container } = render(
      <p dir="rtl">
        <MatchHighlight text="كيفية إعادة تعيين كلمة المرور بسرعة" query="كلمة المرور" />
      </p>
    )
    expect([...container.querySelectorAll("mark")].map((m) => m.textContent)).toEqual(["كلمة", "المرور"])
    expect(container.textContent).toBe("كيفية إعادة تعيين كلمة المرور بسرعة")
    const hebrew = render(<MatchHighlight text="איפוס סיסמה בשתי דקות" query="סיסמה" />)
    expect(hebrew.container.querySelector("mark")?.textContent).toBe("סיסמה")
  })

  it("renders plain text for an empty query", () => {
    const { container } = render(<MatchHighlight text="plain" query="" />)
    expect(container.querySelector("mark")).toBeNull()
    expect(container.textContent).toBe("plain")
  })
})
