import { InteractiveGrid } from "@/components/ballmac/interactive-grid"

const sets = [
  { color: "--chart-2", cell: 28, name: "Small cells" },
  { color: "--chart-4", cell: 44, name: "Large cells, slow fade" },
]

export default function InteractiveGridColors() {
  return (
    <div className="grid w-full max-w-xl gap-3 sm:grid-cols-2">
      {sets.map((s) => (
        <div key={s.name} className="relative flex h-44 items-end overflow-hidden rounded-xl border bg-card p-3">
          <InteractiveGrid cell={s.cell} color={s.color} decay={s.cell > 40 ? 2.4 : 1} />
          <span className="pointer-events-none relative text-xs font-medium">{s.name}</span>
        </div>
      ))}
    </div>
  )
}
