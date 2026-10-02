// Ballmac UI: Dotted Map. https://ui.ballmac.com/components/dotted-map
// Based on cobe (MIT, Copyright (c) 2021 Shu Ding): the land mask is derived from cobe's world texture; the rendering is new.
"use client"

import * as React from "react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"
import { useReducedMotionSafe } from "@/lib/ballmac/motion"
import { useMessages } from "@/lib/ballmac/i18n"

type MapTone = "foreground" | "primary" | "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5" | "destructive"

const COLOR: Record<MapTone, string> = {
  foreground: "var(--foreground)",
  primary: "var(--primary)",
  "chart-1": "var(--chart-1)",
  "chart-2": "var(--chart-2)",
  "chart-3": "var(--chart-3)",
  "chart-4": "var(--chart-4)",
  "chart-5": "var(--chart-5)",
  destructive: "var(--destructive)",
}

type MapMarker = {
  /** Latitude in degrees, north positive. */
  lat: number
  /** Longitude in degrees, east positive. */
  lng: number
  /** Name of the place. Always read by screen readers, and drawn on the map when `labels` is on. */
  label?: string
  /** Marker color. */
  tone?: MapTone
}

type MapArc = {
  /** Start as [lat, lng]. */
  from: [number, number]
  /** End as [lat, lng]. */
  to: [number, number]
  /** Arc color. */
  tone?: MapTone
}

