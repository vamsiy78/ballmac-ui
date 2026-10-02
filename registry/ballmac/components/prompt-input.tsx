// Ballmac UI: Prompt Input. https://ui.ballmac.com/components/prompt-input
"use client"

import * as React from "react"
import { ArrowUp, FileText, Image as ImageIcon, Paperclip, Square, X } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"

type PromptInputStatus = "idle" | "streaming"

type PromptInputContextValue = {
  value: string
  setValue: (value: string) => void
  files: File[]
  setFiles: (files: File[]) => void
  status: PromptInputStatus
  disabled: boolean
  canSubmit: boolean
  submit: () => void
  stop?: () => void
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
}

const PromptInputContext = React.createContext<PromptInputContextValue | null>(null)

function usePromptInput() {
  const ctx = React.useContext(PromptInputContext)
  if (!ctx) throw new Error("PromptInput parts must be rendered inside <PromptInput>.")
  return ctx
}

function useControllable<T>(prop: T | undefined, defaultValue: T, onChange?: (value: T) => void) {
  const [internal, setInternal] = React.useState(defaultValue)
  const controlled = prop !== undefined
  const value = controlled ? prop : internal
  const onChangeRef = React.useRef(onChange)
  React.useEffect(() => {
    onChangeRef.current = onChange
  })
  const setValue = React.useCallback(
    (next: T) => {
      if (!controlled) setInternal(next)
      onChangeRef.current?.(next)
    },
    [controlled]
  )
  return [value, setValue] as const
}

type PromptInputProps = Omit<React.ComponentProps<"form">, "onSubmit" | "defaultValue"> & {
  /** Called with the trimmed text and attached files on Enter or the send button. Uncontrolled inputs clear themselves afterwards. */
  onSubmit?: (value: string, files: File[]) => void
  /** Controlled text. Clear it yourself in onSubmit. */
  value?: string
  /** Initial text when uncontrolled. */
  defaultValue?: string
  /** Called on every edit. */
  onValueChange?: (value: string) => void
  /** Controlled attachments. */
  files?: File[]
  /** Called when files are attached or removed. Nothing is uploaded; that is your job. */
  onFilesChange?: (files: File[]) => void
  /** "streaming" turns the send button into a Stop button and blocks new submissions. */
  status?: PromptInputStatus
  /** Called by the Stop button while streaming. */
  onStop?: () => void
  /** Disables typing, attaching and sending. */
  disabled?: boolean
}

function PromptInput({
  onSubmit,
  value: valueProp,
  defaultValue = "",
  onValueChange,
  files: filesProp,
  onFilesChange,
  status = "idle",
  onStop,
  disabled = false,
  className,
  children,
  ...props
}: PromptInputProps) {
  const [value, setValue] = useControllable(valueProp, defaultValue, onValueChange)
  const [files, setFiles] = useControllable<File[]>(filesProp, [], onFilesChange)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const canSubmit = !disabled && status !== "streaming" && (value.trim().length > 0 || files.length > 0)

  const submit = React.useCallback(() => {
    if (!canSubmit) return
    onSubmit?.(value.trim(), files)
    if (valueProp === undefined) setValue("")
    if (filesProp === undefined) setFiles([])
  }, [canSubmit, onSubmit, value, files, valueProp, filesProp, setValue, setFiles])

  const ctx = React.useMemo<PromptInputContextValue>(
    () => ({ value, setValue, files, setFiles, status, disabled, canSubmit, submit, stop: onStop, textareaRef }),
    [value, setValue, files, setFiles, status, disabled, canSubmit, submit, onStop]
  )

  return (
    <PromptInputContext.Provider value={ctx}>
      <form
        data-slot="prompt-input"
        data-status={status}
        data-disabled={disabled || undefined}
        className={cn(
          "flex w-full cursor-text flex-col rounded-xl border border-input bg-card shadow-xs transition-[border-color,box-shadow] duration-150 focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-60",
          className
        )}
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
        onMouseDown={(event) => {
          // Clicking the padding focuses the textarea, like a single field.
          if (event.target === event.currentTarget) {
            event.preventDefault()
            textareaRef.current?.focus()
          }
        }}
        {...props}
      >
        {children ?? (
          <>
            <PromptInputAttachments />
            <PromptInputTextarea />
            <PromptInputToolbar>
              {onFilesChange ? <PromptInputAttachButton /> : null}
              <PromptInputSubmit />
            </PromptInputToolbar>
          </>
        )}
      </form>
    </PromptInputContext.Provider>
  )
}

type PromptInputTextareaProps = Omit<React.ComponentProps<"textarea">, "value" | "defaultValue"> & {
  /** Height (px) the textarea grows to before it scrolls. */
  maxHeight?: number
}

