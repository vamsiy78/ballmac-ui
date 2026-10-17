// Ballmac UI: Upload 1. https://ui.ballmac.com/blocks/upload-1
"use client"

import * as React from "react"
import { CircleAlert, CircleCheck, Clock, FileText, Image as ImageIcon, Loader2, RotateCw, Sheet, UploadCloud, X } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { Media } from "@/components/ballmac/media"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Upload1Status = "queued" | "uploading" | "processing" | "done" | "failed"

type Upload1Item = {
  id: string
  name: string
  /** Size in bytes. */
  size: number
  status: Upload1Status
  /** From 0 to 1 while uploading. */
  progress?: number
  /** Why it failed. */
  error?: string
  /** A picture to show instead of the file-type tile, such as an object URL. */
  preview?: string
}

type Upload1Props = Omit<React.ComponentProps<"section">, "title" | "onChange"> &
  StateProps & {
    title?: string
    description?: string
    /** Accepted types in the native input syntax: ".pdf", "image/*", "text/csv". */
    accept?: string
    /** The accepted types as people read them ("PNG, JPG, PDF or CSV"). */
    acceptLabel?: string
    /** The most bytes one file may have. */
    maxSize?: number
    /** The most files at once. */
    maxFiles?: number
    /** How many files upload at the same time. */
    concurrency?: number
    /** Files shown when the page opens, for example earlier uploads. They are display only: they have no file to retry. */
    defaultItems?: Upload1Item[]
    /**
     * Uploads one file. Call `report` with progress from 0 to 1; resolve when the server has the file, throw to mark it failed (the
     * message is shown). `signal` aborts when the person cancels. Without it the block simulates an upload.
     */
    onUpload?: (file: File, report: (progress: number) => void, signal: AbortSignal) => Promise<void>
    /** Called whenever the list changes. */
    onItemsChange?: (items: Upload1Item[]) => void
  }

const sample: Upload1Item[] = [
  { id: "s1", name: "Q3 report.pdf", size: 2_410_000, status: "done" },
  { id: "s2", name: "team-photo.jpg", size: 5_120_000, status: "uploading", progress: 0.62 },
  { id: "s3", name: "pricing-table.csv", size: 18_400, status: "processing" },
  { id: "s4", name: "raw-footage.mov", size: 48_300_000, status: "failed", error: "Too large. The most is 10 MB." },
  { id: "s5", name: "logo-final.png", size: 640_000, status: "queued" },
]

const bytes = (n: number) => (n < 1000 ? `${n} B` : n < 1_000_000 ? `${(n / 1000).toFixed(n < 10_000 ? 1 : 0)} KB` : `${(n / 1_000_000).toFixed(n < 10_000_000 ? 1 : 0)} MB`)
const extOf = (name: string) => (name.includes(".") ? name.split(".").pop()!.toUpperCase().slice(0, 4) : "FILE")

function accepts(file: File, accept: string) {
  const rules = accept.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
  if (!rules.length) return true
  return rules.some((r) => (r.startsWith(".") ? file.name.toLowerCase().endsWith(r) : r.endsWith("/*") ? file.type.startsWith(r.slice(0, -1)) : file.type === r))
}

const sleep = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, ms)
    signal.addEventListener("abort", () => {
      clearTimeout(t)
      reject(new DOMException("Cancelled", "AbortError"))
    })
  })

function tileFor(item: Upload1Item) {
  const ext = extOf(item.name)
  if (/^(PNG|JPG|JPEG|GIF|WEBP|SVG|AVIF)$/.test(ext)) return { icon: <ImageIcon />, tone: "bg-chart-4/20" }
  if (/^(CSV|XLS|XLSX)$/.test(ext)) return { icon: <Sheet />, tone: "bg-chart-2/20" }
  return { icon: <FileText />, tone: "bg-chart-1/20" }
}

function UploadSkeleton() {
  return (
    <div className="grid gap-4" aria-hidden="true">
      <Skeleton className="h-56 rounded-3xl" />
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-[4.5rem] rounded-xl" />
      ))}
    </div>
  )
}

/**
 * An upload manager: a drop area that wakes up when files are dragged over it, validation that explains each rejection, and a list where
 * every file has its own state (waiting, uploading with progress, finishing, done, or failed with the reason and a retry), with previews
 * of images, cancel, and a summary with Clear completed.
 */
