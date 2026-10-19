import * as React from "react"
import { Smile } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { EmojiPicker } from "@/components/ballmac/emoji-picker"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ballmac/popover"
import { Textarea } from "@/components/ballmac/textarea"

export default function EmojiPickerPopover() {
  const [text, setText] = React.useState("Great work on the launch")
  const [open, setOpen] = React.useState(false)
  const field = React.useRef<HTMLTextAreaElement>(null)
  const insert = (emoji: string) => {
    const el = field.current
    const at = el?.selectionStart ?? text.length
    const end = el?.selectionEnd ?? at
    setText(text.slice(0, at) + emoji + text.slice(end))
    setOpen(false)
    requestAnimationFrame(() => {
      el?.focus()
      el?.setSelectionRange(at + emoji.length, at + emoji.length)
    })
  }
  return (
    <div className="w-full max-w-sm space-y-2">
      <Textarea ref={field} aria-label="Message" value={text} onChange={(e) => setText(e.target.value)} rows={3} />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger className="inline-flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-sm shadow-xs outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none">
          <Smile className="size-4" aria-hidden="true" />
          Add emoji
        </PopoverTrigger>
        <PopoverContent label="Choose an emoji" align="start" className="w-auto border-0 bg-transparent p-0 shadow-none">
          <EmojiPicker autoFocus onSelect={(e) => insert(e.emoji)} />
        </PopoverContent>
      </Popover>
    </div>
  )
}
