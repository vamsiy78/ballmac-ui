"use client"

import { Matrix1 } from "@/components/ballmac/blocks/matrix-1/matrix-1"

export default function Matrix1Ai() {
  return <Matrix1 services={[{ id: "ai", name: "Assistant", team: "AI" }, { id: "search", name: "Search", team: "AI" }]} regions={[{ id: "us", label: "US East" }, { id: "eu", label: "Europe" }]} availability={[[99.6, 99.1], [99.95, 99.98]]} incidents={{}} />
}
