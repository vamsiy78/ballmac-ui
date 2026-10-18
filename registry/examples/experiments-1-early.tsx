"use client"

import { Experiments1 } from "@/components/ballmac/blocks/experiments-1/experiments-1"

export default function Experiments1Early() {
  return (
    <Experiments1
      title="Pricing page: annual first"
      hypothesis="Showing the yearly price first will raise paid signups."
      metric="Chose a paid plan"
      status="Running since 15 October"
      variants={[
        { id: "a", name: "Monthly first", visitors: 812, conversions: 41, control: true },
        { id: "b", name: "Annual first", visitors: 798, conversions: 52 },
      ]}
    />
  )
}
