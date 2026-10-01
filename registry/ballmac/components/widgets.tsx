// Ballmac UI: Widgets. https://ui.ballmac.com/components/widgets
import * as React from "react"
import { Cloud, CloudLightning, CloudRain, CloudSnow, CloudSun, Moon, Navigation, Sun, Zap } from "lucide-react"

import { cn } from "@/lib/utils"

type WidgetSize = "small" | "medium" | "large"

/** Small is a square, medium is twice as wide, large is twice as wide and as tall. Every size scales with its width. */
const SHAPE: Record<WidgetSize, string> = {
  small: "aspect-square",
  medium: "aspect-[2.14/1]",
  large: "aspect-[0.955/1]",
}

type WidgetProps = React.ComponentProps<"section"> & {
  /** Which size the widget draws at. Set the width with `className` (a small widget is about 10rem wide). */
  size?: WidgetSize
  /** Accessible name of the widget. */
  label: string
  /** Class names for the widget's surface (background and text color). `className` sizes and places the widget. */
  surfaceClassName?: string
}

/** Frame for a desktop widget: rounded, container-scaled, and one of three sizes. Use it for your own widgets. */
function Widget({ size = "small", label, className, surfaceClassName, children, ...props }: WidgetProps) {
  return (
    <section data-slot="widget" data-size={size} aria-label={label} className={cn("@container relative w-40 max-w-full", SHAPE[size], size !== "small" && "w-80", className)} {...props}>
      <div
        data-slot="widget-surface"
        className={cn(
          "absolute inset-0 overflow-hidden rounded-[calc(var(--u)*14)] shadow-[0_8px_24px_-8px_rgb(0_0_0/0.35),0_0_0_1px_rgb(0_0_0/0.06)]",
          size === "small" ? "[--u:1cqw]" : "[--u:0.467cqw]",
          surfaceClassName
        )}
      >
        {children}
      </div>
    </section>
  )
}

/** Font size in the widget's own unit. */
const fs = (n: number): React.CSSProperties => ({ fontSize: `calc(var(--u) * ${n})` })
const sp = (n: number) => `calc(var(--u) * ${n})`

// Weather

type WeatherCondition = "clear" | "partly-cloudy" | "cloudy" | "rain" | "snow" | "storm" | "night"

const SKY: Record<WeatherCondition, string> = {
  clear: "bg-[linear-gradient(165deg,oklch(0.47_0.17_255),oklch(0.58_0.13_232))]",
  "partly-cloudy": "bg-[linear-gradient(165deg,oklch(0.46_0.15_255),oklch(0.57_0.1_238))]",
  cloudy: "bg-[linear-gradient(165deg,oklch(0.44_0.04_255),oklch(0.55_0.035_245))]",
  rain: "bg-[linear-gradient(165deg,oklch(0.36_0.06_260),oklch(0.48_0.06_245))]",
  snow: "bg-[linear-gradient(165deg,oklch(0.46_0.06_245),oklch(0.57_0.045_235))]",
  storm: "bg-[linear-gradient(165deg,oklch(0.28_0.07_290),oklch(0.4_0.08_270))]",
  night: "bg-[linear-gradient(165deg,oklch(0.22_0.08_275),oklch(0.34_0.1_262))]",
}

const SKY_ICON: Record<WeatherCondition, React.ComponentType<{ className?: string }>> = {
  clear: Sun,
  "partly-cloudy": CloudSun,
  cloudy: Cloud,
  rain: CloudRain,
  snow: CloudSnow,
  storm: CloudLightning,
  night: Moon,
}

const SKY_WORD: Record<WeatherCondition, string> = {
  clear: "Clear",
  "partly-cloudy": "Partly Cloudy",
  cloudy: "Cloudy",
  rain: "Rain",
  snow: "Snow",
  storm: "Thunderstorms",
  night: "Clear Night",
}

type HourlyForecast = { label: string; temp: number; condition: WeatherCondition }
type DailyForecast = { day: string; low: number; high: number; condition: WeatherCondition }

type WeatherWidgetProps = Omit<WidgetProps, "label" | "children" | "surfaceClassName"> & {
  /** Place name. */
  city: string
  /** Current temperature, in degrees. */
  temperature: number
  /** Current sky. Chooses the gradient, icon and wording. */
  condition?: WeatherCondition
  /** Today's high. */
  high: number
  /** Today's low. */
  low: number
  /** Upcoming hours, shown on medium and large widgets. */
  hourly?: HourlyForecast[]
  /** Upcoming days, shown on the large widget. */
  daily?: DailyForecast[]
}

