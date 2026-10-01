"use client"

import { WebhookCard, type WebhookDelivery } from "@/components/ballmac/webhook-card"

const deliveries: WebhookDelivery[] = [
  { id: "d1", event: "invoice.paid", status: 200, duration: 184, time: "2026-09-30T14:02:11Z", payload: `{\n  "id": "evt_8a21",\n  "type": "invoice.paid",\n  "data": { "invoice": "in_1042", "amount": 4900, "currency": "usd" }\n}`, response: `{ "received": true }` },
  { id: "d2", event: "customer.created", status: 200, duration: 97, time: "2026-09-30T13:48:40Z", payload: `{\n  "id": "evt_8a1f",\n  "type": "customer.created",\n  "data": { "customer": "cus_91" }\n}` },
  { id: "d3", event: "subscription.updated", status: 200, duration: 143, time: "2026-09-30T12:20:05Z" },
]

export default function WebhookCardDemo() {
  return (
    <div className="w-full max-w-xl">
      <WebhookCard
        url="https://api.example.com/hooks/billing"
        secret="whsec_4f1c0a9e2b7d3c85"
        events={["invoice.paid", "invoice.failed", "customer.created", "subscription.updated", "subscription.canceled"]}
        deliveries={deliveries}
        onTest={() => {}}
        onRedeliver={() => {}}
      />
    </div>
  )
}
