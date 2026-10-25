"use client"

import { SplitBar } from "@/components/ballmac/split-bar"

export default function SplitBarTwo() {
  return (
    <div className="w-full max-w-md">
      <SplitBar title="Traffic" segments={[{ id: "new", label: "New visitors", value: 640 }, { id: "ret", label: "Returning", value: 360 }]} />
    </div>
  )
}
