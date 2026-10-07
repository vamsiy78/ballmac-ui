import { describe, expect, it } from "vitest"
import { decodeSpec, DEFAULT_SPEC, getPreset, normalizeSpec, PRESETS } from "@ballmac-ui/theme-engine"

import { themeUrl } from "../lib/theme-url"

const ocean = PRESETS[1]!.spec
const violet = getPreset("violet")!.spec
const rose = getPreset("rose")!.spec

describe("themeUrl", () => {
  it("keeps the page's own address for the design it opened on", () => {
    expect(themeUrl({ spec: ocean, view: "light", initial: ocean, basePath: "/themes" })).toBe("/themes")
    expect(themeUrl({ spec: violet, view: "light", initial: violet, basePath: "/themes/violet" })).toBe("/themes/violet")
  })

  it("gives every other preset a clean address, whichever page it started on", () => {
    expect(themeUrl({ spec: rose, view: "light", initial: ocean, basePath: "/themes" })).toBe("/themes/rose")
    // the bug this replaces: Rose chosen on the Violet page used to read /themes/violet?h=12&…
    expect(themeUrl({ spec: rose, view: "light", initial: violet, basePath: "/themes/violet" })).toBe("/themes/rose")
  })

  it("puts a customised design on /themes, so the path never names a preset it no longer is", () => {
    const custom = normalizeSpec({ ...violet, hue: 310 })
    const url = themeUrl({ spec: custom, view: "light", initial: violet, basePath: "/themes/violet" })
    expect(url.startsWith("/themes?")).toBe(true)
    expect(url).toContain("h=310")
  })

  it("round-trips a customised design through the address", () => {
    const custom = normalizeSpec({ ...ocean, hue: 123, chroma: 0.09, radius: 0.375, paper: true, edge: "strong" })
    const url = themeUrl({ spec: custom, view: "light", initial: ocean, basePath: "/themes" })
    const back = decodeSpec(new URL(url, "https://ui.ballmac.com").searchParams, DEFAULT_SPEC)
    expect(back).toEqual(custom)
  })

  it("always writes h when anything is customised, because the builder only reads a design when h is present", () => {
    const onlyRadius = normalizeSpec({ ...DEFAULT_SPEC, radius: 0.375 })
    const url = themeUrl({ spec: onlyRadius, view: "light", initial: ocean, basePath: "/themes" })
    expect(new URL(url, "https://x.test").searchParams.has("h")).toBe(true)
  })

  it("adds view only for dark and split", () => {
    expect(themeUrl({ spec: ocean, view: "dark", initial: ocean, basePath: "/themes" })).toBe("/themes?view=dark")
    expect(themeUrl({ spec: violet, view: "split", initial: ocean, basePath: "/themes" })).toBe("/themes/violet?view=split")
    expect(themeUrl({ spec: violet, view: "light", initial: ocean, basePath: "/themes" })).toBe("/themes/violet")
  })
})
