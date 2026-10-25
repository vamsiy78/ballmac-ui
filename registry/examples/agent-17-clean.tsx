"use client"

import { Agent17 } from "@/components/ballmac/blocks/agent-17/agent-17"

export default function Agent17Clean() {
  return <Agent17 cases={[{ id: "1", name: "Greets by name", status: "pass", previous: "pass", input: "Hi", expected: "Greets.", actual: "Hi there!" }]} />
}
