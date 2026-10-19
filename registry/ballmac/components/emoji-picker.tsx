// Ballmac UI: Emoji Picker. https://ui.ballmac.com/components/emoji-picker
// Based on Emojibase (MIT, Copyright (c) 2017-2019 Miles Johnson), which supplies the emoji, their names and search words in many languages.
"use client"

import * as React from "react"
import { Clock, Dumbbell, Flag, Hand, Lightbulb, Leaf, Plane, Search, Smile, Hash, UtensilsCrossed, X } from "lucide-react"

import { Skeleton } from "@/components/ballmac/skeleton"
import { StateView } from "@/components/ballmac/state-view"
import { useDirection } from "@/lib/ballmac/direction"
import { useLocale, useMessages } from "@/lib/ballmac/i18n"
import { cn } from "@/lib/utils"

/** One emoji as the picker uses it. */
type Emoji = {
  /** The character: "👋". */
  emoji: string
  /** Its name in the picker's language: "waving hand". */
  label: string
  hexcode: string
  /** Search words. */
  tags?: string[]
  /** The same emoji in the five skin tones, light to dark, for the ones that have them. */
  skins?: { emoji: string; label: string; hexcode: string }[]
}

type EmojiGroup = { key: string; label: string; emojis: Emoji[] }

/** The emoji and the names of their groups, in the language they are shown. `loadEmojis` returns this. */
type EmojiData = { groups: EmojiGroup[] }

type EmojiSelection = { emoji: string; label: string; hexcode: string; skinTone: number }

type EmojiPickerProps = Omit<React.ComponentProps<"div">, "onSelect" | "children"> & {
  /** Called when an emoji is chosen. */
  onSelect: (emoji: EmojiSelection) => void
  /** Returns the emoji in your language. The default loads English, and only when the picker is first shown. See the docs for other languages. */
  loadEmojis?: () => Promise<EmojiData>
  /** Emoji across. The picker is as wide as it needs to be for this many. */
  columns?: number
  /** Show the people's emoji in this tone, 0 for the default yellow to 5 for the darkest. Remembered unless you set it. */
  skinTone?: number
  onSkinToneChange?: (tone: number) => void
  /** Keep the emoji people use most. Off in browsers that block storage. */
  recent?: boolean
  /** Key under which recent emoji are kept, so two pickers can have their own. */
  storageKey?: string
  /** Height of the scrolling list. */
  height?: number
  /** Focus the search box when the picker mounts. */
  autoFocus?: boolean
  /** Leave out emoji this device cannot draw, which would show as empty boxes. On by default. */
  hideUnsupported?: boolean
}

const TONES = ["", "🏻", "🏼", "🏽", "🏾", "🏿"]
const RECENT_MAX = 24

const GROUP_ICONS: Record<string, React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" }>> = {
  "smileys-emotion": Smile,
  "people-body": Hand,
  "animals-nature": Leaf,
  "food-drink": UtensilsCrossed,
  "travel-places": Plane,
  activities: Dumbbell,
  objects: Lightbulb,
  symbols: Hash,
  flags: Flag,
}

type RawEmoji = { group?: number; hexcode: string; label: string; tags?: string[]; unicode: string; skins?: { hexcode: string; label: string; unicode: string }[] }
type RawGroup = { key: string; message: string; order: number }

/** The English emoji, loaded the first time they are needed so the data stays out of the page's first download. */
async function loadEnglish(): Promise<EmojiData> {
  const [compact, messages] = await Promise.all([import("emojibase-data/en/compact.json"), import("emojibase-data/en/messages.json")])
  return fromEmojibase(compact.default, messages.default.groups)
}

