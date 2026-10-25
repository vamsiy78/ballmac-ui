"use client"

import { Ecommerce1 } from "@/components/ballmac/blocks/ecommerce-1/ecommerce-1"

export default function Ecommerce1Sale() {
  return <Ecommerce1 products={[{ id: "a", name: "Aria speaker", price: 129, compareAt: 159, rating: 4.7, reviews: 1284, category: "Audio", kind: "speaker", badge: "Sale", colors: [{ id: "sand", label: "Sand", tone: 3 }] }]} />
}
