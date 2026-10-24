// Ballmac UI: Run Replay. https://ui.ballmac.com/components/run-replay
"use client"

import * as React from "react"
import { Pause, Play, SkipBack, SkipForward } from "lucide-react"

import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"

type ReplayMarker = {
  /** Where it happens, in seconds. */
  time: number
  /** What happens, for example "Tool call failed". */
  label: string
}

const SPEEDS = [0.5, 1, 2, 4] as const
/** How often playback advances, in milliseconds. Fixed steps keep it exact and testable. */
const TICK = 100

function clock(seconds: number) {
  const s = Math.max(0, Math.floor(seconds))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`
}

type RunReplayProps = Omit<React.ComponentProps<"div">, "onChange" | "defaultValue"> & {
  /** Length of the run in seconds. */
  duration: number
  /** Where playback is, in seconds. Controlled. */
  time?: number
  /** Where playback starts, for uncontrolled use. */
  defaultTime?: number
  /** Called as the time changes, from playing or from the person. */
  onTimeChange?: (time: number) => void
  /** Whether it is playing. Controlled. */
  playing?: boolean
  /** Whether it starts playing. Playback never starts by itself unless you ask. */
  defaultPlaying?: boolean
  /** Called when play or pause changes. */
  onPlayingChange?: (playing: boolean) => void
  /** Points of interest to jump between: a failure, a handoff, an approval. */
  markers?: ReplayMarker[]
  /** Speeds to offer. */
  speeds?: readonly number[]
  /** Turns seconds into text. Defaults to m:ss. */
  formatTime?: (seconds: number) => string
}

/**
 * Transport controls for replaying a recorded agent run: play and pause, step between markers, a scrubber and a speed. It owns only the clock; you
 * render the run (a trace, lanes, a log) from `time`, so one control drives whatever the page shows.
 */
function RunReplay({
  duration,
  time: timeProp,
  defaultTime = 0,
  onTimeChange,
  playing: playingProp,
  defaultPlaying = false,
  onPlayingChange,
  markers = [],
  speeds = SPEEDS,
  formatTime = clock,
  className,
  ...props
}: RunReplayProps) {
  const msg = useMessages()
  const [innerTime, setInnerTime] = React.useState(defaultTime)
  const [innerPlaying, setInnerPlaying] = React.useState(defaultPlaying)
  const [speed, setSpeed] = React.useState<number>(speeds.includes(1) ? 1 : speeds[0])
  const time = Math.min(Math.max(timeProp ?? innerTime, 0), duration)
  const playing = (playingProp ?? innerPlaying) && time < duration
  const sorted = React.useMemo(() => [...markers].sort((a, b) => a.time - b.time), [markers])
  const [announced, setAnnounced] = React.useState("")

  // The latest values, read by the interval so it never needs to restart while playing. The interval also keeps its own running clock, so several ticks
  // in a row add up even before React has re-rendered; a seek from outside (a new `time`) resets it.
  const live = React.useRef({ time, speed, duration, onTimeChange, timeProp, sorted })
  const clock = React.useRef(time)
  React.useEffect(() => {
    live.current = { time, speed, duration, onTimeChange, timeProp, sorted }
    if (Math.abs(clock.current - time) > 1e-6) clock.current = time
  })

  function setTime(next: number) {
    const t = Math.min(Math.max(next, 0), duration)
    if (timeProp === undefined) setInnerTime(t)
    onTimeChange?.(t)
  }
  function setPlaying(next: boolean) {
    if (playingProp === undefined) setInnerPlaying(next)
    onPlayingChange?.(next)
  }

  React.useEffect(() => {
    if (!playing) return
    const id = setInterval(() => {
      const { speed: sp, duration: d, onTimeChange: cb, timeProp: controlled, sorted: ms } = live.current
      const t = clock.current
      const next = Math.min(d, +(t + (TICK / 1000) * sp).toFixed(3))
      clock.current = next
      const crossed = ms.find((m) => m.time > t && m.time <= next)
      if (crossed) setAnnounced(crossed.label)
      if (controlled === undefined) setInnerTime(next)
      cb?.(next)
      if (next >= d) {
        if (playingProp === undefined) setInnerPlaying(false)
        onPlayingChange?.(false)
      }
    }, TICK)
    return () => clearInterval(id)
  }, [playing, playingProp, onPlayingChange])

  const prev = [...sorted].reverse().find((m) => m.time < time - 0.5)
  const next = sorted.find((m) => m.time > time + 0.001)
  const at = duration > 0 ? (time / duration) * 100 : 0
  const btn = "inline-flex size-9 items-center justify-center rounded-full border bg-background text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"

  return (
    <div data-slot="run-replay" data-playing={playing || undefined} className={cn("grid w-full gap-3 rounded-xl border bg-card p-4 text-card-foreground", className)} {...props}>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" disabled={!prev} onClick={() => prev && setTime(prev.time)} aria-label={msg("run-replay.prev", "Previous marker")} className={btn}>
          <SkipBack aria-hidden="true" className="size-4 rtl:-scale-x-100" />
        </button>
        <button
          type="button"
          onClick={() => {
            if (!playing && time >= duration) setTime(0)
            setPlaying(!playing)
          }}
          aria-label={playing ? msg("run-replay.pause", "Pause") : time >= duration ? msg("run-replay.replay", "Replay from the start") : msg("run-replay.play", "Play")}
          className={cn(btn, "size-10 bg-primary text-primary-foreground hover:bg-primary/90")}
        >
          {playing ? <Pause aria-hidden="true" className="size-4" /> : <Play aria-hidden="true" className="size-4 rtl:-scale-x-100" />}
        </button>
        <button type="button" disabled={!next} onClick={() => next && setTime(next.time)} aria-label={msg("run-replay.next", "Next marker")} className={btn}>
          <SkipForward aria-hidden="true" className="size-4 rtl:-scale-x-100" />
        </button>
        <p className="ms-2 font-mono text-sm tabular-nums" dir="ltr">
          <span className="text-foreground">{formatTime(time)}</span>
          <span className="text-muted-foreground"> / {formatTime(duration)}</span>
        </p>
        <div role="group" aria-label={msg("run-replay.speed", "Playback speed")} className="ms-auto flex gap-1">
          {speeds.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={speed === s}
              onClick={() => setSpeed(s)}
              className={cn("h-8 rounded-full px-2.5 font-mono text-xs outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50", speed === s ? "bg-foreground text-background" : "text-muted-foreground hover:bg-accent hover:text-foreground")}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <input
          type="range"
          min={0}
          max={duration}
          step={1}
          value={Math.round(time)}
          onChange={(e) => setTime(Number(e.target.value))}
          aria-label={msg("run-replay.scrub", "Position in the run")}
          aria-valuetext={`${formatTime(time)} of ${formatTime(duration)}`}
          className="peer relative z-10 h-6 w-full cursor-pointer appearance-none bg-transparent outline-none [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-foreground [&::-moz-range-thumb]:bg-background [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-foreground [&::-webkit-slider-thumb]:bg-background [&::-webkit-slider-thumb]:shadow-sm focus-visible:[&::-webkit-slider-thumb]:ring-[3px] focus-visible:[&::-webkit-slider-thumb]:ring-ring/50"
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-muted">
          <div className="h-full rounded-full bg-foreground" style={{ width: `${at}%` }} />
          {sorted.map((m) => (
            <span key={`${m.time}-${m.label}`} className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-chart-3 rtl:translate-x-1/2" style={{ insetInlineStart: `${duration > 0 ? (m.time / duration) * 100 : 0}%` }} />
          ))}
        </div>
      </div>

      {sorted.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label={msg("run-replay.markers", "Markers")}>
          {sorted.map((m) => (
            <li key={`${m.time}-${m.label}`}>
              <button
                type="button"
                onClick={() => setTime(m.time)}
                className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50", Math.abs(m.time - time) < 0.5 && "border-foreground bg-accent")}
              >
                <span className="font-mono text-muted-foreground tabular-nums" dir="ltr">{formatTime(m.time)}</span>
                {m.label}
              </button>
            </li>
          ))}
        </ul>
      )}
      <p aria-live="polite" className="sr-only">
        {announced && msg("run-replay.reached", "Reached: {label}", { label: announced })}
      </p>
    </div>
  )
}

export { RunReplay, type ReplayMarker, type RunReplayProps }
