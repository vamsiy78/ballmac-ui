"use client"

import * as React from "react"

import { AutonomyDial } from "@/components/ballmac/autonomy-dial"

export default function AutonomyDialDemo() {
  const [value, setValue] = React.useState("auto-edit")
  return (
    <div className="w-full max-w-2xl">
      <AutonomyDial value={value} onValueChange={setValue} />
    </div>
  )
}
