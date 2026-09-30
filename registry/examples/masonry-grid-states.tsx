import { MasonryGrid, MasonryItem } from "@/components/ballmac/masonry-grid";
const notes = [
  ["Ship small", "Release the smallest useful change, then learn from it."],
  ["Write it down", "A short note today saves a long meeting next month."],
  ["Name things well", "Good names make code, files and plans easier to follow."],
  ["Review early", "Share drafts while they are still easy to change."],
  ["Measure one thing", "Pick a single number that tells you if it worked."],
];
export default function MasonryGridStates() {
  return (
    <MasonryGrid columns={2} gap="lg" className="w-full max-w-md">
      {notes.map(([title, text], i) => (
        <MasonryItem key={title}>
          <blockquote className="rounded-xl border bg-card p-4">
            <p className="text-sm font-semibold">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{text}{i % 2 ? " Keep the feedback loop short so you notice problems early." : ""}</p>
          </blockquote>
        </MasonryItem>
      ))}
    </MasonryGrid>
  );
}
