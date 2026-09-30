// Ballmac UI: Chat Attachment. https://ui.ballmac.com/components/chat-attachment
"use client"

import * as React from "react"
import {
  AlertCircle,
  Archive,
  AudioLines,
  FileCode2,
  FileSpreadsheet,
  FileText,
  Film,
  Image as ImageIcon,
  File as FileIcon,
  RotateCw,
  X,
} from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

type AttachmentKind = "image" | "pdf" | "code" | "sheet" | "doc" | "archive" | "audio" | "video" | "file"

const KIND_META: Record<AttachmentKind, { label: string; icon: React.ComponentType<{ className?: string }>; tone: string }> = {
  image: { label: "Image", icon: ImageIcon, tone: "bg-chart-2/15 text-chart-2" },
  pdf: { label: "PDF", icon: FileText, tone: "bg-destructive/15 text-destructive" },
  code: { label: "Code", icon: FileCode2, tone: "bg-chart-1/15 text-chart-1" },
  sheet: { label: "Sheet", icon: FileSpreadsheet, tone: "bg-chart-2/15 text-chart-2" },
  doc: { label: "Doc", icon: FileText, tone: "bg-chart-1/15 text-chart-1" },
  archive: { label: "Archive", icon: Archive, tone: "bg-chart-3/15 text-chart-3" },
  audio: { label: "Audio", icon: AudioLines, tone: "bg-chart-4/15 text-chart-4" },
  video: { label: "Video", icon: Film, tone: "bg-chart-5/15 text-chart-5" },
  file: { label: "File", icon: FileIcon, tone: "bg-muted text-muted-foreground" },
}

const EXT: Record<string, AttachmentKind> = {
  png: "image", jpg: "image", jpeg: "image", gif: "image", webp: "image", svg: "image", avif: "image", heic: "image",
  pdf: "pdf",
  ts: "code", tsx: "code", js: "code", jsx: "code", py: "code", go: "code", rs: "code", json: "code", html: "code", css: "code", sh: "code", sql: "code", yml: "code", yaml: "code",
  csv: "sheet", xls: "sheet", xlsx: "sheet", tsv: "sheet",
  doc: "doc", docx: "doc", txt: "doc", md: "doc", rtf: "doc", pages: "doc",
  zip: "archive", gz: "archive", tar: "archive", rar: "archive", "7z": "archive",
  mp3: "audio", wav: "audio", m4a: "audio", ogg: "audio", flac: "audio",
  mp4: "video", mov: "video", webm: "video", mkv: "video",
}

/** Works out the kind of file from its MIME type, then its extension. */
function attachmentKind(name: string, type?: string): AttachmentKind {
  if (type) {
    if (type.startsWith("image/")) return "image"
    if (type.startsWith("audio/")) return "audio"
    if (type.startsWith("video/")) return "video"
    if (type === "application/pdf") return "pdf"
  }
  const ext = name.includes(".") ? name.split(".").pop()!.toLowerCase() : ""
  return EXT[ext] ?? "file"
}

/** 1,536 → "1.5 KB". Uses 1024 steps and a fixed "." so server and browser agree. */
function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes < 0) return ""
  if (bytes < 1024) return `${Math.round(bytes)} B`
  const units = ["KB", "MB", "GB", "TB"]
  let value = bytes / 1024
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit++
  }
  return `${value >= 10 || Number.isInteger(value) ? Math.round(value) : value.toFixed(1)} ${units[unit]}`
}

type ChatAttachmentProps = Omit<React.ComponentProps<"div">, "onClick" | "children"> & {
  /** File name, including its extension. */
  name: string
  /** Size in bytes. */
  size?: number
  /** MIME type, such as `image/png`. Improves the icon and image detection. */
  type?: string
  /** Image URL (or object URL) shown as the thumbnail for images. */
  previewUrl?: string
  /** "ready" is normal, "uploading" shows progress, "error" shows the message and a retry button. */
  status?: "ready" | "uploading" | "error"
  /** Upload progress from 0 to 100. Leave out for an indeterminate bar. */
  progress?: number
  /** Shown in the error state. */
  error?: string
  /** "chip" is a compact row for the composer, "tile" is a square preview for messages and galleries. */
  variant?: "chip" | "tile"
  /** Adds a remove button. Its label is "Remove <name>". */
  onRemove?: () => void
  /** Adds a retry button in the error state. */
  onRetry?: () => void
  /** Makes the attachment a button, for example to open a viewer. */
  onOpen?: () => void
}

