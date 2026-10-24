import { CitationCoverage } from "@/components/ballmac/citation-coverage"

export default function CitationCoverageFull() {
  return (
    <div className="w-full max-w-4xl">
      <CitationCoverage
        claims={[
          { id: "a", text: "Invoices are generated on the first of each month.", sources: [1] },
          { id: "b", text: "Each one is a PDF with the company name and tax ID you entered at checkout.", sources: [1, 2] },
        ]}
        sources={[
          { id: 1, title: "Billing guide", url: "https://example.com/billing" },
          { id: 2, title: "Tax and invoices", url: "https://example.com/tax" },
        ]}
      />
    </div>
  )
}
