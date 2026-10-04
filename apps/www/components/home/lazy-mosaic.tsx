"use client"

import * as React from "react"

import { enqueueMount } from "@/lib/mount-queue"

// The mosaic is the heaviest thing on the home page (about 30 live components). It is fetched after the page has loaded,
// so the headline, install command and links are interactive first. The placeholder holds the mosaic's height, so nothing jumps.
const Mosaic = React.lazy(() => import("./mosaic").then((m) => ({ default: m.Mosaic })))

function Skeleton() {
  return (
    <div aria-hidden="true" className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="bg-muted/40 h-64 rounded-2xl border max-md:[&:nth-child(n+5)]:hidden" />
      ))}
    </div>
  )
}

export function LazyMosaic() {
  const [ready, setReady] = React.useState(false)
  React.useEffect(() => enqueueMount(() => setReady(true)), [])
  return (
    <div className="min-h-[2409px] md:min-h-[1606px] xl:min-h-[832px]">
      {ready ? (
        <React.Suspense fallback={<Skeleton />}>
          <Mosaic />
        </React.Suspense>
      ) : (
        <Skeleton />
      )}
    </div>
  )
}
