import { SmoothCursor } from "@/components/ballmac/smooth-cursor"

const cards = [
  { name: "Aurora", from: "var(--chart-1)", to: "var(--chart-4)" },
  { name: "Lagoon", from: "var(--chart-2)", to: "var(--chart-1)" },
  { name: "Ember", from: "var(--chart-3)", to: "var(--chart-5)" },
]

export default function SmoothCursorDemo() {
  return (
    <SmoothCursor className="w-full max-w-xl rounded-2xl border bg-card p-5">
      <p className="text-sm text-muted-foreground">Move around. Hover a tile to see its label.</p>
      <div className="mt-3 grid grid-cols-3 gap-3">
        {cards.map((c) => (
          <div
            key={c.name}
            data-cursor-label={`View ${c.name}`}
            className="aspect-[4/5] rounded-xl border"
            style={{ background: `linear-gradient(160deg, ${c.from}, ${c.to})` }}
          />
        ))}
      </div>
      <input aria-label="Your email" placeholder="Text fields keep the normal cursor" className="mt-4 h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50" />
    </SmoothCursor>
  )
}
