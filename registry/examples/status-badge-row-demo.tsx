import { StatusBadgeRow, type ServiceDay } from "@/components/ballmac/status-badge-row"

function history(seed: number, incidents: Record<number, ServiceDay> = {}): ServiceDay[] {
  return Array.from({ length: 60 }, (_, i) => incidents[i] ?? "operational")
}

export default function StatusBadgeRowDemo() {
  return (
    <div className="w-full max-w-xl">
      <StatusBadgeRow
        endDate="2026-09-30"
        updated="Updated a minute ago"
        services={[
          { name: "API", description: "REST and GraphQL", status: "operational", uptime: 99.98, days: history(1, { 14: { status: "degraded", note: "Elevated latency" }, 41: "maintenance" }) },
          { name: "Dashboard", description: "app.example.com", status: "operational", uptime: 99.99, days: history(2, { 28: { status: "degraded", note: "Slow page loads" } }) },
          { name: "Webhooks", description: "Outgoing deliveries", status: "operational", uptime: 99.94, days: history(3, { 9: { status: "outage", note: "Queue backlog" }, 10: "degraded" }) },
          { name: "Background jobs", status: "operational", uptime: 100, days: history(4) },
        ]}
      />
    </div>
  )
}