/** Turns Emojibase's compact list and its group names into what the picker uses. Use it in your own `loadEmojis` for another language. */
export function fromEmojibase(compact: ReadonlyArray<object>, groupMessages: ReadonlyArray<object>): EmojiData {
  const list = compact as RawEmoji[]
  const groups = (groupMessages as RawGroup[])
    .filter((g) => g.key !== "component")
    .sort((a, b) => a.order - b.order)
    .map((g) => ({
      key: g.key,
      label: g.message.replace(/(^|[\s&-])\p{L}/gu, (c) => c.toUpperCase()),
      emojis: list
        .filter((e) => e.group === g.order)
        .map<Emoji>((e) => ({ emoji: e.unicode, label: e.label, hexcode: e.hexcode, tags: e.tags, skins: e.skins?.map((s) => ({ emoji: s.unicode, label: s.label, hexcode: s.hexcode })) })),
    }))
  return { groups }
}

/**
 * Says whether the device's emoji font can draw an emoji. A missing one is drawn as an empty box or nothing, and a sequence that falls apart is
 * drawn as its parts, which makes it wider. Both are told from a real one by drawing on a canvas. Without a canvas everything counts as supported.
 */
function makeSupportTest(): (emoji: string) => boolean {
  if (typeof document === "undefined") return () => true
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = 40
  const ctx = canvas.getContext("2d", { willReadFrequently: true })
  if (!ctx) return () => true
  ctx.font = "28px sans-serif"
  ctx.textBaseline = "top"
  const ink = (text: string) => {
    ctx.clearRect(0, 0, 40, 40)
    ctx.fillText(text, 2, 2)
    const px = ctx.getImageData(0, 0, 40, 40).data
    let sum = 0
    for (let i = 3; i < px.length; i += 4) sum += px[i]!
    return sum
  }
  const missing = ink("\u{10FFFF}")
  const one = ctx.measureText("😀").width
  const cache = new Map<string, boolean>()
  return (emoji) => {
    const hit = cache.get(emoji)
    if (hit !== undefined) return hit
    const drawn = ink(emoji)
    const joined = /\u200d|[\u{1F1E6}-\u{1F1FF}]|\u20e3/u.test(emoji)
    const ok = drawn > 0 && drawn !== missing && !(joined && ctx.measureText(emoji).width > one * 1.45)
    cache.set(emoji, ok)
    return ok
  }
}

type Load = { status: "loading" } | { status: "ready"; data: EmojiData } | { status: "error" }

function useEmojiData(loader: () => Promise<EmojiData>) {
  const [load, setLoad] = React.useState<Load>({ status: "loading" })
  const [attempt, setAttempt] = React.useState(0)
  const ref = React.useRef(loader)
  ref.current = loader
  React.useEffect(() => {
    let live = true
    setLoad({ status: "loading" })
    ref.current().then(
      (data) => live && setLoad({ status: "ready", data }),
      () => live && setLoad({ status: "error" })
    )
    return () => {
      live = false
    }
  }, [attempt])
  return { load, retry: () => setAttempt((n) => n + 1) }
}

function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
function writeStored(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage can be blocked */
  }
}

const pick = (e: Emoji, tone: number) => (tone > 0 && e.skins?.[tone - 1] ? e.skins[tone - 1]! : e)

/**
 * An emoji picker that loads its emoji when it is first shown. People search by name or word, jump between groups, pick a skin tone and find the
 * emoji they used last. The grid is a real ARIA grid: arrow keys move across it, Enter picks, and the search box is always one Tab away.
 */
