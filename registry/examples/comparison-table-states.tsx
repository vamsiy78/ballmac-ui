import { ComparisonTable } from "@/components/ballmac/comparison-table"
export default function ComparisonTableStates() {
  return (
    <ComparisonTable
      className="w-full max-w-xl"
      caption="Compare export formats"
      columns={[
        { key: "csv", title: "CSV" },
        { key: "pdf", title: "PDF" },
      ]}
      rows={[
        { label: "Editable data", values: { csv: true, pdf: false } },
        { label: "Print ready", values: { csv: false, pdf: true } },
      ]}
    />
  )
}
