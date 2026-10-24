"use client"

import { PromptLibrary } from "@/components/ballmac/prompt-library"

export default function PromptLibrarySmall() {
  return (
    <div className="w-full max-w-3xl">
      <PromptLibrary
        title="Starters"
        prompts={[
          { id: "1", title: "Brainstorm names", body: "Give me ten names for {{thing}}. Mix playful and serious, and say why each works." },
          { id: "2", title: "Proofread", body: "Proofread the text below. Fix mistakes and tell me what you changed." },
        ]}
        onInsert={() => {}}
      />
    </div>
  )
}
