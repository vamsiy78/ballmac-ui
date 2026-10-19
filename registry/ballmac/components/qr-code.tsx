// Ballmac UI: QR Code. https://ui.ballmac.com/components/qr-code
// Based on uqr (MIT, Copyright (c) 2023 Anthony Fu), which makes the code; this draws it as accessible SVG with shapes, a logo slot and downloads.
"use client"

import * as React from "react"
import { encode, QrCodeDataType } from "uqr"

import { useMessages } from "@/lib/ballmac/i18n"
import { cn } from "@/lib/utils"

type QRCodeShape = "square" | "rounded" | "dots"
type QRCodeLevel = "L" | "M" | "Q" | "H"

type QRCodeProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** What the code holds: a web address, text, a Wi-Fi string or anything else. */
  value: string
  /** Pixel size of the whole code, quiet zone included. */
  size?: number
  /** How much damage it survives: L 7%, M 15%, Q 25%, H 30%. More makes a denser code. A logo raises it to at least Q. */
  level?: QRCodeLevel
  /** Shape of the dark modules. The three corner squares keep their own style so scanners find them. */
  shape?: QRCodeShape
  /** Empty modules around the code. Scanners need at least 4. */
  quietZone?: number
  /** Dark color. Codes scan best dark on light, so the defaults stay that way in dark mode. Any CSS color. */
  foreground?: string
  /** Light color. */
  background?: string
  /** Something drawn in the middle, such as a logo. Its area is cleared. */
  logo?: React.ReactNode
  /** Share of the width the logo takes, up to 0.3. */
  logoSize?: number
  /** Names the code for screen readers. Defaults to "QR code for {value}". */
  label?: string
  /** Called when the value cannot be encoded. */
  onError?: (error: Error) => void
  /** The SVG element, for downloads. */
  svgRef?: React.Ref<SVGSVGElement>
}

type Matrix = { size: number; data: boolean[][]; types: QrCodeDataType[][] }

/** Make the code, or say why it cannot be made. Longer text than version 40 holds is the usual reason. */
export function makeMatrix(value: string, level: QRCodeLevel): { matrix: Matrix } | { error: Error } {
  try {
    const r = encode(value, { ecc: level, border: 0, boostEcc: false })
    return { matrix: { size: r.size, data: r.data, types: r.types as QrCodeDataType[][] } }
  } catch (e) {
    return { error: e instanceof Error ? e : new Error(String(e)) }
  }
}

const n = (v: number) => Math.round(v * 1000) / 1000

/** Path data for the dark modules, merging runs along a row, so a big code stays a small file. */
function squarePath(m: Matrix, skip: (x: number, y: number) => boolean) {
  let d = ""
  for (let y = 0; y < m.size; y++) {
    let x = 0
    while (x < m.size) {
      if (!m.data[y]![x] || skip(x, y)) {
        x++
        continue
      }
      let run = 1
      while (x + run < m.size && m.data[y]![x + run] && !skip(x + run, y)) run++
      d += `M${x} ${y}h${run}v1h${-run}z`
      x += run
    }
  }
  return d
}

function roundedPath(m: Matrix, skip: (x: number, y: number) => boolean, r = 0.32) {
  let d = ""
  const on = (x: number, y: number) => x >= 0 && y >= 0 && x < m.size && y < m.size && m.data[y]![x] && !skip(x, y)
  for (let y = 0; y < m.size; y++)
    for (let x = 0; x < m.size; x++) {
      if (!on(x, y)) continue
      // a corner is rounded only where no neighbour touches it, so joined modules read as one shape
      const tl = !on(x - 1, y) && !on(x, y - 1) ? r : 0
      const tr = !on(x + 1, y) && !on(x, y - 1) ? r : 0
      const br = !on(x + 1, y) && !on(x, y + 1) ? r : 0
      const bl = !on(x - 1, y) && !on(x, y + 1) ? r : 0
      d += `M${n(x + tl)} ${y}H${n(x + 1 - tr)}${tr ? `A${r} ${r} 0 0 1 ${x + 1} ${n(y + tr)}` : ""}V${n(y + 1 - br)}${br ? `A${r} ${r} 0 0 1 ${n(x + 1 - br)} ${y + 1}` : ""}H${n(x + bl)}${bl ? `A${r} ${r} 0 0 1 ${x} ${n(y + 1 - bl)}` : ""}V${n(y + tl)}${tl ? `A${r} ${r} 0 0 1 ${n(x + tl)} ${y}` : ""}z`
    }
  return d
}

