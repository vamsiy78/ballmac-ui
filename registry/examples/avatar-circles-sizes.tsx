"use client"

import * as React from "react"

import { AvatarCircles } from "@/components/ballmac/avatar-circles"

const people = ["Ada", "Grace", "Linus", "Katherine", "Margaret", "Barbara", "Dennis"].map((name) => ({ name, href: "#" }))

export default function AvatarCirclesSizes() {
  const [clicks, setClicks] = React.useState(0)
  return (
    <div className="grid justify-items-center gap-5 pt-10">
      <AvatarCircles size="sm" people={people} max={4} />
      <AvatarCircles size="default" people={people} max={4} onOverflowClick={() => setClicks((c) => c + 1)} />
      <p className="text-xs text-muted-foreground" aria-live="polite">{clicks ? `Overflow opened ${clicks} time${clicks === 1 ? "" : "s"}` : "The +3 is a button."}</p>
    </div>
  )
}
