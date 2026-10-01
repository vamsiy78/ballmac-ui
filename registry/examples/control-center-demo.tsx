import { Radio, Bluetooth, Moon, Monitor, Music, Sun, Volume2, Wifi, Keyboard } from "lucide-react"

import {
  ControlCenter,
  ControlCluster,
  ControlNowPlaying,
  ControlRow,
  ControlSlider,
  ControlTile,
} from "@/components/ballmac/control-center"

export default function ControlCenterDemo() {
  return (
    <div className="relative isolate flex w-full max-w-[640px] justify-center overflow-hidden rounded-2xl border border-foreground/10 px-4 py-10 sm:px-10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 dark:brightness-[0.55]">
        <div className="absolute inset-0 bg-linear-to-br from-chart-4 via-chart-1 to-chart-2" />
        <div className="absolute -inset-x-1/4 top-1/2 h-full rounded-[50%] bg-white/25 blur-2xl" />
      </div>
      <ControlCenter>
        <ControlCluster>
          <ControlRow icon={<Wifi />} label="Wi-Fi" status="Home" defaultPressed />
          <ControlRow icon={<Bluetooth />} label="Bluetooth" status="On" defaultPressed />
          <ControlRow icon={<Radio />} label="AirDrop" status="Contacts" />
        </ControlCluster>
        <ControlTile icon={<Moon />} label="Focus" status="Off" />
        <ControlTile icon={<Monitor />} label="Stage Manager" status="Off" />
        <ControlSlider label="Display" icon={<Sun />} defaultValue={72} />
        <ControlSlider label="Sound" icon={<Volume2 />} defaultValue={46} />
        <ControlTile icon={<Keyboard />} label="Keyboard" status="50%" defaultPressed />
        <ControlTile icon={<Music />} label="Shuffle" status="Off" />
        <ControlNowPlaying title="Midnight City" artist="M83" defaultPlaying />
      </ControlCenter>
    </div>
  )
}
