import { Particles } from "@/components/ballmac/particles"

export default function ParticlesRising() {
  return (
    <div className="relative isolate flex h-72 w-full max-w-xl flex-col items-center justify-center overflow-hidden rounded-xl border bg-card px-6 text-center">
      <Particles quantity={200} color="--chart-1" interaction="repel" vy={-0.35} size={0.9} className="-z-10" />
      <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">Move your pointer</p>
      <h3 className="mt-2 text-2xl font-semibold tracking-tight">Signals, rising.</h3>
    </div>
  )
}
