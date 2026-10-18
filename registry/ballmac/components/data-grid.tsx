// Ballmac UI: Data Grid. https://ui.ballmac.com/components/data-grid
"use client"

import * as React from "react"
import { ArrowDown, ArrowUp, Check, ChevronsUpDown } from "lucide-react"

import { Badge } from "@/components/ballmac/badge"
import { Checkbox } from "@/components/ballmac/checkbox"
import { StateView, type StateProps } from "@/components/ballmac/state-view"
import { Skeleton } from "@/components/ballmac/skeleton"
import { useDirection, type TextDirection } from "@/lib/ballmac/direction"
import { useLocale, useMessages, type Msg } from "@/lib/ballmac/i18n"
import { cn } from "@/lib/utils"

type DataGridTone = "neutral" | "success" | "warning" | "error"
type DataGridOption = { value: string; label: string; tone?: DataGridTone }
type DataGridColumnType = "text" | "number" | "boolean" | "select" | "date"

type DataGridColumn<T> = {
  /** A stable id. Also the key edits and sorting report. */
  id: string
  /** The column heading. */
  header: string
  /** Read the value from this key of the row. */
  accessorKey?: keyof T & string
  /** Or compute it. Then give `setValue` if the column is editable. */
  accessorFn?: (row: T) => unknown
  /** How the value is shown, edited, sorted and pasted. */
  type?: DataGridColumnType
  /** Width in pixels. People can drag it. */
  width?: number
  minWidth?: number
  align?: "start" | "center" | "end"
  /** Whether cells can be edited. A function decides per row. */
  editable?: boolean | ((row: T) => boolean)
  sortable?: boolean
  resizable?: boolean
  /** Keep the column at the start edge while the rest scrolls sideways. */
  pin?: "start"
  /** The choices of a `select` column. */
  options?: DataGridOption[]
  /** Write the value for display. Numbers and dates are formatted for the locale when you leave it out. */
  format?: (value: unknown, row: T) => React.ReactNode
  /** Replace the display of a cell entirely. */
  cell?: (info: { value: unknown; row: T; rowIndex: number }) => React.ReactNode
  /** Return a message to refuse an edit; it is shown on the cell and read out. */
  validate?: (value: unknown, row: T) => string | undefined
  /** Turn typed or pasted text into the value. */
  parse?: (text: string) => unknown
  /** Return the row with the value written. Defaults to `{ ...row, [accessorKey]: value }`. */
  setValue?: (row: T, value: unknown) => T
  /** What to sort by. Defaults to the value. */
  sortValue?: (row: T) => string | number | boolean | null | undefined
  /** `Intl.NumberFormat` options for number columns. */
  numberFormat?: Intl.NumberFormatOptions
}

type DataGridSort = { id: string; desc: boolean }
type DataGridChange<T> = { rowId: string; columnId: string; value: unknown; previous: unknown; row: T }

type DataGridProps<T> = Omit<React.ComponentProps<"div">, "onChange" | "defaultValue"> &
  StateProps & {
    /** The grid's name, read by screen readers. */
    label: string
    columns: DataGridColumn<T>[]
    /** The rows, when you hold them in state. Pair with `onDataChange`. */
    data?: T[]
    /** The rows to start with, when the grid holds them. */
    defaultData?: T[]
    /** Called with the new rows and the cells that changed, after an edit, a paste or an undo. */
    onDataChange?: (rows: T[], changes: DataGridChange<T>[]) => void
    /** Called for every cell that changes. */
    onCellChange?: (change: DataGridChange<T>) => void
    /** A stable id for each row. Defaults to `row.id`, then the position. */
    getRowId?: (row: T, index: number) => string
    /** The height of the scrolling area. Rows beyond it are not drawn until you scroll to them. */
    height?: number | string
    /** Row height. */
    density?: "compact" | "default" | "comfortable"
    /** Show a checkbox on each row. */
    selectable?: boolean
    selectedRowIds?: string[]
    defaultSelectedRowIds?: string[]
    onSelectedRowIdsChange?: (ids: string[]) => void
    /** Sorting, when you hold it in state. */
    sorting?: DataGridSort[]
    defaultSorting?: DataGridSort[]
    onSortingChange?: (sorting: DataGridSort[]) => void
    /** Show only rows with a cell that contains this text. */
    search?: string
    /** The grid reads right to left. Defaults to the page. */
    dir?: TextDirection
    /** Rows drawn beyond the visible ones, for smooth scrolling. */
    overscan?: number
    /** Shown in the bar under the grid, beside the row count. */
    footer?: React.ReactNode
  }

const ROW_HEIGHT = { compact: 32, default: 40, comfortable: 52 } as const
const HEADER_HEIGHT = 40
const SELECT_WIDTH = 44
const SELECT_ID = "__select"
const MAX_HISTORY = 200

const keyOf = <T,>(col: DataGridColumn<T>) => col.accessorKey ?? col.id

function readValue<T>(col: DataGridColumn<T>, row: T): unknown {
  if (col.accessorFn) return col.accessorFn(row)
  const key = col.accessorKey
  return key ? (row as Record<string, unknown>)[key] : undefined
}

function writeValue<T>(col: DataGridColumn<T>, row: T, value: unknown): T {
  if (col.setValue) return col.setValue(row, value)
  const key = col.accessorKey
  return key ? ({ ...(row as object), [key]: value } as T) : row
}

