"use client"

import { TokenMeter } from "@/components/ballmac/token-meter"

export default function TokenMeterDemo() {
  return (
    <div className="w-full max-w-md">
      <TokenMeter
        limit={200_000}
        cost="$0.42"
        segments={[
          { label: "System prompt", tokens: 3_200 },
          { label: "Conversation", tokens: 118_500 },
          { label: "Attached files", tokens: 42_800 },
          { label: "Room for the reply", tokens: 16_000, reserved: true },
        ]}
        action={
          <button
            type="button"
            className="h-8 rounded-md border bg-background px-3 text-[13px] font-medium shadow-xs outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            Compact conversation
          </button>
        }
      />
    </div>
  )
}
