"use client"

import { Reviews2 } from "@/components/ballmac/blocks/reviews-2/reviews-2"

export default function Reviews2Few() {
  return <Reviews2 reviews={[{ id: "1", author: "Sam", rating: 5, date: "Oct 1", title: "Great", body: "Works well." }, { id: "2", author: "Ana", rating: 4, date: "Oct 2", title: "Good", body: "Mostly great." }]} />
}
