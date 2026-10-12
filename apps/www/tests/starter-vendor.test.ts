import { describe, expect, it } from "vitest"

import { mergeCss, renderCss, renderStack } from "../../../scripts/starter-vendor"

describe("starter-vendor stack", () => {
  it("renders selectors, at-rules and nested rules", () => {
    expect(renderCss({ '[data-feel="macos"]': { "--radius": "0.625rem" }, "@media (forced-colors: active)": { "[data-slot=\"button\"]": { border: "1px solid ButtonText" } } })).toBe(
      ['[data-feel="macos"] {', "  --radius: 0.625rem;", "}", "@media (forced-colors: active) {", '  [data-slot="button"] {', "    border: 1px solid ButtonText;", "  }", "}"].join("\n")
    )
  })

  it("merges rules with the same selector and lets later values win", () => {
    expect(mergeCss({ a: { x: "1", y: "2" } }, { a: { y: "3" }, b: { z: "4" } })).toEqual({ a: { x: "1", y: "3" }, b: { z: "4" } })
  })

  it("builds one stylesheet from a stack of items, later items overriding earlier ones", () => {
    const items: Record<string, { name: string; cssVars?: { theme?: Record<string, string>; light?: Record<string, string>; dark?: Record<string, string> }; css?: Record<string, string | Record<string, string>> }> = {
      base: { name: "base", cssVars: { theme: { "ease-out": "var(--bm-ease-out)" }, light: { primary: "black", radius: "1rem" }, dark: { primary: "white" } } },
      preset: { name: "preset", cssVars: { light: { primary: "teal" } } },
      feel: { name: "feel", css: { '[data-feel="windows"]': { "--radius": "0.25rem" } } },
    }
    const css = renderStack(["base", "preset", "feel"], (n) => items[n]!)
    expect(css).toContain("@theme {\n  --ease-out: var(--bm-ease-out);\n}")
    expect(css).toContain(":root {\n  --primary: teal;\n  --radius: 1rem;\n}")
    expect(css).toContain(".dark {\n  --primary: white;\n}")
    expect(css).toContain('[data-feel="windows"] {\n  --radius: 0.25rem;\n}')
    expect(css.startsWith("/* Generated from base + preset + feel")).toBe(true)
  })
})
