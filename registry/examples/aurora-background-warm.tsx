import { AuroraBackground } from "@/components/ballmac/aurora-background"

export default function AuroraBackgroundWarm() {
  return (
    <div className="relative isolate flex h-72 w-full max-w-xl flex-col items-center justify-center overflow-hidden rounded-xl border bg-background px-6 text-center">
      <AuroraBackground
        colors={["var(--chart-5)", "var(--chart-3)", "var(--chart-4)"]}
        curtains={false}
        intensity={0.5}
        duration={16}
        className="-z-10"
      />
      <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">Golden hour</p>
      <h3 className="mt-2 text-3xl font-semibold tracking-tight">Warm by default.</h3>
    </div>
  )
}
