import { Citation, type CitationSource } from "@/components/ballmac/citation"

const pricing: CitationSource[] = [
  {
    title: "Pricing and plans",
    url: "https://example.com/pricing",
    site: "Acme",
    snippet: "Team plans start at $12 per seat each month when billed yearly. Volume discounts apply above 50 seats.",
  },
  {
    title: "What changed in the March pricing update",
    url: "https://example.org/blog/pricing-update",
    site: "Acme Blog",
    date: "Mar 12, 2026",
    snippet: "Seats are now billed monthly, and the free tier includes three projects.",
  },
  {
    title: "Acme pricing compared with alternatives",
    url: "https://example.net/compare/acme",
    site: "Example Reviews",
    snippet: "A side-by-side look at seat prices, included usage and support.",
  },
]

export default function CitationPill() {
  return (
    <p className="max-w-md text-[15px] leading-8 text-foreground">
      The team plan costs $12 per seat a month on yearly billing
      <Citation variant="pill" sources={pricing} />, and the free tier now includes three projects
      <Citation variant="pill" sources={pricing[1]!} />.
    </p>
  )
}
