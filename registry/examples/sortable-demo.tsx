import * as React from "react"

import { Sortable, SortableHandle, SortableItem } from "@/components/ballmac/sortable"

const tracks = [
  { id: "t1", title: "Morning Static", artist: "Lena Okoro", length: "3:42", tone: "bg-chart-1" },
  { id: "t2", title: "Paper Boats", artist: "The Quiet Hours", length: "4:08", tone: "bg-chart-2" },
  { id: "t3", title: "Harbor Lights", artist: "Dev Anand", length: "2:56", tone: "bg-chart-3" },
  { id: "t4", title: "Slow Orbit", artist: "Mira & Co.", length: "5:15", tone: "bg-chart-4" },
  { id: "t5", title: "Nine Floors Up", artist: "Jun Matsuda", length: "3:21", tone: "bg-chart-5" },
]

export default function SortableDemo() {
  const [order, setOrder] = React.useState(tracks.map((t) => t.id))
  const byId = new Map(tracks.map((t) => [t.id, t]))
  return (
    <div className="w-full max-w-md">
      <Sortable label="Playlist" value={order} onValueChange={setOrder}>
        {order.map((id) => {
          const t = byId.get(id)!
          return (
            <SortableItem key={id} id={id} label={t.title}>
              <SortableHandle />
              <span aria-hidden="true" className={`size-10 shrink-0 rounded-lg ${t.tone}/80`} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{t.title}</span>
                <span className="block truncate text-xs text-muted-foreground">{t.artist}</span>
              </span>
              <span className="text-xs tabular-nums text-muted-foreground">{t.length}</span>
            </SortableItem>
          )
        })}
      </Sortable>
    </div>
  )
}
