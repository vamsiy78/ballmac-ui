import * as React from "react"
import { describe, expect, it } from "vitest"

import { isMediaImage } from "@/lib/ballmac/media-image"

describe("isMediaImage", () => {
  it("accepts an image URL and an image object", () => {
    expect(isMediaImage("/hero.png")).toBe(true)
    expect(isMediaImage({ src: "/hero.png", alt: "A dashboard" })).toBe(true)
    expect(isMediaImage({ src: "/light.png", srcDark: "/dark.png", alt: "" })).toBe(true)
  })

  it("rejects elements, nothing and objects without a source", () => {
    expect(isMediaImage(React.createElement("img", { src: "/x.png", alt: "" }))).toBe(false)
    expect(isMediaImage(undefined)).toBe(false)
    expect(isMediaImage(null)).toBe(false)
    expect(isMediaImage({ alt: "no source" })).toBe(false)
    expect(isMediaImage(42)).toBe(false)
  })
})
