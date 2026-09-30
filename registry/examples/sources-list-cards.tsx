import { SourcesList } from "@/components/ballmac/sources-list"

export default function SourcesListCards() {
  return (
    <div className="w-full max-w-xl">
      <SourcesList
        variant="cards"
        collapsible={false}
        title="Read more"
        visibleCount={4}
        sources={[
          { title: "How sea ice extent is measured from satellites", url: "https://example.org/climate/sea-ice-extent", site: "Polar Data Center", date: "Mar 4, 2026", snippet: "Passive microwave sensors record the surface every day; extent counts areas with 15% ice or more." },
          { title: "Arctic summer minimum reaches the second lowest on record", url: "https://example.com/news/arctic-minimum", site: "Example News", date: "Sep 21, 2026", snippet: "The yearly minimum fell well below the 1981–2010 average." },
          { title: "Changes in multi-year ice since 1985", url: "https://example.net/research/multiyear-ice", site: "Journal of Polar Science", snippet: "Older, thicker ice now covers a fraction of what it did four decades ago." },
          { title: "Explainer: why ice loss speeds up warming", url: "https://example.org/explainers/albedo", site: "Climate Explained", snippet: "Dark open water absorbs far more sunlight than bright ice." },
          { title: "Monthly extent series, 1979 to today", url: "https://example.gov/data/sea-ice-index", site: "National Ice Archive" },
        ]}
      />
    </div>
  )
}
