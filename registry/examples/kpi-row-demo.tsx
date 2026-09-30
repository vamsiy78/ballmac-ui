import { KpiRow, KpiItem } from "@/components/ballmac/kpi-row"
export default function KpiRowDemo() {
  return (
    <KpiRow columns={3} className="w-full max-w-xl">
      <KpiItem label="Visitors" value="48.2k" detail="Last 30 days" />
      <KpiItem label="Signups" value="1,208" detail="2.5% conversion" />
      <KpiItem label="Active" value="892" detail="74% retained" />
    </KpiRow>
  )
}
