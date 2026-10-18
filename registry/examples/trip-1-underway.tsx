"use client"

import { Trip1, type Trip1Item } from "@/components/ballmac/blocks/trip-1/trip-1"

const items: Trip1Item[] = [
  { id: "a", kind: "flight", date: "2026-10-17", time: "07:05", title: "Zurich to Lisbon", detail: "Swiss, 2 h 55 min", ref: "LX2090", cost: 340 },
  { id: "b", kind: "stay", date: "2026-10-17", time: "15:00", title: "Check in: Pensão Amor", detail: "4 nights, garden room", ref: "BKG-77120", cost: 520 },
  { id: "c", kind: "activity", date: "2026-10-18", time: "10:00", title: "Walking tour of the old town", detail: "Meet at Rossio, two hours", cost: 28 },
  { id: "d", kind: "food", date: "2026-10-18", time: "13:30", title: "Lunch at Time Out Market", cost: 44 },
]

export default function Trip1Underway() {
  return <Trip1 title="Autumn break" destination="Lisbon, Portugal" dates={["2026-10-17", "2026-10-21"]} travelers={["Noor"]} items={items} packing={[{ id: "x", label: "Sunglasses", done: true }, { id: "y", label: "Travel adapter", done: true }]} today="2026-10-18" />
}
