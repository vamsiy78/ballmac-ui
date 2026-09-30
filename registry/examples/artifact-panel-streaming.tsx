"use client"

import * as React from "react"
import { FileText } from "lucide-react"

import { ArtifactPanel } from "@/components/ballmac/artifact-panel"

const full = `# Release notes, v2.4

## Highlights
- Faster search across large workspaces
- Comments can now be resolved from email
- New keyboard shortcut palette (press ?)

## Fixes
- Pasting a table no longer drops the header row
- Dark mode contrast on code blocks`

export default function ArtifactPanelStreaming() {
  const [text, setText] = React.useState("")
  const [done, setDone] = React.useState(false)
  React.useEffect(() => {
    let i = 0
    const id = setInterval(() => {
      i += 6
      setText(full.slice(0, i))
      if (i >= full.length) {
        clearInterval(id)
        setDone(true)
      }
    }, 60)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="h-[20rem] w-full max-w-xl">
      <ArtifactPanel
        className="h-full"
        title="Release notes"
        kind="Document"
        icon={<FileText />}
        code={text}
        filename="release-notes.md"
        language="md"
        streaming={!done}
        versions={done ? 2 : 1}
        defaultTab="code"
      >
        <article className="mx-auto max-w-sm rounded-lg border bg-background p-5 text-sm leading-6 shadow-xs">
          <h4 className="text-base font-semibold">Release notes, v2.4</h4>
          <p className="mt-2 text-muted-foreground">Faster search, email-resolved comments and a shortcut palette.</p>
        </article>
      </ArtifactPanel>
    </div>
  )
}
