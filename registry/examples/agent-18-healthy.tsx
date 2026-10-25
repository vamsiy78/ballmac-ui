"use client"

import { Agent18 } from "@/components/ballmac/blocks/agent-18/agent-18"

export default function Agent18Healthy() {
  return <Agent18 sources={[{ id: "1", name: "Product docs", kind: "notion", status: "synced", docs: 1284, lastSync: "Just now", included: true }]} />
}
