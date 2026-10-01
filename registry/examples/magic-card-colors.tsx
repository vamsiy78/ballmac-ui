import { MagicCard, type MagicTone } from "@/components/ballmac/magic-card"

const pairs: [MagicTone, MagicTone][] = [
  ["chart-1", "chart-4"],
  ["chart-2", "chart-1"],
  ["chart-3", "chart-5"],
  ["chart-4", "chart-3"],
]

export default function MagicCardColors() {
  return (
    <div className="grid w-full max-w-md grid-cols-2 gap-3">
      {pairs.map(([from, to]) => (
        <MagicCard key={from + to} from={from} to={to} size={200} contentClassName="p-5" tabIndex={0}>
          <p className="font-mono text-xs text-muted-foreground">
            {from} → {to}
          </p>
          <p className="mt-1 text-sm font-medium">Move over me</p>
        </MagicCard>
      ))}
    </div>
  )
}
