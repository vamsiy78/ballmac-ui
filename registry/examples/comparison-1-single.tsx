import { Comparison1 } from "@/components/ballmac/blocks/comparison-1/comparison-1"

export default function Comparison1Single() {
  return (
    <Comparison1
      title="Switching from Notebook?"
      description="Everything you rely on is here, plus a few things you have been missing."
      product="Northwind"
      competitors={[{ key: "notebook", name: "Notebook" }]}
      reasons={[]}
      rows={[
        { label: "Import your notes in one click", values: { us: true, notebook: false } },
        { label: "Offline editing", values: { us: true, notebook: true } },
        { label: "End-to-end encryption", values: { us: true, notebook: "partial" } },
        { label: "Unlimited version history", values: { us: true, notebook: false } },
        { label: "Free plan", values: { us: "Yes, forever", notebook: "14-day trial" } },
      ]}
    />
  )
}
