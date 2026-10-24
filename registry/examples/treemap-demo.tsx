"use client"

import { Treemap, type TreemapItem } from "@/components/ballmac/treemap"

const items: TreemapItem[] = [
  { id: "compute", label: "Compute", value: 4210, group: "Production", detail: "Mostly the web tier and the batch workers." },
  { id: "db", label: "Database", value: 2380, group: "Production", detail: "Two replicas and point-in-time recovery." },
  { id: "cdn", label: "CDN", value: 1120, group: "Production" },
  { id: "queue", label: "Queues", value: 340, group: "Production" },
  { id: "ml", label: "Model inference", value: 3150, group: "AI", detail: "Up 18% on last month with the new assistant." },
  { id: "vec", label: "Vector store", value: 760, group: "AI" },
  { id: "embed", label: "Embeddings", value: 410, group: "AI" },
  { id: "ci", label: "CI runners", value: 920, group: "Developer" },
  { id: "reg", label: "Registry", value: 280, group: "Developer" },
  { id: "logs", label: "Logs", value: 1450, group: "Observability" },
  { id: "met", label: "Metrics", value: 530, group: "Observability" },
  { id: "tr", label: "Traces", value: 210, group: "Observability" },
]

export default function TreemapDemo() {
  return (
    <div className="w-full max-w-3xl">
      <Treemap items={items} unit="USD" defaultSelected="ml" format={(v) => `$${v.toLocaleString("en-US")}`} />
    </div>
  )
}
