"use client"

import { BookOpen, Mail, MapPin, ReceiptText, Search } from "lucide-react"

import { ToolCatalog, type CatalogTool } from "@/components/ballmac/tool-catalog"

const tools: CatalogTool[] = [
  { id: "t1", name: "search_orders", icon: <Search />, description: "Find a customer's orders by email, order number or date range.", enabled: true, risk: "low", calls: 4210, errorRate: 0.012, latencyMs: 340, schema: '{\n  "type": "object",\n  "properties": {\n    "email": { "type": "string" },\n    "order_number": { "type": "string" },\n    "since": { "type": "string", "format": "date" }\n  }\n}' },
  { id: "t2", name: "issue_refund", icon: <ReceiptText />, description: "Refund all or part of an order to the original payment method.", enabled: true, risk: "high", calls: 318, errorRate: 0.031, latencyMs: 910, schema: '{\n  "type": "object",\n  "required": ["order_number", "amount"],\n  "properties": {\n    "order_number": { "type": "string" },\n    "amount": { "type": "number" },\n    "reason": { "type": "string" }\n  }\n}' },
  { id: "t3", name: "send_email", icon: <Mail />, description: "Send an email from the support address.", enabled: false, risk: "medium", calls: 0 },
  { id: "t4", name: "read_knowledge_base", icon: <BookOpen />, description: "Search the help centre and return the closest articles.", enabled: true, risk: "low", calls: 9120, errorRate: 0.004, latencyMs: 210 },
  { id: "t5", name: "update_address", icon: <MapPin />, description: "Change the shipping address on an order that has not shipped.", enabled: true, risk: "medium", calls: 640, errorRate: 0.094, latencyMs: 1480 },
]

export default function ToolCatalogDemo() {
  return (
    <div className="w-full max-w-2xl">
      <ToolCatalog tools={tools} onToggle={() => new Promise((r) => setTimeout(r, 400))} />
    </div>
  )
}
