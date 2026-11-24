import { BallmacMark } from "@/components/site/logo"

/**
 * The closing art: our mark at the centre of a scalloped seal, ringed by its name, with a soft gradient orb behind it. All SVG, so it is sharp at any size
 * and costs no image request. It turns slowly; with reduced motion it stands still.
 */
export function Seal({ label = "BALLMAC UI PRO · ONE PAYMENT · YOURS TO KEEP · " }: { label?: string }) {
  const teeth = 36
  const path = Array.from({ length: teeth * 2 }, (_, i) => {
    const a = (i / (teeth * 2)) * Math.PI * 2
    const r = i % 2 === 0 ? 96 : 90
    return `${i === 0 ? "M" : "L"}${(100 + r * Math.cos(a)).toFixed(2)},${(100 + r * Math.sin(a)).toFixed(2)}`
  }).join(" ")
  return (
    <div className="relative mx-auto size-56 sm:size-64" aria-hidden="true">
      <div className="absolute inset-[22%] rounded-full bg-[conic-gradient(from_200deg,oklch(0.25_0.08_265),oklch(0.62_0.19_255),oklch(0.85_0.12_220),oklch(0.25_0.08_265))] blur-2xl opacity-50" />
      <svg viewBox="0 0 200 200" className="bm-spin-slow absolute inset-0 size-full">
        <defs>
          <path id="bm-seal-ring" d="M100,100 m-66,0 a66,66 0 1,1 132,0 a66,66 0 1,1 -132,0" />
          <radialGradient id="bm-seal-orb" cx="35%" cy="30%" r="75%">
            <stop offset="0" stopColor="oklch(0.88 0.1 220)" />
            <stop offset="0.45" stopColor="oklch(0.6 0.2 258)" />
            <stop offset="1" stopColor="oklch(0.16 0.04 265)" />
          </radialGradient>
        </defs>
        <path d={`${path} Z`} className="fill-background stroke-border" strokeWidth="1" />
        <circle cx="100" cy="100" r="80" fill="none" className="stroke-border" strokeWidth="0.8" strokeDasharray="2 3" />
        <text className="fill-muted-foreground" fontSize="9.5" letterSpacing="3" fontFamily="var(--font-geist-mono)">
          <textPath href="#bm-seal-ring">{label}</textPath>
        </text>
        <circle cx="100" cy="100" r="42" fill="url(#bm-seal-orb)" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-white">
        <BallmacMark className="size-12" />
      </div>
    </div>
  )
}
