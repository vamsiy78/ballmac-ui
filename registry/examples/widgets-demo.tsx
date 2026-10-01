import { Headphones, Laptop, Smartphone, Watch } from "lucide-react"

import { BatteryWidget, CalendarWidget, WeatherWidget } from "@/components/ballmac/widgets"

export default function WidgetsDemo() {
  return (
    <div className="relative isolate w-full max-w-3xl overflow-hidden rounded-2xl border border-foreground/10 px-4 py-8 sm:px-10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 dark:brightness-[0.55]">
        <div className="absolute inset-0 bg-linear-to-br from-chart-4 via-chart-1 to-chart-2" />
        <div className="absolute -inset-x-1/4 top-1/2 h-full rounded-[50%] bg-white/25 blur-2xl" />
      </div>
      <div className="flex flex-wrap justify-center gap-4">
        <WeatherWidget
          city="Cupertino"
          temperature={72}
          condition="partly-cloudy"
          high={78}
          low={61}
          className="w-44"
        />
        <CalendarWidget
          date="2026-10-01"
          events={[
            { id: "a", title: "Design review", time: "10:30 – 11:15 AM", tone: "red" },
            { id: "b", title: "Lunch with Sam", time: "12:30 PM", tone: "blue" },
            { id: "c", title: "Ship v2.4", time: "4:00 PM", tone: "green" },
          ]}
          className="w-44"
        />
        <BatteryWidget
          className="w-44"
          devices={[
            { id: "phone", name: "iPhone", level: 82, charging: true, icon: <Smartphone /> },
            { id: "watch", name: "Watch", level: 54, icon: <Watch /> },
            { id: "buds", name: "Earbuds", level: 17, icon: <Headphones /> },
            { id: "mac", name: "MacBook", level: 96, icon: <Laptop /> },
          ]}
        />
      </div>
    </div>
  )
}