function EmojiPicker({
  onSelect,
  loadEmojis = loadEnglish,
  columns = 8,
  skinTone: toneProp,
  onSkinToneChange,
  recent = true,
  storageKey = "ballmac-emoji-recent",
  height = 288,
  autoFocus = false,
  hideUnsupported = true,
  className,
  ...props
}: EmojiPickerProps) {
  const msg = useMessages()
  const dir = useDirection()
  const locale = useLocale()
  const id = React.useId()
  const { load, retry } = useEmojiData(loadEmojis)
  const [query, setQuery] = React.useState("")
  const [tone, setTone] = React.useState(0)
  const [recentList, setRecentList] = React.useState<{ hexcode: string }[]>([])
  const [focusAt, setFocusAt] = React.useState<{ s: number; i: number }>({ s: 0, i: 0 })
  const [hover, setHover] = React.useState<Emoji | null>(null)
  const [spoken, setSpoken] = React.useState("")
  const scroller = React.useRef<HTMLDivElement>(null)
  const wantFocus = React.useRef(false)

  // what the person chose before comes from storage after mount, so the server and the browser draw the same first frame
  React.useEffect(() => {
    if (recent) setRecentList(readStored(storageKey, []))
    if (toneProp === undefined) setTone(readStored<number>(`${storageKey}-tone`, 0))
  }, [recent, storageKey, toneProp])
  const skin = toneProp ?? tone
  const setSkin = (t: number) => {
    if (toneProp === undefined) setTone(t)
    writeStored(`${storageKey}-tone`, t)
    onSkinToneChange?.(t)
  }

  const loaded = load.status === "ready" ? load.data : null
  // emoji the device cannot draw are left out, once, when the data arrives; this runs in the browser only, so the server draws nothing different
  const data = React.useMemo(() => {
    if (!loaded || !hideUnsupported) return loaded
    const ok = makeSupportTest()
    return { groups: loaded.groups.map((g) => ({ ...g, emojis: g.emojis.filter((e) => ok(e.emoji)) })).filter((g) => g.emojis.length) }
  }, [loaded, hideUnsupported])
  const byHex = React.useMemo(() => {
    const map = new Map<string, Emoji>()
    data?.groups.forEach((g) => g.emojis.forEach((e) => map.set(e.hexcode, e)))
    return map
  }, [data])

  // the sections on show: recent, then each group, or one list of search results
  const q = query.trim().toLowerCase()
  const sections = React.useMemo(() => {
    if (!data) return []
    if (q) {
      const found = data.groups.flatMap((g) => g.emojis).filter((e) => e.label.toLowerCase().includes(q) || e.tags?.some((t) => t.toLowerCase().includes(q)))
      return [{ key: "search", label: msg("emoji-picker.results", "Search results"), icon: Search, emojis: found }]
    }
    const rec = recentList.map((r) => byHex.get(r.hexcode)).filter((e): e is Emoji => !!e)
    return [
      ...(recent && rec.length ? [{ key: "recent", label: msg("emoji-picker.recent", "Recently used"), icon: Clock, emojis: rec }] : []),
      ...data.groups.map((g) => ({ key: g.key, label: g.label, icon: GROUP_ICONS[g.key] ?? Smile, emojis: g.emojis })),
    ]
  }, [data, q, recent, recentList, byHex, msg])

  const choose = (e: Emoji) => {
    const used = pick(e, skin)
    onSelect({ emoji: used.emoji, label: used.label, hexcode: e.hexcode, skinTone: e.skins ? skin : 0 })
    setSpoken(msg("emoji-picker.selected", "Selected {name}", { name: used.label }))
    if (recent) {
      const next = [{ hexcode: e.hexcode }, ...recentList.filter((r) => r.hexcode !== e.hexcode)].slice(0, RECENT_MAX)
      setRecentList(next)
      writeStored(storageKey, next)
    }
  }

  // ----- keyboard: arrow keys across and down the grid, wrapping into the next section
  const move = (s: number, i: number) => {
    wantFocus.current = true
    setFocusAt({ s, i })
  }
  React.useLayoutEffect(() => {
    if (!wantFocus.current) return
    wantFocus.current = false
    scroller.current?.querySelector<HTMLElement>(`[data-s="${focusAt.s}"][data-i="${focusAt.i}"]`)?.focus()
  }, [focusAt, sections])
  const onGridKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const t = (e.target as HTMLElement).closest<HTMLElement>("[data-s][data-i]")
    if (!t) return
    const s = Number(t.dataset.s)
    const i = Number(t.dataset.i)
    const len = (n: number) => sections[n]?.emojis.length ?? 0
    const back = dir === "rtl" ? "ArrowRight" : "ArrowLeft"
    const fwd = dir === "rtl" ? "ArrowLeft" : "ArrowRight"
    const col = i % columns
    let to: [number, number] | null = null
    if (e.key === fwd) to = i + 1 < len(s) ? [s, i + 1] : s + 1 < sections.length ? [s + 1, 0] : null
    else if (e.key === back) to = i > 0 ? [s, i - 1] : s > 0 ? [s - 1, len(s - 1) - 1] : null
    else if (e.key === "ArrowDown") {
      if (i + columns < len(s)) to = [s, i + columns]
      else if (s + 1 < sections.length) to = [s + 1, Math.min(col, len(s + 1) - 1)]
      else if (Math.floor(i / columns) < Math.floor((len(s) - 1) / columns)) to = [s, len(s) - 1]
    } else if (e.key === "ArrowUp") {
      if (i - columns >= 0) to = [s, i - columns]
      else if (s > 0) {
        const last = len(s - 1) - 1
        const lastRowStart = Math.floor(last / columns) * columns
        to = [s - 1, Math.min(lastRowStart + col, last)]
      }
    } else if (e.key === "Home") to = e.ctrlKey ? [0, 0] : [s, i - col]
    else if (e.key === "End") to = e.ctrlKey ? [sections.length - 1, len(sections.length - 1) - 1] : [s, Math.min(i - col + columns - 1, len(s) - 1)]
    else if (e.key === "PageDown") to = s + 1 < sections.length ? [s + 1, 0] : null
    else if (e.key === "PageUp") to = i > 0 ? [s, 0] : s > 0 ? [s - 1, 0] : null
    if (to) {
      e.preventDefault()
      move(to[0], to[1])
    }
  }

  const jump = (key: string) => {
    const el = scroller.current?.querySelector<HTMLElement>(`[data-section="${key}"]`)
    if (el && scroller.current) scroller.current.scrollTo({ top: el.offsetTop - scroller.current.offsetTop, behavior: "auto" })
  }

  const cell = 36
  const width = columns * cell + 16 + 12
  const total = sections.reduce((n, s) => n + s.emojis.length, 0)

  const skeleton = (
    <div className="grid gap-1 p-2" aria-hidden="true" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {Array.from({ length: columns * 6 }, (_, i) => (
        <Skeleton key={i} className="size-8 rounded-md" />
      ))}
    </div>
  )

  return (
    <div
      role="group"
      aria-label={msg("emoji-picker.label", "Emoji picker")}
      data-slot="emoji-picker"
      dir={dir}
      className={cn("flex flex-col overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-md", className)}
      style={{ width }}
      {...props}
    >
      <div className="relative border-b p-2">
        <Search className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          type="search"
          role="searchbox"
          autoFocus={autoFocus}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown" && total) {
              e.preventDefault()
              move(0, 0)
            } else if (e.key === "Escape" && query) {
              e.stopPropagation()
              setQuery("")
            }
          }}
          aria-label={msg("emoji-picker.search", "Search emoji")}
          aria-controls={load.status === "ready" ? `${id}-grid` : undefined}
          placeholder={msg("emoji-picker.search", "Search emoji")}
          disabled={load.status !== "ready"}
          lang={locale}
          className="h-9 w-full rounded-md border border-input bg-background ps-9 pe-8 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50 [&::-webkit-search-cancel-button]:hidden"
        />
        {query ? (
          <button type="button" onClick={() => setQuery("")} aria-label={msg("emoji-picker.clear", "Clear search")} className="absolute end-3.5 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50">
            <X className="size-3.5" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      {data && !q ? (
        <div role="toolbar" aria-label={msg("emoji-picker.groups", "Emoji groups")} aria-orientation="horizontal" className="flex items-center justify-between gap-0.5 border-b px-2 py-1">
          {sections.map((s) => {
            const Icon = s.icon
            return (
              <button key={s.key} type="button" onClick={() => jump(s.key)} aria-label={s.label} title={s.label} className="flex size-7 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none">
                <Icon className="size-4" aria-hidden="true" />
              </button>
            )
          })}
        </div>
      ) : null}

      <StateView
        state={load.status === "loading" ? "loading" : load.status === "error" ? "error" : "ready"}
        loading={skeleton}
        error={{ title: msg("emoji-picker.errorTitle", "Could not load the emoji"), description: msg("emoji-picker.errorDescription", "Check your connection and try again.") }}
        onRetry={retry}
        label={msg("emoji-picker.loading", "Loading emoji")}
        bare
        className="min-h-0 flex-1"
      >
        <div ref={scroller} id={`${id}-grid`} onKeyDown={onGridKey} className="overflow-y-auto overscroll-contain px-2 pb-2" style={{ height }}>
          {total === 0 ? (
            <p role="status" className="px-2 py-10 text-center text-sm text-muted-foreground">
              {msg("emoji-picker.none", "No emoji found for “{query}”", { query: query.trim() })}
            </p>
          ) : null}
          {sections.map((section, si) => {
            if (!section.emojis.length) return null
            const rows = Math.ceil(section.emojis.length / columns)
            return (
              <section key={section.key} data-section={section.key} aria-labelledby={`${id}-${section.key}`} className="[content-visibility:auto] [contain-intrinsic-size:auto_200px]">
                <h3 id={`${id}-${section.key}`} className="sticky top-0 z-10 -mx-2 bg-popover/95 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm">
                  {section.label}
                </h3>
                <div role="grid" aria-label={section.label} aria-rowcount={rows} aria-colcount={columns}>
                  {Array.from({ length: rows }, (_, r) => (
                    <div key={r} role="row" aria-rowindex={r + 1} className="grid" style={{ gridTemplateColumns: `repeat(${columns}, ${cell}px)` }}>
                      {section.emojis.slice(r * columns, r * columns + columns).map((e, c) => {
                        const shown = pick(e, skin)
                        const i = r * columns + c
                        const here = focusAt.s === si && focusAt.i === i
                        return (
                          <div key={e.hexcode} role="gridcell" aria-colindex={c + 1}>
                            <button
                              type="button"
                              data-s={si}
                              data-i={i}
                              tabIndex={here ? 0 : -1}
                              aria-label={shown.label}
                              onClick={() => choose(e)}
                              onFocus={() => {
                                setFocusAt({ s: si, i })
                                setHover(e)
                              }}
                              onMouseEnter={() => setHover(e)}
                              onMouseLeave={() => setHover(null)}
                              className="flex size-9 items-center justify-center rounded-md text-2xl leading-none outline-none transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none"
                            >
                              <span aria-hidden="true">{shown.emoji}</span>
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      </StateView>

      <div className="flex h-12 items-center gap-2 border-t bg-muted/40 px-3">
        <span aria-hidden="true" className="flex size-8 items-center justify-center text-2xl leading-none">
          {hover ? pick(hover, skin).emoji : "🙂"}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">{hover ? pick(hover, skin).label : msg("emoji-picker.prompt", "Pick an emoji")}</span>
        <div role="group" aria-label={msg("emoji-picker.skinTone", "Skin tone")} className="flex shrink-0 items-center gap-0.5">
          {TONES.map((t, n) => (
            <button
              key={n}
              type="button"
              aria-pressed={skin === n}
              aria-label={n === 0 ? msg("emoji-picker.toneDefault", "Default skin tone") : msg("emoji-picker.tone", "Skin tone {n}", { n })}
              title={n === 0 ? msg("emoji-picker.toneDefault", "Default skin tone") : msg("emoji-picker.tone", "Skin tone {n}", { n })}
              onClick={() => setSkin(n)}
              className={cn("flex size-6 items-center justify-center rounded-md text-sm outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none", skin === n && "bg-accent ring-1 ring-ring/40")}
            >
              <span aria-hidden="true">{`✋${t}`}</span>
            </button>
          ))}
        </div>
      </div>
      <span className="sr-only" role="status" aria-live="polite">
        {spoken || (q && data ? msg("emoji-picker.count", { one: "{count} emoji found", other: "{count} emoji found" }, { count: total }) : "")}
      </span>
    </div>
  )
}

export { EmojiPicker, type Emoji, type EmojiData, type EmojiGroup, type EmojiPickerProps, type EmojiSelection }
