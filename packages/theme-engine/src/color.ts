/** OKLCH colour math and WCAG contrast. Pure functions, no dependencies. */

export type Oklch = { l: number; c: number; h: number }

const rad = (deg: number) => (deg * Math.PI) / 180

/** OKLCH to linear sRGB (may fall outside 0..1 when the colour is out of gamut). */
function toLinear({ l, c, h }: Oklch): [number, number, number] {
  const a = c * Math.cos(rad(h))
  const b = c * Math.sin(rad(h))
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ]
}

const inGamut = (rgb: number[]) => rgb.every((v) => v >= -0.0005 && v <= 1.0005)

/** Reduces chroma until the colour fits in sRGB, keeping lightness and hue. */
export function fitGamut(color: Oklch): Oklch {
  if (color.l <= 0) return { l: 0, c: 0, h: color.h }
  if (color.l >= 1) return { l: 1, c: 0, h: color.h }
  if (inGamut(toLinear(color))) return color
  let lo = 0
  let hi = color.c
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2
    if (inGamut(toLinear({ ...color, c: mid }))) lo = mid
    else hi = mid
  }
  return { ...color, c: lo }
}

/** WCAG relative luminance of an OKLCH colour (after fitting to sRGB). */
export function luminance(color: Oklch): number {
  const [r, g, b] = toLinear(fitGamut(color)).map((v) => Math.min(1, Math.max(0, v))) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrast(a: Oklch, b: Oklch): number {
  const la = luminance(a)
  const lb = luminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

/** Formats a colour as CSS `oklch(...)`, with up to three decimals and no trailing zeros. */
export function format(color: Oklch, alpha?: number): string {
  const n = (v: number, d = 3) => String(Number(v.toFixed(d)))
  const c = fitGamut(color)
  const hue = c.c < 0.0005 ? 0 : ((c.h % 360) + 360) % 360
  return `oklch(${n(c.l)} ${n(c.c)} ${n(hue, 1)}${alpha === undefined ? "" : ` / ${Math.round(alpha * 100)}%`})`
}

/** Parses the `oklch(L C H)` strings this package writes. Returns null for anything else (alpha colours, other spaces). */
export function parse(value: string): Oklch | null {
  const m = value.trim().match(/^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)$/)
  return m ? { l: Number(m[1]), c: Number(m[2]), h: Number(m[3]) } : null
}

/**
 * Finds the lightness closest to `from` (moving in `dir`) whose colour reaches `min` contrast against every colour in `against`.
 * Chroma is kept as high as the sRGB gamut allows at each step.
 */
export function solve(hue: number, chroma: number, from: number, dir: 1 | -1, min: number, against: Oklch[]): Oklch {
  for (let l = from; l >= 0 && l <= 1; l += dir * 0.004) {
    const color = fitGamut({ l, c: chroma, h: hue })
    if (against.every((bg) => contrast(color, bg) >= min)) return color
  }
  return dir === 1 ? { l: 1, c: 0, h: hue } : { l: 0, c: 0, h: hue }
}
