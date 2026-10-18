import {
  auditTheme,
  buildTheme,
  decodeCode,
  DEFAULT_SPEC,
  encodeCode,
  feelSpec,
  FEELS,
  FONT_CHOICES,
  getFontFace,
  getPersonality,
  getPreset,
  getSystem,
  isCode,
  isFeelId,
  isFontChoice,
  matchPersonality,
  MOTION_PERSONALITIES,
  normalizeSpec,
  SYSTEMS,
  type ThemeSpec,
} from "@ballmac-ui/theme-engine"

/**
 * Makes a preset from a description, for agents and scripts: `GET /api/v1/preset?from=ink&hue=262&font=geist&feel=macos`.
 * It starts from a design system, a colour theme or a code (or the defaults), applies what is asked for, and answers with the 16-character code,
 * the install command, what the design is made of and its contrast results. Every value is clamped by the theme engine; nothing is stored.
 */
const HEADERS = { "access-control-allow-origin": "*", "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400" }
const fail = (message: string) => Response.json({ error: message }, { status: 400, headers: { "access-control-allow-origin": "*", "cache-control": "no-store" } })

const NUMBERS = { hue: [0, 360], chroma: [0, 0.26], radius: [0, 1.5], tint: [0, 0.03] } as const

export function GET(request: Request) {
  const url = new URL(request.url)
  const q = url.searchParams
  let spec: ThemeSpec = { ...DEFAULT_SPEC, ...getPersonality("native")!.motion }

  const from = q.get("from")
  if (from) {
    const base = getSystem(from)?.spec ?? getPreset(from)?.spec ?? (isCode(from) ? decodeCode(from) : null)
    if (!base) return fail(`"from" is not a design system, a theme or a valid code. Systems: ${SYSTEMS.map((s) => s.slug).join(", ")}. Themes are named like ocean or violet.`)
    spec = base
  }

  const feel = q.get("feel")
  if (feel) {
    if (!isFeelId(feel)) return fail(`"feel" must be one of ${FEELS.map((f) => f.slug).join(", ")}.`)
    spec = { ...spec, ...feelSpec(feel) }
  }
  const motion = q.get("motion")
  if (motion) {
    const p = getPersonality(motion)
    if (!p) return fail(`"motion" must be one of ${MOTION_PERSONALITIES.map((m) => m.slug).join(", ")}.`)
    spec = { ...spec, ...p.motion }
  }

  const patch: Partial<ThemeSpec> = {}
  for (const [key, [min, max]] of Object.entries(NUMBERS)) {
    const raw = q.get(key)
    if (raw === null) continue
    const n = Number(raw)
    if (raw.trim() === "" || !Number.isFinite(n) || n < min || n > max) return fail(`"${key}" must be a number from ${min} to ${max}.`)
    if (key === "tint") patch.neutralChroma = n
    else patch[key as "hue" | "chroma" | "radius"] = n
  }
  if (patch.hue !== undefined && q.get("greyHue") === null) patch.neutralHue = patch.hue
  const grey = q.get("greyHue")
  if (grey !== null) {
    const n = Number(grey)
    if (grey.trim() === "" || !Number.isFinite(n) || n < 0 || n > 360) return fail(`"greyHue" must be a number from 0 to 360.`)
    patch.neutralHue = n
  }
  const primary = q.get("primary")
  if (primary) {
    if (primary !== "brand" && primary !== "ink") return fail(`"primary" must be brand or ink.`)
    patch.primary = primary
  }
  const edge = q.get("edge")
  if (edge) {
    if (edge !== "soft" && edge !== "strong") return fail(`"edge" must be soft or strong.`)
    patch.edge = edge
  }
  const density = q.get("density")
  if (density) {
    if (density !== "compact" && density !== "default" && density !== "comfortable") return fail(`"density" must be compact, default or comfortable.`)
    patch.density = density
  }
  const paper = q.get("paper")
  if (paper !== null) {
    if (!["true", "false", "1", "0"].includes(paper)) return fail(`"paper" must be true or false.`)
    patch.paper = paper === "true" || paper === "1"
  }
  const font = q.get("font")
  if (font) {
    if (!isFontChoice(font)) return fail(`"font" must be one of ${FONT_CHOICES.join(", ")}.`)
    patch.font = font
  }

  spec = normalizeSpec({ ...spec, ...patch })
  const code = encodeCode(spec)
  const snapped = decodeCode(code)!
  const system = SYSTEMS.find((s) => s.code === code)
  const name = system?.slug ?? code
  const checks = auditTheme(buildTheme(snapped))
  const failing = checks.filter((c) => !c.pass)
  const face = getFontFace(snapped.font)

  return Response.json(
    {
      code,
      name: system?.title ?? null,
      install: `npx shadcn@latest add @ballmac/preset-${name}`,
      url: `${url.origin}/r/preset-${name}.json`,
      builder: `${url.origin}/themes?code=${code}`,
      madeOf: {
        typeface: face ? `${face.label} (installed from Fontsource)` : snapped.font === "keep" ? "your project's font" : `${snapped.font} system stack`,
        feel: snapped.feel,
        motion: matchPersonality(snapped)?.slug ?? "custom",
        radius: `${snapped.radius}rem`,
        density: snapped.density,
        buttons: snapped.primary,
        hue: snapped.hue,
      },
      contrast: { passed: checks.length - failing.length, total: checks.length, failing: failing.map((c) => `${c.mode} ${c.label} ${c.ratio}:1 (needs ${c.min}:1)`) },
      onlyParts: "Add ?only=colors,shape,font,motion,feel to the url to install some parts.",
      spec: snapped,
    },
    { headers: HEADERS }
  )
}
