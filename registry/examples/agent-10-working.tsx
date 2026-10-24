"use client"

import { Agent10 } from "@/components/ballmac/blocks/agent-10/agent-10"

export default function Agent10Working() {
  return <Agent10 running messages={[{ id: "1", role: "user", text: "Summarise last week's tickets.", at: "09:00" }, { id: "2", role: "agent", text: "Reading the tickets…", at: "09:00", tools: [{ name: "list_tickets", input: "Last 7 days", status: "running" }] }]} />
}