// A 256 x 128 equirectangular land mask, one bit per cell, rows from 90 degrees north to 90 south.
const LAND =
  "////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////Dj///////6n////////////////////////////////8AAACAAAAgP8AP////////////////////////////8AAAP/gAAAAAAA+gf//////////////////////////wAAAfQAAAAAAAADg////////////////////g//////AAAAQAAAAGYAAAf8H//////////////////4AJ////8AAAAAAAAD4AAP//4AAfn/////////x/////4AB////wAAAAAAAAcAAL///gKAef////////+H/////8zD///+AAAAAAAAHAHH/////8A/AAO//P/+AAM//////+H///wAAAAAIAAcA//////////uAA/gP//z/5//////4f//+AAAAB/8AAB73//////////9/+D////////////w///gAAAAf//mf//f////////////+H////////////D//gAAAAD///f////////////////5////////////4P/4A/AAA/3+P////////////////CAf///////+8T/Af8AD8AAH+f/////////////////4AP////////ghTwA/gAAAAB/n//////////////////wA////////8APwAB8AAAAAP+f///////////////z/gAB/sX/////gA/mAAwAAAAA/4///////////////8OAAABeAD/////AD/8AAAAAAMBPB/////////////+ABwAAABkAH/////gH/wAAAAAAwDcf/////////////gAfAAAAQAAH/////wf/gAAAAADgPB/////////////4AB4AAAAAAAH/////3//wAAAAB3A///////////////8AHAAAAAAAAP/////P//gAAAAHeP///////////////8AYAAAAAAAAf///////8AAAAAB7////////////////wBAAAAAAAAA///////+YAAAAABf///////////////9gAAAAAAAAAB////v//DwAAAAAf/////5//////////0AAAAAAAAAAD///+P/8HAAAAAA/////+B/////////+QAAAAAAAAAAP////v/+AAAAAAB///9nwHf////////wAAAAAAAAAAB////2/9gAAAAAAH/v/ifj9////////+OAAAAAAAAAAH//////AAAAAAAP8nP8AfH/////////w4AAAAAAAAAAf/////8AAAAAAB/wnP3x+P////////4AAAAAAAAAAAA//////AAAAAAAH+CG7//4/////////AYAAAAAAAAAAD/////4AAAAAAAfwARn//j///////wYBgAAAAAAAAAAH/////AAAAAAAA+AmGf//P///////4wMAAAAAAAAAAAP////8AAAAAAAAj/AAF//////////DHwAAAAAAAAAAA/////gAAAAAAAH/8AAH/////////4J8AAAAAAAAAAAA////8AAAAAAAA//8GAf/////////wOAAAAAAAAAAAAB////AAAAAAAAH//8/L//////////gQAAAAAAAAAAAAG//+8AAAAAAAAf//////////////+AAAAAAAAAAAAAAP/8AYAAAAAAAD//////+////////4AAAAAAAAAAAAAAX/gBgAAAAAAA/////9/5////////AAAAAAAAAAAAAAAv+ACAAAAAAAD/////7/wf//////4AAAAAAAAAAAAAADf4AAAAAAAAAf/////v/uB//////IAAAAAAAAAAAAAAE/gBgAAAAAAD//////f/8B/////5gAAAAAAAAAAAAAAB+ADwAAAAAAP/////8//wH//f/+AAAAAAAAAAAAAAAAH4MBgAAAAAA//////7//AH/w/8gAAAAAAAAAAAAAAAAfxwA4AAAAAD//////n/4AP+B/mAAAAAAAAAAAAAAAAAf+ABAAAAAAP//////P/AA/gH/AGAAAAAAAAAAAAAAAAP4AAAAAAAA//////8/wAD8AX+AYAAAAAAAAAAAAAAAAD+AAAAAAAD//////78AAPgAf8BgAAAAAAAAAAAAAAAAD4AAAAAAAP///////AAAeAA/wDAAAAAAAAAAAAAAAAADgAAAAAAA///////gAAB4ACfADAAAAAAAAAAAAAAAAAGD+wAAAAB///////+AADgAI4AQAAAAAAAAAAAAAAAAAP//gAAAAD///////wAANAAhABQAAAAAAAAAAAAAAAAAb//AAAAAH///////AAAMADAAHAAAAAAAAAAAAAAAAAAH//AAAAAP//////4AAAwAGAMMAAAAAAAAAAAAAAAAAAf//gAAAAOw/////gAAAADcB4AAAAAAAAAAAAAAAAAAB///AAAAAAAf///8AAAAAOwPAAAAAAAAAAAAAAAAAAAP//8AAAAAAB////gAAAAAfB8AAAAAAAAAAAAAAAAAAB///4AAAAAAP///4AAAAAA8fzoAAAAAAAAAAAAAAAAAP///4AAAAAA//+/AAAAAABx/MGAAAAAAAAAAAAAAAAA////4AAAAAD//78AAAAAADz7gNgAAAAAAAAAAAAAAAB////+AAAAAH///gAAAAAAPHuO/4AAAAAAAAAAAAAAAP////8AAAAAP//8AAAAAAAYAcA/wAAAAAAAAAAAAAAAf////4AAAAAf//wAAAAAAAcAAA/sAAAAAAAAAAAAAAB/////gAAAAB///AAAAAAAA+AAD+AAAAAAAAAAAAAAAD////+AAAAAH//8AAAAAAAAADADMAAAAAAAAAAAAAAAP////wAAAAAP//4AAAAAAAAAAAAYAAAAAAAAAAAAAAAf///+AAAAAA///gAAAAAAAAAA4QAAAAAAAAAAAAAAAA////4AAAAAH//+DAAAAAAAAAPjAAAAAAAAAAAAAAAAD////gAAAAA///4cAAAAAAAAH+GAAAAAAAAAAAAAAAAH///8AAAAAD///jwAAAAAAAA/88AAAAAAAAAAAAAAAAH///wAAAAAP//4fAAAAAAAAH//wAAAgAAAAAAAAAAAAP///AAAAAAf//B4AAAAAAAA///gAAAAAAAAAAAAAAAA///4AAAAAB//4HgAAAAAAAf///AAAAAAAAAAAAAAAAD///gAAAAAD//gcAAAAAAAD///+AEAAAAAAAAAAAAAAP//8AAAAAAP//BwAAAAAAAf///8AAAAAAAAAAAAAAAA//+AAAAAAA//4HAAAAAAAB////wAAAAAAAAAAAAAAAH//wAAAAAAD//AAAAAAAAAH////gAAAAAAAAAAAAAAAf//AAAAAAAH/4AAAAAAAAAf///+AAAAAAAAAAAAAAAB//4AAAAAAAf/gAAAAAAAAB////4AAAAAAAAAAAAAAAH//AAAAAAAA/8AAAAAAAAAD////gAAAAAAAAAAAAAAAf/4AAAAAAAB/gAAAAAAAAAP///+AAAAAAAAAAAAAAAB//gAAAAAAAH8AAAAAAAAAA/gf/wAAAAAAAAAAAAAAAP/8AAAAAAAAdAAAAAAAAAADgAv/AAAAAAAAAAAAAAAA//AAAAAAAAAAAAAAAAAAAAAAAf4AAQAAAAAAAAAAAAD/8AAAAAAAAAAAAAAAAAAAAAAB/gAAgAAAAAAAAAAAAP/AAAAAAAAAAAAAAAAAAAAAAAB4AADgAAAAAAAAAAAB/wAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAAAAAAAAAH+AAAAAAAAAAAAAAAAAAAAAAAAHAADAAAAAAAAAAAAAfwAAAAAAAAAAAAAAAAAAAAAAAAYAAcAAAAAAAAAAAAA/AAAAAAAAAAAAAAAAAAAAAAAAAAADAAAAAAAAAAAAAHwAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAAAAAAAAAAfgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAeAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwAAAAAAAAAAAAAAAAAHwAAAAAAAAAAAAAAAAAAAAAA8AAAAAAAAAAAAAAAAAg/gGB8AAAAAAAAAAAAAAAAAAfgAAAAAAAAAAAAfwAD///////8AAAAAAAAAAAAAAAAB/AAAAAAAAAAAA///8f////////4AAAAAAAAAAAAAAD/4AAAAAAAAPAf///////////////AAAAAAAAAAAAAAP/gAAAAA/////////////////////8AAAAAAAAAD/4D//AAAAA//////////////////////8AAAAABv/3P////4AAAAP//////////////////////wAAAA//////////4AAAH//////////////////////wAAAB///////////+AAH//////////////////////+AMA//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////w=="

