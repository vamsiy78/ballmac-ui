import { LightRays, type RayTone } from "@/components/ballmac/light-rays"

const tones: RayTone[] = ["chart-2", "chart-3", "chart-4", "foreground"]

export default function LightRaysTones() {
  return (
    <div className="grid w-full max-w-xl grid-cols-2 gap-3">
      {tones.map((tone, i) => (
        <div key={tone} className="relative h-36 overflow-hidden rounded-xl border bg-background">
          <LightRays tone={tone} count={4 + i} intensity={0.6} />
          <span className="absolute bottom-2 start-3 z-10 font-mono text-[11px] text-muted-foreground">
            {tone} · {4 + i} rays
          </span>
        </div>
      ))}
    </div>
  )
}
