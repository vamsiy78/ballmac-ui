"use client"

import * as React from "react"

import { RichTextEditor } from "@/components/ballmac/rich-text-editor"

const content = `<h3>Before launch</h3><ul data-type="taskList"><li data-type="taskItem" data-checked="true"><p>Run the accessibility audit</p></li><li data-type="taskItem" data-checked="true"><p>Check mirrored layouts</p></li><li data-type="taskItem" data-checked="false"><p>Write the changelog entry</p></li><li data-type="taskItem" data-checked="false"><p>Tell the support team</p></li></ul>`

export default function RichTextEditorChecklist() {
  const [html, setHtml] = React.useState(content)
  return <RichTextEditor label="Launch checklist" value={html} onChange={setHtml} features={["heading", "bold", "italic", "taskList", "bulletList", "undo", "slash"]} minHeight={190} className="w-full max-w-xl" />
}
