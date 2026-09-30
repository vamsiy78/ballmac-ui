import { MasonryGrid, MasonryItem } from "@/components/ballmac/masonry-grid";
const tiles = [
  { h: "h-40", tone: "from-chart-1/40 to-chart-1/10", title: "Morning light" },
  { h: "h-28", tone: "from-chart-2/40 to-chart-2/10", title: "Workshop" },
  { h: "h-52", tone: "from-chart-3/40 to-chart-3/10", title: "Harbor" },
  { h: "h-32", tone: "from-chart-4/40 to-chart-4/10", title: "Studio wall" },
  { h: "h-44", tone: "from-chart-5/40 to-chart-5/10", title: "Field notes" },
  { h: "h-24", tone: "from-chart-1/30 to-chart-2/10", title: "Sketch" },
  { h: "h-36", tone: "from-chart-2/30 to-chart-3/10", title: "Terrace" },
  { h: "h-48", tone: "from-chart-3/30 to-chart-4/10", title: "Market" },
  { h: "h-28", tone: "from-chart-4/30 to-chart-5/10", title: "Ceramics" },
];
export default function MasonryGridDemo() {
  return (
    <MasonryGrid columns={{ base: 2, sm: 3 }} gap="sm" reveal className="w-full max-w-2xl">
      {tiles.map((t) => (
        <MasonryItem key={t.title}>
          <figure className="overflow-hidden rounded-xl border bg-card shadow-xs">
            <div className={`${t.h} bg-gradient-to-br ${t.tone}`} />
            <figcaption className="px-3 py-2 text-xs font-medium">{t.title}</figcaption>
          </figure>
        </MasonryItem>
      ))}
    </MasonryGrid>
  );
}
