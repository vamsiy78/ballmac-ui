"use client"

import { Seatmap1 } from "@/components/ballmac/blocks/seatmap-1/seatmap-1"

// Pressing Hold fails because E5 was just taken: it becomes taken, E4 and E6 stay chosen.
export default function Seatmap1Conflict() {
  return <Seatmap1 defaultSelected={["E4", "E5", "E6"]} onContinue={() => Promise.reject(Object.assign(new Error("conflict"), { taken: ["E5"] }))} />
}
