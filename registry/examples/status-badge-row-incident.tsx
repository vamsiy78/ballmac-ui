import { StatusBadgeRow, type ServiceDay } from "@/components/ballmac/status-badge-row"

const calm: ServiceDay[] = Array.from({ length: 45 }, () => "operational")
const rough: ServiceDay[] = Array.from({ length: 45 }, (_, i) => (i === 44 ? { status: "outage", note: "Investigating" } : i === 43 ? "degraded" : i === 20 ? "maintenance" : "operational"))

export default function StatusBadgeRowIncident() {
  return (
    <div className="w-full max-w-xl">
      <StatusBadgeRow
        endDate="2026-09-30"
        updated="Incident opened 14 minutes ago"
        services={[
          { name: "API", status: "outage", uptime: 99.71, days: rough, description: "Returning errors for some requests" },
          { name: "Dashboard", status: "degraded", uptime: 99.9, days: calm, description: "Data may be out of date" },
          { name: "Billing", status: "maintenance", uptime: 100, days: calm, description: "Scheduled until 18:00 UTC" },
        ]}
      />
    </div>
  )
}
