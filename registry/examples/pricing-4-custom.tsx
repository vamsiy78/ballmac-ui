"use client"

import { Pricing4 } from "@/components/ballmac/blocks/pricing-4/pricing-4"

export default function Pricing4Custom() {
  return (
    <Pricing4
      title="Tempo is yours to keep."
      description="Pay once, or subscribe for every update."
      currency="EUR"
      years={4}
      defaultMode="subscribe"
      defaultTier="studio"
      renewal={{ single: 15, studio: 29 }}
      guarantee={null}
      tiers={[
        { id: "single", name: "Single", description: "One person", once: 59, yearly: 29 },
        { id: "studio", name: "Studio", description: "Up to ten people", once: 249, yearly: 119 },
      ]}
      href={(tier, mode) => `/checkout?tier=${tier}&mode=${mode}`}
    />
  )
}