function dotsPath(m: Matrix, skip: (x: number, y: number) => boolean) {
  let d = ""
  const r = 0.44
  for (let y = 0; y < m.size; y++)
    for (let x = 0; x < m.size; x++) if (m.data[y]![x] && !skip(x, y)) d += `M${n(x + 0.5 - r)} ${n(y + 0.5)}a${r} ${r} 0 1 0 ${n(2 * r)} 0a${r} ${r} 0 1 0 ${n(-2 * r)} 0z`
  return d
}

/** One of the three corner markers: a ring of seven, a gap, and a block of three. Drawn with even-odd fill so the gap is open. */
function finder(x: number, y: number, shape: QRCodeShape) {
  if (shape === "square") return `M${x} ${y}h7v7h-7zM${x + 1} ${y + 1}v5h5v-5zM${x + 2} ${y + 2}h3v3h-3z`
  const ring = (px: number, py: number, s: number, r: number) =>
    `M${px + r} ${py}h${s - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${s - 2 * r}a${r} ${r} 0 0 1 ${-r} ${r}h${-(s - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}v${-(s - 2 * r)}a${r} ${r} 0 0 1 ${r} ${-r}z`
  const hole = (px: number, py: number, s: number, r: number) =>
    `M${px + r} ${py}a${r} ${r} 0 0 0 ${-r} ${r}v${s - 2 * r}a${r} ${r} 0 0 0 ${r} ${r}h${s - 2 * r}a${r} ${r} 0 0 0 ${r} ${-r}v${-(s - 2 * r)}a${r} ${r} 0 0 0 ${-r} ${-r}z`
  const outer = 1.6
  const inner = 1.1
  return `${ring(x, y, 7, outer)}${hole(x + 1, y + 1, 5, outer - 0.6)}${ring(x + 2, y + 2, 3, inner)}`
}

/**
 * A QR code as SVG: it scales without blurring, has a name for screen readers, and can hold a logo. The shapes keep the three corner markers
 * recognizable, so rounded and dotted codes still scan. A value that is too long is reported, not drawn wrong.
 */
