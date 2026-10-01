import { DottedMap } from "@/components/ballmac/dotted-map"

const regions = [
  { lat: 53.35, lng: -6.26, label: "eu-west-1" },
  { lat: 39.04, lng: -77.49, label: "us-east-1" },
  { lat: 35.68, lng: 139.65, label: "ap-northeast-1" },
  { lat: -23.55, lng: -46.63, label: "sa-east-1" },
  { lat: -26.2, lng: 28.04, label: "af-south-1" },
  { lat: 19.07, lng: 72.88, label: "ap-south-1" },
]

export default function DottedMapRegions() {
  return (
    <div className="w-full max-w-xl rounded-2xl border bg-card p-4">
      <DottedMap dots={110} tone="chart-2" label="Deployment regions" markers={regions.map((r) => ({ ...r, tone: "chart-2" as const }))} />
      <ul className="mt-3 flex flex-wrap gap-1.5">
        {regions.map((r) => (
          <li key={r.label} className="rounded-full border px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
            {r.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
