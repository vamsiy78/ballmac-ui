"use client"

import { Floorplan1 } from "@/components/ballmac/blocks/floorplan-1/floorplan-1"

export default function Floorplan1Busy() {
  return <Floorplan1 tables={[{ id: "a", name: "T1", seats: 2, x: 25, y: 35, shape: "round", status: "seated", party: { name: "Okafor", size: 2, since: "18:05" } }, { id: "b", name: "T2", seats: 4, x: 65, y: 55, shape: "square", status: "seated", party: { name: "Lind", size: 4, since: "18:20" } }]} waiting={[{ id: "w", name: "Haas", size: 3, waited: "12 min" }]} />
}