function QRCode({
  value,
  size = 192,
  level = "M",
  shape = "square",
  quietZone = 4,
  foreground = "rgb(0, 0, 0)",
  background = "rgb(255, 255, 255)",
  logo,
  logoSize = 0.22,
  label,
  onError,
  svgRef,
  className,
  style,
  ...props
}: QRCodeProps) {
  const msg = useMessages()
  const effective: QRCodeLevel = logo && (level === "L" || level === "M") ? "Q" : level
  const made = React.useMemo(() => (value ? makeMatrix(value, effective) : null), [value, effective])
  const failed = made && "error" in made ? made.error : null
  const onErrorRef = React.useRef(onError)
  onErrorRef.current = onError
  React.useEffect(() => {
    if (failed) onErrorRef.current?.(failed)
  }, [failed])

  const clamp = Math.min(Math.max(logoSize, 0.1), 0.3)
  const shown = made && "matrix" in made ? made.matrix : null
  const total = shown ? shown.size + quietZone * 2 : 0

  const parts = React.useMemo(() => {
    if (!shown) return null
    const m = shown
    const c = (m.size - 1) / 2
    const half = (m.size * clamp) / 2
    const inLogo = (x: number, y: number) => !!logo && Math.abs(x - c) <= half && Math.abs(y - c) <= half
    const isFinder = (x: number, y: number) => (x < 8 && y < 8) || (x >= m.size - 8 && y < 8) || (x < 8 && y >= m.size - 8)
    const skip = (x: number, y: number) => inLogo(x, y) || (shape !== "square" ? isFinder(x, y) : false)
    const body = shape === "square" ? squarePath(m, (x, y) => inLogo(x, y)) : shape === "rounded" ? roundedPath(m, skip) : dotsPath(m, skip)
    // the finders are drawn whole, the separator row around them stays empty
    const finders = shape === "square" ? "" : `${finder(0, 0, shape)}${finder(m.size - 7, 0, shape)}${finder(0, m.size - 7, shape)}`
    return { body, finders }
  }, [shown, shape, logo, clamp])

  const name = label ?? msg("qr-code.label", "QR code for {value}", { value: value.length > 80 ? `${value.slice(0, 77)}…` : value })

  if (!value) {
    return (
      <div data-slot="qr-code" data-state="empty" className={cn("flex items-center justify-center rounded-xl border border-dashed text-center text-sm text-muted-foreground", className)} style={{ width: size, height: size, ...style }} {...props}>
        {msg("qr-code.empty", "Nothing to encode yet")}
      </div>
    )
  }
  if (failed || !shown || !parts) {
    return (
      <div data-slot="qr-code" data-state="error" role="alert" className={cn("flex items-center justify-center rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-center text-sm text-destructive", className)} style={{ width: size, height: size, ...style }} {...props}>
        {msg("qr-code.tooLong", "This is too long to fit in a QR code. Use a shorter link.")}
      </div>
    )
  }

  const unit = size / total
  const quiet = quietZone
  return (
    <div data-slot="qr-code" data-shape={shape} className={cn("relative inline-block shrink-0 overflow-hidden rounded-xl", className)} style={{ width: size, height: size, background, ...style }} {...props}>
      <svg ref={svgRef} role="img" aria-label={name} viewBox={`0 0 ${total} ${total}`} width={size} height={size} shapeRendering={shape === "square" ? "crispEdges" : "geometricPrecision"} xmlns="http://www.w3.org/2000/svg">
        <title>{name}</title>
        <rect width={total} height={total} fill={background} />
        <g transform={`translate(${quiet} ${quiet})`} fill={foreground}>
          <path d={parts.body} />
          {parts.finders ? <path d={parts.finders} fillRule="evenodd" /> : null}
        </g>
      </svg>
      {logo ? (
        <div
          data-slot="qr-code-logo"
          className="absolute flex items-center justify-center overflow-hidden rounded-lg"
          style={{ background, width: Math.round(unit * shown.size * clamp), height: Math.round(unit * shown.size * clamp), insetInlineStart: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
        >
          {logo}
        </div>
      ) : null}
    </div>
  )
}

/** The code as an SVG file's text, to save or send: `value`, with the same options as the component. */
export function qrToSvg(value: string, { level = "M", shape = "square", quietZone = 4, size = 512, foreground = "rgb(0, 0, 0)", background = "rgb(255, 255, 255)" }: Partial<Pick<QRCodeProps, "level" | "shape" | "quietZone" | "size" | "foreground" | "background">> = {}) {
  const made = makeMatrix(value, level)
  if ("error" in made) throw made.error
  const m = made.matrix
  const total = m.size + quietZone * 2
  const none = () => false
  const body = shape === "square" ? squarePath(m, none) : shape === "rounded" ? roundedPath(m, (x, y) => (x < 8 && y < 8) || (x >= m.size - 8 && y < 8) || (x < 8 && y >= m.size - 8)) : dotsPath(m, (x, y) => (x < 8 && y < 8) || (x >= m.size - 8 && y < 8) || (x < 8 && y >= m.size - 8))
  const finders = shape === "square" ? "" : `${finder(0, 0, shape)}${finder(m.size - 7, 0, shape)}${finder(0, m.size - 7, shape)}`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" width="${size}" height="${size}"><rect width="${total}" height="${total}" fill="${background}"/><g transform="translate(${quietZone} ${quietZone})" fill="${foreground}"><path d="${body}"/>${finders ? `<path d="${finders}" fill-rule="evenodd"/>` : ""}</g></svg>`
}

/**
 * Save the code the person is looking at, as an SVG or a PNG. Call it from a button's click. A PNG is drawn on a canvas at `size` pixels.
 */
export async function downloadQRCode(svg: SVGSVGElement, { filename = "qr-code", format = "png", size = 1024 }: { filename?: string; format?: "svg" | "png"; size?: number } = {}) {
  const xml = new XMLSerializer().serializeToString(svg)
  const save = (blob: Blob, ext: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${filename}.${ext}`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  if (format === "svg") return save(new Blob([xml], { type: "image/svg+xml" }), "svg")
  const img = new Image()
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`
  await img.decode()
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = size
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("A canvas is not available.")
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(img, 0, 0, size, size)
  await new Promise<void>((resolve, reject) => canvas.toBlob((b) => (b ? (save(b, "png"), resolve()) : reject(new Error("Could not make the image."))), "image/png"))
}

export { QRCode, type QRCodeLevel, type QRCodeProps, type QRCodeShape }
