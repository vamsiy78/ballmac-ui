import { Calendar, Camera, Globe, Mail, Map, MessageCircle, Mic, Music, Phone, Search, Settings } from "lucide-react"

import { AndroidFrame } from "@/components/ballmac/android-frame"

const apps = [
  { icon: Phone, name: "Phone", tone: "bg-chart-2" },
  { icon: MessageCircle, name: "Messages", tone: "bg-chart-1" },
  { icon: Globe, name: "Browser", tone: "bg-chart-5" },
  { icon: Camera, name: "Camera", tone: "bg-chart-4" },
  { icon: Mail, name: "Gmail", tone: "bg-destructive" },
  { icon: Map, name: "Maps", tone: "bg-chart-2" },
  { icon: Music, name: "Music", tone: "bg-chart-3" },
  { icon: Settings, name: "Settings", tone: "bg-neutral-600" },
]

function Home() {
  return (
    <div className="relative flex h-full flex-col bg-[linear-gradient(170deg,oklch(0.38_0.13_265),oklch(0.3_0.1_300)_55%,oklch(0.34_0.1_20))] px-5 pb-16 text-white">
      <div className="mt-6 text-center">
        <p className="text-[70px] leading-none font-light tracking-tight tabular-nums">9:41</p>
        <p className="mt-1 text-[16px] font-medium text-white/90">Thu, Oct 1 · 18°C</p>
      </div>
      <div className="mt-5 flex items-center gap-3 rounded-full bg-white/15 px-5 py-3.5 backdrop-blur-xl">
        <Search className="size-5" aria-hidden="true" />
        <span className="flex-1 text-[15px] text-white/90">Search apps and the web</span>
        <Mic className="size-5" aria-hidden="true" />
      </div>
      <div className="mt-6 flex items-center gap-3 rounded-3xl bg-white/15 p-4 backdrop-blur-xl">
        <Calendar className="size-6 shrink-0" aria-hidden="true" />
        <div className="min-w-0 leading-tight">
          <p className="truncate text-[15px] font-semibold">Design review</p>
          <p className="text-[13px] text-white/85">10:30 · Room 4B</p>
        </div>
      </div>
      <div className="mt-auto grid grid-cols-4 gap-y-5">
        {apps.map((a) => (
          <div key={a.name} className="flex flex-col items-center gap-1.5">
            <span className={`flex size-14 items-center justify-center rounded-[18px] text-white shadow-lg ${a.tone}`}>
              <a.icon className="size-6" aria-hidden="true" />
            </span>
            <span className="text-[12px] font-medium">{a.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AndroidFrameDemo() {
  return (
    <div className="flex w-full justify-center px-2 py-6">
      <AndroidFrame screenWidth={412} screenClassName="dark" className="max-w-[300px]">
        <Home />
      </AndroidFrame>
    </div>
  )
}
