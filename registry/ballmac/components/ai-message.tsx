// Ballmac UI: AI Message. https://ui.ballmac.com/components/ai-message
"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { cn } from "@/lib/utils"
import { useLocale, useMessages } from "@/lib/ballmac/i18n"

type MessageRole = "user" | "assistant" | "system"

const MessageContext = React.createContext<{ role: MessageRole }>({ role: "assistant" })

type MessageProps = Omit<React.ComponentProps<"div">, "role"> & {
  /** Who sent the message. User messages sit right in a bubble; assistant messages run full width; system messages are centered notes. */
  role?: MessageRole
}

function Message({ role = "assistant", className, ...props }: MessageProps) {
  const value = React.useMemo(() => ({ role }), [role])
  return (
    <MessageContext.Provider value={value}>
      <div
        data-slot="message"
        data-role={role}
        className={cn(
          "group/message grid w-full gap-y-1.5 has-[>[data-slot=message-avatar]]:gap-x-3",
          role === "user" && "grid-cols-[minmax(0,1fr)_auto]",
          role === "assistant" && "grid-cols-[auto_minmax(0,1fr)]",
          role === "system" && "grid-cols-1 justify-items-center",
          className
        )}
        {...props}
      />
    </MessageContext.Provider>
  )
}

/** Column placement shared by every part except the avatar. */
function useBodyPlacement() {
  const { role } = React.useContext(MessageContext)
  if (role === "user") return "col-start-1 justify-self-end"
  if (role === "assistant") return "col-start-2 justify-self-start"
  return "col-start-1"
}

type MessageAvatarProps = React.ComponentProps<"div">

function MessageAvatar({ className, ...props }: MessageAvatarProps) {
  const { role } = React.useContext(MessageContext)
  return (
    <div
      data-slot="message-avatar"
      className={cn(
        "row-start-1 flex size-8 shrink-0 items-center justify-center self-start overflow-hidden rounded-full border bg-muted font-mono text-[11px] font-medium text-muted-foreground [&_img]:size-full [&_img]:object-cover [&_svg]:size-4",
        role === "user" ? "col-start-2" : "col-start-1",
        role === "system" && "hidden",
        className
      )}
      {...props}
    />
  )
}

type MessageContentProps = React.ComponentProps<"div">

function MessageContent({ className, ...props }: MessageContentProps) {
  const { role } = React.useContext(MessageContext)
  const placement = useBodyPlacement()
  return (
    <div
      data-slot="message-content"
      className={cn(
        placement,
        "min-w-0 text-sm break-words",
        role === "user" &&
          "max-w-[85%] rounded-xl rounded-ee-sm bg-muted px-3.5 py-2 leading-6 whitespace-pre-wrap text-foreground",
        role === "assistant" &&
          "w-full leading-7 text-foreground [&_code]:font-mono [&_code]:text-[0.9em] [&_pre]:overflow-x-auto [&>*+*]:mt-3 [&_ol]:list-decimal [&_ol]:ps-5 [&_ul]:list-disc [&_ul]:ps-5",
        role === "system" &&
          "rounded-md border border-dashed px-3 py-1.5 text-center font-mono text-xs text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

type MessageActionsProps = React.ComponentProps<"div"> & {
  /** "hover" reveals the row on hover or keyboard focus on devices with a mouse (always visible on touch). "always" keeps it visible. */
  visibility?: "hover" | "always"
}

function MessageActions({ visibility = "hover", className, ...props }: MessageActionsProps) {
  const msg = useMessages()
  const { role } = React.useContext(MessageContext)
  const placement = useBodyPlacement()
  return (
    <div
      data-slot="message-actions"
      role="toolbar"
      aria-label={msg("ai-message.messageActions", "Message actions")}
      className={cn(
        placement,
        "flex items-center gap-0.5",
        role === "assistant" && "-ms-1.5",
        visibility === "hover" &&
          "transition-opacity duration-150 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within/message:opacity-100 [@media(hover:hover)]:group-hover/message:opacity-100",
        className
      )}
      {...props}
    />
  )
}

type MessageActionProps = Omit<React.ComponentProps<typeof Button>, "variant" | "size"> & {
  /** Accessible name for the icon-only button, also shown as a native tooltip. */
  label: string
}

function MessageAction({ label, className, ...props }: MessageActionProps) {
  return (
    <Button
      data-slot="message-action"
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      title={label}
      className={cn(
        "size-7 text-muted-foreground hover:text-foreground aria-pressed:text-foreground focus-visible:ring-offset-0 [&_svg:not([class*='size-'])]:size-3.5",
        className
      )}
      {...props}
    />
  )
}

type MessageCopyActionProps = Omit<MessageActionProps, "label" | "onClick"> & {
  /** Text written to the clipboard, usually the message's raw markdown. */
  value: string
  /** Accessible name before copying. */
  label?: string
  /** Called after the text was copied. */
  onCopied?: () => void
}

function MessageCopyAction({ value, label, onCopied, ...props }: MessageCopyActionProps) {
  const msg = useMessages()
  label ??= msg("ai-message.label", "Copy message")
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  React.useEffect(() => () => clearTimeout(timer.current), [])

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      return
    }
    setCopied(true)
    onCopied?.()
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 1800)
  }

  return (
    <>
      <MessageAction label={copied ? "Copied" : label} onClick={copy} {...props}>
        {copied ? <Check /> : <Copy />}
      </MessageAction>
      <span className="sr-only" aria-live="polite">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </>
  )
}

type MessageTimestampProps = Omit<React.ComponentProps<"time">, "children"> & {
  /** When the message was sent. */
  date: Date | string | number
  /** BCP 47 locale for formatting. */
  locale?: string
  /** IANA time zone. When omitted the viewer's zone is used, formatted after hydration so server and browser agree. */
  timeZone?: string
  /** Intl.DateTimeFormat options. */
  format?: Intl.DateTimeFormatOptions
  /** Preformatted text; overrides the built-in formatting. */
  children?: React.ReactNode
}

const subscribeNothing = () => () => {}

function MessageTimestamp({
  date,
  locale,
  timeZone,
  format = { hour: "numeric", minute: "2-digit" },
  className,
  children,
  ...props
}: MessageTimestampProps) {
  const defaultLocale = useLocale()
  locale ??= defaultLocale
  const placement = useBodyPlacement()
  const isClient = React.useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false
  )
  const d = new Date(date)
  const valid = !Number.isNaN(d.getTime())
  const text =
    children ??
    (valid && (timeZone || isClient) ? new Intl.DateTimeFormat(locale, { ...format, timeZone }).format(d) : null)

  return (
    <time
      data-slot="message-timestamp"
      dateTime={valid ? d.toISOString() : undefined}
      className={cn(placement, "min-h-4 font-mono text-[11px] text-muted-foreground tabular-nums", className)}
      {...props}
    >
      {text}
    </time>
  )
}

export {
  Message,
  MessageAvatar,
  MessageContent,
  MessageActions,
  MessageAction,
  MessageCopyAction,
  MessageTimestamp,
  type MessageRole,
  type MessageProps,
  type MessageAvatarProps,
  type MessageContentProps,
  type MessageActionsProps,
  type MessageActionProps,
  type MessageCopyActionProps,
  type MessageTimestampProps,
}
