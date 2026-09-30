import { Citation, type CitationSource } from "@/components/ballmac/citation"

const sources: CitationSource[] = [
  {
    title: "How sea ice extent is measured from satellites",
    url: "https://example.org/climate/sea-ice-extent",
    site: "Polar Data Center",
    date: "Mar 4, 2026",
    snippet: "Passive microwave sensors record the ocean surface every day, and extent is the area with at least 15% ice cover.",
  },
  {
    title: "Arctic summer minimum reaches the second lowest on record",
    url: "https://example.com/news/arctic-minimum",
    site: "Example News",
    date: "Sep 21, 2026",
    snippet: "The yearly minimum fell well below the 1981–2010 average, continuing a long decline.",
  },
]

export default function CitationDemo() {
  return (
    <p className="max-w-md text-[15px] leading-7 text-foreground">
      Arctic sea ice is tracked by satellites that sense microwave emission from the surface
      <Citation index={1} sources={sources[0]!} />. This year&apos;s minimum was the second lowest since records began
      <Citation index={2} sources={sources[1]!} />, and the trend across four decades is downward.
    </p>
  )
}
