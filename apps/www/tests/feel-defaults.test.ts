import { readFileSync } from "node:fs"
import { join } from "node:path"
import { feelVars } from "@ballmac-ui/theme-engine"
import { describe, expect, it } from "vitest"

const theme = readFileSync(join(import.meta.dirname, "../node_modules/tailwindcss/theme.css"), "utf8")
const value = (name: string) => theme.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1]?.trim().replace(/\s+/g, " ")
const squash = (v: string | undefined) => v?.replace(/\s+/g, "").replace(/,/g, ", ")

describe("the web feel is Tailwind's own defaults", () => {
  const web = feelVars("web").root

  for (const k of ["xs", "sm", "md", "lg", "xl", "2xl"]) {
    it(`shadow-${k}`, () => {
      expect(squash(web[`bm-shadow-${k}`])).toBe(squash(value(`shadow-${k}`)))
    })
  }
  for (const k of ["xs", "sm", "base"]) {
    it(`text-${k}`, () => {
      expect(web[`bm-text-${k}`]).toBe(value(`text-${k}`))
      expect(squash(web[`bm-text-${k}-lh`])).toBe(squash(value(`text-${k}--line-height`)))
    })
  }
})
