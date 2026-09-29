// Ballmac UI: Tag Input. https://ui.ballmac.com/components/tag-input
"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

type TagInputProps = Omit<React.ComponentProps<"div">, "onChange"> & {
  /** Controlled tag list. */
  value?: string[]
  /** Initial tag list when uncontrolled. */
  defaultValue?: string[]
  /** Called with the complete list after edits. */
  onValueChange?: (value: string[]) => void
  /** Maximum number of tags. */
  maxTags?: number
  /** Maximum characters per tag. */
  maxLength?: number
  /** Placeholder shown when the list is empty. */
  placeholder?: string
  /** Accessible name for the text field. */
  label?: string
  /** Name used for repeated hidden form inputs. */
  name?: string
  /** Disable editing. */
  disabled?: boolean
}
function TagInput({
  value,
  defaultValue = [],
  onValueChange,
  maxTags = 8,
  maxLength = 32,
  placeholder = "Add a tag…",
  label = "Tags",
  name,
  disabled = false,
  className,
  ...props
}: TagInputProps) {
  const [internal, setInternal] = React.useState(defaultValue)
  const [draft, setDraft] = React.useState("")
  const [message, setMessage] = React.useState("")
  const tags = value ?? internal
  const id = React.useId()
  const inputRef = React.useRef<HTMLInputElement>(null)
  function commit(next: string[]) {
    if (value === undefined) setInternal(next)
    onValueChange?.(next)
  }
  function add(raw: string) {
    const tag = raw.trim().slice(0, maxLength)
    if (!tag) return
    if (
      tags.some(
        (entry) =>
          entry.toLocaleLowerCase("en-US") === tag.toLocaleLowerCase("en-US"),
      )
    ) {
      setMessage("That tag is already added.")
      return
    }
    if (tags.length >= maxTags) {
      setMessage(`You can add up to ${maxTags} tags.`)
      return
    }
    commit([...tags, tag])
    setDraft("")
    setMessage("")
  }
  return (
    <div
      data-slot="tag-input"
      className={cn("w-full min-w-0", className)}
      {...props}
    >
      <div
        className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border border-input bg-background p-1.5 shadow-xs transition-[border-color,box-shadow] duration-150 motion-reduce:transition-none focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 has-[input[aria-invalid=true]]:border-destructive"
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className="inline-flex max-w-full items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground"
          >
            <span className="truncate">{tag}</span>
            <button
              type="button"
              disabled={disabled}
              aria-label={`Remove ${tag}`}
              onClick={(event) => {
                event.stopPropagation()
                commit(tags.filter((_, position) => position !== index))
                inputRef.current?.focus()
              }}
              className="flex size-5 items-center justify-center rounded-sm outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"
            >
              <X aria-hidden="true" className="size-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          data-slot="tag-input-field"
          aria-label={label}
          aria-describedby={message ? id : undefined}
          disabled={disabled}
          value={draft}
          placeholder={tags.length ? "" : placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === ",") {
              event.preventDefault()
              add(draft)
            }
            if (event.key === "Backspace" && !draft && tags.length)
              commit(tags.slice(0, -1))
          }}
          onPaste={(event) => {
            const text = event.clipboardData.getData("text")
            if (text.includes(",")) {
              event.preventDefault()
              const next = [...tags]
              for (const raw of text.split(",")) {
                const tag = raw.trim().slice(0, maxLength)
                if (
                  tag &&
                  next.length < maxTags &&
                  !next.some(
                    (entry) =>
                      entry.toLocaleLowerCase("en-US") ===
                      tag.toLocaleLowerCase("en-US"),
                  )
                )
                  next.push(tag)
              }
              if (next.length !== tags.length) commit(next)
              setDraft("")
            }
          }}
          className="min-w-24 flex-1 bg-transparent px-1 text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-50"
        />
      </div>
      {name &&
        tags.map((tag, index) => (
          <input
            key={`${tag}-${index}`}
            type="hidden"
            name={name}
            value={tag}
          />
        ))}
      <p
        id={id}
        className="mt-1.5 text-xs text-muted-foreground"
        aria-live="polite"
      >
        {message ||
          `${tags.length} of ${maxTags} tags · Enter to add, Backspace to remove`}
      </p>
    </div>
  )
}
export { TagInput, type TagInputProps }
