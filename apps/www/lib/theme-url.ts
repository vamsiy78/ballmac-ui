import { encodeSpec, PRESETS, type ThemeSpec } from "@ballmac-ui/theme-engine"

export type ThemeView = "light" | "dark" | "split"

const same = (a: ThemeSpec, b: ThemeSpec) => (Object.keys(a) as (keyof ThemeSpec)[]).every((k) => a[k] === b[k])

/**
 * The address that describes a theme on the builder, so the address bar is always a link you can share.
 *
 * - The design the page opened on keeps the page's own address (`/themes` or `/themes/violet`).
 * - Any other preset gets its own clean address (`/themes/rose`), never a long query.
 * - A customised design is `/themes?h=…`, with only the values that differ from the default, so the path never names a preset it no longer is.
 * - A dark or split preview adds `view=…`; light is the default and adds nothing.
 */
export function themeUrl({ spec, view, initial, basePath }: { spec: ThemeSpec; view: ThemeView; initial: ThemeSpec; basePath: string }): string {
  const params = new URLSearchParams()
  let path = "/themes"
  if (same(spec, initial)) {
    path = basePath
  } else {
    const preset = PRESETS.find((p) => same(p.spec, spec))
    if (preset) {
      path = `/themes/${preset.slug}`
    } else {
      encodeSpec(spec).forEach((value, key) => params.set(key, value))
      // the builder reads a design from the address only when `h` is present
      if (params.size && !params.has("h")) params.set("h", String(spec.hue))
    }
  }
  if (view !== "light") params.set("view", view)
  const query = params.toString()
  return query ? `${path}?${query}` : path
}
