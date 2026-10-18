"use client"

import { Experiments1 } from "@/components/ballmac/blocks/experiments-1/experiments-1"

export default function Experiments1Flat() {
  return (
    <Experiments1
      title="Homepage: headline wording"
      hypothesis="A benefit-led headline will get more people to click Get started."
      metric="Clicked Get started"
      status="Ended 16 October"
      variants={[
        { id: "a", name: "Current headline", visitors: 21480, conversions: 1934, control: true },
        { id: "b", name: "Benefit-led headline", visitors: 21512, conversions: 1941 },
      ]}
    />
  )
}
