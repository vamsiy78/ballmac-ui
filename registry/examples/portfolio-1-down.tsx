"use client"

import { Portfolio1 } from "@/components/ballmac/blocks/portfolio-1/portfolio-1"

// A rough year: the value fell, so the line and the change turn to the loss colors. The last point matches the holdings (176,583).
const year = Array.from({ length: 52 }, (_, i) => Math.round(176583 + (1 - i / 51) * 21400 + Math.sin(i * 0.8) * 2400 * (1 - i / 70)))

export default function Portfolio1Down() {
  return <Portfolio1 defaultRange="1Y" series={{ "1W": [181200, 180600, 179400, 178900, 177800, 177100, 176583], "1M": [188400, 186900, 184200, 182100, 179600, 176583], "1Y": year }} />
}
