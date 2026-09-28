import { Badge } from "@/components/ballmac/badge"

const deployments = [
  { name: "api-gateway", status: "success", label: "Deployed" },
  { name: "web-dashboard", status: "warning", label: "Degraded" },
  { name: "billing-worker", status: "error", label: "Failed" },
  { name: "search-indexer", status: "neutral", label: "Queued" },
] as const

export default function BadgeStatus() {
  return (
    <ul className="w-full max-w-sm divide-y rounded-xl border bg-card">
      {deployments.map((d) => (
        <li key={d.name} className="flex items-center justify-between gap-3 px-4 py-3">
          <span className="truncate font-mono text-xs">{d.name}</span>
          <Badge status={d.status}>{d.label}</Badge>
        </li>
      ))}
    </ul>
  )
}
