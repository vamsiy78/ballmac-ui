import { Nfc } from "lucide-react"

import { TiltCard, TiltCardLayer } from "@/components/ballmac/tilt-card"

function Chip() {
  return (
    <svg viewBox="0 0 46 36" className="h-9 w-[46px] drop-shadow-[0_1px_1px_rgb(0_0_0/0.25)]" aria-hidden="true">
      <defs>
        <linearGradient id="tilt-demo-chip" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="color-mix(in oklch, var(--chart-3) 70%, white)" />
          <stop offset="50%" stopColor="var(--chart-3)" />
          <stop offset="100%" stopColor="color-mix(in oklch, var(--chart-3) 70%, black)" />
        </linearGradient>
      </defs>
      <rect x="0.5" y="0.5" width="45" height="35" rx="7" fill="url(#tilt-demo-chip)" />
      <g fill="none" stroke="rgb(0 0 0 / 0.28)" strokeWidth="1">
        <path d="M0.5 12.5h13a4 4 0 0 1 4 4v3a4 4 0 0 1-4 4h-13" />
        <path d="M45.5 12.5h-13a4 4 0 0 0-4 4v3a4 4 0 0 0 4 4h13" />
        <path d="M17.5 18h11M23 0.5v12M23 23.5v12" />
      </g>
    </svg>
  )
}

export default function TiltCardDemo() {
  return (
    <div className="flex w-full justify-center px-2 py-10">
      <TiltCard
        tabIndex={0}
        role="group"
        aria-label="Acme membership card, member Jordan Avery, since 2024"
        maxTilt={14}
        className="aspect-[1.586] w-full max-w-[360px] rounded-[22px] border-0 bg-primary text-primary-foreground shadow-[0_30px_60px_-24px_rgb(0_0_0/0.55),0_0_0_1px_rgb(255_255_255/0.06)_inset]"
      >
        {/* Surface: aurora and fine texture, clipped to the card. */}
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden rounded-[inherit]">
          <div className="absolute -top-1/2 -start-1/4 size-[120%] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--chart-1)_55%,transparent),transparent)] opacity-70 blur-2xl" />
          <div className="absolute -end-1/3 -bottom-2/3 size-[110%] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--chart-4)_55%,transparent),transparent)] opacity-60 blur-2xl" />
          <div className="absolute inset-0 bg-[repeating-linear-gradient(115deg,rgb(255_255_255/0.035)_0_1px,transparent_1px_6px)]" />
        </div>

        <div className="relative flex h-full flex-col justify-between p-6 transform-3d">
          <TiltCardLayer depth={40} className="flex items-start justify-between">
            <span className="flex items-center gap-2">
              <span className="size-6 rounded-[7px] bg-[conic-gradient(from_210deg,var(--chart-1),var(--chart-4),var(--chart-2),var(--chart-1))] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.25)]" />
              <span className="text-[15px] font-semibold tracking-tight">Ballmac</span>
            </span>
            <span className="rounded-full border border-current/20 px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.2em]">
              PRO
            </span>
          </TiltCardLayer>

          <TiltCardLayer depth={28} className="flex items-center gap-4">
            <Chip />
            <Nfc className="size-6 opacity-70" aria-hidden="true" />
            {/* Holographic foil: its gradient slides with the tilt via --tilt-x / --tilt-y. */}
            <span
              aria-hidden="true"
              className="ms-auto h-8 w-12 rounded-md bg-[linear-gradient(115deg,var(--chart-1),var(--chart-2),var(--chart-3),var(--chart-5),var(--chart-4),var(--chart-1))] bg-[length:300%_300%] opacity-80 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.3)] [background-position:var(--tilt-x,50%)_var(--tilt-y,50%)]"
            />
          </TiltCardLayer>

          <TiltCardLayer depth={20} className="flex items-end justify-between gap-4">
            <span>
              <span className="block text-[9px] font-medium tracking-[0.2em] opacity-60">MEMBER</span>
              <span className="block text-[15px] font-medium tracking-wide">Jordan Avery</span>
            </span>
            <span className="text-end">
              <span className="block font-mono text-[13px] tracking-widest opacity-80">•••• 2048</span>
              <span className="block text-[10px] opacity-60">Since 2024</span>
            </span>
          </TiltCardLayer>
        </div>
      </TiltCard>
    </div>
  )
}