function ChatAttachment({
  name,
  size,
  type,
  previewUrl,
  status = "ready",
  progress,
  error = "Upload failed",
  variant = "chip",
  onRemove,
  onRetry,
  onOpen,
  className,
  ...props
}: ChatAttachmentProps) {
  const reduce = useReducedMotion()
  const kind = attachmentKind(name, type)
  const meta = KIND_META[kind]
  const Icon = meta.icon
  const isImage = kind === "image" && !!previewUrl
  const uploading = status === "uploading"
  const failed = status === "error"
  const pct = progress === undefined ? undefined : Math.min(100, Math.max(0, Math.round(progress)))
  const sizeText = size === undefined ? "" : formatFileSize(size)
  const detail = failed ? error : uploading ? (pct === undefined ? "Uploading…" : `Uploading ${pct}%`) : [meta.label, sizeText].filter(Boolean).join(" · ")

  const enter = {
    layout: (reduce ? false : true) as boolean,
    initial: reduce ? { opacity: 0 } : { opacity: 0, scale: 0.92 },
    animate: { opacity: 1, scale: 1 },
    exit: reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9 },
    transition: { type: "spring", stiffness: 420, damping: 34 } as const,
  }

  const progressBar = uploading && (
    <span
      role="progressbar"
      aria-label={`Uploading ${name}`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden bg-foreground/10"
    >
      <span
        className={cn(
          "block h-full bg-foreground transition-[width] duration-200 motion-reduce:transition-none",
          pct === undefined && "w-1/3 animate-pulse motion-reduce:animate-none"
        )}
        style={pct === undefined ? undefined : { width: `${pct}%` }}
      />
    </span>
  )

  const removeButton = onRemove && (
    <button
      type="button"
      onClick={onRemove}
      aria-label={`Remove ${name}`}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-foreground hover:text-background focus-visible:ring-[3px] focus-visible:ring-ring/50",
        variant === "chip" ? "size-6" : "absolute top-1.5 right-1.5 size-6 bg-background/90 text-foreground shadow-sm backdrop-blur"
      )}
    >
      <X aria-hidden="true" className="size-3.5" />
    </button>
  )

  const retryButton = failed && onRetry && (
    <button
      type="button"
      onClick={onRetry}
      aria-label={`Retry uploading ${name}`}
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-md text-xs font-medium text-foreground outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50",
        variant === "chip" ? "h-6 px-1.5" : "h-7 px-2"
      )}
    >
      <RotateCw aria-hidden="true" className="size-3" />
      Retry
    </button>
  )

  const body = (
    <>
      {variant === "chip" ? (
        <>
          <span
            aria-hidden="true"
            className={cn(
              "relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg",
              failed ? "bg-destructive/15 text-destructive" : isImage ? "bg-muted" : meta.tone
            )}
          >
            {isImage && !failed ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="" className="size-full object-cover" />
            ) : failed ? (
              <AlertCircle className="size-4" />
            ) : (
              <Icon className="size-4" />
            )}
          </span>
          <span className="grid min-w-0 flex-1 text-left">
            <span className="truncate text-[13px] leading-5 font-medium text-foreground">{name}</span>
            <span className="truncate text-xs leading-4 text-muted-foreground tabular-nums">{detail}</span>
          </span>
        </>
      ) : (
        <>
          {isImage && !failed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="" aria-hidden="true" className="absolute inset-0 size-full object-cover" />
          ) : (
            <span
              aria-hidden="true"
              className={cn(
                "absolute inset-0 flex items-start p-3",
                failed ? "bg-destructive/10 text-destructive" : meta.tone
              )}
            >
              {failed ? <AlertCircle className="size-6" /> : <Icon className="size-6" />}
            </span>
          )}
          <span
            className={cn(
              "absolute inset-x-0 bottom-0 grid gap-px px-2.5 pb-2 text-left",
              isImage && !failed ? "bg-gradient-to-t from-black/70 via-black/45 to-transparent pt-7" : "pt-2"
            )}
          >
            <span className={cn("truncate text-xs leading-4 font-medium", isImage && !failed ? "text-white" : "text-foreground")}>{name}</span>
            <span className={cn("truncate text-[11px] leading-4 tabular-nums", isImage && !failed ? "text-white/80" : "text-foreground/80")}>{detail}</span>
          </span>
        </>
      )}
    </>
  )

  const shell =
    variant === "chip"
      ? cn(
          "relative flex h-14 w-72 max-w-full items-center gap-2.5 overflow-hidden rounded-xl border bg-card py-2 pr-2 pl-2 text-card-foreground shadow-xs",
          failed && "border-destructive/50"
        )
      : cn(
          "group/tile relative aspect-square w-28 overflow-hidden rounded-xl border bg-card shadow-xs",
          failed && "border-destructive/50"
        )

  // The open action covers the tile; remove and retry stay siblings, so there are no nested buttons.
  return (
    <motion.div
      data-slot="chat-attachment"
      data-variant={variant}
      data-status={status}
      role="listitem"
      className={cn(shell, className)}
      {...enter}
      {...(props as object)}
    >
      {onOpen && !failed && !uploading ? (
        <button
          type="button"
          onClick={onOpen}
          aria-label={`Open ${name}`}
          className={cn(
            "absolute inset-0 z-0 flex items-center rounded-[inherit] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
            variant === "chip" ? "gap-2.5 py-2 pr-9 pl-2 hover:bg-accent/50" : ""
          )}
        >
          {variant === "chip" ? body : <>{body}</>}
        </button>
      ) : (
        <>{body}</>
      )}
      {progressBar}
      {variant === "chip" ? (
        <span className="relative z-10 ml-auto flex shrink-0 items-center gap-0.5">
          {retryButton}
          {removeButton}
        </span>
      ) : (
        <>
          {removeButton && <span className="opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within/tile:opacity-100 [@media(hover:hover)]:group-hover/tile:opacity-100">{removeButton}</span>}
          {retryButton && <span className="absolute top-1.5 left-1.5 rounded-md bg-background/90 backdrop-blur">{retryButton}</span>}
        </>
      )}
    </motion.div>
  )
}

type ChatAttachmentListProps = React.ComponentProps<"div"> & {
  /** Accessible name of the list. */
  label?: string
}

/** A wrapping row of attachments. Removing one animates the others into place. */
function ChatAttachmentList({ label = "Attachments", className, children, ...props }: ChatAttachmentListProps) {
  return (
    <div
      data-slot="chat-attachment-list"
      role="list"
      aria-label={label}
      className={cn("flex flex-wrap gap-2", className)}
      {...props}
    >
      <AnimatePresence initial={false} mode="popLayout">
        {children}
      </AnimatePresence>
    </div>
  )
}

export {
  ChatAttachment,
  ChatAttachmentList,
  attachmentKind,
  formatFileSize,
  type ChatAttachmentProps,
  type ChatAttachmentListProps,
  type AttachmentKind,
}
