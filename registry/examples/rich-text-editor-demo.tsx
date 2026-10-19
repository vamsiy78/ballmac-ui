import * as React from "react"

import { RichTextEditor } from "@/components/ballmac/rich-text-editor"

const content = `<h2>Release notes for 2.4</h2><p>This release makes the <strong>data grid</strong> faster and adds a <a href="https://ui.ballmac.com">calendar</a> people can drag events around in.</p><ul><li><p>Grids draw only the rows in view</p></li><li><p>Events move with Alt and the arrow keys</p></li></ul><blockquote><p>Type <code>/</code> to add a heading, list or divider.</p></blockquote>`

export default function RichTextEditorDemo() {
  const [html, setHtml] = React.useState(content)
  return <RichTextEditor label="Release notes" value={html} onChange={setHtml} showCount minHeight={220} className="w-full max-w-2xl" />
}
