import { CitationCoverage } from "@/components/ballmac/citation-coverage"

export default function CitationCoverageDemo() {
  return (
    <div className="w-full max-w-4xl">
      <CitationCoverage
        defaultSelected="c2"
        claims={[
          { id: "c1", text: "The refund window is 14 days from purchase.", sources: [1] },
          { id: "c2", text: "A refund is paid back to the original payment method.", sources: [1, 2] },
          { id: "c3", text: "Most refunds arrive within two days.", sources: [] },
          { id: "c4", text: "Team licences can be switched to a different organisation once a year.", sources: [3] },
          { id: "c5", text: "Support replies within one business day.", sources: [] },
        ]}
        sources={[
          { id: 1, title: "Refund policy", url: "https://example.com/refund", quote: "If an item does not work as described and we cannot fix it within 14 days, we refund the full price." },
          { id: 2, title: "Payments FAQ", url: "https://example.com/payments", quote: "Refunds go back to the original payment method." },
          { id: 3, title: "Team licence terms", url: "https://example.com/team", quote: "A seat may move to another person with our written consent, once in any 90 days." },
        ]}
      />
    </div>
  )
}
