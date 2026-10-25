"use client"

import * as React from "react"

import { RatingDistribution } from "@/components/ballmac/rating-distribution"

const counts = { 5: 1284, 4: 612, 3: 188, 2: 74, 1: 61 }

export default function RatingDistributionDemo() {
  const [sel, setSel] = React.useState<1 | 2 | 3 | 4 | 5 | null>(null)
  return (
    <div className="grid w-full max-w-xl gap-3">
      <RatingDistribution counts={counts} selected={sel} onSelect={setSel} />
      <p aria-live="polite" className="text-sm text-muted-foreground">{sel ? `Showing ${sel}-star reviews only.` : "Showing all reviews."}</p>
    </div>
  )
}
