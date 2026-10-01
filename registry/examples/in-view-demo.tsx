import { InView, type InViewEffect } from "@/components/ballmac/in-view"

const effects: InViewEffect[] = ["fade", "slide-up", "slide-down", "scale", "blur"]

export default function InViewDemo() {
  return (
    <div className="grid w-full max-w-md grid-cols-2 gap-3 sm:grid-cols-3">
      {effects.map((effect, i) => (
        <InView key={effect} effect={effect} delay={i * 0.1} amount={0.1} className="rounded-xl border bg-card p-4 text-center">
          <p className="font-mono text-xs text-muted-foreground">effect</p>
          <p className="text-sm font-semibold">{effect}</p>
        </InView>
      ))}
    </div>
  )
}
