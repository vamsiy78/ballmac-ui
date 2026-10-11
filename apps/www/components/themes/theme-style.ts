import type { CSSProperties } from "react"
import { buildTheme, reducedMotionFields, type ThemeSpec } from "@ballmac-ui/theme-engine"

export type Mode = "light" | "dark"

/** Inline custom properties that scope a theme to one element. Components read tokens only, so everything inside follows. */
export function themeStyle(spec: ThemeSpec, mode: Mode, reducedMotion = false): CSSProperties {
  // A media query cannot be scoped to one element, so a preview that should show reduced motion carries the reduced values inline.
  const vars = buildTheme(reducedMotion ? { ...spec, ...reducedMotionFields(spec) } : spec)
  const palette = { ...vars.light, ...(mode === "dark" ? vars.dark : {}) }
  const style: Record<string, string> = {}
  for (const [k, v] of Object.entries(palette)) style[`--${k}`] = v
  if (vars.theme.spacing) style["--spacing"] = vars.theme.spacing
  // Utilities like `font-sans` resolve the site's own font at build time, so the chosen stack is applied directly.
  if (vars.theme["font-sans"]) style.fontFamily = vars.theme["font-sans"]
  style.colorScheme = mode
  return style as CSSProperties
}
