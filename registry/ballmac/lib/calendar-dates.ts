// Ballmac UI: Calendar Dates. https://ui.ballmac.com/components/calendar-dates

/** A date, a timestamp, or text: "2026-10-20" (a day, in local time) or "2026-10-20T09:30" (a moment). */
export type DateInput = Date | number | string

const DAY = /^(\d{4})-(\d{2})-(\d{2})$/

/** Reads a date without the surprise that "2026-10-20" means midnight UTC: a bare day is local midnight. */
export function toDate(input: DateInput): Date {
  if (input instanceof Date) return new Date(input.getTime())
  if (typeof input === "string") {
    const m = DAY.exec(input)
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  }
  return new Date(input)
}

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds())
export const addMinutes = (d: Date, n: number) => new Date(d.getTime() + n * 60_000)
export const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1)
export const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0)

/** Moves by months and stays in range: January 31 plus one month is February 28 (or 29), not March 3. */
export function addMonths(d: Date, n: number) {
  const target = new Date(d.getFullYear(), d.getMonth() + n, 1, d.getHours(), d.getMinutes())
  const last = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
  target.setDate(Math.min(d.getDate(), last))
  return target
}

export const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
export const isSameMonth = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()

/** Whole days from `a` to `b`, by the calendar (a daylight-saving change does not make a day 23 or 25 hours). */
export const daysBetween = (a: Date, b: Date) => Math.round((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / 86_400_000)

export const minutesOfDay = (d: Date) => d.getHours() * 60 + d.getMinutes()
export const setMinutesOfDay = (d: Date, minutes: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, minutes)

export type WeekStart = 0 | 1 | 2 | 3 | 4 | 5 | 6

/** The day a week starts on in a locale: 0 is Sunday, 1 is Monday. Falls back to Sunday where the browser cannot say. */
export function weekStartFor(locale: string): WeekStart {
  try {
    const l = new Intl.Locale(locale) as Intl.Locale & { getWeekInfo?: () => { firstDay: number }; weekInfo?: { firstDay: number } }
    const first = l.getWeekInfo?.().firstDay ?? l.weekInfo?.firstDay
    if (first) return (first % 7) as WeekStart
  } catch {
    /* an unknown locale */
  }
  return 0
}

export function startOfWeek(d: Date, weekStartsOn: WeekStart) {
  const diff = (d.getDay() - weekStartsOn + 7) % 7
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - diff)
}

