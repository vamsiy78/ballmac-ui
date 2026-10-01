import { WarpBackground } from "@/components/ballmac/warp-background"

export default function WarpBackgroundCards() {
  return (
    <WarpBackground density={90} speed={0.5} colors={["--foreground", "--chart-2"]} parallax={false} className="w-full max-w-xl rounded-2xl border p-6" contentClassName="grid gap-3 sm:grid-cols-2">
      {["Edge network", "Instant rollbacks"].map((t) => (
        <div key={t} className="rounded-xl border bg-card/80 p-4 backdrop-blur">
          <p className="text-sm font-semibold">{t}</p>
          <p className="mt-1 text-[13px] text-muted-foreground">Fewer, slower streaks keep dense content calm.</p>
        </div>
      ))}
    </WarpBackground>
  )
}
