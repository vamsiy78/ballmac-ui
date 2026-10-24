"use client"

import { Fleet1 } from "@/components/ballmac/blocks/fleet-1/fleet-1"

export default function Fleet1Service() {
  return <Fleet1 vehicles={[{ id: "v", name: "Van 12", plate: "LK71 ABC", driver: "Priya", status: "parked", where: "Depot, Leeds", level: 22, serviceInKm: 120, alerts: ["Tyre pressure low"] }]} />
}