/** Every day of the week that holds `d`. */
export const weekDays = (d: Date, weekStartsOn: WeekStart) => {
  const start = startOfWeek(d, weekStartsOn)
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

/** The weeks that cover a month, each a row of seven days: the grid of a month view. */
export function monthGrid(d: Date, weekStartsOn: WeekStart) {
  const first = startOfWeek(startOfMonth(d), weekStartsOn)
  const last = startOfWeek(endOfMonth(d), weekStartsOn)
  const weeks = daysBetween(first, last) / 7 + 1
  return Array.from({ length: weeks }, (_, w) => Array.from({ length: 7 }, (_, i) => addDays(first, w * 7 + i)))
}

// ------------------------------------------------------------------ formatting (cached: building a formatter is the slow part)

const cache = new Map<string, Intl.DateTimeFormat>()
export function formatter(locale: string, options: Intl.DateTimeFormatOptions) {
  const key = `${locale}|${JSON.stringify(options)}`
  let f = cache.get(key)
  if (!f) cache.set(key, (f = new Intl.DateTimeFormat(locale, options)))
  return f
}
/**
 * Newer text engines write "9:30 AM" and "Oct 19 – 25" with narrow no-break spaces, older ones with plain spaces. A page rendered on a server and
 * then in a browser with different ones would not match, and React would redraw it. Plain spaces everywhere keeps both the same.
 */
const plain = (text: string) => text.replace(/[\u202f\u2009\u00a0]/g, " ")

export const format = (d: Date, locale: string, options: Intl.DateTimeFormatOptions) => plain(formatter(locale, options).format(d))

/** "Oct 19 – 25, 2026" */
export const formatRange = (a: Date, b: Date, locale: string, options: Intl.DateTimeFormatOptions) => plain(formatter(locale, options).formatRange(a, b))

// ------------------------------------------------------------------ events

export type CalendarEventLike = { id: string; start: DateInput; end?: DateInput; allDay?: boolean }
export type Span<E> = { event: E; start: Date; end: Date; allDay: boolean }

/**
 * The real start and end of an event. A day-long or all-day event runs to the end of its last day: `end` of an all-day event is that last day
 * (inclusive), as people write it. A timed event with no end lasts an hour.
 */
export function spanOf<E extends CalendarEventLike>(event: E): Span<E> {
  const start = toDate(event.start)
  if (event.allDay) {
    const last = startOfDay(event.end ? toDate(event.end) : start)
    return { event, start: startOfDay(start), end: addDays(last < startOfDay(start) ? startOfDay(start) : last, 1), allDay: true }
  }
  const end = event.end ? toDate(event.end) : addMinutes(start, 60)
  return { event, start, end: end <= start ? addMinutes(start, 15) : end, allDay: false }
}

/** Does the event touch this day at all? */
export const touchesDay = (s: Span<unknown>, day: Date) => s.start < addDays(startOfDay(day), 1) && s.end > startOfDay(day)

export type Placed<E> = { span: Span<E>; top: number; height: number; column: number; columns: number }

/**
 * Lays out one day's timed events so that overlapping ones sit side by side. Top and height are minutes from midnight, clipped to the day;
 * `column` and `columns` say which slice of the width the event gets.
 */
export function layoutDay<E>(spans: Span<E>[], day: Date, minHeight = 20): Placed<E>[] {
  const dayStart = startOfDay(day).getTime()
  const dayEnd = addDays(startOfDay(day), 1).getTime()
  const items = spans
    .filter((s) => !s.allDay && s.start.getTime() < dayEnd && s.end.getTime() > dayStart)
    .map((span) => {
      const from = Math.max(span.start.getTime(), dayStart)
      const to = Math.min(span.end.getTime(), dayEnd)
      const top = (from - dayStart) / 60_000
      return { span, top, height: Math.max((to - from) / 60_000, minHeight), column: 0, columns: 1 }
    })
    .sort((a, b) => a.top - b.top || b.height - a.height)

  // group events that overlap each other, directly or through a chain, then give each group its columns
  let cluster: typeof items = []
  let clusterEnd = -1
  const flush = () => {
    const columnEnds: number[] = []
    for (const item of cluster) {
      let col = columnEnds.findIndex((end) => end <= item.top)
      if (col < 0) col = columnEnds.length
      columnEnds[col] = item.top + item.height
      item.column = col
    }
    for (const item of cluster) item.columns = columnEnds.length
    cluster = []
    clusterEnd = -1
  }
  for (const item of items) {
    if (cluster.length && item.top >= clusterEnd) flush()
    cluster.push(item)
    clusterEnd = Math.max(clusterEnd, item.top + item.height)
  }
  flush()
  return items
}

export type Segment<E> = { span: Span<E>; /** index of the first day of the row it covers */ from: number; /** index of the last day, inclusive */ to: number; lane: number; startsHere: boolean; endsHere: boolean }

/**
 * Lays out the events of one week row (a month view) as bars across days. Each bar gets a lane so that bars do not overlap; a bar that continues
 * from the week before or into the week after says so.
 */
export function layoutWeek<E>(spans: Span<E>[], days: Date[]): Segment<E>[] {
  const first = startOfDay(days[0]!)
  const after = addDays(startOfDay(days[days.length - 1]!), 1)
  const segs: Segment<E>[] = []
  for (const span of spans) {
    if (!(span.start < after && span.end > first)) continue
    const from = Math.max(0, daysBetween(first, span.start))
    // an event that ends at midnight does not take that day
    const lastMoment = new Date(span.end.getTime() - 1)
    const to = Math.min(days.length - 1, daysBetween(first, lastMoment))
    segs.push({ span, from, to: Math.max(from, to), lane: 0, startsHere: span.start >= first, endsHere: span.end <= after })
  }
  segs.sort((a, b) => a.from - b.from || b.to - b.from - (a.to - a.from) || a.span.start.getTime() - b.span.start.getTime())
  const laneEnds: number[] = []
  for (const seg of segs) {
    let lane = laneEnds.findIndex((end) => end < seg.from)
    if (lane < 0) lane = laneEnds.length
    laneEnds[lane] = seg.to
    seg.lane = lane
  }
  return segs
}

/** Round to the nearest slot: 37 minutes in 15-minute slots is 30. */
export const snap = (minutes: number, slot: number) => Math.round(minutes / slot) * slot
