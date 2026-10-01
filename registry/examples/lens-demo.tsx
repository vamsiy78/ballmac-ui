import { Lens } from "@/components/ballmac/lens"

function map() {
  const lines = Array.from({ length: 18 }, (_, i) => `<path d="M0 ${i * 28 + 10} Q 120 ${i * 28 - 20}, 240 ${i * 28 + 14} T 480 ${i * 28 + 6}" stroke="rgba(255,255,255,.35)" fill="none" stroke-width="1.4"/>`).join("")
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0ea5e9"/><stop offset="1" stop-color="#6366f1"/></linearGradient></defs><rect width="480" height="320" fill="url(#g)"/>${lines}<circle cx="300" cy="150" r="9" fill="#fff"/><circle cx="140" cy="210" r="6" fill="#fde047"/><text x="316" y="146" font-family="sans-serif" font-size="12" fill="#fff">Lisbon</text><text x="152" y="214" font-family="sans-serif" font-size="9" fill="#fff">Porto</text></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export default function LensDemo() {
  return (
    <Lens zoom={2.6} lensSize={150} label="Route map" className="w-full max-w-md border shadow-sm">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={map()} alt="Map of the coast between Porto and Lisbon" className="block w-full select-none" draggable={false} />
    </Lens>
  )
}