function Upload1({
  title = "Upload files",
  description = "Add the files for this project. You can keep working while they upload.",
  accept = "image/*,.pdf,.csv",
  acceptLabel = "PNG, JPG, PDF or CSV",
  maxSize = 10_000_000,
  maxFiles = 10,
  concurrency = 2,
  defaultItems = sample,
  onUpload,
  onItemsChange,
  state = "ready",
  onRetry,
  errorState,
  className,
  ...props
}: Upload1Props) {
  const id = React.useId()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [items, setItems] = React.useState<Upload1Item[]>(defaultItems)
  const [dragging, setDragging] = React.useState(false)
  const [announce, setAnnounce] = React.useState("")
  const files = React.useRef(new Map<string, File>())
  const controllers = React.useRef(new Map<string, AbortController>())
  const queue = React.useRef<string[]>([])
  const running = React.useRef(0)
  const counter = React.useRef(0)
  const dragDepth = React.useRef(0)
  const unavailable = state === "error"
  const shown = state === "empty" ? [] : items

  const patch = React.useCallback((itemId: string, changes: Partial<Upload1Item>) => setItems((l) => l.map((i) => (i.id === itemId ? { ...i, ...changes } : i))), [])
  React.useEffect(() => {
    onItemsChange?.(items)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items])
  // release everything on unmount: stop uploads, and below free the preview pictures
  React.useEffect(() => {
    const ctrls = controllers.current
    return () => {
      ctrls.forEach((c) => c.abort())
    }
  }, [])
  const previews = React.useRef(new Set<string>())
  React.useEffect(() => {
    const urls = previews.current
    return () => urls.forEach((u) => URL.revokeObjectURL(u))
  }, [])

  const pump = React.useCallback(() => {
    while (running.current < concurrency && queue.current.length) {
      const itemId = queue.current.shift()!
      const file = files.current.get(itemId)
      if (!file) continue
      running.current += 1
      const controller = new AbortController()
      controllers.current.set(itemId, controller)
      patch(itemId, { status: "uploading", progress: 0, error: undefined })
      const report = (p: number) => patch(itemId, p >= 1 ? { status: "processing", progress: 1 } : { progress: Math.max(0, p) })
      ;(async () => {
        try {
          if (onUpload) await onUpload(file, report, controller.signal)
          else {
            for (let p = 0; p < 1; ) {
              await sleep(120, controller.signal)
              p = Math.min(1, p + 0.1 + (file.size % 7) / 100)
              report(p)
            }
            await sleep(700, controller.signal)
          }
          patch(itemId, { status: "done", progress: 1 })
          setAnnounce(`${file.name} uploaded`)
        } catch (err) {
          const cancelled = controller.signal.aborted
          patch(itemId, { status: "failed", error: cancelled ? "Cancelled." : err instanceof Error && err.message ? err.message : "The upload failed. Check your connection and retry." })
          setAnnounce(cancelled ? `${file.name} cancelled` : `${file.name} failed to upload`)
        } finally {
          controllers.current.delete(itemId)
          running.current -= 1
          pump()
        }
      })()
    }
  }, [concurrency, onUpload, patch])

  function add(list: File[]) {
    if (!list.length || unavailable) return
    const next: Upload1Item[] = []
    let room = Math.max(0, maxFiles - items.filter((i) => i.status !== "failed").length)
    for (const file of list) {
      const itemId = `${id}-${++counter.current}`
      const base = { id: itemId, name: file.name, size: file.size }
      if (!accepts(file, accept)) next.push({ ...base, status: "failed", error: `Not allowed. Use ${acceptLabel}.` })
      else if (file.size > maxSize) next.push({ ...base, status: "failed", error: `Too large. The most is ${bytes(maxSize)}.` })
      else if (room <= 0) next.push({ ...base, status: "failed", error: `Only ${maxFiles} files at a time.` })
      else {
        room -= 1
        files.current.set(itemId, file)
        let preview: string | undefined
        if (file.type.startsWith("image/")) {
          preview = URL.createObjectURL(file)
          previews.current.add(preview)
        }
        next.push({ ...base, status: "queued", progress: 0, preview })
        queue.current.push(itemId)
      }
    }
    setItems((l) => [...next, ...l])
    setAnnounce(`${next.length} ${next.length === 1 ? "file" : "files"} added`)
    pump()
  }

  function remove(item: Upload1Item) {
    controllers.current.get(item.id)?.abort()
    queue.current = queue.current.filter((q) => q !== item.id)
    files.current.delete(item.id)
    if (item.preview) {
      URL.revokeObjectURL(item.preview)
      previews.current.delete(item.preview)
    }
    setItems((l) => l.filter((i) => i.id !== item.id))
  }

  function retry(item: Upload1Item) {
    if (!files.current.has(item.id)) return
    patch(item.id, { status: "queued", progress: 0, error: undefined })
    queue.current.push(item.id)
    pump()
  }

  const total = shown.length
  const done = shown.filter((i) => i.status === "done").length
  const active = shown.some((i) => i.status === "uploading" || i.status === "queued" || i.status === "processing")
  const overall = total ? shown.reduce((sum, i) => sum + (i.status === "done" || i.status === "processing" ? 1 : (i.progress ?? 0)), 0) / total : 0
  const failed = shown.filter((i) => i.status === "failed").length

  const drop = (
    <div
      role="group"
      aria-labelledby={`${id}-drop`}
      onDragEnter={(e) => {
        e.preventDefault()
        dragDepth.current += 1
        if (!unavailable) setDragging(true)
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={() => {
        dragDepth.current = Math.max(0, dragDepth.current - 1)
        if (!dragDepth.current) setDragging(false)
      }}
      onDrop={(e) => {
        e.preventDefault()
        dragDepth.current = 0
        setDragging(false)
        add([...e.dataTransfer.files])
      }}
      className={cn(
        "relative isolate flex flex-col items-center rounded-3xl border-2 border-dashed px-6 py-12 text-center transition-[border-color,background-color,transform] duration-200 motion-reduce:transition-none",
        dragging ? "border-primary bg-accent/60 scale-[1.01] motion-reduce:scale-100" : "border-border hover:border-foreground/30 hover:bg-accent/20",
        unavailable && "bg-muted/40 pointer-events-none border-border"
      )}
    >
      <span aria-hidden="true" className={cn("bg-muted flex size-14 items-center justify-center rounded-2xl transition-transform duration-200 motion-reduce:transition-none [&_svg]:size-7", dragging && "bg-primary text-primary-foreground -translate-y-1 motion-reduce:translate-y-0")}>
        <UploadCloud />
      </span>
      <p id={`${id}-drop`} className="mt-5 text-lg font-semibold tracking-tight">
        {dragging ? "Drop to upload" : "Drag files here"}
      </p>
      <p className="text-muted-foreground mt-1 text-sm">
        or{" "}
        <button
          type="button"
          disabled={unavailable}
          onClick={() => inputRef.current?.click()}
          className="text-foreground focus-visible:ring-ring/50 rounded-sm font-medium underline underline-offset-4 outline-none focus-visible:ring-[3px]"
        >
          browse your computer
        </button>
      </p>
      <p className="text-muted-foreground mt-4 text-xs text-pretty">
        {acceptLabel} · up to {bytes(maxSize)} each · {maxFiles} files at a time
      </p>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
        onChange={(e) => {
          add([...(e.target.files ?? [])])
          e.target.value = ""
        }}
      />
    </div>
  )

  const content = (
    <div className="grid gap-6">
      {unavailable ? (
        <div role="alert" className="border-destructive/30 bg-destructive/5 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm">
          <CircleAlert aria-hidden="true" className="text-destructive mt-0.5 size-4 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-medium">{errorState?.title ?? "Uploads are unavailable right now"}</p>
            <p className="text-muted-foreground mt-0.5 text-xs text-pretty">{errorState?.description ?? "Your files were not lost. Try again in a moment."}</p>
          </div>
          {onRetry ? (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RotateCw aria-hidden="true" />
              Try again
            </Button>
          ) : null}
        </div>
      ) : null}
      {drop}

      {total ? (
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="min-w-0 flex-1 basis-48">
              <h2 className="text-sm font-semibold tabular-nums">
                {done} of {total} uploaded
                {failed ? <span className="text-destructive font-normal"> · {failed} failed</span> : null}
              </h2>
              <div role="progressbar" aria-label="All uploads" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(overall * 100)} className="bg-muted mt-2 h-1.5 overflow-hidden rounded-full">
                <div className={cn("h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none", done === total ? "bg-chart-2" : "bg-primary")} style={{ width: `${Math.round(overall * 100)}%` }} />
              </div>
            </div>
            <div className="flex gap-2">
              {active ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    queue.current = []
                    controllers.current.forEach((c) => c.abort())
                    setItems((l) => l.map((i) => (i.status === "queued" ? { ...i, status: "failed", error: "Cancelled." } : i)))
                  }}
                >
                  Cancel all
                </Button>
              ) : null}
              {done ? (
                <Button variant="ghost" size="sm" onClick={() => shown.filter((i) => i.status === "done").forEach(remove)}>
                  Clear completed
                </Button>
              ) : null}
            </div>
          </div>
          <ul aria-label="Files" className="grid gap-2">
            {shown.map((i) => {
              const tile = tileFor(i)
              const pct = Math.round((i.progress ?? 0) * 100)
              const canRetry = i.status === "failed" && files.current.has(i.id)
              return (
                <li key={i.id} className={cn("bg-card flex items-center gap-4 rounded-xl border p-3 pe-2 transition-colors duration-200", i.status === "failed" && "border-destructive/40")}>
                  <span aria-hidden="true" className={cn("relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg [&_svg]:size-5", tile.tone)}>
                    {i.preview ? <Media media={i.preview} alt="" fill className="absolute inset-0" /> : <span className="font-mono text-[10px] font-semibold">{extOf(i.name)}</span>}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{i.name}</p>
                    {i.status === "uploading" ? (
                      <>
                        <div role="progressbar" aria-label={`${i.name} upload`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} className="bg-muted mt-1.5 h-1.5 overflow-hidden rounded-full">
                          <div className="bg-primary h-full rounded-full transition-[width] duration-150 motion-reduce:transition-none" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-muted-foreground mt-1 text-xs tabular-nums">
                          {pct}% · {bytes(Math.round(i.size * (i.progress ?? 0)))} of {bytes(i.size)}
                        </p>
                      </>
                    ) : (
                      <p className={cn("mt-0.5 flex items-center gap-1.5 text-xs", i.status === "failed" ? "text-destructive" : "text-muted-foreground")}>
                        {i.status === "queued" ? <Clock aria-hidden="true" className="size-3.5" /> : null}
                        {i.status === "processing" ? <Loader2 aria-hidden="true" className="size-3.5 animate-spin motion-reduce:animate-none" /> : null}
                        {i.status === "done" ? <CircleCheck aria-hidden="true" className="text-chart-2 size-3.5" /> : null}
                        {i.status === "failed" ? <CircleAlert aria-hidden="true" className="size-3.5" /> : null}
                        <span className="tabular-nums">
                          {bytes(i.size)} · {i.status === "queued" ? "Waiting" : i.status === "processing" ? "Finishing up" : i.status === "done" ? "Uploaded" : i.error ?? "Failed"}
                        </span>
                      </p>
                    )}
                  </div>
                  {canRetry ? (
                    <Button variant="outline" size="sm" onClick={() => retry(i)} aria-label={`Retry ${i.name}`}>
                      <RotateCw aria-hidden="true" />
                      Retry
                    </Button>
                  ) : null}
                  <Button variant="ghost" size="icon-sm" onClick={() => remove(i)} aria-label={i.status === "uploading" || i.status === "queued" ? `Cancel ${i.name}` : `Remove ${i.name}`}>
                    <X aria-hidden="true" />
                  </Button>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}
    </div>
  )

  return (
    <section data-slot="upload-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-2xl px-4 py-8 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-6">
        <h1 id={`${id}-title`} className="text-3xl font-semibold tracking-[-0.035em]">
          {title}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm text-pretty">{description}</p>
      </header>
      <StateView state={state === "loading" ? "loading" : "ready"} label="Loading uploads" loading={<UploadSkeleton />}>
        {content}
      </StateView>
      <p aria-live="polite" className="sr-only">
        {announce}
      </p>
    </section>
  )
}

export { Upload1, type Upload1Props, type Upload1Item, type Upload1Status }
