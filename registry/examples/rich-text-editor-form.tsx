"use client"

import * as React from "react"

import { Button } from "@/components/ballmac/button"
import { RichTextEditor } from "@/components/ballmac/rich-text-editor"

export default function RichTextEditorForm() {
  const [html, setHtml] = React.useState("")
  const [sent, setSent] = React.useState(false)
  const [touched, setTouched] = React.useState(false)
  const empty = html.trim() === ""
  const invalid = touched && empty
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        setTouched(true)
        if (!empty) setSent(true)
      }}
      className="w-full max-w-xl space-y-3"
    >
      <div className="space-y-1.5">
        <p id="bio-label" className="text-sm font-medium">
          About you
        </p>
        <RichTextEditor
          label="About you"
          value={html}
          onChange={(v) => {
            setHtml(v)
            setSent(false)
          }}
          features={["bold", "italic", "link", "bulletList", "orderedList", "undo"]}
          placeholder="A few lines for your profile"
          invalid={invalid}
          description={invalid ? "Write a line or two about yourself." : "Shown on your public profile."}
          minHeight={130}
        />
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit">Save profile</Button>
        {sent ? <span role="status" className="text-sm text-muted-foreground">Saved.</span> : null}
      </div>
    </form>
  )
}
