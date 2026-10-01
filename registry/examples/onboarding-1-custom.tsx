"use client"

import { Onboarding1 } from "@/components/ballmac/blocks/onboarding-1/onboarding-1"

export default function Onboarding1Custom() {
  return (
    <Onboarding1
      product="Northwind"
      domain="northwind.dev"
      goals={[
        { id: "ship", title: "Ship faster", description: "Preview every branch" },
        { id: "monitor", title: "Monitor production", description: "Errors, logs and uptime" },
        { id: "collab", title: "Review together", description: "Comments on live previews" },
      ]}
      onComplete={async () => {
        // Create the workspace on your server here; throw to show the error state.
        await new Promise((r) => setTimeout(r, 600))
      }}
    />
  )
}
