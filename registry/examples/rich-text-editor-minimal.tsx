import * as React from "react"

import { RichTextEditor } from "@/components/ballmac/rich-text-editor"

export default function RichTextEditorMinimal() {
  const [html, setHtml] = React.useState("")
  return (
    <RichTextEditor
      label="Comment"
      value={html}
      onChange={setHtml}
      features={["bold", "italic", "link", "bulletList", "undo"]}
      placeholder="Add a comment"
      characterLimit={280}
      minHeight={110}
      className="w-full max-w-lg"
    />
  )
}