const MASK_W = 256
const MASK_H = 128
let bits: Uint8Array | null = null

function isLand(lat: number, lng: number) {
  if (!bits) {
    const raw = atob(LAND)
    bits = new Uint8Array(raw.length)
    for (let i = 0; i < raw.length; i++) bits[i] = raw.charCodeAt(i)
  }
  const x = Math.min(MASK_W - 1, Math.max(0, Math.floor(((lng + 180) / 360) * MASK_W)))
  const y = Math.min(MASK_H - 1, Math.max(0, Math.floor(((90 - lat) / 180) * MASK_H)))
  const index = y * MASK_W + x
  return ((bits[index >> 3]! >> (7 - (index & 7))) & 1) === 1
}

type DottedMapProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Places to mark. */
  markers?: MapMarker[]
  /** Routes to draw between places, animated as if traffic is flowing. */
  arcs?: MapArc[]
  /** Number of dots across the whole width. More dots give a finer, denser map. */
  dots?: number
  /** Southernmost and northernmost latitude to show. */
  latRange?: [number, number]
  /** Color of the land dots. */
  tone?: MapTone
  /** Write each marker's label on the map. */
  labels?: boolean
  /** Accessible summary of the map. */
  label?: string
}

const WIDTH = 1000

function project(lat: number, lng: number, top: number, span: number, height: number) {
  return { x: ((lng + 180) / 360) * WIDTH, y: ((top - lat) / span) * height }
}

