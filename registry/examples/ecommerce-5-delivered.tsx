"use client"

import { Ecommerce5 } from "@/components/ballmac/blocks/ecommerce-5/ecommerce-5"

export default function Ecommerce5Delivered() {
  return <Ecommerce5 order={{ number: "BM-48100", placed: "Oct 12", total: "$96.00", stage: "delivered", eta: "Delivered", carrier: "Parcel Express", tracking: "PX 1100 2231", address: ["Sam Rivera", "12 Quay Street"], items: [{ id: "1", name: "Glow desk lamp", variant: "Ink", quantity: 1, kind: "lamp", tone: 5 }], events: [{ id: "e1", when: "Oct 15, 11:20", text: "Delivered to the front door", place: "Bristol" }] }} onStartReturn={() => new Promise((resolve) => setTimeout(resolve, 600))} />
}
