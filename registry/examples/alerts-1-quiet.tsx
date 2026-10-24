"use client"

import { Alerts1 } from "@/components/ballmac/blocks/alerts-1/alerts-1"

export default function Alerts1Quiet() {
  return <Alerts1 rules={[{ id: "a", name: "API latency (p95)", condition: "api.latency.p95 > 800ms for 10m", severity: "warning", channel: "Slack #oncall", status: "ok", enabled: true }, { id: "b", name: "Certificate expires soon", condition: "tls.days_left < 14", severity: "info", channel: "Email", status: "ok", enabled: true }]} />
}
