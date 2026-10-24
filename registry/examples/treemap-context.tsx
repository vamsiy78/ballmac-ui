import { Treemap, type TreemapItem } from "@/components/ballmac/treemap"

const items: TreemapItem[] = [
  { id: "sys", label: "System prompt", value: 3200, group: "Instructions" },
  { id: "tools", label: "Tool definitions", value: 5600, group: "Instructions" },
  { id: "h1", label: "Earlier conversation", value: 41800, group: "History", detail: "Messages from before the last summary." },
  { id: "h2", label: "Recent turns", value: 22300, group: "History" },
  { id: "f1", label: "billing/export.ts", value: 14200, group: "Files" },
  { id: "f2", label: "billing/client.ts", value: 9100, group: "Files" },
  { id: "f3", label: "billing/*.test.ts", value: 11800, group: "Files" },
  { id: "f4", label: "docs/billing.md", value: 6400, group: "Files" },
  { id: "r1", label: "Search results", value: 8700, group: "Retrieved" },
  { id: "r2", label: "Ticket thread", value: 4300, group: "Retrieved" },
]

export default function TreemapContext() {
  return (
    <div className="w-full max-w-3xl">
      <Treemap items={items} unit="tokens" aspect={2} />
    </div>
  )
}
