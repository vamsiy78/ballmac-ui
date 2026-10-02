import { ProgressiveBlur } from "@/components/ballmac/progressive-blur"

function scene() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f97316"/><stop offset=".5" stop-color="#db2777"/><stop offset="1" stop-color="#6366f1"/></linearGradient></defs><rect width="400" height="260" fill="url(#g)"/><g fill="none" stroke="rgba(255,255,255,.7)" stroke-width="3">${Array.from({ length: 9 }, (_, i) => `<circle cx="${60 + i * 36}" cy="${130 + Math.sin(i) * 50}" r="${14 + (i % 3) * 8}"/>`).join("")}</g></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const sides = ["top", "right", "bottom", "left"] as const

export default function ProgressiveBlurSides() {
  return (
    <div className="grid w-full max-w-xl grid-cols-2 gap-3">
      {sides.map((position) => (
        <div key={position} className="relative aspect-[3/2] overflow-hidden rounded-xl border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={scene()} alt="" className="size-full object-cover" />
          <ProgressiveBlur position={position} size="45%" strength={14} />
          <span className="absolute top-2 start-2 z-20 rounded bg-black/55 px-1.5 py-0.5 font-mono text-[11px] text-white">{position}</span>
        </div>
      ))}
    </div>
  )
}
