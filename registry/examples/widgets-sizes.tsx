import { Headphones, Laptop, Smartphone, Watch } from "lucide-react"

import { BatteryWidget, CalendarWidget, WeatherWidget, type DailyForecast, type HourlyForecast } from "@/components/ballmac/widgets"

const hourly: HourlyForecast[] = [
  { label: "Now", temp: 72, condition: "partly-cloudy" },
  { label: "1 PM", temp: 74, condition: "clear" },
  { label: "2 PM", temp: 76, condition: "clear" },
  { label: "3 PM", temp: 77, condition: "partly-cloudy" },
  { label: "4 PM", temp: 75, condition: "cloudy" },
  { label: "5 PM", temp: 72, condition: "cloudy" },
]
const daily: DailyForecast[] = [
  { day: "Tue", low: 61, high: 78, condition: "partly-cloudy" },
  { day: "Wed", low: 58, high: 70, condition: "rain" },
  { day: "Thu", low: 55, high: 66, condition: "storm" },
  { day: "Fri", low: 54, high: 69, condition: "cloudy" },
  { day: "Sat", low: 57, high: 75, condition: "clear" },
]
const events = [
  { id: "a", title: "Design review", time: "10:30 – 11:15 AM", tone: "red" as const },
  { id: "b", title: "Lunch with Sam", time: "12:30 PM", tone: "blue" as const },
  { id: "c", title: "Ship v2.4", time: "4:00 PM", tone: "green" as const },
]
const devices = [
  { id: "phone", name: "iPhone", level: 82, charging: true, icon: <Smartphone /> },
  { id: "watch", name: "Watch", level: 54, icon: <Watch /> },
  { id: "buds", name: "Earbuds", level: 17, icon: <Headphones /> },
  { id: "mac", name: "MacBook", level: 96, icon: <Laptop /> },
]

export default function WidgetsSizes() {
  return (
    <div className="grid w-full max-w-3xl gap-6 md:grid-cols-2">
      <div className="flex flex-col gap-6">
        <WeatherWidget size="medium" city="Cupertino" temperature={72} condition="partly-cloudy" high={78} low={61} hourly={hourly} className="w-full" />
        <CalendarWidget size="medium" date="2026-10-01" events={events} className="w-full" />
        <WeatherWidget size="medium" city="Oslo" temperature={-2} condition="snow" high={1} low={-6} hourly={hourly.map((h) => ({ ...h, temp: h.temp - 74, condition: "snow" }))} className="w-full" />
      </div>
      <div className="flex flex-col gap-6">
        <WeatherWidget size="large" city="Cupertino" temperature={72} condition="clear" high={78} low={61} hourly={hourly} daily={daily} className="w-full" />
        <BatteryWidget size="large" devices={devices} className="w-full" />
      </div>
    </div>
  )
}
