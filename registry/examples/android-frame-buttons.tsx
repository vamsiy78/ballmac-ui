import { BatteryMedium, Bluetooth, ChevronRight, Moon, Wifi } from "lucide-react"

import { AndroidFrame } from "@/components/ballmac/android-frame"

const rows = [
  { icon: Wifi, name: "Network & internet", detail: "Wi-Fi, mobile, data usage", tone: "bg-chart-1" },
  { icon: Bluetooth, name: "Connected devices", detail: "Bluetooth, pairing", tone: "bg-chart-4" },
  { icon: BatteryMedium, name: "Battery", detail: "82% · about 1 day left", tone: "bg-chart-2" },
  { icon: Moon, name: "Display", detail: "Dark theme, font size", tone: "bg-chart-5" },
]

function Settings() {
  return (
    <div className="flex h-full flex-col px-5 pt-5">
      <p className="text-[34px] leading-tight font-normal tracking-tight">Settings</p>
      <div className="mt-4 rounded-full bg-muted px-5 py-3 text-[15px] text-muted-foreground">Search settings</div>
      <ul className="mt-4 flex flex-col gap-0.5">
        {rows.map((r) => (
          <li key={r.name} className="flex items-center gap-4 rounded-2xl px-2 py-3">
            <span className={`flex size-11 shrink-0 items-center justify-center rounded-full text-white ${r.tone}`}>
              <r.icon className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block truncate text-[16px] font-medium">{r.name}</span>
              <span className="block truncate text-[13px] text-muted-foreground">{r.detail}</span>
            </span>
            <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function AndroidFrameButtons() {
  return (
    <div className="flex w-full justify-center px-2 py-6">
      <AndroidFrame screenWidth={412} variant="sage" navigation="buttons" className="max-w-[300px]">
        <Settings />
      </AndroidFrame>
    </div>
  )
}
