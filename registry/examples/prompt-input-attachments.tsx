"use client"

import * as React from "react"

import {
  PromptInput,
  PromptInputAttachButton,
  PromptInputAttachments,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
} from "@/components/ballmac/prompt-input"

export default function PromptInputAttachmentsDemo() {
  const [files, setFiles] = React.useState<File[]>([])
  React.useEffect(() => {
    // Seed two example files so the chips are visible in the preview.
    setFiles([new File(["# Q3 plan"], "q3-plan.md", { type: "text/markdown" }), new File(["{}"], "metrics.json", { type: "application/json" })])
  }, [])
  return (
    <div className="w-full max-w-xl">
      <PromptInput files={files} onFilesChange={setFiles} onSubmit={() => setFiles([])} defaultValue="Compare these against last quarter">
        <PromptInputAttachments />
        <PromptInputTextarea placeholder="Ask about the attached files…" />
        <PromptInputToolbar>
          <PromptInputAttachButton accept=".md,.json,.csv,.txt" />
          <PromptInputSubmit className="ml-auto" />
        </PromptInputToolbar>
      </PromptInput>
    </div>
  )
}
