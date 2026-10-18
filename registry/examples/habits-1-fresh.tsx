"use client"

import { Habits1 } from "@/components/ballmac/blocks/habits-1/habits-1"

export default function Habits1Fresh() {
  return (
    <Habits1
      habits={[
        { id: "a", name: "Drink water before coffee", target: 7, done: ["2026-10-18", "2026-10-17", "2026-10-16"], tone: 2 },
        { id: "b", name: "Ten minutes of stretching", target: 4, done: ["2026-10-17"], tone: 5 },
      ]}
    />
  )
}
