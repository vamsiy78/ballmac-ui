"use client"

import { RichTextEditor } from "@/components/ballmac/rich-text-editor"

export default function RichTextEditorError() {
  return <RichTextEditor label="Notes" state="error" onRetry={() => undefined} minHeight={150} className="w-full max-w-xl" />
}