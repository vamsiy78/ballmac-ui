"use client"

import { Secrets1 } from "@/components/ballmac/blocks/secrets-1/secrets-1"

export default function Secrets1Fresh() {
  return <Secrets1 secrets={[{ id: "a", name: "DATABASE_URL", environment: "production", owner: "Platform", rotatedDays: 12, lastUsed: "Just now", usedBy: "api" }, { id: "b", name: "JWT_SIGNING_KEY", environment: "production", owner: "Platform", rotatedDays: 40, lastUsed: "Just now", usedBy: "auth" }]} />
}
