"use client"

import { Editor1 } from "@/components/ballmac/blocks/editor-1/editor-1"

export default function Editor1Failed() {
  return <Editor1 autosaveMs={800} onSave={() => Promise.reject(new Error("offline"))} />
}