function SkyIcon({ condition, className, style }: { condition: WeatherCondition; className?: string; style?: React.CSSProperties }) {
  const Icon = SKY_ICON[condition]
  return (
    <span aria-hidden="true" className={cn("flex items-center justify-center drop-shadow-[0_1px_3px_rgb(0_0_0/0.25)]", className)} style={style}>
      <Icon className="size-full" />
    </span>
  )
}

/** A weather widget with a sky gradient that follows the condition, hourly strip and daily ranges. */
function WeatherWidget({ city, temperature, condition = "clear", high, low, hourly = [], daily = [], size = "small", className, ...props }: WeatherWidgetProps) {
  const min = Math.min(...daily.map((d) => d.low), low)
  const max = Math.max(...daily.map((d) => d.high), high)
  const summary = `${city}, ${temperature} degrees, ${SKY_WORD[condition]}. High ${high}, low ${low}.`
  return (
    <Widget size={size} label={`Weather in ${city}`} surfaceClassName={cn("text-white [text-shadow:0_1px_2px_rgb(0_0_0/0.18)]", SKY[condition])} className={className} {...props}>
      <p className="sr-only">{summary}</p>
      <div aria-hidden="true" className="flex size-full flex-col" style={{ padding: sp(size === "small" ? 11 : size === "medium" ? 9 : 13) }}>
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="flex items-center gap-[calc(var(--u)*3)] font-semibold" style={fs(size === "small" ? 9.5 : 10)}>
              <span className="truncate">{city}</span>
              <Navigation className="shrink-0 fill-current" style={{ width: sp(8), height: sp(8) }} />
            </p>
            <p className="font-light tracking-tight tabular-nums" style={{ ...fs(size === "small" ? 31 : size === "medium" ? 27 : 38), lineHeight: 1.05, marginLeft: sp(-1) }}>
              {temperature}°
            </p>
          </div>
          {size !== "small" && (
            <div className="flex flex-col items-end text-right" style={{ gap: sp(1) }}>
              <SkyIcon condition={condition} style={{ width: sp(size === "medium" ? 14 : 20), height: sp(size === "medium" ? 14 : 20) }} />
              <p className="font-semibold" style={fs(9.5)}>{SKY_WORD[condition]}</p>
              <p className="tabular-nums" style={fs(9.5)}>H:{high}° L:{low}°</p>
            </div>
          )}
        </div>
        {size === "small" && (
          <div className="mt-auto">
            <p className="flex items-center font-semibold" style={{ gap: sp(4), ...fs(9.5) }}>
              <SkyIcon condition={condition} style={{ width: sp(12), height: sp(12) }} />
              <span className="truncate">{SKY_WORD[condition]}</span>
            </p>
            <p className="tabular-nums" style={fs(9.5)}>H:{high}° L:{low}°</p>
          </div>
        )}
        {size !== "small" && hourly.length > 0 && (
          <div className={cn("flex justify-between border-t border-white/25", size === "medium" ? "mt-auto" : "mt-[calc(var(--u)*10)]")} style={{ paddingTop: sp(size === "medium" ? 5 : 8) }}>
            {hourly.slice(0, 6).map((h) => (
              <div key={h.label} className="flex flex-col items-center" style={{ gap: sp(size === "medium" ? 2.5 : 4), ...fs(size === "medium" ? 8.5 : 9) }}>
                <span className="font-medium">{h.label}</span>
                <SkyIcon condition={h.condition} style={{ width: sp(size === "medium" ? 11 : 13), height: sp(size === "medium" ? 11 : 13) }} />
                <span className="font-semibold tabular-nums" style={fs(size === "medium" ? 9.5 : 10)}>{h.temp}°</span>
              </div>
            ))}
          </div>
        )}
        {size === "large" && daily.length > 0 && (
          <ul className="mt-[calc(var(--u)*8)] flex flex-1 flex-col justify-between border-t border-white/25" style={{ paddingTop: sp(4) }}>
            {daily.slice(0, 5).map((d) => (
              <li key={d.day} className="grid grid-cols-[18%_12%_1fr] items-center" style={{ gap: sp(6), ...fs(10) }}>
                <span className="font-semibold">{d.day}</span>
                <SkyIcon condition={d.condition} style={{ width: sp(12), height: sp(12) }} />
                <span className="flex items-center" style={{ gap: sp(6) }}>
                  <span className="w-[14%] text-right tabular-nums opacity-85">{d.low}°</span>
                  <span className="relative h-[calc(var(--u)*3.5)] flex-1 rounded-full bg-white/25">
                    <span
                      className="absolute inset-y-0 rounded-full bg-gradient-to-r from-[oklch(0.85_0.13_200)] to-[oklch(0.85_0.15_80)]"
                      style={{ left: `${((d.low - min) / (max - min || 1)) * 100}%`, right: `${100 - ((d.high - min) / (max - min || 1)) * 100}%` }}
                    />
                  </span>
                  <span className="w-[14%] tabular-nums">{d.high}°</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Widget>
  )
}

// Calendar

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

type CalendarEvent = { id: string; title: string; time: string; tone?: "red" | "blue" | "green" | "orange" | "purple" }

const EVENT_TONE: Record<NonNullable<CalendarEvent["tone"]>, string> = {
  red: "bg-destructive",
  blue: "bg-chart-1",
  green: "bg-chart-2",
  orange: "bg-chart-5",
  purple: "bg-chart-4",
}

type CalendarWidgetProps = Omit<WidgetProps, "label" | "children" | "surfaceClassName"> & {
  /** The day to show, as an ISO date such as "2026-10-01". Read as UTC, so every viewer sees the same day. */
  date: string
  /** Events on that day, in order. */
  events?: CalendarEvent[]
}

function monthGrid(year: number, month: number) {
  const first = new Date(Date.UTC(year, month, 1)).getUTCDay()
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  return { lead: first, days }
}

function Events({ events, limit }: { events: CalendarEvent[]; limit: number }) {
  if (events.length === 0) return <p className="text-muted-foreground" style={fs(9.5)}>No events today</p>
  return (
    <ul className="flex flex-col" style={{ gap: sp(5) }}>
      {events.slice(0, limit).map((e) => (
        <li key={e.id} className="flex items-stretch" style={{ gap: sp(5) }}>
          <span aria-hidden="true" className={cn("w-[calc(var(--u)*2.4)] shrink-0 rounded-full", EVENT_TONE[e.tone ?? "blue"])} />
          <span className="min-w-0 leading-tight" style={fs(9.5)}>
            <span className="block truncate font-semibold">{e.title}</span>
            <span className="block truncate text-muted-foreground tabular-nums">{e.time}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}

/** A calendar widget: the day in big type, a month grid with today circled, and the day's events. */
function CalendarWidget({ date, events = [], size = "small", className, ...props }: CalendarWidgetProps) {
  const d = new Date(`${date}T00:00:00Z`)
  const year = d.getUTCFullYear()
  const month = d.getUTCMonth()
  const day = d.getUTCDate()
  const weekday = WEEKDAYS[d.getUTCDay()]!
  const { lead, days } = monthGrid(year, month)
  const label = `${weekday}, ${MONTHS[month]} ${day}, ${year}`
  const compact = size === "medium"
  const cell = compact ? 8.5 : 12
  const grid = (
    <div aria-hidden="true" className="flex flex-col" style={{ gap: sp(compact ? 1 : 2) }}>
      <p className="font-semibold text-destructive" style={fs(9.5)}>{MONTHS[month]!.toUpperCase()}</p>
      <div className="grid grid-cols-7 text-center tabular-nums" style={{ ...fs(compact ? 7.5 : 8.5), rowGap: sp(compact ? 1 : 2) }}>
        {["S", "M", "T", "W", "T", "F", "S"].map((w, i) => (
          <span key={i} className="text-muted-foreground">{w}</span>
        ))}
        {Array.from({ length: lead }, (_, i) => <span key={`lead-${i}`} />)}
        {Array.from({ length: days }, (_, i) => (
          <span
            key={i}
            className={cn("mx-auto flex items-center justify-center rounded-full font-medium", i + 1 === day && "bg-destructive font-bold text-white")}
            style={{ width: sp(cell), height: sp(cell) }}
          >
            {i + 1}
          </span>
        ))}
      </div>
    </div>
  )
  return (
    <Widget size={size} label={`Calendar, ${label}`} surfaceClassName="bg-background text-foreground" className={className} {...props}>
      <div className={cn("size-full", size === "large" ? "flex flex-col" : size === "medium" ? "grid grid-cols-2" : "flex flex-col")} style={{ padding: sp(size === "small" ? 11 : size === "medium" ? 9 : 13), gap: sp(10) }}>
        {size === "large" ? (
          <>
            {grid}
            <div className="border-t" style={{ paddingTop: sp(8) }}>
              <p className="sr-only">{label}</p>
              <Events events={events} limit={3} />
            </div>
          </>
        ) : (
          <>
            <div className="flex min-w-0 flex-col" style={{ gap: sp(4) }}>
              <p className="sr-only">{label}</p>
              <p aria-hidden="true" className="font-semibold tracking-wide text-destructive uppercase" style={fs(9.5)}>{weekday}</p>
              <p aria-hidden="true" className="font-light tracking-tight tabular-nums" style={{ ...fs(size === "small" ? 28 : 34), lineHeight: 1 }}>{day}</p>
              <div className="mt-auto"><Events events={events} limit={1} /></div>
            </div>
            {size === "medium" && grid}
          </>
        )}
      </div>
    </Widget>
  )
}

// Battery

type BatteryDevice = {
  id: string
  /** Device name. */
  name: string
  /** Charge from 0 to 100. */
  level: number
  /** Whether it is charging. */
  charging?: boolean
  /** Icon for the device. */
  icon: React.ReactNode
}

type BatteryWidgetProps = Omit<WidgetProps, "label" | "children" | "surfaceClassName"> & {
  /** Devices and their charge. Small shows four, medium four, large lists them all. */
  devices: BatteryDevice[]
}

function Ring({ device, big }: { device: BatteryDevice; big?: boolean }) {
  const r = 20
  const c = 2 * Math.PI * r
  const level = Math.max(0, Math.min(100, device.level))
  const low = level <= 20 && !device.charging
  return (
    <div aria-hidden="true" className="relative flex aspect-square w-full items-center justify-center">
      <svg viewBox="0 0 48 48" className="absolute inset-0 size-full -rotate-90">
        <circle cx="24" cy="24" r={r} fill="none" strokeWidth="4.5" className="stroke-foreground/15" />
        <circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeDasharray={`${(level / 100) * c} ${c}`}
          className={cn(low ? "stroke-destructive" : "stroke-[oklch(0.7_0.19_150)]")}
        />
      </svg>
      <span className="flex items-center justify-center text-foreground [&_svg]:size-full" style={{ width: big ? "34%" : "38%", height: big ? "34%" : "38%" }}>
        {device.icon}
      </span>
      {device.charging && (
        <span className="absolute -right-[4%] -bottom-[4%] flex size-[34%] items-center justify-center rounded-full bg-background text-[oklch(0.62_0.19_150)] shadow-sm">
          <Zap className="size-[70%] fill-current" />
        </span>
      )}
    </div>
  )
}

/** A battery widget: one ring per device, red when low, with a bolt while charging. The large size lists devices with bars. */
function BatteryWidget({ devices, size = "small", className, ...props }: BatteryWidgetProps) {
  const spoken = (d: BatteryDevice) => `${d.name}, ${Math.round(d.level)} percent${d.charging ? ", charging" : ""}`
  return (
    <Widget size={size} label="Batteries" surfaceClassName="bg-background text-foreground" className={className} {...props}>
      <ul className={cn("size-full", size === "large" ? "flex flex-col justify-around" : size === "medium" ? "grid grid-cols-4 items-center" : "grid grid-cols-2 grid-rows-2 items-center")} style={{ padding: sp(size === "large" ? 14 : size === "small" ? 9 : 13), gap: sp(size === "large" ? 4 : size === "small" ? 5 : 10) }}>
        {devices.slice(0, size === "large" ? 6 : 4).map((d) =>
          size === "large" ? (
            <li key={d.id} className="flex items-center" style={{ gap: sp(10) }}>
              <span aria-hidden="true" className="shrink-0" style={{ width: sp(30) }}>
                <Ring device={d} big />
              </span>
              <span className="min-w-0 flex-1">
                <span className="sr-only">{spoken(d)}</span>
                <span aria-hidden="true" className="block truncate font-semibold" style={fs(11)}>{d.name}</span>
                <span aria-hidden="true" className="mt-[calc(var(--u)*3)] block h-[calc(var(--u)*4)] overflow-hidden rounded-full bg-foreground/15">
                  <span className={cn("block h-full rounded-full", d.level <= 20 && !d.charging ? "bg-destructive" : "bg-[oklch(0.7_0.19_150)]")} style={{ width: `${d.level}%` }} />
                </span>
              </span>
              <span aria-hidden="true" className="font-semibold tabular-nums" style={fs(11)}>{Math.round(d.level)}%</span>
            </li>
          ) : (
            <li key={d.id} className="flex flex-col items-center" style={{ gap: sp(3) }}>
              <span className="sr-only">{spoken(d)}</span>
              <span className="w-full" style={{ maxWidth: sp(size === "small" ? 24 : 40) }}><Ring device={d} /></span>
              <span aria-hidden="true" className="font-semibold tabular-nums" style={fs(size === "small" ? 9.5 : 10)}>{Math.round(d.level)}%</span>
            </li>
          )
        )}
      </ul>
    </Widget>
  )
}

export {
  Widget,
  WeatherWidget,
  CalendarWidget,
  BatteryWidget,
  type WidgetProps,
  type WidgetSize,
  type WeatherWidgetProps,
  type WeatherCondition,
  type HourlyForecast,
  type DailyForecast,
  type CalendarWidgetProps,
  type CalendarEvent,
  type BatteryWidgetProps,
  type BatteryDevice,
}