function PromptInputTextarea({
  maxHeight = 200,
  placeholder,
  className,
  onKeyDown,
  onChange,
  ref,
  style,
  ...props
}: PromptInputTextareaProps) {
  const msg = useMessages()
  placeholder ??= msg("prompt-input.placeholder", "Send a message…")
  const { value, setValue, submit, disabled, textareaRef } = usePromptInput()

  const setRefs = React.useCallback(
    (node: HTMLTextAreaElement | null) => {
      textareaRef.current = node
      if (typeof ref === "function") ref(node)
      else if (ref) ref.current = node
    },
    [ref, textareaRef]
  )

  // Grow with the content (no dependency): measure from auto height each change.
  React.useLayoutEffect(() => {
    const node = textareaRef.current
    if (!node) return
    node.style.height = "auto"
    node.style.height = `${Math.min(node.scrollHeight, maxHeight)}px`
    node.style.overflowY = node.scrollHeight > maxHeight ? "auto" : "hidden"
  }, [value, maxHeight, textareaRef])

  return (
    <textarea
      ref={setRefs}
      data-slot="prompt-input-textarea"
      rows={1}
      aria-label={props["aria-labelledby"] ? undefined : msg("prompt-input.message", "Message")}
      placeholder={placeholder}
      disabled={disabled}
      value={value}
      onChange={(event) => {
        onChange?.(event)
        setValue(event.target.value)
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (event.defaultPrevented) return
        // Enter sends; Shift+Enter inserts a newline; ignore Enter that confirms an IME composition.
        if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) {
          event.preventDefault()
          submit()
        }
      }}
      style={{ maxHeight, ...style }}
      className={cn(
        "block min-h-11 w-full resize-none bg-transparent px-3.5 pt-3 pb-1 text-sm leading-6 outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  )
}

type PromptInputToolbarProps = React.ComponentProps<"div">

/** The bottom row: attach button, model pickers or other controls on the left, send/stop on the right. */
function PromptInputToolbar({ className, ...props }: PromptInputToolbarProps) {
  return (
    <div
      data-slot="prompt-input-toolbar"
      className={cn("flex min-w-0 flex-wrap items-center gap-1 px-2 pb-2", className)}
      {...props}
    />
  )
}

type PromptInputSubmitProps = Omit<React.ComponentProps<typeof Button>, "type" | "onClick"> & {
  /** Accessible name of the send button. */
  submitLabel?: string
  /** Accessible name of the stop button. */
  stopLabel?: string
}

function PromptInputSubmit({
  submitLabel,
  stopLabel,
  className,
  children,
  ...props
}: PromptInputSubmitProps) {
  const msg = useMessages()
  submitLabel ??= msg("prompt-input.submitLabel", "Send message")
  stopLabel ??= msg("prompt-input.stopLabel", "Stop generating")
  const { status, canSubmit, stop, disabled } = usePromptInput()
  const streaming = status === "streaming"
  return (
    <Button
      data-slot="prompt-input-submit"
      data-status={status}
      type={streaming ? "button" : "submit"}
      size="icon-sm"
      shape="pill"
      aria-label={streaming ? stopLabel : submitLabel}
      title={streaming ? stopLabel : submitLabel}
      disabled={streaming ? disabled || !stop : !canSubmit}
      onClick={streaming ? () => stop?.() : undefined}
      className={cn("ms-auto", className)}
      {...props}
    >
      {children ?? (streaming ? <Square className="size-3 fill-current" /> : <ArrowUp />)}
    </Button>
  )
}

type PromptInputAttachButtonProps = Omit<React.ComponentProps<typeof Button>, "type" | "onClick"> & {
  /** File types to accept, as for <input type="file" accept>. */
  accept?: string
  /** Allow picking several files at once. */
  multiple?: boolean
  /** Accessible name of the icon button. */
  label?: string
}

function PromptInputAttachButton({
  accept,
  multiple = true,
  label,
  className,
  children,
  ...props
}: PromptInputAttachButtonProps) {
  const msg = useMessages()
  label ??= msg("prompt-input.label", "Attach files")
  const { files, setFiles, disabled } = usePromptInput()
  const inputRef = React.useRef<HTMLInputElement>(null)
  return (
    <>
      <input
        ref={inputRef}
        type="file"
        tabIndex={-1}
        aria-hidden="true"
        className="hidden"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={(event) => {
          const picked = Array.from(event.target.files ?? [])
          if (picked.length) setFiles(multiple ? [...files, ...picked] : picked.slice(0, 1))
          event.target.value = ""
        }}
      />
      <Button
        data-slot="prompt-input-attach"
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={label}
        title={label}
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className={cn("text-muted-foreground hover:text-foreground", className)}
        {...props}
      >
        {children ?? <Paperclip />}
      </Button>
    </>
  )
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

type PromptInputAttachmentsProps = React.ComponentProps<"ul">

/** Removable chips for the attached files. Renders nothing when there are none. */
function PromptInputAttachments({ className, ...props }: PromptInputAttachmentsProps) {
  const msg = useMessages()
  const { files, setFiles, disabled } = usePromptInput()
  if (!files.length) return null
  return (
    <ul
      data-slot="prompt-input-attachments"
      aria-label={msg("prompt-input.attachments", "Attachments")}
      className={cn("flex flex-wrap gap-1.5 px-2.5 pt-2.5", className)}
      {...props}
    >
      {files.map((file, index) => {
        const Icon = file.type.startsWith("image/") ? ImageIcon : FileText
        return (
          <li
            key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
            data-slot="prompt-input-attachment"
            className="flex h-8 max-w-full items-center gap-1.5 rounded-md border bg-muted/50 pe-1 ps-2 text-xs"
          >
            <Icon aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="max-w-40 truncate font-medium">{file.name}</span>
            <span className="shrink-0 font-mono text-[11px] text-muted-foreground tabular-nums">{formatBytes(file.size)}</span>
            <button
              type="button"
              aria-label={msg("prompt-input.remove", "Remove {name}", { name: file.name })}
              disabled={disabled}
              onClick={() => setFiles(files.filter((_, i) => i !== index))}
              className="flex size-6 shrink-0 items-center justify-center rounded-sm text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
            >
              <X aria-hidden="true" className="size-3.5" />
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export {
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputSubmit,
  PromptInputAttachButton,
  PromptInputAttachments,
  usePromptInput,
  type PromptInputProps,
  type PromptInputTextareaProps,
  type PromptInputToolbarProps,
  type PromptInputSubmitProps,
  type PromptInputAttachButtonProps,
  type PromptInputAttachmentsProps,
  type PromptInputStatus,
}