const isEditable = <T,>(col: DataGridColumn<T>, row: T) => (typeof col.editable === "function" ? col.editable(row) : !!col.editable)

function defaultParse<T>(col: DataGridColumn<T>, text: string): unknown {
  const t = col.type ?? "text"
  if (col.parse) return col.parse(text)
  if (t === "number") {
    const cleaned = text.replace(/[\s,]/g, "").replace(/^[$€£¥₹]/, "")
    if (cleaned === "") return null
    const n = Number(cleaned)
    return Number.isFinite(n) ? n : text
  }
  if (t === "boolean") return /^(true|yes|y|1|on|✓)$/i.test(text.trim())
  if (t === "select") {
    const byLabel = col.options?.find((o) => o.label.toLowerCase() === text.trim().toLowerCase() || o.value.toLowerCase() === text.trim().toLowerCase())
    return byLabel ? byLabel.value : text.trim()
  }
  return text
}

function toText<T>(col: DataGridColumn<T>, value: unknown): string {
  if (value === null || value === undefined) return ""
  if (col.type === "select") return col.options?.find((o) => o.value === value)?.label ?? String(value)
  if (col.type === "boolean") return value ? "true" : "false"
  return String(value)
}

function compare(a: unknown, b: unknown, locale: string) {
  const empty = (v: unknown) => v === null || v === undefined || v === ""
  if (empty(a) && empty(b)) return 0
  if (empty(a)) return 1
  if (empty(b)) return -1
  if (typeof a === "number" && typeof b === "number") return a - b
  if (typeof a === "boolean" && typeof b === "boolean") return Number(a) - Number(b)
  return String(a).localeCompare(String(b), locale, { numeric: true, sensitivity: "base" })
}

/** Clamp without NaN surprises. */
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))

