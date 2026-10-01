// Ballmac UI: Audio Player. https://ui.ballmac.com/components/audio-player
"use client"

import * as React from "react"
import { Pause, Play, RotateCcw, RotateCw } from "lucide-react"

import { Slider } from "@/components/ballmac/slider"
import { cn } from "@/lib/utils"

type AudioChapter = {
  /** Start time in seconds. */
  start: number
  /** Chapter title. */
  title: string
}

type AudioPlayerProps = Omit<React.ComponentProps<"div">, "title" | "onTimeUpdate"> & {
  /** Audio file URL. Leave it out for a silent demo that advances a clock, so you can design the page before the audio exists. */
  src?: string
  /** Episode or track title. */
  title: string
  /** Show or artist, shown under the title. */
  subtitle?: string
  /** Length in seconds. Used before the file's metadata loads, and as the length of a silent demo. */
  duration?: number
  /** Chapters. Drawn as ticks on the scrubber, and the current one is named under the title. */
  chapters?: AudioChapter[]
  /** Artwork shown on the left. */
  artwork?: React.ReactNode
  /** Playback speeds the speed button cycles through. */
  rates?: number[]
  /** Seconds the back and forward buttons skip. */
  skip?: { back: number; forward: number }
  /** Controlled position in seconds. */
  time?: number
  /** Called when the position changes (playback, seeking or skipping). */
  onTimeChange?: (seconds: number) => void
  /** Called when play or pause is chosen. */
  onPlayingChange?: (playing: boolean) => void
  /** "compact" is a single row, for a sticky mini player. */
  variant?: "default" | "compact"
}

