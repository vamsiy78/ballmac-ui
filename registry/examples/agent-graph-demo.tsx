"use client"

import { CreditCard, Database, Mail, ReceiptText } from "lucide-react"

import { AgentGraph, type GraphEdge, type GraphNode } from "@/components/ballmac/agent-graph"

const nodes: GraphNode[] = [
  { id: "user", label: "Customer", kind: "human", detail: "Asked why a refund has not arrived." },
  { id: "router", label: "Router", kind: "agent", status: "done", subtitle: "Haiku 5.5", detail: "Decided this is a billing question." },
  { id: "billing", label: "Billing agent", kind: "agent", status: "working", subtitle: "Sonnet 5.5", detail: "Reading the payment record and the refund policy." },
  { id: "memory", label: "Customer memory", kind: "memory", status: "idle", icon: <Database /> },
  { id: "payments", label: "Payments API", kind: "tool", status: "idle", icon: <CreditCard /> },
  { id: "refunds", label: "Refund tool", kind: "tool", status: "waiting", icon: <ReceiptText />, detail: "Waiting for approval, the amount is over the limit." },
  { id: "reply", label: "Reply writer", kind: "agent", status: "idle", subtitle: "Sonnet 5.5", icon: <Mail /> },
]
const edges: GraphEdge[] = [
  { from: "user", to: "router" },
  { from: "router", to: "billing", label: "billing", active: true },
  { from: "billing", to: "memory", label: "reads" },
  { from: "billing", to: "payments", label: "looks up", active: true },
  { from: "billing", to: "refunds", label: "asks" },
  { from: "payments", to: "reply" },
  { from: "refunds", to: "reply" },
]

export default function AgentGraphDemo() {
  return (
    <div className="w-full max-w-4xl">
      <AgentGraph title="Support team" nodes={nodes} edges={edges} defaultSelected="billing" />
    </div>
  )
}
