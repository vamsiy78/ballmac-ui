import { NoiseTexture } from "@/components/ballmac/noise-texture"

const blends = ["overlay", "soft-light", "multiply", "normal"] as const

export default function NoiseTextureBlends() {
  return (
    <div className="grid w-full max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
      {blends.map((blend) => (
        <div key={blend} className="relative h-28 overflow-hidden rounded-xl border bg-[linear-gradient(160deg,var(--chart-3),var(--chart-5))]">
          <NoiseTexture blend={blend} opacity={0.3} />
          <span className="relative block p-2 font-mono text-[11px] text-white drop-shadow-sm">{blend}</span>
        </div>
      ))}
    </div>
  )
}
