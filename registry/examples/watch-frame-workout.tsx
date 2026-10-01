import { Flame, Footprints, Heart } from "lucide-react"

import { WatchFrame } from "@/components/ballmac/watch-frame"

function Workout() {
  return (
    <div className="flex h-full flex-col px-4 pt-3 pb-5 text-white">
      <p className="flex items-center gap-1.5 text-[15px] font-semibold text-[oklch(0.8_0.18_135)]">
        <Footprints className="size-4" aria-hidden="true" /> Outdoor Run
      </p>
      <p className="mt-1 text-[44px] leading-none font-semibold tracking-tight tabular-nums">24:18</p>
      <div className="mt-auto grid gap-2">
        <div className="flex items-baseline justify-between">
          <span className="flex items-center gap-1.5 text-[22px] font-semibold tabular-nums">
            <Heart className="size-4 fill-[oklch(0.7_0.22_20)] text-[oklch(0.7_0.22_20)]" aria-hidden="true" />148
          </span>
          <span className="text-[13px] text-white/75">BPM</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="flex items-center gap-1.5 text-[22px] font-semibold tabular-nums">
            <Flame className="size-4 fill-[oklch(0.8_0.17_60)] text-[oklch(0.8_0.17_60)]" aria-hidden="true" />312
          </span>
          <span className="text-[13px] text-white/75">CAL</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-[22px] font-semibold tabular-nums">5&apos;42&quot;</span>
          <span className="text-[13px] text-white/75">PACE</span>
        </div>
      </div>
    </div>
  )
}

export default function WatchFrameWorkout() {
  return (
    <div className="flex w-full justify-center px-2 py-6">
      <WatchFrame screenWidth={208} band="loop" bandTone="orange" variant="black" className="max-w-[250px]">
        <Workout />
      </WatchFrame>
    </div>
  )
}
