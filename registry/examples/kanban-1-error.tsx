"use client"

import { Kanban1 } from "@/components/ballmac/blocks/kanban-1/kanban-1"

export default function Kanban1Error() {
  return <Kanban1 state="error" onRetry={() => {}} height="28rem" />
}
