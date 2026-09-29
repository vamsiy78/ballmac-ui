// Ballmac UI: File Dropzone. https://ui.ballmac.com/components/file-dropzone
"use client"

import * as React from "react"
import { FileUp, X } from "lucide-react"
import { cn } from "@/lib/utils"

type FileDropzoneProps = Omit<React.ComponentProps<"div">, "onChange"> & {
  /** Accepted MIME types or extensions, in native input accept syntax. */
  accept?: string
  /** Allow more than one file. */
  multiple?: boolean
  /** Maximum number of files in the selection. */
  maxFiles?: number
  /** Maximum size of each file in bytes. */
  maxSize?: number
  /** Controlled file selection. */
  files?: File[]
  /** Initial selection when uncontrolled. */
  defaultFiles?: File[]
  /** Called with the complete selection after add or remove. */
  onFilesChange?: (files: File[]) => void
  /** Disable browsing and dropping. */
  disabled?: boolean
}

function FileDropzone({
  accept,
  multiple = true,
  maxFiles = multiple ? 5 : 1,
  maxSize = 10 * 1024 * 1024,
  files,
  defaultFiles = [],
  onFilesChange,
  disabled = false,
  className,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  ...props
}: FileDropzoneProps) {
  const [internalFiles, setInternalFiles] = React.useState<File[]>(defaultFiles)
  const [dragging, setDragging] = React.useState(false)
  const [error, setError] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)
  const id = React.useId()
  const selected = files ?? internalFiles

  function commit(next: File[]) {
    if (files === undefined) setInternalFiles(next)
    onFilesChange?.(next)
  }
  function add(incoming: File[]) {
    const allowed =
      accept
        ?.split(",")
        .map((part) => part.trim().toLowerCase())
        .filter(Boolean) ?? []
    const valid = incoming.filter((file) => {
      const accepted =
        !allowed.length ||
        allowed.some((part) =>
          part.startsWith(".")
            ? file.name.toLowerCase().endsWith(part)
            : part.endsWith("/*")
              ? file.type.startsWith(part.slice(0, -1))
              : file.type.toLowerCase() === part,
        )
      if (!accepted) setError(`${file.name} is not an accepted file type.`)
      else if (file.size > maxSize)
        setError(`${file.name} exceeds the size limit.`)
      return accepted && file.size <= maxSize
    })
    const next = multiple ? [...selected, ...valid] : valid.slice(0, 1)
    if (next.length > maxFiles) {
      setError(`Choose no more than ${maxFiles} files.`)
      return
    }
    if (valid.length) {
      setError("")
      commit(next)
    }
  }

  return (
    <div
      data-slot="file-dropzone"
      className={cn("w-full min-w-0", className)}
      {...props}
    >
      <div
        data-slot="file-dropzone-area"
        data-dragging={dragging || undefined}
        className="flex flex-col items-center rounded-xl border border-dashed border-input bg-card/50 px-5 py-7 text-center transition-[background-color,border-color] duration-150 data-[dragging]:border-ring data-[dragging]:bg-accent motion-reduce:transition-none"
        onDragEnter={(event) => {
          onDragEnter?.(event)
          event.preventDefault()
          if (!disabled) setDragging(true)
        }}
        onDragLeave={(event) => {
          onDragLeave?.(event)
          if (!event.currentTarget.contains(event.relatedTarget as Node))
            setDragging(false)
        }}
        onDragOver={(event) => {
          onDragOver?.(event)
          event.preventDefault()
        }}
        onDrop={(event) => {
          onDrop?.(event)
          event.preventDefault()
          setDragging(false)
          if (!disabled) add(Array.from(event.dataTransfer.files))
        }}
      >
        <FileUp
          aria-hidden="true"
          className="mb-3 size-6 text-muted-foreground"
        />
        <p className="text-sm font-medium">Drop files here or browse</p>
        <p id={id} className="mt-1 text-xs text-muted-foreground">
          {multiple ? `Up to ${maxFiles} files` : "One file"} ·{" "}
          {Math.round(maxSize / 1024 / 1024)} MB each
        </p>
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="mt-4 inline-flex h-9 items-center rounded-md border border-border bg-background px-3 text-sm font-medium shadow-xs outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
        >
          Choose {multiple ? "files" : "file"}
        </button>
        <input
          ref={inputRef}
          type="file"
          aria-label="Files to upload"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          aria-describedby={id}
          tabIndex={-1}
          className="sr-only"
          onChange={(event) => {
            add(Array.from(event.currentTarget.files ?? []))
            event.currentTarget.value = ""
          }}
        />
      </div>
      {error && (
        <p
          data-slot="file-dropzone-error"
          role="alert"
          className="mt-2 text-sm text-destructive"
        >
          {error}
        </p>
      )}
      {selected.length > 0 && (
        <ul
          data-slot="file-dropzone-files"
          className="mt-3 flex flex-col gap-2"
        >
          {selected.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex min-w-0 items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm"
            >
              <span className="min-w-0 flex-1 truncate">{file.name}</span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {Math.max(1, Math.round(file.size / 1024))} KB
              </span>
              <button
                type="button"
                aria-label={`Remove ${file.name}`}
                disabled={disabled}
                onClick={() =>
                  commit(selected.filter((_, position) => position !== index))
                }
                className="flex size-7 shrink-0 items-center justify-center rounded-md outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export { FileDropzone, type FileDropzoneProps }
