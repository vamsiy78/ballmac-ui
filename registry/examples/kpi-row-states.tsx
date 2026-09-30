import { KpiRow, KpiItem } from "@/components/ballmac/kpi-row"
export default function KpiRowStates() {
  return (
    <KpiRow columns={2} className="w-full max-w-md">
      <KpiItem label="Requests" value="2.4M" />
      <KpiItem
        label="Success rate"
        value="99.9%"
        detail="Trailing seven days"
      />
    </KpiRow>
  )
}
