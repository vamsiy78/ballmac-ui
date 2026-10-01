"use client"

import { Settings2 } from "@/components/ballmac/blocks/settings-2/settings-2"

export default function Settings2Custom() {
  return (
    <Settings2
      title="Alerts"
      description="Tell us what is worth waking up for."
      events={[
        { id: "deploy", label: "Deploy failed", description: "A production deploy does not finish" },
        { id: "uptime", label: "Downtime", description: "A monitored service stops responding" },
        { id: "usage", label: "Usage limits", description: "You reach 80% of a plan limit" },
      ]}
      defaultValues={{
        digest: "never",
        events: {
          deploy: { email: true, push: true, inApp: true },
          uptime: { email: true, push: true, inApp: true },
          usage: { email: true, push: false, inApp: true },
        },
        quiet: { enabled: false, from: "23:00", to: "06:30", days: ["sat", "sun"] },
      }}
      onChange={async () => {
        await new Promise((r) => setTimeout(r, 300))
      }}
    />
  )
}