/** What every column of a kind refuses, before the column's own `validate`. */
function builtInProblem<T>(column: DataGridColumn<T>, value: unknown, msg: Msg): string | undefined {
  if (value === null || value === undefined || value === "") return undefined
  if (column.type === "number" && typeof value !== "number") return msg("data-grid.notNumber", "Enter a number.")
  if (column.type === "date" && !/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return msg("data-grid.notDate", "Enter a date as year-month-day.")
  if (column.type === "select" && column.options && !column.options.some((o) => o.value === value)) return msg("data-grid.notOption", "Choose one of the options.")
  return undefined
}

type Edit = { row: number; col: number; draft: string; error?: string }

type Cell<T> = { column: DataGridColumn<T> | null; id: string }

/**
 * A spreadsheet-style grid for thousands of rows. Only the rows in view are drawn. Move with the arrow keys, press Enter or start typing to edit,
 * sort and resize the headings, pin a column, select rows, paste from a spreadsheet and undo with Ctrl+Z. It follows the ARIA grid pattern and
 * mirrors in right-to-left.
 */
function DataGrid<T>({
  label,
  columns,
  data,
  defaultData,
  onDataChange,
  onCellChange,
  getRowId,
  height = 420,
  density = "default",
  selectable = false,
  selectedRowIds,
  defaultSelectedRowIds,
  onSelectedRowIdsChange,
  sorting,
  defaultSorting,
  onSortingChange,
  search = "",
  dir: dirProp,
  overscan = 6,
  footer,
  state,
  onRetry,
  emptyState,
  errorState,
  className,
  ...props
}: DataGridProps<T>) {
  const msg = useMessages()
  const locale = useLocale()
  const dir = useDirection(dirProp)
  const rtl = dir === "rtl"
  const rowHeight = ROW_HEIGHT[density]
  const gridId = React.useId()

  // ---------- the rows, held here or by the caller
  const [innerData, setInnerData] = React.useState<T[]>(defaultData ?? [])
  const rows = data ?? innerData
  const idOf = React.useCallback(
    (row: T, index: number) => (getRowId ? getRowId(row, index) : String((row as { id?: unknown })?.id ?? index)),
    [getRowId]
  )

  // ---------- sorting and selection, controlled or not
  const [innerSort, setInnerSort] = React.useState<DataGridSort[]>(defaultSorting ?? [])
  const sort = sorting ?? innerSort
  const setSort = (next: DataGridSort[]) => {
    if (sorting === undefined) setInnerSort(next)
    onSortingChange?.(next)
  }
  const [innerSel, setInnerSel] = React.useState<string[]>(defaultSelectedRowIds ?? [])
  const selectedIds = selectedRowIds ?? innerSel
  const selectedSet = React.useMemo(() => new Set(selectedIds), [selectedIds])
  const setSelected = (next: string[]) => {
    if (selectedRowIds === undefined) setInnerSel(next)
    onSelectedRowIdsChange?.(next)
  }

  // ---------- widths
  const [widths, setWidths] = React.useState<Record<string, number>>({})
  const widthOf = React.useCallback((c: DataGridColumn<T>) => widths[c.id] ?? c.width ?? 160, [widths])

  // pinned columns first, in the order given
  const ordered = React.useMemo(() => [...columns.filter((c) => c.pin === "start"), ...columns.filter((c) => c.pin !== "start")], [columns])
  const cells: Cell<T>[] = React.useMemo(
    () => [...(selectable ? [{ column: null, id: SELECT_ID }] : []), ...ordered.map((c) => ({ column: c, id: c.id }))],
    [selectable, ordered]
  )
  const offsets = React.useMemo(() => {
    let x = 0
    return cells.map((c) => {
      const start = x
      x += c.column ? widthOf(c.column) : SELECT_WIDTH
      return start
    })
  }, [cells, widthOf])
  const totalWidth = cells.reduce((sum, c) => sum + (c.column ? widthOf(c.column) : SELECT_WIDTH), 0)
  const pinnedCount = cells.filter((c) => !c.column || c.column.pin === "start").length
  const pinnedWidth = pinnedCount ? offsets[pinnedCount - 1]! + (cells[pinnedCount - 1]!.column ? widthOf(cells[pinnedCount - 1]!.column!) : SELECT_WIDTH) : 0

  // ---------- the rows in view: filtered, then sorted
  const view = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    let list = rows.map((row, index) => ({ row, index, id: idOf(row, index) }))
    if (q) {
      list = list.filter(({ row }) =>
        ordered.some((c) => {
          const v = readValue(c, row)
          return v !== null && v !== undefined && toText(c, v).toLowerCase().includes(q)
        })
      )
    }
    if (sort.length) {
      const keys = sort
        .map((s) => ({ s, col: ordered.find((c) => c.id === s.id) }))
        .filter((k): k is { s: DataGridSort; col: DataGridColumn<T> } => !!k.col)
      list = [...list].sort((a, b) => {
        for (const { s, col } of keys) {
          const va = col.sortValue ? col.sortValue(a.row) : readValue(col, a.row)
          const vb = col.sortValue ? col.sortValue(b.row) : readValue(col, b.row)
          const c = compare(va, vb, locale)
          if (c !== 0) return s.desc ? -c : c
        }
        return a.index - b.index
      })
    }
    return list
  }, [rows, ordered, sort, search, idOf, locale])

  // ---------- scrolling and the window of rows drawn
  const scroller = React.useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = React.useState(0)
  const [scrolledX, setScrolledX] = React.useState(false)
  const [viewport, setViewport] = React.useState(typeof height === "number" ? height : 420)
  React.useEffect(() => {
    const el = scroller.current
    if (!el || typeof ResizeObserver === "undefined") return
    const ro = new ResizeObserver(() => el.clientHeight && setViewport(el.clientHeight))
    ro.observe(el)
    if (el.clientHeight) setViewport(el.clientHeight)
    return () => ro.disconnect()
  }, [])
  const frame = React.useRef(0)
  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => {
      setScrollTop(el.scrollTop)
      setScrolledX(Math.abs(el.scrollLeft) > 1)
    })
  }
  React.useEffect(() => () => cancelAnimationFrame(frame.current), [])

  // ---------- the active cell, editing, history
  const [active, setActive] = React.useState<{ row: number; col: number } | null>(null)
  const [edit, setEdit] = React.useState<Edit | null>(null)
  const focusNext = React.useRef(false)
  // each entry is one edit, or one paste: undo takes back the whole thing
  const undo = React.useRef<DataGridChange<T>[][]>([])
  const redo = React.useRef<DataGridChange<T>[][]>([])
  const [announce, setAnnounce] = React.useState("")

  const rowCount = view.length
  const colCount = cells.length
  const first = clamp(Math.floor(scrollTop / rowHeight) - overscan, 0, Math.max(0, rowCount - 1))
  const last = clamp(Math.ceil((scrollTop + viewport) / rowHeight) + overscan, 0, rowCount)
  const drawn = new Set<number>()
  for (let i = first; i < last; i++) drawn.add(i)
  // the cell with the keyboard stays in the document even when scrolled away, so focus is never lost
  if (active && active.row < rowCount) drawn.add(active.row)
  const drawnRows = [...drawn].sort((a, b) => a - b)

  const move = (row: number, col: number) => {
    if (!rowCount || !colCount) return
    focusNext.current = true
    setActive({ row: clamp(row, 0, rowCount - 1), col: clamp(col, 0, colCount - 1) })
  }

  React.useLayoutEffect(() => {
    if (!focusNext.current || !active) return
    focusNext.current = false
    const el = scroller.current?.querySelector<HTMLElement>(`[data-row="${active.row}"][data-col="${active.col}"]`)
    el?.focus()
  }, [active, drawnRows.length])

  // ---------- writing values: one or many cells at once, so a paste is a single change and a single undo
  const applyBatch = React.useCallback(
    (items: { row: number; col: number; value: unknown }[], options: { record?: boolean; strict?: boolean } = {}): { problem?: string; applied: number } => {
      const { record = true, strict = true } = options
      let working = rows
      const changes: DataGridChange<T>[] = []
      let problem: string | undefined
      for (const { row, col, value } of items) {
        const item = view[row]
        const column = cells[col]?.column
        if (!item || !column) continue
        const current = working[item.index]!
        const previous = readValue(column, current)
        if (Object.is(previous, value)) continue
        const bad = builtInProblem(column, value, msg) ?? column.validate?.(value, current)
        if (bad) {
          if (strict) return { problem: bad, applied: 0 }
          problem ??= bad
          continue
        }
        if (working === rows) working = [...rows]
        const nextRow = writeValue(column, current, value)
        working[item.index] = nextRow
        changes.push({ rowId: item.id, columnId: column.id, value, previous, row: nextRow })
      }
      if (!changes.length) return { problem, applied: 0 }
      if (data === undefined) setInnerData(working)
      onDataChange?.(working, changes)
      for (const c of changes) onCellChange?.(c)
      if (record) {
        undo.current = [...undo.current.slice(-(MAX_HISTORY - 1)), changes]
        redo.current = []
      }
      return { problem, applied: changes.length }
    },
    [view, cells, rows, data, onDataChange, onCellChange, msg]
  )

  const applyHistory = (from: React.MutableRefObject<DataGridChange<T>[][]>, to: React.MutableRefObject<DataGridChange<T>[][]>, direction: "undo" | "redo") => {
    const batch = from.current.at(-1)
    if (!batch) return
    const ordered = direction === "undo" ? [...batch].reverse() : batch
    const items = ordered
      .map((c) => ({ row: view.findIndex((v) => v.id === c.rowId), col: cells.findIndex((x) => x.id === c.columnId), value: direction === "undo" ? c.previous : c.value }))
      .filter((i) => i.row >= 0 && i.col >= 0)
    from.current = from.current.slice(0, -1)
    if (!items.length) return
    const result = applyBatch(items, { record: false, strict: false })
    if (!result.applied) return
    to.current = [...to.current, batch]
    move(items[0]!.row, items[0]!.col)
    setAnnounce(
      direction === "undo"
        ? msg("data-grid.undone", { one: "Undid {count} change", other: "Undid {count} changes" }, { count: result.applied })
        : msg("data-grid.redone", { one: "Redid {count} change", other: "Redid {count} changes" }, { count: result.applied })
    )
  }

  // ---------- editing
  const startEdit = (row: number, col: number, seed?: string) => {
    const item = view[row]
    const column = cells[col]?.column
    if (!item || !column || !isEditable(column, item.row)) return
    const value = readValue(column, item.row)
    setEdit({ row, col, draft: seed ?? (column.type === "select" ? String(value ?? "") : toText(column, value)) })
  }

  const finishEdit = (apply: boolean, then?: "down" | "up" | "next" | "previous") => {
    if (!edit) return
    const column = cells[edit.col]?.column
    const item = view[edit.row]
    if (!column || !item) return setEdit(null)
    if (apply) {
      const value = column.type === "select" ? (edit.draft === "" ? null : edit.draft) : defaultParse(column, edit.draft)
      const { problem } = applyBatch([{ row: edit.row, col: edit.col, value }])
      if (problem) {
        setEdit({ ...edit, error: problem })
        setAnnounce(problem)
        return
      }
    }
    setEdit(null)
    const { row, col } = edit
    if (then === "down") move(row + 1, col)
    else if (then === "up") move(row - 1, col)
    else if (then === "next") move(col + 1 < colCount ? row : row + 1, col + 1 < colCount ? col + 1 : 0)
    else if (then === "previous") move(col > 0 ? row : row - 1, col > 0 ? col - 1 : colCount - 1)
    else move(row, col)
  }

  // ---------- selection
  const toggleRow = (id: string, on?: boolean) => {
    const has = selectedSet.has(id)
    const want = on ?? !has
    if (want === has) return
    setSelected(want ? [...selectedIds, id] : selectedIds.filter((s) => s !== id))
  }
  const allSelected = view.length > 0 && view.every((v) => selectedSet.has(v.id))
  const someSelected = view.some((v) => selectedSet.has(v.id))
  const toggleAll = () => {
    if (allSelected) setSelected(selectedIds.filter((id) => !view.some((v) => v.id === id)))
    else setSelected([...new Set([...selectedIds, ...view.map((v) => v.id)])])
  }

  // ---------- sorting
  const sortBy = (column: DataGridColumn<T>, additive: boolean) => {
    const current = sort.find((s) => s.id === column.id)
    const rest = additive ? sort.filter((s) => s.id !== column.id) : []
    if (!current) return setSort([...rest, { id: column.id, desc: false }])
    if (!current.desc) return setSort([...rest, { id: column.id, desc: true }])
    setSort(rest)
  }

  // ---------- keyboard
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (edit) return // the input handles its own keys
    const target = e.target as HTMLElement
    if (target.closest("input, select, textarea, [role=separator]")) return
    const cellEl = target.closest<HTMLElement>("[data-row][data-col]")
    if (!cellEl) return
    // a control inside the cell (its checkbox) keeps Space and Enter; movement still works from it
    const inner = target !== cellEl
    const row = Number(cellEl.dataset.row)
    const col = Number(cellEl.dataset.col)
    const start = rtl ? "ArrowRight" : "ArrowLeft"
    const end = rtl ? "ArrowLeft" : "ArrowRight"
    const page = Math.max(1, Math.floor((viewport - HEADER_HEIGHT) / rowHeight) - 1)
    const mod = e.ctrlKey || e.metaKey
    const column = cells[col]?.column
    const item = view[row]
    const flip = (r: number, c: number) => applyBatch([{ row: r, col: c, value: !readValue(cells[c]!.column!, view[r]!.row) }])
    let handled = true
    if (mod && !e.altKey && ["a", "z", "y"].includes(e.key.toLowerCase())) {
      const k = e.key.toLowerCase()
      if (k === "a" && selectable) toggleAll()
      else if (k === "z") applyHistory(e.shiftKey ? redo : undo, e.shiftKey ? undo : redo, e.shiftKey ? "redo" : "undo")
      else if (k === "y") applyHistory(redo, undo, "redo")
      else return
      e.preventDefault()
      return
    }
    switch (e.key) {
      case "ArrowDown": move(row + 1, col); break
      case "ArrowUp": move(row - 1, col); break
      case end: move(row, col + 1); break
      case start: move(row, col - 1); break
      case "Home": move(mod ? 0 : row, 0); break
      case "End": move(mod ? rowCount - 1 : row, colCount - 1); break
      case "PageDown": move(row + page, col); break
      case "PageUp": move(row - page, col); break
      case "Enter":
      case "F2":
        if (inner || !column || !item || !isEditable(column, item.row)) handled = false
        else if (column.type === "boolean") flip(row, col)
        else startEdit(row, col)
        break
      case " ":
        if (inner || !item) handled = false
        else if (!column) toggleRow(item.id)
        else if (column.type === "boolean" && isEditable(column, item.row)) flip(row, col)
        else if (e.shiftKey && selectable) toggleRow(item.id)
        else handled = false
        break
      case "Delete":
      case "Backspace":
        if (column && item && isEditable(column, item.row)) applyBatch([{ row, col, value: column.type === "boolean" ? false : null }])
        else handled = false
        break
      default:
        if (!inner && !mod && !e.altKey && e.key.length === 1 && column && item && isEditable(column, item.row) && column.type !== "boolean" && column.type !== "select") startEdit(row, col, e.key)
        else handled = false
    }
    if (handled) e.preventDefault()
  }

  // ---------- clipboard: copy the cell, paste rows and columns from a spreadsheet
  const onCopy = (e: React.ClipboardEvent<HTMLDivElement>) => {
    if (edit || !active) return
    const item = view[active.row]
    const column = cells[active.col]?.column
    if (!item || !column) return
    e.clipboardData.setData("text/plain", toText(column, readValue(column, item.row)))
    e.preventDefault()
  }
  const onPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    if (edit || !active) return
    const text = e.clipboardData.getData("text/plain")
    if (!text) return
    e.preventDefault()
    const lines = text.replace(/\r\n?/g, "\n").replace(/\n$/, "").split("\n").map((l) => l.split("\t"))
    const items: { row: number; col: number; value: unknown }[] = []
    lines.forEach((line, dr) =>
      line.forEach((text, dc) => {
        const item = view[active.row + dr]
        const column = cells[active.col + dc]?.column
        if (item && column && isEditable(column, item.row)) items.push({ row: active.row + dr, col: active.col + dc, value: defaultParse(column, text) })
      })
    )
    const { applied, problem } = applyBatch(items, { strict: false })
    setAnnounce(
      problem
        ? msg("data-grid.pastedSome", "Pasted {count} cells. Some were refused: {problem}", { count: applied, problem })
        : msg("data-grid.pasted", { one: "Pasted {count} cell", other: "Pasted {count} cells" }, { count: applied })
    )
  }

  // ---------- resizing
  const resize = (column: DataGridColumn<T>, next: number) => setWidths((w) => ({ ...w, [column.id]: clamp(Math.round(next), column.minWidth ?? 64, 800) }))
  const startResize = (column: DataGridColumn<T>) => (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const el = e.currentTarget
    el.setPointerCapture(e.pointerId)
    const startX = e.clientX
    const startW = widthOf(column)
    const sign = rtl ? -1 : 1
    const mv = (ev: PointerEvent) => resize(column, startW + sign * (ev.clientX - startX))
    const up = () => {
      el.removeEventListener("pointermove", mv)
      el.removeEventListener("pointerup", up)
      el.removeEventListener("pointercancel", up)
    }
    el.addEventListener("pointermove", mv)
    el.addEventListener("pointerup", up)
    el.addEventListener("pointercancel", up)
  }

  // ---------- drawing
  const numberFormatters = React.useMemo(() => new Map<string, Intl.NumberFormat>(), [])
  const display = (column: DataGridColumn<T>, row: T, value: unknown, rowIndex: number): React.ReactNode => {
    if (column.cell) return column.cell({ value, row, rowIndex })
    if (column.format) return column.format(value, row)
    if (value === null || value === undefined || value === "") return <span className="text-muted-foreground/60" aria-hidden="true">–</span>
    switch (column.type) {
      case "number": {
        const k = JSON.stringify(column.numberFormat ?? {})
        let nf = numberFormatters.get(k)
        if (!nf) numberFormatters.set(k, (nf = new Intl.NumberFormat(locale, column.numberFormat)))
        return typeof value === "number" ? nf.format(value) : String(value)
      }
      case "boolean":
        return value ? (
          <span data-boolean="" className="inline-flex size-4 items-center justify-center rounded-[4px] border border-primary bg-primary text-primary-foreground" role="img" aria-label={msg("data-grid.yes", "Yes")}>
            <Check className="size-3" strokeWidth={3} aria-hidden="true" />
          </span>
        ) : (
          <span data-boolean="" className="inline-flex size-4 rounded-[4px] border border-input bg-background" role="img" aria-label={msg("data-grid.no", "No")} />
        )
      case "select": {
        const o = column.options?.find((opt) => opt.value === value)
        return (
          <Badge status={o?.tone ?? "neutral"} className="max-w-full truncate">
            {o?.label ?? String(value)}
          </Badge>
        )
      }
      case "date": {
        const d = new Date(`${String(value)}T00:00:00`)
        return Number.isNaN(d.getTime()) ? String(value) : new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(d)
      }
      default:
        return String(value)
    }
  }

  const gridCols = cells.map((c) => `${c.column ? widthOf(c.column) : SELECT_WIDTH}px`).join(" ")
  const alignClass = (a?: "start" | "center" | "end", type?: DataGridColumnType) => {
    const eff = a ?? (type === "number" ? "end" : "start")
    return eff === "end" ? "justify-end text-end" : eff === "center" ? "justify-center text-center" : "justify-start text-start"
  }
  const pinStyle = (i: number, z: number): React.CSSProperties => ({ position: "sticky", insetInlineStart: offsets[i], zIndex: z })
  const isPinned = (i: number) => i < pinnedCount
  const lastPinned = (i: number) => i === pinnedCount - 1 && pinnedCount > 0
  const pinnedEdge = (i: number) => lastPinned(i) && "border-e border-border"
  const pinnedShadow = (i: number) =>
    lastPinned(i) && scrolledX && "after:pointer-events-none after:absolute after:inset-y-0 after:-end-3 after:w-3 after:bg-gradient-to-r after:from-foreground/10 after:to-transparent rtl:after:bg-gradient-to-l"

  const sortOf = (column: DataGridColumn<T>) => sort.find((s) => s.id === column.id)
  const effective: StateProps["state"] = state ?? (rows.length === 0 ? "empty" : "ready")

  const body = (
    <div
      role="grid"
      aria-label={label}
      aria-rowcount={rowCount + 1}
      aria-colcount={colCount}
      aria-multiselectable={selectable || undefined}
      dir={dir}
      onKeyDown={onKeyDown}
      onCopy={onCopy}
      onPaste={onPaste}
      data-scrolled={scrolledX || undefined}
      style={{ width: totalWidth, minWidth: "100%" }}
      className="group/grid relative text-sm outline-none"
    >
      <div role="rowgroup" className="sticky top-0 z-30">
        <div role="row" aria-rowindex={1} className="grid bg-muted/80 backdrop-blur-sm" style={{ gridTemplateColumns: gridCols, height: HEADER_HEIGHT }}>
          {cells.map((c, i) => {
            const column = c.column
            const sorted = column ? sortOf(column) : undefined
            const sortable = !!column && column.sortable !== false
            return (
              <div
                key={c.id}
                role="columnheader"
                aria-colindex={i + 1}
                aria-sort={sorted ? (sorted.desc ? "descending" : "ascending") : sortable ? "none" : undefined}
                style={isPinned(i) ? pinStyle(i, 31) : undefined}
                className={cn(
                  "relative flex items-center border-b border-border bg-muted px-3 font-medium text-muted-foreground",
                  column ? alignClass(column.align, column.type) : "justify-center px-0",
                  isPinned(i) && "bg-muted",
                  pinnedEdge(i),
                  pinnedShadow(i)
                )}
              >
                {!column ? (
                  <Checkbox
                    aria-label={msg("data-grid.selectAll", "Select all rows")}
                    checked={allSelected ? true : someSelected ? "indeterminate" : false}
                    onCheckedChange={toggleAll}
                  />
                ) : sortable ? (
                  <button
                    type="button"
                    onClick={(e) => sortBy(column, e.shiftKey)}
                    className="group/sort -mx-1.5 flex min-w-0 items-center gap-1.5 rounded-md px-1.5 py-1 outline-none transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-[pressed=true]:text-foreground"
                    aria-pressed={!!sorted}
                    title={msg("data-grid.sortHint", "Sort by {column}. Hold Shift to add a second sort.", { column: column.header })}
                  >
                    <span className="truncate">{column.header}</span>
                    {sorted ? (
                      sorted.desc ? <ArrowDown className="size-3.5 shrink-0" aria-hidden="true" /> : <ArrowUp className="size-3.5 shrink-0" aria-hidden="true" />
                    ) : (
                      <ChevronsUpDown className="size-3.5 shrink-0 opacity-0 transition-opacity group-hover/sort:opacity-60 group-focus-visible/sort:opacity-60 motion-reduce:transition-none" aria-hidden="true" />
                    )}
                    {sorted && sort.length > 1 ? <span className="text-[10px] tabular-nums text-muted-foreground" aria-hidden="true">{sort.findIndex((s) => s.id === column.id) + 1}</span> : null}
                  </button>
                ) : (
                  <span className="truncate">{column.header}</span>
                )}
                {column && column.resizable !== false ? (
                  <div
                    role="separator"
                    aria-orientation="vertical"
                    aria-label={msg("data-grid.resize", "Resize {column}", { column: column.header })}
                    aria-valuenow={widthOf(column)}
                    aria-valuemin={column.minWidth ?? 64}
                    aria-valuemax={800}
                    tabIndex={0}
                    onPointerDown={startResize(column)}
                    onDoubleClick={() => setWidths((w) => { const { [column.id]: _, ...rest } = w; return rest })}
                    onKeyDown={(e) => {
                      const step = e.shiftKey ? 48 : 16
                      const grow = rtl ? "ArrowLeft" : "ArrowRight"
                      const shrink = rtl ? "ArrowRight" : "ArrowLeft"
                      if (e.key === grow) resize(column, widthOf(column) + step)
                      else if (e.key === shrink) resize(column, widthOf(column) - step)
                      else return
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    className="absolute inset-y-1.5 -end-1 z-10 flex w-2 cursor-col-resize touch-none justify-center outline-none after:h-full after:w-px after:bg-border after:transition-colors hover:after:w-0.5 hover:after:bg-primary focus-visible:after:w-0.5 focus-visible:after:bg-ring motion-reduce:after:transition-none"
                  />
                ) : null}
              </div>
            )
          })}
        </div>
      </div>

      <div role="rowgroup" className="relative" style={{ height: Math.max(rowCount, 1) * rowHeight }}>
        {rowCount === 0 ? (
          <div className="sticky start-0 flex h-24 w-[100cqw] items-center justify-center px-4 text-sm text-muted-foreground">
            {search.trim() ? msg("data-grid.noMatches", "No rows match “{search}”.", { search: search.trim() }) : msg("data-grid.noRows", "No rows.")}
          </div>
        ) : null}
        {drawnRows.map((ri) => {
          const item = view[ri]
          if (!item) return null
          const selected = selectedSet.has(item.id)
          return (
            <div
              key={item.id}
              role="row"
              aria-rowindex={ri + 2}
              aria-selected={selectable ? selected : undefined}
              data-selected={selected || undefined}
              className={cn(
                "group/row absolute inset-x-0 grid border-b border-border/60 bg-card transition-colors hover:bg-muted/40 motion-reduce:transition-none",
                selected && "bg-primary/5 hover:bg-primary/[0.08]"
              )}
              style={{ top: ri * rowHeight, height: rowHeight, gridTemplateColumns: gridCols }}
            >
              {cells.map((c, ci) => {
                const column = c.column
                const isActive = active?.row === ri && active.col === ci
                const tabStop = active ? isActive : ri === 0 && ci === (cells[0]?.column ? 0 : Math.min(1, colCount - 1))
                const editing = edit?.row === ri && edit.col === ci
                const value = column ? readValue(column, item.row) : undefined
                const editable = !!column && isEditable(column, item.row)
                const invalid = editing && edit?.error
                return (
                  <div
                    key={c.id}
                    role="gridcell"
                    aria-colindex={ci + 1}
                    aria-readonly={column && !editable ? true : undefined}
                    aria-invalid={invalid ? true : undefined}
                    data-row={ri}
                    data-col={ci}
                    data-active={isActive || undefined}
                    tabIndex={tabStop && !editing ? 0 : -1}
                    onFocus={() => !editing && setActive((a) => (a && a.row === ri && a.col === ci ? a : { row: ri, col: ci }))}
                    onMouseDown={() => !editing && !isActive && setActive({ row: ri, col: ci })}
                    onClick={(e) => {
                      // the check box in a yes/no cell works with one click, as it does in a spreadsheet
                      if (column?.type === "boolean" && editable && (e.target as HTMLElement).closest("[data-boolean]")) applyBatch([{ row: ri, col: ci, value: !value }])
                    }}
                    onDoubleClick={() => column && column.type !== "boolean" && startEdit(ri, ci)}
                    style={isPinned(ci) ? pinStyle(ci, 10) : undefined}
                    className={cn(
                      "relative flex min-w-0 items-center overflow-hidden px-3 outline-none",
                      column ? alignClass(column.align, column.type) : "justify-center px-0",
                      column?.type === "number" && "tabular-nums",
                      isPinned(ci) && (selected ? "bg-[color-mix(in_oklab,var(--card),var(--primary)_5%)]" : "bg-card group-hover/row:bg-muted"),
                      pinnedEdge(ci),
                      pinnedShadow(ci),
                      isActive && "z-20 ring-2 ring-inset ring-ring",
                      editing && "bg-background ring-primary",
                      invalid && "ring-destructive"
                    )}
                  >
                    {!column ? (
                      <Checkbox
                        tabIndex={-1}
                        aria-label={msg("data-grid.selectRow", "Select row {n}", { n: ri + 1 })}
                        checked={selected}
                        onCheckedChange={(v) => toggleRow(item.id, v === true)}
                      />
                    ) : editing ? (
                      <EditorInput
                        column={column}
                        edit={edit!}
                        onChange={(draft) => setEdit((cur) => (cur ? { ...cur, draft, error: undefined } : cur))}
                        onFinish={finishEdit}
                        label={msg("data-grid.editCell", "Edit {column}, row {n}", { column: column.header, n: ri + 1 })}
                        locale={locale}
                        rtl={rtl}
                      />
                    ) : (
                      <span className="min-w-0 truncate">{display(column, item.row, value, item.index)}</span>
                    )}
                    {invalid ? (
                      <span role="alert" className="pointer-events-none absolute inset-x-0 top-full z-40 mt-1 w-max max-w-64 rounded-md border border-destructive/30 bg-popover px-2 py-1 text-xs text-destructive shadow-md">
                        {edit?.error}
                      </span>
                    ) : null}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )

  const skeleton = (
    <div className="overflow-hidden rounded-xl border bg-card" aria-hidden="true">
      <div className="grid border-b bg-muted" style={{ gridTemplateColumns: gridCols, height: HEADER_HEIGHT }}>
        {cells.map((c) => (
          <div key={c.id} className="flex items-center px-3">
            {c.column ? <Skeleton className="h-3.5 w-2/3" /> : null}
          </div>
        ))}
      </div>
      {Array.from({ length: Math.max(3, Math.floor((typeof height === "number" ? height : 420) / rowHeight) - 2) }, (_, i) => (
        <div key={i} className="grid border-b border-border/60 last:border-0" style={{ gridTemplateColumns: gridCols, height: rowHeight }}>
          {cells.map((c, j) => (
            <div key={c.id} className="flex items-center px-3">
              {c.column ? <Skeleton className={cn("h-3.5", ["w-4/5", "w-3/5", "w-2/3", "w-1/2"][(i + j) % 4])} /> : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  )

  // numbers are written for the locale ("20,000"), while the plural form still follows the real count
  const nf = new Intl.NumberFormat(locale)
  const countText = msg("data-grid.rowCount", { one: "{n} row", other: "{n} rows" }, { count: view.length, n: nf.format(view.length) })
  const filteredText = view.length !== rows.length ? msg("data-grid.rowsOfTotal", "{n} of {total} rows", { count: view.length, n: nf.format(view.length), total: nf.format(rows.length) }) : countText

  return (
    <div data-slot="data-grid" data-density={density} className={cn("min-w-0", className)} {...props}>
      <StateView state={effective} loading={skeleton} empty={emptyState ?? {}} error={errorState ?? {}} onRetry={onRetry} label={msg("data-grid.loading", "Loading rows")} bare className="rounded-xl">
        <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
          <div
            ref={scroller}
            onScroll={onScroll}
            data-slot="data-grid-scroller"
            style={{ height, scrollPaddingTop: HEADER_HEIGHT, scrollPaddingInlineStart: pinnedWidth }}
            className="@container relative overflow-auto overscroll-contain focus-visible:outline-none"
          >
            {body}
          </div>
          <div className="flex min-h-9 items-center justify-between gap-3 border-t bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
            <span data-slot="data-grid-status" role="status" aria-live="polite" className="tabular-nums">
              {filteredText}
              {selectable && selectedIds.length ? ` · ${msg("data-grid.selectedCount", "{n} selected", { n: nf.format(selectedIds.length) })}` : ""}
            </span>
            {footer ? <span className="min-w-0 truncate">{footer}</span> : null}
          </div>
        </div>
      </StateView>
      <span className="sr-only" aria-live="polite" role="status" id={`${gridId}-announce`}>
        {announce}
      </span>
    </div>
  )
}

/** The input a cell turns into while it is edited. */
function EditorInput<T>({
  column,
  edit,
  onChange,
  onFinish,
  label,
  locale,
  rtl,
}: {
  column: DataGridColumn<T>
  edit: Edit
  onChange: (draft: string) => void
  onFinish: (apply: boolean, then?: "down" | "up" | "next" | "previous") => void
  label: string
  locale: string
  rtl: boolean
}) {
  const ref = React.useRef<HTMLInputElement & HTMLSelectElement>(null)
  const done = React.useRef(false)
  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    el.focus()
    // typing into a cell replaces what is there; Enter and F2 edit it, with the caret at the end
    if ("setSelectionRange" in el && (el as HTMLInputElement).type === "text") {
      const n = el.value.length
      try { el.setSelectionRange(n, n) } catch {}
    }
  }, [])
  const finish = (apply: boolean, then?: "down" | "up" | "next" | "previous") => {
    done.current = true
    onFinish(apply, then)
  }
  const keys = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") finish(true, e.shiftKey ? "up" : "down")
    else if (e.key === "Tab") finish(true, e.shiftKey ? "previous" : "next")
    else if (e.key === "Escape") finish(false)
    else {
      e.stopPropagation()
      return
    }
    e.preventDefault()
    e.stopPropagation()
  }
  const common = {
    ref,
    "aria-label": label,
    "aria-invalid": edit.error ? true : undefined,
    onKeyDown: keys,
    onBlur: () => {
      if (!done.current) onFinish(true)
    },
    className: "h-full w-full min-w-0 bg-transparent text-sm outline-none",
  } as const
  if (column.type === "select") {
    return (
      <select {...common} value={edit.draft} onChange={(e) => onChange(e.target.value)} className={cn(common.className, "cursor-pointer")}>
        <option value="" />
        {column.options?.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    )
  }
  return (
    <input
      {...common}
      type={column.type === "date" ? "date" : "text"}
      inputMode={column.type === "number" ? "decimal" : undefined}
      value={edit.draft}
      onChange={(e) => onChange(e.target.value)}
      dir={column.type === "number" || column.type === "date" ? "ltr" : undefined}
      lang={locale}
      className={cn(common.className, column.type === "number" && (rtl ? "text-start" : "text-end"), column.type === "number" && "tabular-nums")}
    />
  )
}

export {
  DataGrid,
  type DataGridChange,
  type DataGridColumn,
  type DataGridColumnType,
  type DataGridOption,
  type DataGridProps,
  type DataGridSort,
  type DataGridTone,
}
