import { GlareHover } from "@/components/ballmac/glare-hover"

function poster(a: string, b: string, label: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="420"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="320" height="420" fill="url(#g)"/><circle cx="230" cy="110" r="52" fill="rgba(255,255,255,.35)"/><path d="M0 330 L90 230 L160 300 L230 210 L320 320 V420 H0Z" fill="rgba(0,0,0,.28)"/></svg>`
  return { src: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`, label }
}

const posters = [poster("#6366f1", "#22d3ee", "Aurora"), poster("#f97316", "#db2777", "Sunset"), poster("#10b981", "#0ea5e9", "Lagoon")]

export default function GlareHoverDemo() {
  return (
    <div className="grid w-full max-w-lg grid-cols-3 gap-3">
      {posters.map((p) => (
        <GlareHover key={p.label} className="rounded-xl border shadow-sm" tabIndex={0}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.src} alt={p.label} className="aspect-[3/4] w-full object-cover" />
        </GlareHover>
      ))}
    </div>
  )
}
