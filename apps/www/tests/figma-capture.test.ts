import { describe, expect, it } from "vitest"

import { fileBase, MODES, selectItems, VIEWPORTS } from "../../../scripts/figma-capture"

const items = [
  { name: "button", title: "Button", kind: "component", category: "primitives", tier: "free", examples: ["button-demo", "button-loading"], url: "" },
  { name: "hero-pro-1", title: "Hero Pro 1", kind: "block", category: "blocks", tier: "pro", examples: ["hero-pro-1-demo"], url: "" },
  { name: "hero-1", title: "Hero 1", kind: "block", category: "blocks", tier: "free", examples: ["hero-1-demo"], url: "" },
  { name: "color", title: "Color", kind: "foundation", category: "foundations", tier: "free", examples: [], url: "" },
  { name: "template-orbit", title: "Orbit", kind: "template", category: "templates", tier: "free", examples: ["template-orbit-demo"], url: "" },
]

describe("figma capture selection", () => {
  it("skips items without previews", () => {
    expect(selectItems(items, {}).map((i) => i.name)).not.toContain("color")
  })
  it("filters by tier, kind and name prefix", () => {
    expect(selectItems(items, { tier: "pro" }).map((i) => i.name)).toEqual(["hero-pro-1"])
    expect(selectItems(items, { kinds: ["template"] }).map((i) => i.name)).toEqual(["template-orbit"])
    expect(selectItems(items, { filter: ["hero"] }).map((i) => i.name)).toEqual(["hero-pro-1", "hero-1"])
    expect(selectItems(items, { filter: ["button"], tier: "all" }).map((i) => i.name)).toEqual(["button"])
  })
  it("names files predictably, one per width and mode", () => {
    expect(fileBase(items[1]!, "hero-pro-1-demo", "1440", "dark")).toBe("blocks/hero-pro-1/hero-pro-1-demo.1440.dark")
    expect(VIEWPORTS.map((v) => v.width)).toEqual([1440, 390])
    expect(MODES).toEqual(["light", "dark"])
  })
})
