import { readFileSync } from "node:fs"
import { join } from "node:path"
import { ANIMATE_THEME } from "@ballmac-ui/theme-engine"
import { describe, expect, it } from "vitest"

const squash = (v: string) => v.replace(/\s+/g, "")

describe("motion theme and tw-animate-css", () => {
  const css = readFileSync(join(import.meta.dirname, "../node_modules/tw-animate-css/dist/tw-animate.css"), "utf8")

  // The theme repeats these definitions to make the duration speed-aware. If the package changes them, this fails so the copy is updated.
  for (const [name, value] of Object.entries(ANIMATE_THEME)) {
    it(`${name} is tw-animate-css's definition with only the duration changed`, () => {
      const original = css.match(new RegExp(`--${name}: ([^;]*);`))?.[1]
      expect(original, `${name} is defined by tw-animate-css`).toBeTruthy()
      expect(squash(value)).toBe(squash(original!.replace(".15s", "calc(150ms / var(--bm-speed))").replace(".2s", "calc(200ms / var(--bm-speed))")))
    })
  }
})
