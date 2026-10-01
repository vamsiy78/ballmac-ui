import { NeonCard, type NeonTone } from "@/components/ballmac/neon-card"

const sets: { from: NeonTone; to: NeonTone; flicker?: boolean }[] = [
  { from: "chart-2", to: "chart-1" },
  { from: "chart-3", to: "destructive" },
  { from: "chart-5", to: "chart-4", flicker: true },
]

export default function NeonCardTones() {
  return (
    <div className="grid w-full max-w-md gap-4 sm:grid-cols-3">
      {sets.map((s) => (
        <NeonCard key={s.from + s.to} from={s.from} to={s.to} flicker={s.flicker} radius="xl" contentClassName="p-4 text-center">
          <p className="font-mono text-[11px] text-muted-foreground">
            {s.from} → {s.to}
          </p>
          <p className="mt-1 text-sm font-medium">{s.flicker ? "Flicker" : "Steady"}</p>
        </NeonCard>
      ))}
    </div>
  )
}
