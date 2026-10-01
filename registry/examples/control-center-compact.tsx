"use client"

import * as React from "react"
import { Bluetooth, Moon, Plane, Sun, Wifi } from "lucide-react"

import { ControlCenter, ControlSlider, ControlTile } from "@/components/ballmac/control-center"

export default function ControlCenterCompact() {
  const [wifi, setWifi] = React.useState(true)
  const [brightness, setBrightness] = React.useState(60)
  return (
    <div className="flex w-full flex-col items-center gap-3 py-2">
      <ControlCenter label="Quick settings" className="w-[19rem]">
        <ControlTile stacked icon={<Wifi />} label="Wi-Fi" status={wifi ? "Connected" : "Off"} pressed={wifi} onPressedChange={setWifi} />
        <ControlTile stacked icon={<Bluetooth />} label="Bluetooth" status="On" defaultPressed />
        <ControlTile stacked icon={<Plane />} label="Airplane" status="Off" />
        <ControlTile stacked icon={<Moon />} label="Focus" status="Off" />
        <ControlSlider label="Display" icon={<Sun />} value={brightness} onValueChange={setBrightness} />
      </ControlCenter>
      <p className="text-sm text-muted-foreground" role="status">
        Wi-Fi {wifi ? "on" : "off"}, brightness {brightness}%
      </p>
    </div>
  )
}
