import { BlurFade } from "@/components/ballmac/blur-fade"

const dirs = ["up", "down", "left", "right"] as const

export default function BlurFadeDirections() {
  return (
    <div className="grid w-full max-w-md grid-cols-2 gap-3">
      {dirs.map((direction, i) => (
        <BlurFade key={direction} inView={false} direction={direction} delay={i * 0.12} offset={18} blur={12}>
          <div className="rounded-xl border bg-card p-4">
            <p className="font-mono text-xs text-muted-foreground">direction</p>
            <p className="text-lg font-semibold">{direction}</p>
          </div>
        </BlurFade>
      ))}
    </div>
  )
}
