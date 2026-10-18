/**
 * The typefaces a theme can ask for. Four are system stacks and cost nothing; the rest are open-source variable fonts that the shadcn CLI
 * installs from Fontsource (`font-<id>` registry items), so they are served from your own app, not from a third-party host.
 *
 * The ORDER of FONT_CHOICES is part of the preset code format: append new fonts at the end, never reorder or remove.
 */
export type FontKind = "sans" | "serif" | "mono"

export type SystemFont = "keep" | "system" | "serif" | "mono"

export type FontFace = {
  /** The id used in theme links, preset codes and the `font-<id>` registry item. */
  id: string
  label: string
  kind: FontKind
  /** One short line on what it is good for. */
  note: string
  /** The CSS font stack written to `--font-sans`. */
  family: string
  /** The Google Fonts name the shadcn CLI records. */
  import: string
  /** The npm package that carries the font files. */
  dependency: string
  /** The `font-family` the package registers, without the fallback. */
  fontFamily: string
  /** The file inside the package with the Latin glyphs, for the site's previews. */
  latinFile: string
}

const GENERIC: Record<FontKind, string> = { sans: "sans-serif", serif: "serif", mono: "monospace" }

const face = (f: Omit<FontFace, "family" | "dependency"> & { package: string }): FontFace => ({
  ...f,
  dependency: `@fontsource-variable/${f.package}`,
  family: `'${f.fontFamily}', ${GENERIC[f.kind]}`,
})

/** Open-source variable fonts (SIL Open Font License). */
export const FONT_FACES: FontFace[] = [
  face({ id: "inter", label: "Inter", kind: "sans", note: "Neutral, built for screens. The safe default.", import: "Inter", package: "inter", fontFamily: "Inter Variable", latinFile: "inter-latin-wght-normal.woff2" }),
  face({ id: "geist", label: "Geist", kind: "sans", note: "Crisp and technical. Developer tools, dashboards.", import: "Geist", package: "geist", fontFamily: "Geist Variable", latinFile: "geist-latin-wght-normal.woff2" }),
  face({ id: "dm-sans", label: "DM Sans", kind: "sans", note: "Low contrast, geometric, friendly.", import: "DM Sans", package: "dm-sans", fontFamily: "DM Sans Variable", latinFile: "dm-sans-latin-wght-normal.woff2" }),
  face({ id: "manrope", label: "Manrope", kind: "sans", note: "Modern and a little wide. Fintech, SaaS.", import: "Manrope", package: "manrope", fontFamily: "Manrope Variable", latinFile: "manrope-latin-wght-normal.woff2" }),
  face({ id: "jakarta", label: "Plus Jakarta Sans", kind: "sans", note: "Warm geometric forms. Consumer apps.", import: "Plus Jakarta Sans", package: "plus-jakarta-sans", fontFamily: "Plus Jakarta Sans Variable", latinFile: "plus-jakarta-sans-latin-wght-normal.woff2" }),
  face({ id: "figtree", label: "Figtree", kind: "sans", note: "Friendly and open. Health, education, community.", import: "Figtree", package: "figtree", fontFamily: "Figtree Variable", latinFile: "figtree-latin-wght-normal.woff2" }),
  face({ id: "instrument-sans", label: "Instrument Sans", kind: "sans", note: "Slightly condensed, editorial. Studios and brands.", import: "Instrument Sans", package: "instrument-sans", fontFamily: "Instrument Sans Variable", latinFile: "instrument-sans-latin-wght-normal.woff2" }),
  face({ id: "space-grotesk", label: "Space Grotesk", kind: "sans", note: "Quirky, technical. Crypto, hardware, creative tools.", import: "Space Grotesk", package: "space-grotesk", fontFamily: "Space Grotesk Variable", latinFile: "space-grotesk-latin-wght-normal.woff2" }),
  face({ id: "bricolage", label: "Bricolage Grotesque", kind: "sans", note: "Characterful and bold. Marketing, portfolios.", import: "Bricolage Grotesque", package: "bricolage-grotesque", fontFamily: "Bricolage Grotesque Variable", latinFile: "bricolage-grotesque-latin-wght-normal.woff2" }),
  face({ id: "fraunces", label: "Fraunces", kind: "serif", note: "A soft, expressive serif. Editorial, food, lifestyle.", import: "Fraunces", package: "fraunces", fontFamily: "Fraunces Variable", latinFile: "fraunces-latin-wght-normal.woff2" }),
  face({ id: "newsreader", label: "Newsreader", kind: "serif", note: "A reading serif. Publications, docs, long text.", import: "Newsreader", package: "newsreader", fontFamily: "Newsreader Variable", latinFile: "newsreader-latin-wght-normal.woff2" }),
  face({ id: "source-serif", label: "Source Serif 4", kind: "serif", note: "Sturdy and neutral. Finance, legal, research.", import: "Source Serif 4", package: "source-serif-4", fontFamily: "Source Serif 4 Variable", latinFile: "source-serif-4-latin-wght-normal.woff2" }),
  face({ id: "jetbrains-mono", label: "JetBrains Mono", kind: "mono", note: "Made for code. Terminals, developer products.", import: "JetBrains Mono", package: "jetbrains-mono", fontFamily: "JetBrains Mono Variable", latinFile: "jetbrains-mono-latin-wght-normal.woff2" }),
  face({ id: "geist-mono", label: "Geist Mono", kind: "mono", note: "Clean monospace to pair with Geist.", import: "Geist Mono", package: "geist-mono", fontFamily: "Geist Mono Variable", latinFile: "geist-mono-latin-wght-normal.woff2" }),
]

export type FontId = (typeof FONT_FACES)[number]["id"]

/** Every value a theme's `font` can take. The position in this list is what a preset code stores. */
export const FONT_CHOICES: readonly string[] = ["keep", "system", "serif", "mono", ...FONT_FACES.map((f) => f.id)]

export const getFontFace = (id: string) => FONT_FACES.find((f) => f.id === id)
export const isFontChoice = (v: unknown): v is string => typeof v === "string" && FONT_CHOICES.includes(v)

/** The registry item that installs a font. */
export const fontItemName = (id: string) => `font-${id}`

/** The `registry:font` item the shadcn CLI installs: it adds the Fontsource package, imports it and sets `--font-sans`. */
export function fontRegistryItem(f: FontFace) {
  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: fontItemName(f.id),
    type: "registry:font" as const,
    title: f.label,
    description: `${f.label}: ${f.note} Installed from Fontsource, so the font files are served from your own app.`,
    author: "Ballmac <https://ui.ballmac.com>",
    font: {
      family: f.family,
      provider: "google" as const,
      import: f.import,
      variable: "--font-sans",
      subsets: ["latin"],
      dependency: f.dependency,
    },
  }
}