/** m:ss, or h:mm:ss for long audio. */
function formatTime(s: number) {
  const t = Math.max(0, Math.floor(s))
  const h = Math.floor(t / 3600)
  const m = Math.floor((t % 3600) / 60)
  const sec = String(t % 60).padStart(2, "0")
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`
}

/** An audio player with play and pause, skip back and forward, a scrubber, chapters and a speed control. Works with a real file or as a silent demo. */
function AudioPlayer({
  src,
  title,
  subtitle,
  duration: durationProp = 0,
  chapters = [],
  artwork,
  rates = [1, 1.25, 1.5, 2, 0.75],
  skip = { back: 15, forward: 30 },
  time: timeProp,
  onTimeChange,
  onPlayingChange,
  variant = "default",
  className,
  ...props
}: AudioPlayerProps) {
  const audio = React.useRef<HTMLAudioElement>(null)
  const [inner, setInner] = React.useState(0)
  const [length, setLength] = React.useState(durationProp)
  const [playing, setPlaying] = React.useState(false)
  const [rateIndex, setRateIndex] = React.useState(0)
  const time = timeProp ?? inner
  const rate = rates[rateIndex] ?? 1
  const total = length || durationProp

  // Latest values for the timer and the change callback, kept in refs so they never restart the interval.
  const timeRef = React.useRef(time)
  const onTimeRef = React.useRef(onTimeChange)
  React.useEffect(() => {
    timeRef.current = time
    onTimeRef.current = onTimeChange
  })

  // Report every change of position once, whether it came from playback, the scrubber or a skip.
  const first = React.useRef(true)
  React.useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    onTimeRef.current?.(inner)
  }, [inner])

  // A silent demo (no src) advances its own clock.
  React.useEffect(() => {
    if (src || !playing) return
    const id = setInterval(() => {
      const next = Math.min(total, timeRef.current + 0.25 * rate)
      timeRef.current = next
      setInner(next)
      if (next >= total) {
        setPlaying(false)
        onPlayingChange?.(false)
      }
    }, 250)
    return () => clearInterval(id)
  }, [src, playing, rate, total, onPlayingChange])

  // Keep a real element in step with what the controls say.
  React.useEffect(() => {
    const el = audio.current
    if (!el) return
    el.playbackRate = rate
  }, [rate])
  React.useEffect(() => {
    const el = audio.current
    if (!el || timeProp === undefined) return
    if (Math.abs(el.currentTime - timeProp) > 1) el.currentTime = timeProp
  }, [timeProp])

  function toggle() {
    const next = !playing
    const el = audio.current
    if (el) {
      if (next) el.play().catch(() => setPlaying(false))
      else el.pause()
    } else if (next && total && time >= total) {
      setInner(0)
    }
    setPlaying(next)
    onPlayingChange?.(next)
  }
  function seek(to: number) {
    const clamped = Math.min(Math.max(0, to), total || to)
    setInner(clamped)
    if (audio.current) audio.current.currentTime = clamped
  }

  const chapter = [...chapters].reverse().find((c) => time >= c.start)
  const label = `${formatTime(time)} of ${formatTime(total)}`
  const btn = "text-foreground hover:bg-accent focus-visible:ring-ring/50 inline-flex shrink-0 items-center justify-center rounded-full outline-none transition-colors focus-visible:ring-[3px]"

  const controls = (
    <div className="flex items-center gap-1.5">
      <button type="button" onClick={() => seek(time - skip.back)} className={cn(btn, "relative size-10")} aria-label={`Back ${skip.back} seconds`}>
        <RotateCcw className="size-[22px]" aria-hidden="true" />
        <span className="absolute text-[9px] font-bold tabular-nums" aria-hidden="true">{skip.back}</span>
      </button>
      <button type="button" onClick={toggle} className={cn(btn, "bg-primary text-primary-foreground hover:bg-primary/90 size-12")} aria-label={playing ? "Pause" : "Play"}>
        {playing ? <Pause className="size-5 fill-current" aria-hidden="true" /> : <Play className="size-5 translate-x-px fill-current" aria-hidden="true" />}
      </button>
      <button type="button" onClick={() => seek(time + skip.forward)} className={cn(btn, "relative size-10")} aria-label={`Forward ${skip.forward} seconds`}>
        <RotateCw className="size-[22px]" aria-hidden="true" />
        <span className="absolute text-[9px] font-bold tabular-nums" aria-hidden="true">{skip.forward}</span>
      </button>
    </div>
  )

  const scrubber = (
    <div className="min-w-0 flex-1">
      <div className="relative">
        <Slider
          aria-label="Seek"
          min={0}
          max={Math.max(total, 1)}
          step={1}
          value={[Math.min(time, Math.max(total, 1))]}
          onValueChange={(v) => seek(v[0] ?? 0)}
          formatValue={(v) => label.replace(formatTime(time), formatTime(v))}
        />
        {chapters.length > 1 && total > 0 && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1/2 h-0">
            {chapters.slice(1).map((c) => <span key={c.start} className="bg-background absolute -top-1.5 h-3 w-0.5 rounded" style={{ left: `${(c.start / total) * 100}%` }} />)}
          </div>
        )}
      </div>
      <div className="text-muted-foreground mt-1.5 flex justify-between text-xs tabular-nums">
        <span>{formatTime(time)}</span>
        <span>−{formatTime(Math.max(0, total - time))}</span>
      </div>
    </div>
  )

  const speed = (
    <button type="button" onClick={() => setRateIndex((i) => (i + 1) % rates.length)} className={cn(btn, "h-9 min-w-12 px-2.5 text-sm font-semibold tabular-nums")} aria-label={`Playback speed ${rate}×. Change speed`}>
      {rate}×
    </button>
  )

  return (
    <div data-slot="audio-player" data-playing={playing || undefined} className={cn("bg-card text-card-foreground rounded-2xl border", variant === "compact" ? "p-3" : "p-4 sm:p-5", className)} role="group" aria-label={`Audio player: ${title}`} {...props}>
      {src && <audio ref={audio} src={src} preload="metadata" onLoadedMetadata={(e) => setLength(e.currentTarget.duration)} onTimeUpdate={(e) => setInner(e.currentTarget.currentTime)} onEnded={() => setPlaying(false)} />}
      {variant === "compact" ? (
        <div className="flex items-center gap-3">
          {controls}
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{title}</p>{scrubber}</div>
          {speed}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            {artwork && <div className="size-16 shrink-0 overflow-hidden rounded-xl sm:size-20">{artwork}</div>}
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-semibold">{title}</p>
              {subtitle && <p className="text-muted-foreground truncate text-sm">{subtitle}</p>}
              {chapter && <p className="text-muted-foreground mt-1 truncate text-xs" aria-live="polite">Chapter: <span className="text-foreground font-medium">{chapter.title}</span></p>}
            </div>
            {speed}
          </div>
          {scrubber}
          <div className="flex justify-center">{controls}</div>
        </div>
      )}
    </div>
  )
}

export { AudioPlayer, formatTime, type AudioChapter, type AudioPlayerProps }