/** A world map made of dots, with markers and flowing routes. Pure SVG. */
function DottedMap({ markers = [], arcs = [], dots = 150, latRange = [-56, 73], tone = "foreground", labels = false, label, className, ...props }: DottedMapProps) {
  const msg = useMessages()
  label ??= msg("dotted-map.label", "World map")
  const reduce = useReducedMotionSafe()
  const [south, north] = latRange
  const span = north - south
  const height = (WIDTH * span) / 360
  const spacing = WIDTH / dots

  const land = React.useMemo(() => {
    const rows = Math.floor(height / spacing)
    let d = ""
    for (let r = 0; r < rows; r++) {
      const y = (r + 0.5) * spacing
      const lat = north - (y / height) * span
      const shift = r % 2 ? spacing / 2 : 0
      for (let c = 0; c < dots; c++) {
        const x = c * spacing + spacing / 2 + shift
        if (x > WIDTH) continue
        const lng = (x / WIDTH) * 360 - 180
        if (isLand(lat, lng)) d += `M${x.toFixed(1)} ${y.toFixed(1)}h0`
      }
    }
    return d
  }, [dots, height, spacing, north, span])

  const places = markers.map((m) => ({ ...m, ...project(m.lat, m.lng, north, span, height) }))
  const routes = arcs.map((a) => {
    const p = project(a.from[0], a.from[1], north, span, height)
    const q = project(a.to[0], a.to[1], north, span, height)
    const lift = Math.hypot(q.x - p.x, q.y - p.y) * 0.32
    return { ...a, d: `M${p.x.toFixed(1)} ${p.y.toFixed(1)} Q${((p.x + q.x) / 2).toFixed(1)} ${(((p.y + q.y) / 2) - lift).toFixed(1)} ${q.x.toFixed(1)} ${q.y.toFixed(1)}` }
  })
  const summary = markers.filter((m) => m.label).map((m) => m.label)

  return (
    <div data-slot="dotted-map" className={cn("relative w-full", className)} {...props}>
      <svg role="img" aria-label={summary.length ? `${label}: ${summary.join(", ")}` : label} viewBox={`0 0 ${WIDTH} ${height.toFixed(1)}`} className="block h-auto w-full overflow-visible">
        <path d={land} fill="none" stroke={COLOR[tone]} strokeOpacity={tone === "foreground" ? 0.28 : 0.55} strokeWidth={spacing * 0.58} strokeLinecap="round" />
        {routes.map((r, i) => (
          <g key={i} style={{ color: COLOR[r.tone ?? "chart-1"] }}>
            <path d={r.d} fill="none" stroke="currentColor" strokeOpacity={0.22} strokeWidth="1.5" strokeDasharray="2 6" strokeLinecap="round" />
            <motion.path
              d={r.d}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              initial={reduce ? { pathLength: 1, opacity: 0.9 } : { pathLength: 0, opacity: 0 }}
              animate={reduce ? undefined : { pathLength: [0, 1, 1], opacity: [0, 1, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.7, times: [0, 0.6, 1] }}
            />
          </g>
        ))}
        {places.map((p, i) => (
          <g key={i} style={{ color: COLOR[p.tone ?? "chart-1"] }}>
            {!reduce && (
              <motion.circle
                cx={p.x}
                cy={p.y}
                fill="currentColor"
                initial={{ r: spacing * 0.9, opacity: 0.5 }}
                animate={{ r: [spacing * 0.9, spacing * 3.4], opacity: [0.5, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut", delay: i * 0.35 }}
              />
            )}
            <circle cx={p.x} cy={p.y} r={spacing * 0.95} fill="currentColor" stroke="var(--background)" strokeWidth="2" />
          </g>
        ))}
      </svg>
      {labels &&
        places
          .filter((p) => p.label)
          .map((p, i) => (
            <span
              key={i}
              aria-hidden="true"
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-[calc(100%+0.6rem)] rounded-md border bg-popover px-1.5 py-0.5 text-[11px] font-medium whitespace-nowrap text-popover-foreground shadow-sm"
              style={{ left: `${(p.x / WIDTH) * 100}%`, top: `${(p.y / height) * 100}%` }}
            >
              {p.label}
            </span>
          ))}
    </div>
  )
}

export { DottedMap, type DottedMapProps, type MapMarker, type MapArc, type MapTone }
