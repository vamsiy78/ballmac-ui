"use client"

import { Booking1 } from "@/components/ballmac/blocks/booking-1/booking-1"

export default function Booking1Demo() {
  return <Booking1 onChange={() => new Promise((r) => setTimeout(r, 400))} />
}
