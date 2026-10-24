"use client"

import { RunReplay } from "@/components/ballmac/run-replay"

export default function RunReplayDemo() {
  return (
    <div className="w-full max-w-xl">
      <RunReplay
        duration={270}
        defaultTime={42}
        markers={[
          { time: 38, label: "Plan ready" },
          { time: 104, label: "Search failed" },
          { time: 188, label: "Tests failing" },
          { time: 236, label: "Approved" },
        ]}
      />
    </div>
  )
}
