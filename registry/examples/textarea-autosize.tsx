"use client"

import * as React from "react"
import { ArrowUp } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { Textarea } from "@/components/ballmac/textarea"

export default function TextareaAutosize() {
  const [value, setValue] = React.useState("")
  return (
    <form
      className="flex w-full max-w-md items-end gap-2 rounded-xl border bg-card p-2"
      onSubmit={(event) => {
        event.preventDefault()
        setValue("")
      }}
    >
      <Textarea
        autoResize
        minRows={1}
        maxRows={6}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Write a message. The box grows up to six lines."
        aria-label="Message"
        className="border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent"
      />
      <Button type="submit" size="icon-sm" aria-label="Send message" disabled={!value.trim()}>
        <ArrowUp />
      </Button>
    </form>
  )
}
