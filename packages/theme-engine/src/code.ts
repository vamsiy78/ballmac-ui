/**
 * Preset codes: a whole design system (colour, shape, typeface, platform feel and motion) as 16 characters you can paste into a chat,
 * a README or a command: `npx shadcn@latest add @ballmac/preset-k3m9-w0tz-4hqd-bv7e`.
 *
 * Nothing is stored anywhere. The code IS the settings: each field is snapped to the step the theme builder's sliders use and packed
 * into one number (mixed radix, 76 bits), which is written in lowercase base 32 with a 4-bit check for typos. Decoding runs the result through
 * `normalizeSpec`, so any input produces a safe theme.
 *
 * The format is versioned. Within version 0 the lists below only ever grow at their end (fonts: see FONT_CHOICES), so a code made today
 * keeps meaning the same thing.
 */
import { DEFAULT_SPEC, normalizeSpec, type ThemeSpec } from "./engine"
import { FONT_CHOICES } from "./fonts"

const ALPHABET = "0123456789abcdefghjkmnpqrstvwxyz"
const LENGTH = 16
const DENSITIES = ["compact", "default", "comfortable"] as const
/** Append-only: the position is stored in the code. */
const FEEL_ORDER = ["web", "macos", "ios", "windows"] as const

type Field = { radix: number; get: (s: ThemeSpec) => number; set: (n: number, out: Partial<ThemeSpec>) => boolean }

const step = (n: number, size: number, min: number, max: number) => Math.min(max, Math.max(min, Math.round(n / size)))
const range = (min: number, size: number, count: number, key: "speed" | "bounce" | "travel" | "hover" | "stagger"): Field => ({
  radix: count,
  get: (s) => Math.min(count - 1, Math.max(0, Math.round((s[key] - min) / size))),
  set: (n, out) => ((out[key] = Number((min + n * size).toFixed(2))), n < count),
})

/** The fields, in the order they are packed. Never reorder or change a radix within a version. */
const FIELDS: Field[] = [
  { radix: 4, get: () => 0, set: (n) => n === 0 }, // version
  { radix: 360, get: (s) => Math.round(s.hue) % 360, set: (n, o) => ((o.hue = n), true) },
  { radix: 53, get: (s) => step(s.chroma, 0.005, 0, 52), set: (n, o) => ((o.chroma = Number((n * 0.005).toFixed(3))), n <= 52) },
  { radix: 360, get: (s) => Math.round(s.neutralHue) % 360, set: (n, o) => ((o.neutralHue = n), true) },
  { radix: 31, get: (s) => step(s.neutralChroma, 0.001, 0, 30), set: (n, o) => ((o.neutralChroma = Number((n * 0.001).toFixed(4))), n <= 30) },
  { radix: 61, get: (s) => step(s.radius, 0.025, 0, 60), set: (n, o) => ((o.radius = Number((n * 0.025).toFixed(3))), n <= 60) },
  { radix: 2, get: (s) => (s.primary === "brand" ? 1 : 0), set: (n, o) => ((o.primary = n ? "brand" : "ink"), true) },
  { radix: 2, get: (s) => (s.paper ? 1 : 0), set: (n, o) => ((o.paper = n === 1), true) },
  { radix: 2, get: (s) => (s.edge === "strong" ? 1 : 0), set: (n, o) => ((o.edge = n ? "strong" : "soft"), true) },
  { radix: 3, get: (s) => Math.max(0, DENSITIES.indexOf(s.density)), set: (n, o) => ((o.density = DENSITIES[n]!), n < DENSITIES.length) },
  { radix: 32, get: (s) => Math.max(0, FONT_CHOICES.indexOf(s.font)), set: (n, o) => ((o.font = FONT_CHOICES[n] ?? "keep"), n < FONT_CHOICES.length) },
  { radix: 4, get: (s) => Math.max(0, FEEL_ORDER.indexOf(s.feel)), set: (n, o) => ((o.feel = FEEL_ORDER[n]!), n < FEEL_ORDER.length) },
  range(0.5, 0.05, 41, "speed"),
  range(0, 0.05, 21, "bounce"),
  range(0, 0.05, 41, "travel"),
  range(0, 0.05, 41, "hover"),
  range(0, 0.05, 41, "stagger"),
  { radix: 2, get: (s) => (s.ambient ? 1 : 0), set: (n, o) => ((o.ambient = n === 1), true) },
  { radix: 2, get: (s) => (s.reduce === "always" ? 1 : 0), set: (n, o) => ((o.reduce = n ? "always" : "system"), true) },
]

const CHECK_MOD = 13n
const CAPACITY = 1n << BigInt(LENGTH * 5)
const SPACE = FIELDS.reduce((n, f) => n * BigInt(f.radix), 1n)
if (SPACE * CHECK_MOD > CAPACITY) throw new Error("preset code: the fields no longer fit in 16 characters")
if (FONT_CHOICES.length > 32) throw new Error("preset code: more fonts than the font field holds")

/** Writes a spec as a code, for example `k3m9-w0tz-4hqd-bv7e`. The spec is snapped to the builder's steps first. */
export function encodeCode(input: Partial<ThemeSpec>, options: { dashes?: boolean } = {}): string {
  const spec = normalizeSpec(input)
  let n = 0n
  for (const f of FIELDS) n = n * BigInt(f.radix) + BigInt(f.get(spec))
  let value = n * CHECK_MOD + (n % CHECK_MOD)
  let out = ""
  for (let i = 0; i < LENGTH; i++) {
    out = ALPHABET[Number(value & 31n)]! + out
    value >>= 5n
  }
  return options.dashes === false ? out : out.match(/.{4}/g)!.join("-")
}

/** What people type or paste: any case, with dashes or spaces, and the letters that look like 0 and 1. */
const clean = (text: string) =>
  text
    .toLowerCase()
    .replace(/[\s-]/g, "")
    .replace(/o/g, "0")
    .replace(/[il]/g, "1")

/** Whether the text has the shape of a code (it may still fail the check in `decodeCode`). */
export function isCode(text: string): boolean {
  const c = clean(text)
  return c.length === LENGTH && [...c].every((ch) => ALPHABET.includes(ch))
}

/** Reads a code back into a spec, or null when it is not a code this version understands or its check fails. */
export function decodeCode(text: string): ThemeSpec | null {
  if (!isCode(text)) return null
  let value = 0n
  for (const ch of clean(text)) value = (value << 5n) | BigInt(ALPHABET.indexOf(ch))
  const check = value % CHECK_MOD
  let n = value / CHECK_MOD
  // Reject what encodeCode could never have written: a check that does not match, or a number outside the field space.
  if (n >= SPACE || n % CHECK_MOD !== check) return null
  const out: Partial<ThemeSpec> = { ...DEFAULT_SPEC }
  for (let i = FIELDS.length - 1; i >= 0; i--) {
    const f = FIELDS[i]!
    const digit = Number(n % BigInt(f.radix))
    n /= BigInt(f.radix)
    if (!f.set(digit, out)) return null
  }
  return normalizeSpec(out)
}

/** The spec a code would produce for this one: every field on the builder's steps. */
export const snapSpec = (input: Partial<ThemeSpec>): ThemeSpec => decodeCode(encodeCode(input))!
