import { NoiseTexture } from "@/components/ballmac/noise-texture"

export default function NoiseTextureDemo() {
  return (
    <div className="relative flex h-64 w-full max-w-xl items-end overflow-hidden rounded-2xl border bg-[linear-gradient(135deg,var(--chart-4),var(--chart-1)_55%,var(--chart-2))] p-6">
      <NoiseTexture opacity={0.22} />
      <div className="relative">
        <p className="font-mono text-xs tracking-widest text-white/80 uppercase">Edition 04</p>
        <h3 className="mt-1 text-3xl font-semibold tracking-tight text-white drop-shadow-sm">Grain makes it feel printed</h3>
      </div>
    </div>
  )
}
