"use client"

import { WebhookCard, type WebhookDelivery } from "@/components/ballmac/webhook-card"

const deliveries: WebhookDelivery[] = [
  { id: "f1", event: "order.created", status: 500, duration: 2100, time: "2026-09-30T14:10:02Z", payload: `{\n  "type": "order.created",\n  "data": { "order": "ord_771" }\n}`, response: `{ "error": "database unavailable" }` },
  { id: "f2", event: "order.created", status: 0, time: "2026-09-30T14:02:51Z", payload: `{\n  "type": "order.created",\n  "data": { "order": "ord_770" }\n}` },
  { id: "f3", event: "order.paid", status: 200, duration: 160, time: "2026-09-30T13:30:14Z" },
  { id: "f4", event: "order.refunded", status: 404, duration: 90, time: "2026-09-30T12:55:33Z" },
]

export default function WebhookCardFailing() {
  return (
    <div className="w-full max-w-xl">
      <WebhookCard
        url="https://hooks.shop.example.com/orders"
        secret="whsec_91a7d0e6b2f4"
        events={["order.created", "order.paid", "order.refunded"]}
        deliveries={deliveries}
        onRedeliver={() => {}}
      />
    </div>
  )
}
